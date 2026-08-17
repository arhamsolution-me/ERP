# MEGA PROMPT 06 — DEVOPS, INFRASTRUCTURE & SCALABILITY (1,000,000+ USERS)
## NexERP — Global Multi-Tenant Textile-to-Retail ERP

**Role for AI Agent:** You are a Principal DevOps/SRE Engineer. Design and implement infrastructure that keeps the platform available, fast, and cost-sane at scale — from first paying tenant through 1,000,000+ platform users — without the system "falling over" (website crash / slowdown) at any growth stage.

---

## 1. Environment Strategy

```
local (Docker Compose) → staging (mirrors prod topology, smaller scale) → production (multi-AZ)
```

Every environment provisioned via Infrastructure as Code (Terraform) — no manual console clicks in staging or production. All infra changes go through PR review + `terraform plan` output posted to the PR before merge.

---

## 2. Compute & Orchestration

- Kubernetes (managed: EKS/GKE) for the API, worker, and AI service tiers.
- Next.js frontend deployed to a globally-distributed edge platform (Vercel or self-hosted behind Cloudflare) for the marketing surface; dashboard/app surface can run as standard SSR pods behind the same cluster for operational simplicity.
- Autoscaling:
  - **Horizontal Pod Autoscaler** on API pods: min 3, max 100, target 65% CPU + custom metric (in-flight request count).
  - **Cluster Autoscaler** on node pools to add/remove nodes as pod demand changes.
  - AI service pods scale independently (GPU-backed node pool), scale-to-near-zero during off-hours since defect-scanning/forecasting is bursty, not constant.
- Pod Disruption Budgets on every deployment so rolling updates/node drains never take the API below minimum healthy replica count.

---

## 3. Database Scaling Path (staged, not all built on day one — document the trigger for each stage)

| Stage | Trigger | Action |
|---|---|---|
| 1 | Launch | Single Postgres primary + 1 read replica, PgBouncer pooling |
| 2 | >70% CPU sustained on primary, or replica lag issues | Add 2nd read replica, route all reporting queries there |
| 3 | Table bloat on high-volume tables | Activate partitioning + archival jobs (defined in Prompt 02) |
| 4 | Single primary write throughput becomes the bottleneck | Migrate to Citus (sharded Postgres) sharded by `tenant_id`, or move largest tenants to dedicated schema-per-tenant |
| 5 | Global tenant base (multi-continent) | Cross-region read replicas with latency-based routing; evaluate multi-primary only if truly required |

Do NOT pre-build stage 4/5 infrastructure before the metrics in the trigger column are actually observed — premature sharding adds operational complexity without benefit.

---

## 4. Caching & CDN

- Redis Cluster (managed: ElastiCache/MemoryStore) for sessions, rate-limit counters, hot-read cache — sized and sharded independently from the "future DB shard" concern above.
- Cloudflare in front of everything: CDN for static assets, WAF, DDoS mitigation, and edge rate limiting before traffic even reaches the cluster.
- Cache invalidation is targeted (specific keys on write), monitored via cache hit-ratio dashboard — a sustained drop in hit ratio is itself an alerting signal (something's invalidating too aggressively or a cache-stampede is occurring).

---

## 5. Load Testing & Capacity Planning

- Before every major release, run load tests (k6 or Gatling) simulating realistic peak patterns: POS checkout burst (retail store opening hours across time zones), month-end payroll run, month-end financial reconciliation — these are NexERP's actual peak-load shapes, not generic traffic.
- Capacity targets validated by load test, not assumption: p99 API latency < 500ms at 50,000 concurrent simulated users before sign-off on a release that touches hot-path code (POS, auth, inventory).
- Chaos testing (occasional pod kill, forced replica failover in staging) to verify the system degrades gracefully rather than cascading.

---

## 6. CI/CD Pipeline

```
PR opened → lint + typecheck + unit tests + Lighthouse CI (frontend) + OWASP ZAP baseline (backend)
  → merge to main → build container images → push to registry
  → deploy to staging → integration test suite + smoke test
  → manual approval gate → canary deploy to production (5% traffic)
  → automated error-rate check (5-10 min) → full rollout OR automatic rollback
```

- Database migrations run as a separate pipeline step BEFORE app deploy, and must be backward-compatible with the previous app version (so a rollback of the app doesn't break against a newer schema) — expand/contract migration pattern, never a breaking rename in a single deploy.

---

## 7. Monitoring, Alerting & On-Call

- Prometheus + Grafana for metrics; centralized structured logging (Loki or ELK) with `tenant_id` and `request_id` as indexed fields so any incident can be traced to the specific affected tenant(s) immediately.
- OpenTelemetry distributed tracing across API → worker → AI service.
- Key dashboards: request latency percentiles, error rate by route, DB connection pool saturation, Redis hit ratio, queue depth/age, POS sync-conflict rate.
- PagerDuty/Opsgenie on-call rotation with clearly tiered severity: Sev-1 (platform down / cross-tenant data exposure) pages immediately, Sev-2 (single tenant degraded) business-hours response, Sev-3 (cosmetic) ticketed.
- Status page (public) for transparency during incidents, especially important for enterprise international clients with their own SLA expectations.

---

## 8. Cost Management at Scale

- Right-size before scale-out: profile and optimize hot queries/N+1 issues BEFORE reaching for more infrastructure — throwing hardware at inefficient code is expensive and masks bugs.
- Reserved/committed-use instances for baseline steady-state load once traffic patterns are known; autoscaling handles bursts on top of that baseline.
- Cold storage tiering (S3 Glacier or equivalent) for archived partitions (Prompt 02) and old audit logs — don't pay hot-storage prices for data accessed once a year.
- Per-tenant resource usage tracked so the platform's subscription pricing (Prompt 02, `subscription_plans`) can be validated against actual infra cost per tenant tier.

---

## 9. Disaster Recovery

- RTO ≤ 1 hour, RPO ≤ 5 minutes for the primary database (as set in Prompt 01) — validated with an actual quarterly restore drill, not just assumed from backup configuration.
- Multi-AZ deployment for all stateful services (Postgres, Redis) as the baseline — a single AZ outage must not take the platform down.
- Documented, tested runbooks for: full region failure, accidental data deletion (restore from point-in-time backup), compromised credential rotation.

---

## 10. Deliverable Expectations for AI Agent

1. Terraform modules for the full production topology (VPC, EKS/GKE cluster, RDS/Cloud SQL Postgres with read replica, ElastiCache/MemoryStore Redis, S3 buckets with lifecycle policies).
2. Helm charts / Kubernetes manifests for API, worker, and AI service deployments including HPA and PodDisruptionBudget configs.
3. GitHub Actions (or equivalent) pipeline implementing the CI/CD flow in Section 6.
4. k6 load test scripts modeling the three peak-load shapes in Section 5.
5. A `RUNBOOKS.md` covering the disaster recovery scenarios in Section 9.

---

## Suite Complete

All 6 mega-prompts (Architecture → Database → Security → API Routes → Frontend/SEO → DevOps/Scalability) form the complete NexERP build specification. Build in the order listed in `00_MASTER_OVERVIEW.md`.
