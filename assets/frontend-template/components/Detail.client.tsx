'use client';
// hydrate 后追加登录态/支付入口；用标准 Web + 服务端支付/授权(见 container.ts)
import { useEffect } from 'react';
import { isAlipayClient, openPageInAlipay } from '../container';

export default function DetailClient({ data, id }: { data: { title: string; summary: string; cover: string }; id: string }) {
  useEffect(() => {
    document.title = `${data.title} - 站点名`; // 没有 setTitle，统一 HTML <title>
    // 支付/授权按钮：调后端拿 wap.pay / 授权 URL 后 location.assign(container.startPay / redirectToAuth)
  }, [id, data]);

  return (
    <div>
      <h1>{data.title}</h1>
      <p>{data.summary}</p>
      {/* 登录态互动(无登录自动降级)；支付走服务端 wap.pay 跳转 */}
      {!isAlipayClient() && (
        <button onClick={() => openPageInAlipay(location.href)}>在支付宝中打开体验更佳</button>
      )}
    </div>
  );
}
