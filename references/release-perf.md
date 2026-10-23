# 发布与性能（公开方案，不依赖私有基建）

没有离线包/客户端开关/企业监控/真机调试平台。等价公开件：

## 性能 / 秒开（取代离线包）
- SSR/SSG 首屏真实 HTML + 关键 CSS 内联 + JS `defer`/异步 + `preload`。
- 路由级 code split；图片 WebP/AVIF + 懒加载 + 按视口尺寸；字体子集化。
- 动画用 transform/opacity。
- **Service Worker（默认不依赖 → 真机验证后决定）**：SW 在支付宝 WKWebView(iOS)/Android WebView 是否生效**无官方文档**，默认只用 SSR/SSG + CDN + HTTP 缓存。真机验证后再决定是否作离线壳，步骤：
  1) 跑 `scripts/check-env.mjs` 的 `serviceWorker in navigator` 探针；
  2) 实际 `navigator.serviceWorker.register('/sw.js')` 后**断网刷新**验证缓存命中；
  3) iOS(WKWebView) 与 Android **两端均生效** 才作为可选离线壳预缓存静态资源；任一不生效/未验证 → 不引入。

## 编码侧 / 运行时性能（交互态与水合后）
- **首屏体量给预算**：首屏 JS / 关键 CSS 设上限，CI 跑 bundle 分析对红线，超标即阻断。
- **React 渲染**：长列表虚拟化（react-window 等）或服务端分页；列表 `key` 用稳定业务 id（别用 index）；重计算用 `useMemo`/`useCallback`，纯展示组件 `React.memo`，避免无谓 re-render 蔓延。
- **状态热路径**：别在 render 或 input `onChange` 里做重计算/深拷贝；大数据勿全量入 state；计算下沉到 `useMemo` 或事件外。
- **CLS 预防**：图片/iframe/广告位预留尺寸盒（`width`/`height` 或 `aspect-ratio`）；字体 `font-display` + 回退，避免文字回弹与布局抖动。
- **INP / 交互**：拆分长任务（`requestIdleCallback`/`scheduler`/零宽 `setTimeout`）；首屏外重组件 code split & `lazy`；交互回调里的重活延后做。
- **防布局抖动**：不在循环里读写 `offsetWidth`；批量改 className；动画只用 `transform`/`opacity`。
- **资源 / HTTP**：首屏关键资源 `preconnect`/`preload`；三方/统计 `defer` 或闲置加载；接口合并、并行请求避免瀑布；列表分页且首屏只取必要字段。
- **水合后**：避免同步大批量 DOM 写与重型 effect，先 paint 再消费剩余工作。

## 灰度 / 发布
- CDN 按 URL/权重灰度 + CI/CD(<分支名/环境> 部署到不同 CDN 路径/域名)。
- Feature Flag(自建或第三方)控制灰度人群。
- 版本号 + 静态资源长缓存 + HTML 短缓存/回源；出问题分钟级回滚。

## 监控 / 打点
- 错误：Sentry(或同类)。
- 性能：RUM 采集 Core Web Vitals(LCP/INP/CLS)。
- 业务打点：自建或第三方（如神策等）。

## 安全
- 全站 HTTPS + HSTS；输出转义 + CSP(防 XSS)；接口防 CSRF；敏感信息不入前端代码与 source map。
