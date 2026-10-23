/**
 * 支付宝第三方纯 H5 — 容器抽象层(模板)
 * 约定见 references/container.md：默认 Level 1(标准 Web) + Level 2(开放平台服务端接口/scheme)。
 * 不要在此依赖 AlipayJSBridge.pushWindow/setTitle/setShareContent(第三方不可用)。
 */

// ---------- env ----------
export function isAlipayClient(): boolean {
  if (typeof window !== 'undefined' && typeof (window as any).AlipayJSBridge !== 'undefined') return true;
  return /AlipayClient|AliApp|Alipay/i.test(typeof navigator !== 'undefined' ? navigator.userAgent : '');
}

/**
 * SSR 安全判定（传 request 的 UA）：只在需要"是否在支付宝内"做极轻分流时用。
 * ⚠ 反 cloaking：绝不要据此给爬虫与用户出不同内容/head；爬虫 UA 不在支付宝内，
 *   按 UA 减内容会被判作弊。可据此"不预取登录态数据"，但公开 HTML 必须与真实用户一致。
 */
export function isAlipayClientSSR(ua: string | undefined): boolean {
  if (!ua) return false;
  return /AlipayClient|AliApp|Alipay/i.test(ua);
}


// ---------- navigation (第三方无多 webview -> 标准多页) ----------
/** 进入下一页：无论浏览器还是支付宝都是整页加载本 URL(标准多页)。 */
export function openPage(url: string, params?: Record<string, unknown>): void {
  location.assign(appendQuery(url, params));
}
/** 返回上一页：标准浏览器历史后退(无原生 popWindow)。 */
export function popWindow(): void {
  history.back();
}
/** 浏览器环境引导"在支付宝中打开"(landing scheme)。非 alipay.com 域名需配白名单。 */
export function openPageInAlipay(targetUrl: string): void {
  const scheme = `alipays://platformapi/startapp?appId=20000067&url=${encodeURIComponent(targetUrl)}`;
  const landing = `https://render.alipay.com/p/s/i/?scheme=${encodeURIComponent(scheme)}`;
  location.assign(landing);
}

// ---------- pay / auth (服务端建 URL,前端只跳转) ----------
/** 手机网站支付：服务端已生成 wap.pay 支付 URL，前端跳转即可。无需前端 SDK。 */
export function startPay(payServerUrl: string): void {
  location.assign(payServerUrl);
}
/** OAuth 授权：服务端已生成 publicAppAuthorize/授权 URL，前端跳转；回调页用 code 换 uid。 */
export function redirectToAuth(authServerUrl: string): void {
  location.assign(authServerUrl);
}
// 可选：仅 ap.getAuthCode（H5 半屏授权，open/01zsdu / mini/02xtl8）作"不离开页面"增强；来源/包名以
// open/08xgr7 为准，默认不引入；引入后在此处扩展，仍保持上层 API 不变。
// 支付一律服务端 wap.pay 跳转（ap.tradePay 公网无 H5 版，勿臆造）。

// ---------- cross-load state: localStorage + storage 事件 + visibilitychange ----------
const BUS_KEY = '__xc_bus__';
export function emit(event: string, payload: unknown, opts?: { from?: string; to?: string }): void {
  try {
    localStorage.setItem(BUS_KEY, JSON.stringify({ event, payload, ts: Date.now(), from: opts?.from, to: opts?.to }));
  } catch { /* 私有模式/空间不足：以服务端持久化为主 */ }
}
export function on(event: string, handler: (payload: unknown, from?: string) => void, opts?: { currentPage?: string }): () => void {
  const fn = (e: StorageEvent) => {
    if (e.key !== BUS_KEY || !e.newValue) return;
    try {
      const m = JSON.parse(e.newValue);
      if (m.event !== event) return;
      if (m.to && opts?.currentPage && m.to !== opts.currentPage) return;
      handler(m.payload, m.from);
    } catch {}
  };
  window.addEventListener('storage', fn);
  return () => window.removeEventListener('storage', fn);
}
export function onResume(handler: () => void): () => void {
  const fn = () => { if (document.visibilityState === 'visible') handler(); };
  document.addEventListener('visibilitychange', fn);
  return () => document.removeEventListener('visibilitychange', fn);
}

// ---------- helpers ----------
function appendQuery(url: string, p?: Record<string, unknown>): string {
  if (!p || !Object.keys(p).length) return url;
  const qs = new URLSearchParams(p as any).toString();
  return url.includes('?') ? `${url}&${qs}` : `${url}?${qs}`;
}
