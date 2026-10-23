# 易踩坑（AI 常见误判，勿重复）

本领域 AI（含本 skill 早期草稿）出现过/易出现的误判与校正依据。证据均来自公开 opendocs.alipay.com。

## 1. 把 AlipayJSBridge 容器 JSAPI 当"第三方 H5 可选/待验证"留着
- 误判：以为 `pushWindow`/`popWindow`/`setTitle`/`setShareContent` 在支付宝 WebView 里"可能可用，先写成 opt-in 占位留待验证"。
- 真相：这些是**小程序容器**能力（私有栈），**第三方纯 H5 拿不到**。opendocs 全站搜 `pushWindow`/`setShareContent` 均 **0 命中**；`AlipayJSBridge` 命中均在 `/mini/*`。
- 做法：**不写、不留 opt-in 占位**。多页用标准 `location`/history；标题用 `<title>`；分享用 OG + scheme。
- 注：少数受限合作场景(如发票/抬头)有特例 `AlipayJSBridge.call` JSAPI，不属本 skill 适用范围——也不据此引入 pushWindow/setTitle/setShareContent 等通用容器 JSAPI。

## 2. 混淆 `my.*`（小程序）与 H5 能力
- 误判：用户贴 `opendocs.alipay.com/mini/api` 链接就被带偏，以为 H5 能用 `my.*`。
- 真相：`my.*`（`my.share`/`my.navigateTo`/`my.tradePay`/`my.getAuthCode`…）只在**真·小程序**内；第三方纯 H5 没有。H5 等价：支付走服务端 `alipay.trade.wap.pay`，授权走 `publicAppAuthorize`（可选 `ap.getAuthCode`）。
- 做法：H5 一律用服务端接口 + 可选 `ap.*` JSSDK；要 `my.*` 体验 → 那是小程序，不在本 skill。

## 3. `AlipayJSBridge` 存在 ≠ 其 JSAPI 可调
- 误判：检测到 `window.AlipayJSBridge` 就尝试 `AlipayJSBridge.call('pushWindow'…)`。
- 真相：第三方 H5 里该对象可能存在，但其导航/标题/分享接口对第三方不可调用（"存在不等于可用"）。
- 做法：只用其**对象存在性**做环境判定（`isAlipayClient`），绝不调用其容器 JSAPI。

## 4. 服务端按 UA 给爬虫/用户出不同内容 = cloaking
- 误判：服务端判"是不是 Googlebot / 是不是支付宝内"，据此减内容或给不同可见内容/head。
- 真相：被搜索引擎判作弊（cloaking）。
- 做法：公开 HTML 对爬虫与用户**完全一致**；"缺失"的只是"本就需要登录、hydrate 才追加"的部分。需服务端判定用 `isAlipayClientSSR`，仅做极轻分流（如不预取登录态），不改可见内容/head。

## 5. 猜 SDK / npm 包名
- 误判：臆造 `@alipay/jssdk` 之类写进 import。
- 真相：实测 `@alipay/jssdk` 在 npm **404**（多个猜测名均 404）。公开 H5 客户端 JSSDK 来源/包名以 **open/08xgr7** 为准，且**默认无需前端 SDK**（服务端跳转/scheme 即可）；服务端集成用公开 npm 包 `alipay-sdk`。
- 做法：前端默认零 SDK；确需 `ap.*` 时按官方文档核对来源再引入，绝不臆造包名。

## 6. 把"离线包/客户端开关"当纯 H5 能力
- 误判：以为纯 H5 也能离线包秒开、客户端开关灰度。
- 真相：离线包/客户端开关是**小程序/私有**基建，第三方纯 H5 无。
- 做法：秒开 = SSR/SSG + CDN + HTTP 缓存 + 图片优化；灰度 = CDN 权重 + feature flag。别在 H5 路径期望离线包。
