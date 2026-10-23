# 环境判定与降级

## 是否在支付宝内（UA 同步判定，SSR 安全）
```ts
export function isAlipayClient(): boolean {
  if (typeof window !== 'undefined' && typeof (window as any).AlipayJSBridge !== 'undefined') return true;
  return /AlipayClient|AliApp|Alipay/i.test(typeof navigator !== 'undefined' ? navigator.userAgent : '');
}
```
- 这个判定**只用于**：启用支付/授权等公开能力、给浏览器用户做降级。**不**用它去调 `AlipayJSBridge` 容器 JSAPI(第三方不可用)。
- React：用 `useInAlipay()` 钩子(SSR 期返回 null，挂载后判定)防闪烁。

## 浏览器 → 支付宝：scheme + landing 唤起
```ts
export function openPageInAlipay(targetUrl: string): void {
  const scheme = `alipays://platformapi/startapp?appId=20000067&url=${encodeURIComponent(targetUrl)}`;
  const landing = `https://render.alipay.com/p/s/i/?scheme=${encodeURIComponent(scheme)}`;
  location.assign(landing); // 非 alipay.com 域名需在开放平台配白名单
}
```

## noindex 功能页的浏览器降级屏（AlipayGuard）
B 类功能页(`/publish`、`/order`、`/result/:tradeNo`)：
- `robots: noindex`；浏览器打开时**不**渲染整页 CSR，显示"请在支付宝中打开"+`openPageInAlipay`。
- 在支付宝内则渲染子内容。
模板见 assets/frontend-template/AlipayGuard.tsx。

## 公开页不挡浏览器
A 类(详情/列表/活动)在浏览器与支付宝都正常展示(SSR HTML)。浏览器只是拿不到登录态/支付态，自然降级。

## SSR / 服务端判定（避免 cloaking）
`isAlipayClientSSR(request.headers.get('user-agent'))` 在服务端轻量判定"是否在支付宝内"——**仅用于极轻分流**（如不预取登录态数据）。⚠ 严禁据此给爬虫与用户出不同可见内容/head（判为 cloaking）：爬虫 UA 不在支付宝内，按 UA 减内容即作弊。模板里已有 `isAlipayClientSSR`（见 assets/frontend-template/container.ts）。详见 references/pitfalls.md。
