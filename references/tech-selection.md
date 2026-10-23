# 技术选型（G2）

栈是固定的：React + TypeScript + AntD Mobile v5 + Next(App Router，SSR/SSG)；服务端用公开 `alipay-sdk`。本页只给「固定栈内的选择」与「何时偏离」的决策依据，选择必须落到每页、不靠默认。

## 渲染选型决策树（逐页选）
- 内容静态/低频变更（详情/列表/落地）→ **SSG** 或 **SSG+ISR**（按 id 重生成）；SEO 最优、CDN 直发。
- 内容按请求动态/强个人化（首页推荐）→ **SSR**。
- 功能页（发布/订单/结果）→ **CSR + `noindex`**；浏览器给降级屏（AlipayGuard，见 env-degradation.md）。
- 判别原则：要被收录/被分享 → 必有独立公网 URL + 可抓首屏 HTML → SSG/SSR；纯属 App 内操作 → CSR + noindex。

## 能力选型（固定，勿偏离）
- 支付：手机网站支付 `alipay.trade.wap.pay`，服务端建跳转 URL → 前端 `location.assign`（见 container.md）。
- 授权：默认 `publicAppAuthorize` 服务端跳转；仅当「不离开页面半屏授权」确有体验需求，才上可选 `ap.getAuthCode`（公开来源 `/open/01zsdu`、`/mini/02xtl8`，默认不引入）。
- 浏览器→App 唤起：alipays scheme + render landing（非 alipay.com 域名需开放平台配白名单）。

## 缓存 / CDN
- HTML 短缓存回源、静态资产哈希文件名长缓存；按 URL/权重灰度；动静拆分（公开内容静态化、登录态动态拉）。细节见 release-perf.md。

## 监控
- 错误：Sentry(或同类)；性能：RUM 采集 LCP/INP/CLS；业务打点：自建/第三方（无私有监控基建）。接入见 release-perf.md / release.md。

## 接口 / Mock
- 接口层统一在 `lib/api`（见 coding-standards.md）；开发期 mock 优先 MSW(拦截 fetch)或 Next 路由 handler 兜底；SSR 期别让 mock 抛错致整页降级。

## 何时偏离（写明理由记档）
- 需要原生小程序能力（`my.*` / 多 webview / 自定义分享 / 离线包）→ 那不是本 skill，改做小程序。
- 某公开能力但本 skill 结论为「不可用」→ 先核对 opendocs，勿臆造；确属受限合作场景另议，不据此引入通用容器 JSAPI（见 pitfalls.md）。
