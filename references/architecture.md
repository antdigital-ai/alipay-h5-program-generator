# 架构：纯 H5 的形态与 URL 结构

## 双身份与降级
同一份 H5 有两副面孔，差别只在客户端 hydrate 之后；**服务端 HTML 相同**（反 cloaking）：
- 公网网页：被爬虫抓、被外部分享 → 需 SSR/SSG 吐真实 HTML。
- 支付宝内：被 iOS WKWebView / Android WebView 加载同一个公网 URL → hydrate 后启用支付/授权。

第三方 H5 **没有多 webview**：跨屏=标准多页(`location`+历史后退)。失去"原生多页栈/保留前页"，换 SEO 与跨端通用性。这是本范式与原生小程序容器方案最大的实际差异。

## URL 结构（每屏一条公网 URL）
- **A 公开可索引**（SSR/SSG、进 sitemap）：`/`、`/list/:cat`、`/detail/:id`、`/activity/:slug`
- **B App 内功能**（noindex、不进 sitemap）：`/publish`、`/order`、`/result/:tradeNo`（浏览器打开给"请在支付宝中打开"）
- **C 引导**：通过 landing scheme 把浏览器用户唤起进支付宝（见 env-degradation.md）

## 渲染策略
- 公开页 SSR/SSG：可抓内容**无登录即可拼出并进 HTML**；登录态内容 hydrate 后拉。内容多静态→SSG；按请求动态→SSR。
- 功能页 CSR + noindex + 浏览器降级屏。

## 反 cloaking（详见 references/pitfalls.md §4）
服务端**不按 UA 区分爬虫**；爬虫与用户拿同一份公开 HTML；"缺失"的只是"本就需要登录、hydrate 才追加"的部分。

## 多步流程用单页状态
需要跨步骤共享状态的多步流程（发布/编辑）：放在单 WebView(单 URL) 内用组件状态/客户端路由，整页 noindex。
