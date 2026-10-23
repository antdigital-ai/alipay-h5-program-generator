'use client';
import { useEffect, useState } from 'react';
import { Button, Result } from 'antd-mobile';
import { isAlipayClient, openPageInAlipay } from '../container';

/** 是否在支付宝内(SSR 期返回 null，挂载后判定，避免首屏闪烁与 hydration mismatch)。 */
export function useInAlipay(): boolean | null {
  const [v, setV] = useState<boolean | null>(null);
  useEffect(() => setV(isAlipayClient()), []);
  return v;
}

/**
 * noindex 功能页(B 类 /publish、/order、/result/:tradeNo)的浏览器降级屏：
 * 支付宝内渲染子内容；浏览器内显示「请在支付宝中打开」+ scheme/landing 唤起。
 */
export function AlipayGuard({ children }: { children: React.ReactNode }) {
  const inApp = useInAlipay();
  if (inApp === null) return null;
  if (inApp) return <>{children}</>;
  return (
    <div style={{ padding: '24px 0', textAlign: 'center' }}>
      <Result status="info" title="请在支付宝中打开" description="本功能需在支付宝客户端内使用" />
      <Button color="primary" onClick={() => openPageInAlipay(location.href)}>在支付宝中打开</Button>
    </div>
  );
}
