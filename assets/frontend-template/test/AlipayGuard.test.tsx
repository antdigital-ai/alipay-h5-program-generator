import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AlipayGuard } from '../../src/components/AlipayGuard'; // 路径按项目实际调整

// isAlipayClient 默认按 navigator.userAgent 判；测试环境 UA 非支付宝 → 浏览器分支
describe('AlipayGuard', () => {
  it('浏览器内显示「请在支付宝中打开」、子内容不可见', async () => {
    render(
      <AlipayGuard>
        <div data-testid="child">该内容对浏览器不可见</div>
      </AlipayGuard>
    );
    expect(await screen.findByText(/请在支付宝中打开/)).toBeTruthy();
    expect(screen.queryByTestId('child')).toBeNull();
  });
});
