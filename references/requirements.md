# 需求理解与细化（G1：开工前必做）

第三方纯 H5 的成败在「需求能否落到 URL 与数据契约」。本 skill 工作流第一步不是写代码，是先把需求问清、拆成 A/B/C 页与接口、确认收录/分享/支付/授权边界。下面是给需求方的问题清单 + 给开发者的细化产物。

## 1. Intake 问题清单（逐条问清，落到下表）
- 受众：公网访客(被搜索引擎带来) / 支付宝内用户 / 两者？主要设备，是否需桌面可达？
- 收录：哪些内容让搜索引擎抓、目标关键词/主题、是否要结构化数据(Article/Product/ItemList)？
- 内容来源：CMS / 接口 / 静态？「公开内容(无登录)」与「登录态内容」的边界在哪？
- 分享：外部(微信/QQ/浏览器粘贴)卡片标题/图/描述；App 内分享是 URL 还是自定义卡片？（第三方纯 H5 拿不到自定义分享 → 用 URL）
- 支付：要支付吗？走手机网站支付(服务端 wap.pay 跳转) → 需 AppId/密钥配置；下单与结果回跳 URL？
- 授权：要拿支付宝用户身份吗？默认 publicAppAuthorize(跳转)即可；是否要半屏 ap.getAuthCode(不离开页面，可选)？
- 页面分类：哪些是公开页(A 类，可索引)、哪些是 App 内功能页(B 类，noindex)、哪些是引导去支付宝(C 类)？
- 数据契约：每屏公开内容字段(无登录可拼) 与 登录态/功能字段(hydrate 后拉) 分别是什么？接口在哪、是否 mock？
- 非功能：是否多语言？无障碍(a11y)是否硬指标(见 coding-standards.md / testing-acceptance.md)？首屏预算(LCP/CLS/INP)？

## 2. 细化产物（填表，作为 G2 设计输入）
| 屏(路径) | 分类 A/B/C | 渲染 SSG/SSR/CSR | 公开内容字段(无登录) | 登录态/功能字段 | 收录/分享卡片 | 支付 | 授权 |
|---|---|---|---|---|---|---|---|
| / | A | SSG | 首页聚合内容 | 个人化推荐/登录态 | title/desc/og | ✗ | ✗ |
| /detail/:id | A | SSG+ISR | 商品标题/摘要/图 | 登录态/购买/分享 | og:image | ✓(可选) | ✓(可选) |
| /publish , /order , /result/:tradeNo | B | CSR noindex | — | 全功能 | 不进 sitemap | ✓ | ✓ |

## 3. 从需求到结构的落地步骤
1) 把每屏归到 A/B/C（见 architecture.md）。
2) 填「公开内容字段」——决定 SSR 能否无登录拼出可抓 HTML（反 cloaking，见 pitfalls.md §4）。
3) 给容器层列出每屏需要的公开能力：支付/授权/唤起/降级（见 container.md）。
4) 出接口清单 + mock 约定（见 tech-selection.md / coding-standards.md）。
5) 在 testing-acceptance.md 取得对应验收条目，作为 G4 出口。
