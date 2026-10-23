# SSR / SEO / 分享

## 渲染选型
- 内容多静态(详情/列表/落地) → **SSG**(构建期) 或 **SSG+ISR**(按 id 重生成)。SEO 最佳、CDN 部署。
- 内容按请求动态(首页推荐、个人化强) → **SSR**。
- 功能页(发布/订单) → CSR + `noindex`。
- AntD Mobile v5 SSR 兼容(官方有 Next.js 示例)；App Router 里作 `'use client'` 组件，SSR 仍渲染首屏 HTML。注意模块顶层别用 `window`，防 hydration mismatch。

## 公开可索引页的 head（必须进 SSR HTML，不要 JS 动态塞）
```html
<title>{内容标题} - {站点名}</title>
<meta name="description" content="{摘要}" />
<link rel="canonical" href="https://m.example.com/detail/123" />
<meta property="og:type" content="article" />
<meta property="og:url"  content="https://m.example.com/detail/123" />
<meta property="og:title" content="{内容标题}" />
<meta property="og:description" content="{摘要}" />
<meta property="og:image" content="https://m.example.com/covers/123.jpg" />
<meta name="twitter:card" content="summary_large_image" />
<script type="application/ld+json">{ ... Article/Product/ItemList ... }</script>
```
- `canonical` = `og:url` = 分享 url = 公网 URL，**四处一致**。
- 可抓内容须**无登录**可拼出；登录态内容 hydrate 后追加。反 cloaking（见 references/pitfalls.md §4）：爬虫与用户拿同一 HTML。
- sitemap.xml 只含 A 类 URL(含分页)，每页各自 canonical；robots.txt 双保险屏蔽 B 类。

## 分享（双路径）
- **外部分享**(微信/QQ/浏览器粘贴)：靠 `og:*`(上面已进 HTML)。
- **App 内分享**：第三方 H5 拿不到 `setShareContent`；默认就是分享当前 URL，用户点开后经 scheme/landing 唤起进支付宝(见 env-degradation.md)。App 内自定义卡片属小程序能力，不在本路径。
- 标题统一用 HTML `<title>`(没有原生 setTitle)。
