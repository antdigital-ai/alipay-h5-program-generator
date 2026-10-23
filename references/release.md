# 发布与发布前门（G5）

性能/秒开、灰度策略、监控、安全 等执行细节见 references/release-perf.md；本页只管「发布流程与发布前门」(G5 出口)。

## 发布前门（过完才能发）
1. 护栏脚本全绿(rc 0)：`check-env` / `check-project` / `check-seo` / `check-build`。
2. 测试与验收(见 testing-acceptance.md §1–9)全过。
3. 服务端密钥不入前端：私钥只在服务端 env；前端 bundle 与 source map 不含密钥串（`check-build.mjs` 兜底）。
4. 灰度计划：CDN 按 URL/权重逐量；量级 → 观察指标(LCP/INP/CLS、错误率) → 放量/回滚阈值。
5. 监控接入：错误(Sentry/同类) + 性能 RUM(CWV) + 业务打点；告警阈值与负责盯盘人。
6. 回滚演练：知道如何分钟级回滚（版本号 + 静态资源长缓存 + HTML 短缓存，切版本即可）。

## 发布流程
1) `next build` → 产物；跑 `check-build.mjs`（产物首屏可抓内容、secret 不入包、 bundle 体积）。
2) 部署到 CDN（按分支/环境到不同路径/域名）；HTML 短缓存回源、静态资产长缓存。
3) 按 CDN 权重灰度；观察 RUM / Sentry；超阈值即回滚切版本。
4) 发布后核对：sitemap/robots 可达、OG 调试器卡片、支付 e2e、降级屏真机。

## 与能力边界的关系
- 无离线包 / 客户端开关 / 原生灰度；发布、灰度、监控、安全全走公开件(CDN / feature flag / Sentry / RUM)，勿臆造私有基建（见 pitfalls.md / release-perf.md）。
