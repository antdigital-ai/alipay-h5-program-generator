# 容器与公开能力边界

「在支付宝 WebView 内」≠「拥有支付宝小程序的容器能力」。第三方独立 H5 拿不到小程序容器的 `my.*`、`AlipayJSBridge` 容器 JSAPI、离线包等；可用的是开放平台公开能力。

## 能力边界（公网核实，源 opendocs.alipay.com）

### 可用（公开，默认路径）
- 网页&移动应用 /open/03lo16：服务端接口用支付/资金/营销/安全产品。
- 手机网站支付 `alipay.trade.wap.pay` /open/203/107091：**服务端生成支付 URL，前端 location 跳转**；可经 alipays 协议唤起 App。无需前端 SDK。
- OAuth 网页授权 + 获取用户信息 /mini/02xtl8：服务端 publicAppAuthorize 跳转拿 auth_code → `alipay.system.oauth.*` 换 uid；H5 内可选 `ap.getAuthCode` 半屏授权。
- PC/H5 唤起支付宝 /open/02zlo5：**仅服务端 SDK**，生成 alipays scheme 把浏览器用户唤起进支付宝（如需 PC/网页内获取用户信息，见 `/mini/02xtl7`）。
- 小程序内嵌 H5(web-view) /mini/tool/h5：若以后要宿主能力，可把 H5 包进小程序当壳(代价：形态变小程序，H5 不再独立被收录)。

### 不可用 / 受限（纯第三方 H5）
`pushWindow`/`popWindow`(多 webview)、`setTitle`(原生栏)、`setShareContent`(自定义分享)、私有 RPC 网关、`my.*`、离线包、客户端开关、真机调试平台——**均无第三方公开版**。(opendocs 搜 `pushWindow`/`setShareContent` 均为 0 命中；`AlipayJSBridge` 命中均在 `/mini/*` 小程序范畴。)

### 待真机验证
Service Worker 在支付宝 WKWebView(iOS)/Android WebView 内是否生效——无官方文档。

## 容器层实现约定：两级回退
- **Level 1 标准 Web**（永远可用，主路径）：`location`/`history`/`fetch`/`localStorage`/`document`/`visibilitychange`。
- **Level 2 公开 Alipay**：
  - 支付 = 服务端建 wap.pay URL → 前端 `location.assign(url)`。
  - 授权 = 服务端建 publicAppAuthorize URL → 前端 `location.assign(url)`，回跳后用 code 换 uid。
  - 浏览器→App 唤起 = 算 `alipays://platformapi/startapp?appId=20000067&url=<encodeURIComponent(本页URL)>`，经 `https://render.alipay.com/p/s/i/?scheme=<encodeURIComponent(scheme)>` landing 跳（非 alipay.com 域名需在开放平台配白名单）。
  - 可选前端 `ap.*`：仅 `ap.getAuthCode`（H5 半屏授权拿 auth_code，源 /mini/02xtl8、/open/01zsdu）作"不离开页面"的授权增强；默认用 publicAppAuthorize 服务端跳转即可。**`ap.tradePay` 未在公网确认为第三方 H5 公开**（公网只见小程序 `my.tradePay`），H5 支付一律服务端 `alipay.trade.wap.pay` 跳转，勿臆造。来源/包名以 open/08xgr7 为准，默认不引入；具体可用以你方应用开放平台授权为准。
- **不要依赖 `AlipayJSBridge` 的容器 JSAPI**（`pushWindow`/`setTitle`/`setShareContent` 等，第三方不可用）——写进代码只会误导。

## 编码契约
- 用薄薄一层 `container/*` 封装"环境判定 + 支付/授权跳转 + scheme 唤起 + 降级"，业务页只调人类可读 API（模板见 assets/frontend-template/container.ts）。
- 每个 API 写清"在支付宝内/浏览器内分别做什么"；禁止直接穿透到 `AlipayJSBridge`。
- "在支付宝内能拿到的"只限：被 WebView 加载(公网 URL 正常渲染) + 上面公开能力，**不要假设更多**。
