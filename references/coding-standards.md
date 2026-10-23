# 编码规范（G3）

纯 H5 + App Router 的可维护底线。示例见 assets/frontend-template/。

## 目录结构（App Router，按 A/B/C 分）
```
src/
  lib/            # 接口与纯逻辑：api.ts / pay-server.ts / auth-server.ts / types.ts / constants.ts
  container/      # 容器抽象层(见 container.md)
  hooks/          # useInAlipay 等 SSR 安全 hook
  components/     # 通用 UI + 业务组件；server/client 按需
  app/
    layout.tsx robots.ts sitemap.ts
    <a-page>/page.tsx       # A 类 server 组件：generateMetadata + SSR 公开内容 + JSON-LD
    <b-page>/page.tsx       # B 类 client + AlipayGuard + noindex
    api/<pay|auth>/route.ts # 服务端：建 wap.pay / 授权 URL
```
- A 类用 server 组件直出公开内容进 HTML；登录态/支付落到同名 `.client.tsx`（挂 `'use client'`）。
- B 类整页 `noindex` + AlipayGuard；不要把可索引内容放进 B 页。

## 命名
- 文件：路由 `kebab-case`、复用组件 `PascalCase.tsx`、client 组件后缀 `.client.tsx`、server 页 `.page.tsx`。
- 变量/函数 `camelCase`；类型/接口 `PascalCase`；常量 `UPPER_SNAKE`。

## TypeScript
- `tsconfig`：`strict: true`、`noUncheckedIndexedAccess: on`、`paths` 别名 `@/*`。
- DTO 在 `lib/types.ts`；服务端返回与前端对齐；禁用隐式 `any`。

## server vs client 边界
- 能在 server 做的别搬 client（接口调用、内容拼装进 server 组件）。
- 只有需要 `window`/交互/登录态/支付才上 `'use client'`；模块顶层别用 `window`（防 hydration mismatch）。

## 接口层 `lib/api`
- 统一入口；列表/详情/支付/授权各一函数；返回同一类型；mock 与真实后端同签名（SSR/CSR 同源）。
- 服务端建 wap.pay/授权 URL 放 `pay-server.ts`/`auth-server.ts`；私钥签名只在服务端（见下）。

## 环境变量边界（安全）
- 服务端密钥(AppId 私钥等)只读服务端 env，**绝不**入前端 bundle / source map（check-build.mjs 兜底校验）。
- 只有「必须前端可见」的配置才用 `NEXT_PUBLIC_*`（白名单，如公网站点 origin/name）；每加一条 `NEXT_PUBLIC_` 评审一次。

## 错误 / 空态
- 接口失败统一：空态(antd-mobile `Empty`)+重试；server 组件取数失败给降级公开 HTML（别整页白屏），细节见 ux-interaction.md。

## 无障碍(a11y)编码基线（发布前由 testing-acceptance.md 验收）
- 语义化标签（`button`/`a`/`nav`/`main`/`section`/有序 headings）；可点元素用真 `button`/`a`（键盘可达 + 默认回车）。
- 图片 `alt`；表单 `label`/`aria-label`；键盘焦点可见（`:focus-visible`）；触控目标 ≥44px（见 responsive-cross-end.md）。
- 颜色对比达标(WCAG AA)；勿用纯颜色传达状态（配图标/文字）。

## 代码风格
- ESLint（`next/core-web-vitals` + `@typescript-eslint` + `jsx-a11y`）+ Prettier；模板见 assets/frontend-template（`.eslintrc.cjs`/`.prettierrc`）。
- 提交前 `next lint`/`tsc --noEmit` 过；CI 跑 check-env/check-project/check-seo/check-build（见 testing-acceptance.md）。
