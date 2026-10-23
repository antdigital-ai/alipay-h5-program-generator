# 交互体验（移动 H5 通用规则）

第三方纯 H5 没有原生转场/弹层/Toast 容器，交互反馈一律标准 Web + antd-mobile。下面是面向「内嵌支付宝 WebView + 公网浏览器」的体验底线。组件名以 antd-mobile v5 官方为准。

## 加载与就绪态
- 首屏 SSR/SSG 真实 HTML（见 architecture.md）是最好的 loading；hydrate 后再注入登录态/交互。
- 数据区配骨架屏（antd-mobile `Skeleton`）而非空白；首屏数据已 SSR 直出的不再闪骨架。
- 接口约 ≥300ms 才到才给 loading/骨架；更短直接出结果，避免闪烁。

## 空 / 错 / 重试
- 空数据：空态插画 + 文案 + 主操作（antd-mobile `Empty` / 自绘 + `Button`）。
- 接口失败：「加载失败」+「重试」（antd-mobile `ErrorBlock` / `Toast`）；网络异常与 5xx 区分文案。
- 关键支付/下单失败给兜底（回上一屏 / 客服），别让用户卡死。

## 列表 / 滚动加载 / 下拉刷新
- 长列表用 antd-mobile `InfiniteScroll` 触底加载 + 底部 loading/「没有更多」；勿一次拉全量。
- 顶部刷新用 antd-mobile `PullToRefresh`。
- 列表项 `key` 用稳定业务 id，别用 index（防状态错乱 + 利复用）。

## 点击反馈与防抖
- 可点元素给 `:active` 反馈态或用 antd-mobile `Button`/`ListItem` 自带 activeStyle，点之有触觉感。
- 高频触发按钮（提交/点赞/拉取）防抖（debounce）；表单提交防重复（提交即禁用按钮直到结果）。
- 量大滚动监听用节流（throttle）或 `requestAnimationFrame` 批处理，别每帧重算。

## 表单与键盘
- 聚焦时 `scrollIntoView` 防键盘遮挡；失焦收起键盘（点空白）。
- 实时校验给即时反馈，提交前总校验。
- 密码/支付类输入：走服务端校验与服务端支付跳转（见 container.md），敏感逻辑不留前端常驻。

## 返回与导航
- 「返回」一律 `history.back()`（无原生 popWindow）；`history.length<=1` 时退到首页或指定回退路径，别让用户卡空白。
- 离开未保存表单给二次确认（`onbeforeunload` 在支付宝 WebView 约束较弱，以应用内确认弹层为主）。
- 多步流程放单页（见 architecture.md「多步流程用单页状态」），别拆成多屏靠返回拼状态。

## 转场与反馈
- 页间是整页加载（无原生转场），靠骨架 + 数据直出降低「白」感；可用淡入/位移 CSS 过渡做首屏进场。
- Toast / 确认 / 对话框用 antd-mobile `Toast`/`Dialog`/`Modal`，别用简陋 `alert/confirm`。
- 支付/关键操作前 `Dialog.confirm`；支付走服务端跳转（见 container.md `startPay`）。

## 弱网与降级
- 弱网：骨架 + 超时兜底文案；图片懒加载 + 占位（见 release-perf.md）。
- 离线态：纯 H5 默认无离线，给「网络异常，请重试」+ 重试；不假设刷新即有缓存（除非真机验证 SW 生效，见 release-perf.md）。
