# 跨页 / 跨次状态

纯 H5 无多 webview，"跨页通信"主要是**跨次访问/跨标签页**复用状态，不是实时多窗口消息。原则：**服务端持久化为主，前端补偿为辅**。

## 主路径：服务端
A 页写入服务端(如状态/进度/草稿)，B 页打开时拉取并写入自己页面内。最可靠，无 cookie/storage 缺失风险。

## 前端补偿：localStorage + storage 事件（同源标准 Web）
- 写：`localStorage.setItem('__bus__', JSON.stringify({event,payload,ts}))`
- 其它同源 WebView/标签页收到 `window.addEventListener('storage', e => ...)`(本页写不触发自己，正好用于跨页)。
- "回到前台"用 `visibilitychange`(`document.visibilityState==='visible'`) 兜底刷新。
- 见 assets/frontend-template/container.ts 的 `emit/on/onResume`。
- 真机验证：同源 storage 事件在支付宝 WebView(iOS/Android) 跨 WebView/跨次的表现。

## 不行的方式
- 跨页共享 `window` 全局/模块单例/内存里状态——拿不到。
- 依赖"上一页还活着所以能读到"——第三方 H5 多页是整页加载，上一页 JS 上下文已成历史。
