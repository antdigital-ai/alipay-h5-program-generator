# 测试与验收（G4：上生产前必过）

确定性护栏脚本（rc 0/1，非测试框架）：`check-env`（环境能力）、`check-project`（禁用 API 静态扫）、`check-seo`（收录一致性）、`check-build`（secret/产物）。脚本之外的功能与体验验收如下。

## 1. 单元 / 组件测试
- 选型：Vitest + @testing-library/react + jsdom；配置见 assets/frontend-template/vitest.config.ts。
- client 组件(如 `AlipayGuard`)测分支：浏览器分支显示降级屏、子内容不可见；示例见 assets/frontend-template/test/AlipayGuard.test.tsx。
- server 组件(page)不直接渲染网络：对取数/`generateMetadata` 返回结构断言，或把逻辑提纯到 `lib` 再测。
- `lib/api` 用 mock 单测；`pay-server`/`auth-server` 测 URL 构建且签名/密钥不泄露。

## 2. 接口 / 契约 Mock
- 优先 MSW 拦截 fetch（开发与测试同源）；或 Next 路由 handler 兜底 mock。
- 公开内容 mock 须无登录可拼 → 顺带验证反 cloaking。

## 3. SEO 收录验收（必过，由 check-seo.mjs 兜底）
- `canonical` == `og:url` == 分享 URL == 公网 URL，四处一致。
- 每个可索引页 SSR HTML 含可抓首屏内容(无登录可拼)；登录态 hydrate 后追加，不为爬虫减内容(反 cloaking)。
- JSON-LD 在场且 schema 有效(Article/Product/ItemList)；title/description 非占位。
- `sitemap.ts` 只含 A 类(含分页，每页 canonical)；`robots.ts` 屏蔽 B 类且 B 类 `noindex`；站点公网可达。

## 4. 分享验收
- 外部：OG 卡片预览(微信/QQ/开放图谱调试器)标题/图/描述正确且与 canonical 一致。
- App 内：分享当前 URL → 点开经 scheme/landing 唤起进支付宝(env-degradation.md)；自定义分享不可达，勿臆造 `setShareContent`。

## 5. 支付端到端
- `POST /api/pay` 生成 wap.pay URL → 前端 `container.startPay` 跳转 → 回 `/result/:tradeNo` 展示结果。
- 校验：私钥只在服务端 env；前端 bundle 无密钥串(见 check-build.mjs)；wap.pay URL 域名正确。

## 6. 降级屏 / B 类页
- B 类页浏览器打开给 AlipayGuard「请在支付宝中打开」+ 唤起按钮；在支付宝内正常渲染子内容。
- robots：B 类 noindex + 不进 sitemap。

## 7. 移动适配真机核对（iOS WKWebView / Android WebView / 手机浏览器）
- viewport/安全区(刘海/Home 手势条)不裁切；固定吸底栏不被遮挡；输入聚焦键盘不遮挡(`scrollIntoView`)。
- 横屏不崩；触控热区 ≥44px；高 DPI 图不糊；细节见 responsive-cross-end.md。

## 8. 性能预算（发布前对照，见 release-perf.md）
- LCP<2.5s、CLS<0.1、INP<200ms(移动网络)；首屏 JS / 关键 CSS 在 bundle 预算内；图片 WebP/AVIF + 懒加载。

## 9. 无障碍(a11y)验收
- 键盘可达(tab 序合理、焦点可见、Esc/回车行为正常)、屏幕阅读器试读标题/图片 alt、对比达标、触控目标 ≥44px（见 coding-standards.md）；可用 axe 对关键页扫一轮。

## 10. 发布前验收 checklist（G5 入口）
- [ ] check-env 能力矩阵对齐 / [ ] check-project 0 禁用项 / [ ] check-seo 收录一致 0 / [ ] check-build secret/产物 0
- [ ] §1–9 全过（SEO/分享/支付/降级/移动/性能预算/a11y）/ [ ] 监控接入(Sentry/RUM) / [ ] 灰度计划 + 回滚演练 / [ ] 发布前门见 release.md
