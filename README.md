# alipay-h5-program-generator

> Codex / Claude Code Skill — 装进技能目录后，agent 用自然语言提需求即按工程化流程交付「部署在公网、可被搜索引擎收录、可分享、内嵌支付宝 WebView」的第三方纯 H5 网页应用。React + TypeScript + AntD Mobile + Next.js（SSR/SSG）；能力靠支付宝开放平台服务端接口（手机网站支付 / OAuth）+ alipays scheme 唤起。

[![npm version](https://img.shields.io/npm/v/alipay-h5-program-generator.svg)](https://www.npmjs.com/package/alipay-h5-program-generator)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

## 适用 / 不适用
- **用**：在 [open.alipay.com](https://open.alipay.com) 注册「网页&移动应用」、把 H5 部署到公网 CDN 的第三/外部开发者；需要 SEO 收录 + 分享 + 支付/授权；React + TS + AntD Mobile + Next。
- **不用**：依赖小程序容器 JSAPI / 离线包 / 私有 RPC / 企业监控等私有基建的项目；**支付宝小程序**（需 `my.*` 原生能力、原生多页/分享/离线包/原生标题栏）；无「在支付宝内 + 收录/分享」诉求的普通移动网页。

把「公网可收录 H5 + 支付宝 WebView 内嵌」的工程范式做成可外网版：只迁移架构与工程范式，不内嵌任何私有代码 / 内部文档 / 私有 API，引用仅限公开源（opendocs.alipay.com / MDN / web.dev / antd-mobile 官方）。

## 核心范式
1. 每屏一条公网 URL + SSR/SSG（可收录/可分享内容进 HTML；登录态 hydrate 后拉）
2. 多页导航退化为标准多页（无多 webview → `location` + 历史后退）
3. 能力靠「开放平台服务端接口 + scheme」：支付 = 服务端 `alipay.trade.wap.pay` 跳转、授权 = `publicAppAuthorize` 跳转、浏览器→App = alipays scheme 唤起；默认无需前端 JSSDK
4. 分享双路径：外部 = OG meta（进 SSR HTML）；App 内 = URL 分享 + scheme 唤起
5. 环境降级：UA 判定是否在支付宝，noindex 功能页在浏览器给「请在支付宝中打开」
6. 跨页/跨次状态：服务端持久化为主，前端 localStorage + storage 事件 + visibilitychange 补偿
7. 发布/性能：SSR/SSG + CDN + HTTP 缓存 + 图片优化；无离线包

另含**响应式与跨端适配、运行时性能、交互体验**三套移动 H5 底线规则。

## 能力边界（公网核实，零编造）
- ✅ **可用**：手机网站支付 `alipay.trade.wap.pay`、OAuth 网页授权（`publicAppAuthorize`，可选 `ap.getAuthCode`）、alipays scheme 唤起进入支付宝。
- ❌ **不可用**（第三方纯 H5）：`pushWindow`/`popWindow`（多 webview）、`setTitle`（原生栏）、`setShareContent`（自定义分享）、`my.*`、私有 RPC 网关、离线包、客户端开关——opendocs 搜均 0 命中。
- ⚠️ **谨慎**：`AlipayJSBridge` 对象可能存在但仅用于**环境判定**，绝不 `.call(...)` 其容器 JSAPI（存在 ≠ 可用）；`ap.tradePay` 公网无第三方 H5 版，支付一律服务端跳转。

## Installation
```bash
npm install alipay-h5-program-generator
```
注册到 `~/.agents/skills/alipay-h5-program-generator`；换根目录设 `ALIPAY_SKILL_ROOT`；`--ignore-scripts` / 不联网 CD 环境补跑 `npx alipay-h5-program-generator install`。

## Update
```bash
npm install alipay-h5-program-generator@latest
```
覆盖更新、无残留。

## Uninstall
```bash
npx alipay-h5-program-generator uninstall
```
一行清技能目录 + 自动卸载 npm 包。`npm uninstall` 单条不清技能目录（npm 10 卸载依赖不触发依赖自身的 preuninstall），请用上面这条。

## Usage
无需手动调用——在 Codex / Claude Code 里用自然语言提需求即可：
```text
- 帮我搭一个能被 Google 收录、可分享、内嵌支付宝的第三方纯 H5 详情页（React + AntD Mobile + Next SSR）
- 给这个 H5 接入支付宝手机网站支付（服务端建 wap.pay 跳转）和网页授权
- 浏览器里把用户用 alipays scheme 唤起进支付宝
- 排查支付宝内 H5 能不能用 pushWindow / setShareContent（结论：不能用）
```

## Scripts
| Script | Purpose | Exit Code |
|---|---|---|
| `scripts/check-env.mjs` | 打印能力矩阵 + 浏览器探针（viewport / UA / AlipayJSBridge / ServiceWorker / localStorage） | `0` done |
| `scripts/check-project.mjs` | 项目护栏确定性扫描：禁止容器/小程序/私有 API 调用遗址 | `0` pass / `1` 禁止项 |
| `scripts/check-seo.mjs` | 构建前 SEO 收录一致性：canonical↔og↔URL 一致、sitemap/robots 在场、无 cloaking 嫌疑 | `0` pass / `1` 须修 / `2` 非 App Router |
| `scripts/check-build.mjs` | 发布前门：NEXT_PUBLIC_ 不暴露 secret、(构建后)产物无私钥串、app/api 不误用 public 变量 | `0` pass / `1` 须修 |

## Directory
```
SKILL.md                      # Skill 指令正文
.claude-skill.json            # 包 → 技能 manifest
references/
  requirements.md · architecture.md · tech-selection.md · coding-standards.md · container.md
  ssr-seo-sharing.md · env-degradation.md · cross-page-comm.md · responsive-cross-end.md · ux-interaction.md
  testing-acceptance.md · release.md · release-perf.md · pitfalls.md
assets/frontend-template/     # container.ts / AlipayGuard.tsx / Detail.client.tsx / example-detail.page.tsx + vitest.config/.eslintrc/.prettierrc + test/AlipayGuard.test.tsx
scripts/                      # check-env / check-project / check-seo / check-build / install-skill / cli / lib/skill-registrar.mjs
```

## Requirements
- [Node.js](https://nodejs.org) ≥ 18
- 技术栈：React + TypeScript + AntD Mobile v5 + Next.js（App Router，SSR/SSG）
- 一台公网 CDN；支付宝开放平台「网页&移动应用」应用；支付/授权能力在 [开放平台](https://open.alipay.com) 配置后获取

## Workflow
G1 需求与细化(requirements) → G2 设计与选型(architecture/tech-selection/container/ssr-seo) → G3 编码(coding-standards + 模板) → G4 测试验收(testing-acceptance + check-env/check-project/check-seo/check-build + 真机核对) → G5 发布(release + 发布前门)。每门满足出口准则才进下一门、发现上层错回退。详见 `SKILL.md`。

## Contributing
修订能力边界时同步：`scripts/check-env.mjs` 能力矩阵 + `references/container.md` + `references/pitfalls.md` + `scripts/check-project.mjs` 禁止项规则；改完跑 `node scripts/check-env.mjs` 与 `node scripts/check-project.mjs .`。

## Trademark
`alipay` / 支付宝 等相关商标归其各自所有权人所有；本技能与支付宝及其关联方无任何隶属或授权关系。

## License
[ISC](https://opensource.org/licenses/ISC)

## Author
[**hey_tangxiaoxin**](https://github.com/hey_tangxiaoxin)
