---
name: alipay-h5-program-generator
description: 在支付宝开放平台「网页&移动应用」下开发第三方纯 H5 网页应用——部署到公网、可被搜索引擎收录、可分享、内嵌在支付宝 WebView。技术栈 React+TS+AntD Mobile+Next(SSR/SSG)；能力以服务端接口(手机网站支付、OAuth)+alipays scheme 唤起为主。不要用于依赖原生容器/离线包/私有 RPC 等私有基建的项目，也不要用于支付宝小程序。
---

# 支付宝第三方纯 H5 网页应用

面向在 open.alipay.com 注册「网页&移动应用」、把 H5 部署到公网 CDN 的第三方开发者。页面运行在支付宝 WebView 内，但**不是小程序、不在小程序运行时内**——因此没有 `my.*`、没有原生容器 JSAPI、没有离线包。本 skill 把「公网可收录 H5 + 支付宝 WebView 内嵌」的工程范式做成可外网版：只迁移架构范式，不内嵌任何私有代码、内部文档或私有 API，引用仅限公开源(opendocs.alipay.com)。

## 何时用 / 何时不用

- 用：第三方/外网部署的纯 H5；需要 SEO 收录 + 分享 + 支付/授权；React+TS+AntD Mobile。
- 不用：
  - 依赖小程序容器 JSAPI / 离线包 / 私有 RPC / 企业监控等私有基建的项目——私有栈，非本范畴。
  - **支付宝小程序**（需 `my.*` 原生能力、原生多页/分享/离线包/原生标题栏）——改用小程序框架。
  - 无"在支付宝内 + 收录/分享"诉求的普通移动网页——标准 H5 即可。

## 核心范式

1. **每屏一条公网 URL + SSR/SSG**：可收录/可分享内容必有独立 URL 并在 HTML 含可抓取内容；登录态内容客户端再拉。见 references/architecture.md、references/ssr-seo-sharing.md。
2. **多页导航退化为标准多页**：第三方 H5 无多 WebView 能力；跨屏跳转用 `location`+历史后退，不在页面间用 SPA 客户端路由做"全站多屏"。只有多步流程压在单页内用客户端状态。
3. **能力靠"开放平台服务端接口 + scheme"**：支付走手机网站支付(服务端生成 wap.pay URL 跳转)、授权走 OAuth(publicAppAuthorize 跳转)、浏览器用户用 alipays scheme 唤起进支付宝。默认**无需前端 JSSDK**。授权可选公开 `ap.getAuthCode`（半屏，/mini/02xtl8、/open/01zsdu）；支付一律服务端跳转，**勿臆造 `ap.tradePay`**(公网无 H5 版)。见 references/container.md。
4. **分享双路径**：外部=OG meta(进 SSR HTML)；App 内=URL 分享 + scheme 唤起(无自定义分享 SDK)。见 references/ssr-seo-sharing.md。
5. **环境降级**：UA 判定是否在支付宝，浏览器内对 noindex 功能页给"请在支付宝中打开"。见 references/env-degradation.md。
6. **跨页/跨次状态**：服务端持久化为主，前端补偿用 localStorage+storage 事件+visibilitychange(无多 webview 实时通信)。见 references/cross-page-comm.md。
7. **发布/性能**：SSR/SSG+CDN+HTTP 缓存+图片优化；无离线包——秒开靠 SSR 与 CDN，灰度靠 CDN 权重+feature flag，监控 Sentry+RUM。见 references/release-perf.md。

## 关键 guardrail

下列能力**纯 H5 拿不到，不要在本 skill 路径硬做**——它们属于支付宝小程序：原生多 WebView / 原生标题栏 / App 内自定义分享 / 离线包秒开 / 客户端开关灰度。若同时要"被收录 + App 内富功能"：公开内容用本 H5(SSR 收录/分享/支付)，站内富功能入口另做小程序(或在 H5 内给"用小程序打开"引导)。

## 易踩坑（AI 常见误判，勿重复；详见 references/pitfalls.md）
1. **不要把 `AlipayJSBridge.pushWindow/popWindow/setTitle/setShareContent` 当"第三方可选/待验证"留着**——第三方纯 H5 拿不到（属小程序/私有栈），直接不写。（opendocs 搜均 0 命中）
2. **`my.*` 是小程序 API，不是 H5**——第三方纯 H5 没有；用户给的 `/mini/*` 链接别被带偏。H5 走服务端接口 + 可选 `ap.*`。
3. **`AlipayJSBridge` 存在 ≠ 其 JSAPI 可调**——只用于环境判定（`isAlipayClient`），绝不 `.call(...)` 其容器 JSAPI。
4. **服务端按 UA 给爬虫/用户出不同内容 = cloaking**——公开 HTML 必须一致。
5. **别猜 SDK/包名**——`@alipay/jssdk` 实测 npm 404；前端默认无需 SDK（服务端跳转即可），`ap.*` 来源以 open/08xgr7 为准，服务端用公开 `alipay-sdk`。

## 响应式 / 性能 / 交互体验（移动 H5 底线）
- **响应式与跨端适配**：viewport + 安全区 / rem 适配（antd-mobile 官方方案）/ 高 DPI / 触摸热区 / 输入与键盘 / 横竖屏 / 桌面降级。见 references/responsive-cross-end.md。
- **性能**：发布侧（SSR/SSG + CDN + 图片优化 + Service Worker）见 references/release-perf.md；编码侧运行时性能（React 渲染 / 虚拟列表 / CLS / INP / bundle 预算）亦在其中。
- **交互体验**：骨架 / 空错态 / 重试、下拉刷新 + 上拉加载、点击反馈与防抖、表单与键盘、返回与转场、弱网降级。见 references/ux-interaction.md。

## 工作流

1. 确认是「网页&移动应用」第三方纯 H5（非小程序、不依赖私有基建）。
2. 定渲染策略(SSR/SSG)与 URL 结构（references/architecture.md）。
3. 用 assets/frontend-template 的 `container.ts` 做环境判定 + 服务端跳转/scheme + 降级（references/container.md）。
4. 写页面：SSR head(OG/canonical/jsonld) + hydrate 登录态。
5. 跑 scripts/check-env.mjs 打印能力矩阵与浏览器探针，在真机/模拟器核对环境与可用能力。
