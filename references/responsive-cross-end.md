# 响应式与跨端适配

主战场是手机：支付宝内（iOS WKWebView / Android WebView）+ 外部手机浏览器；同一公网 URL 也会被桌面/平板浏览器打开（A 类公开页 SSG 后应能正常展示）。口径「移动端优先，桌面不死板」。以下均为公开 Web 标准，与支付宝能力边界无关（不引入任何私有 JSAPI）。

## viewport
- `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`。
- `viewport-fit=cover` 才能拿到安全区；配合 CSS `env(safe-area-inset-*)` 给刘海/底部 Home 指示条留白。
- 是否禁缩放（`maximum-scale=1, user-scalable=no`）按业务权衡：禁缩放防误触双击放大，但牺牲可访问性；交互密集表单页倾向禁缩放，内容浏览页倾向允许。

## 尺寸单位 / rem 适配（antd-mobile 官方方案）
- antd-mobile v5 用 px；跨屏等比用 antd-mobile 官方「rem 适配」方案（`postcss-pxtorem` 把 px 转 rem，按视口宽度设 root `font-size`），默认基准 375px 设计稿。勿用 `rpx`（小程序专用，H5 无效）。
- 图标用 antd-mobile 自带或 SVG，随设计稿等比放大，避免位图糊。
- 文字最小可读约 14px（设计稿）。

## 高 DPI / 图片
- 多倍图按 DPR 选源（`1x/2x/3x` 或 CDN 裁切参数）；用 `<img srcset>` / 背景图媒体查询。优先 WebP/AVIF（与发布侧一致，见 release-perf.md）。
- 1px 边框用 `transform: scale(.5)` 或 `0.5px`，别物理 1px（移动端偏粗）。

## 安全区 / 固定栏
- 顶部贴 `env(safe-area-inset-top)`，底部贴 `env(safe-area-inset-bottom)` 给 Home 手势条/导航留位；横屏同样留左右安全区。
- 固定吸底栏（支付按钮 / 底导航）加 `padding-bottom: calc(env(safe-area-inset-bottom) + Npx)`，避免被手势条遮挡。

## 布局
- 移动优先 CSS：默认竖屏样式 + `@media (min-width:768px)` 增强；Flex/Grid + `gap`；宽度用 `vw`/`%` 自适应，避免写死 `px` 宽。
- 桌面收敛：内容区 `max-width`（如 480–600px）居中，避免桌面铺满拉扯；A 类公开页桌面可正常展示公开内容。
- 长文本/长表：`overflow-wrap`/`word-break`；弹性表格横向滚动。

## 触摸与点击
- 可点击元素最小热区 44×44px（Apple HIG）；间距足够防误触。
- 列表项整行可点与右侧操作区分离，避免点穿（用 `<button>`/可点击元素天然边界）。
- 现代浏览器在含 `width=device-width` 的 viewport 下已自动消除 300ms 延迟，别再加第三方 fastclick。
- 限手势按需设 `touch-action`（如轮播设 `pan-x`）。

## 输入与键盘
- 输入框 `font-size ≥ 16px` 防 iOS 聚焦自动放大；弹起键盘时聚焦元素 `scrollIntoView({block:'center'})` 防遮挡。
- 表单用 antd-mobile `Form`；长表单分组 + 顶部进度。
- 用对 `type`/`inputmode`（`number`/`tel`/`decimal`）调出对应键盘。

## 横竖屏与方向
- 横屏不崩：布局用 Flex/Grid + 百分比，别按竖屏写死；必要时 `orientation: landscape` 媒体查询调整。
- 纯 H5 无法强制旋转系统方向；需竖屏的功能（扫码/支付确认页）以文案引导用户竖屏使用即可。

## 跨端探针
- 开工前跑 scripts/check-env.mjs（含 viewport meta 探针），在 iOS 模拟器、Android 模拟器、外部手机浏览器各核一遍；底导航/安全区/键盘遮挡、横竖屏逐一过。
