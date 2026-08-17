# MEGA PROMPT 01 — SYSTEM ARCHITECTURE
## NexERP — Global Multi-Tenant Textile-to-Retail ERP

**Role for AI Agent:** You are a Principal Systems Architect designing a globally scalable, multi-tenant SaaS ERP capable of serving 1,000,000+ users across textile manufacturing and retail operations, with zero single point of failure and sub-200ms API response times under peak load.

---

## 1. Architectural Style Decision

Build as a **modular monolith with service-oriented boundaries**, NOT a premature microservices sprawl. Reasoning: a team this size cannot operationally support 20 microservices. Structure the monolith into clearly bounded modules that CAN be extracted into standalone services later without a rewrite:

```
/apps
  /web            → Next.js frontend (SSR + ISR)
  /api            → Node.js (Fastify/NestJS) core API monolith
  /worker         → Background job processor (BullMQ + Redis)
  /ai-service     → Python microservice (FastAPI) — defect detection, forecasting, NL query
/packages
  /shared-types   → TypeScript types shared across api/web
  /db             → Prisma schema + migrations, shared client
  /auth           → Auth/session logic, shared middleware
  /tenant-context → Multi-tenant resolution middleware
```

The **AI service is the one true microservice** from day one — it has different scaling characteristics (GPU/CPU bound, bursty) and a different language runtime (Python for YOLO/ML), so it must be independently deployable and scalable.

---

## 2. Multi-Tenancy Model

Use **shared database, shared schema, tenant_id discriminator column** approach (NOT database-per-tenant) for these reasons: 1,000,000 users across potentially thousands of tenant businesses makes database-per-tenant operationally unmanageable (migrations x N databases).

Rules:
- Every table (except global platform tables like `platform_admins`, `subscription_plans`) has a mandatory `tenant_id UUID NOT NULL` column, indexed as the leading column in every composite index.
- Enforce tenant isolation at THREE layers, not one:
  1. **Application layer**: every ORM query auto-injected with `WHERE tenant_id = :currentTenant` via a Prisma middleware/extension — no query is allowed to bypass this.
  2. **Database layer**: PostgreSQL **Row-Level Security (RLS)** policies on every tenant-scoped table as a defense-in-depth backstop, keyed to a session variable (`SET app.current_tenant_id`).
  3. **Cache layer**: every Redis key prefixed `tenant:{tenant_id}:...` — never a bare key.
- Large enterprise tenants (mills with 1000+ workers) get **schema-per-tenant** as an opt-in upgrade path for compliance-heavy clients — design the data layer so this migration path exists, but don't build it in v1.

---

## 3. Scalability Model — Designing for 1,000,000 Users

Assume peak concurrent load of ~5-8% of total users (50,000-80,000 concurrent), with POS transaction spikes during business hours across time zones.

**Stateless Application Tier**
- API servers hold zero session state in-process. All session/auth state lives in Redis. This allows horizontal auto-scaling — any request can land on any instance.
- Deploy on Kubernetes with Horizontal Pod Autoscaler (HPA) triggered on CPU (>65%) and custom metric (request queue depth).
- Minimum 3 replicas per service across 2+ availability zones at all times (no scale-to-zero on core API).

**Database Scaling**
- PostgreSQL primary + read replicas (minimum 2 read replicas in production). Route all `SELECT`-heavy reporting/dashboard queries to replicas; writes and read-your-write-critical paths (POS checkout) go to primary.
- Connection pooling via **PgBouncer** in transaction mode — application servers never connect directly to Postgres.
- Partition high-volume tables (`inventory_movements`, `pos_transactions`, `audit_logs`) by `tenant_id` hash + monthly range, so old partitions can be archived to cold storage (S3 + Parquet) without touching hot data.
- At real scale (post product-market fit), plan a migration path to **Citus (Postgres sharding extension)** sharded by `tenant_id` — document this now, implement when a single primary can't keep up.

**Caching Strategy**
- Redis Cluster (not single node) for session store, rate-limit counters, and hot-read caching (product catalog, pricing, tenant config).
- Cache-aside pattern: read from Redis → miss → read Postgres → populate Redis with TTL. Invalidate on write via targeted key deletion, never full flush.
- CDN (Cloudflare/CloudFront) in front of all static assets and public-facing marketing/SEO pages.

**Async & Background Processing**
- Anything not required for the immediate HTTP response goes to a queue (BullMQ on Redis): report generation, AI defect-detection batch jobs, email/SMS notifications, payroll calculation, demand-forecast model runs.
- Dead-letter queue + automatic retry with exponential backoff for failed jobs; alert on DLQ depth > threshold.

**Offline-First POS Resilience**
- Retail POS clients (PWA) maintain a local IndexedDB transaction queue. On connectivity loss, sales continue locally; on reconnect, a sync worker pushes queued transactions with idempotency keys and resolves stock-conflict via a "last-write-wins with manager override alert" rule — flag conflicts for manual reconciliation rather than silently dropping data.

**Multi-Region Readiness (design now, deploy later)**
- Stateless app tier + externalized session/cache means the API layer can be deployed to multiple regions behind a global load balancer (Route53/Cloudflare) with latency-based routing.
- Database stays single-region-primary initially (with cross-region read replica for DR), full multi-region write requires future work — note this explicitly as a v2 item, don't over-engineer v1.

---

## 4. High-Level Component Diagram (describe/build as system diagram)

```
[Cloudflare CDN/WAF]
        │
[Load Balancer] ──────────────┐
        │                     │
[Next.js Frontend Pods]  [API Gateway / Rate Limiter]
                                │
                    ┌───────────┴───────────┐
              [Core API Pods]         [AI Service Pods (Python)]
                    │                       │
        ┌───────────┼───────────┐           │
   [PgBouncer]   [Redis Cluster] [BullMQ Workers]
        │
[Postgres Primary] ── replicates to ── [Read Replica x2]
        │
[S3/Object Storage — assets, exports, cold archive partitions]
```

---

## 5. Failure & Resilience Requirements

- Every external dependency call (payment gateway, SMS, FBR tax API) wrapped in a **circuit breaker** — fail fast and degrade gracefully rather than cascading failure.
- Health checks (`/healthz`, `/readyz`) on every service for Kubernetes liveness/readiness probes.
- Database automated backups: continuous WAL archiving + daily full snapshot, tested restore drill monthly.
- Blue-green or canary deployment strategy — new version receives 5% traffic first, auto-rollback on elevated error rate.
- Define and document RTO (Recovery Time Objective) ≤ 1 hour and RPO (Recovery Point Objective) ≤ 5 minutes for the primary database.

---

## 6. Observability Requirements

- Structured JSON logging everywhere, correlation ID (`request_id`) propagated across API → worker → AI service for full request tracing.
- Metrics via Prometheus + Grafana: request latency (p50/p95/p99), error rate, queue depth, DB connection pool saturation, cache hit ratio.
- Distributed tracing (OpenTelemetry) across service boundaries.
- Alerting thresholds defined per service (e.g., p99 latency > 500ms for 5 min → page on-call).

---

## 7. Deliverable Expectations for AI Agent

When implementing from this prompt, produce:
1. A monorepo scaffold (Turborepo or Nx) matching the folder structure in Section 1.
2. Docker Compose for local dev replicating: Postgres, Redis, MinIO (S3-compatible local), the API, and the AI service.
3. Kubernetes manifests (or Helm chart) for the production topology in Section 4.
4. A written ADR (Architecture Decision Record) for every major choice above, so future engineers understand the "why," not just the "what."

Proceed to `02_DATABASE_SCHEMA_PROMPT.md` for the data layer this architecture depends on.
