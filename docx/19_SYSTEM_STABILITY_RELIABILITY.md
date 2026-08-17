# MEGA PROMPT 19 — SYSTEM STABILITY & RELIABILITY ENGINEERING
## NexERP — Keeping the Platform Fast and Unbreakable Under Real-World Load

**Role for AI Agent:** You are a Principal Site Reliability Engineer. Prompt 01 designed the architecture to SCALE; Prompt 06 designed the infrastructure to DEPLOY; this prompt defines how the system stays **stable** under real, messy, unpredictable conditions — traffic spikes, bad actors, buggy integrations, partial failures — without crashing ("website faty na") or degrading ("system slow na ho"), per the original project requirement.

---

## 1. Service Level Objectives (SLOs) — Define "Stable" Precisely

Stability isn't a feeling, it's a measured target. Every core user journey gets an explicit SLO, so the team knows exactly when the system is/isn't meeting the bar:

| User Journey | Latency SLO (p95) | Availability SLO |
|---|---|---|
| POS checkout (Charge button, page 43) | < 300ms | 99.95% (this is the single most business-critical path — a slow/down POS directly stops a retail sale in progress) |
| Dashboard page load | < 1.5s | 99.9% |
| Batch stage advance (production) | < 500ms | 99.9% |
| Report generation (async, page loads then background) | Initial response < 200ms (job queued), completion < 2min for standard reports | 99.5% |
| Public API request (Prompt 17) | < 400ms | 99.9% |
| Login/auth flow | < 500ms | 99.95% (auth blocking = entire platform inaccessible) |

- **Error budget:** each SLO implies an allowed failure rate (e.g., 99.9% availability = ~43min downtime/month budget). Once a service's error budget is exhausted for the month, new feature deploys to that service PAUSE in favor of stability work — this is a real engineering-culture rule, not just a metric on a dashboard, and it's what actually prevents "we kept shipping features on a wobbling system until it fell over."

---

## 2. Graceful Degradation — Fail Partially, Never Fully

The core stability principle: **a non-critical failure must never cascade into a critical one.** Define explicit degradation behavior per dependency:

| Dependency Fails | Degraded Behavior (NOT a full outage) |
|---|---|
| AI defect-detection service down | QC Inspection page (Prompt 08, page 29) still works — inspector does manual pass/fail without the AI-assist panel, a banner explains AI scoring is temporarily unavailable |
| Demand forecasting service down | Inventory dashboard hides the forecast widget, everything else (stock levels, transfers) unaffected |
| SMS/WhatsApp notification provider down | In-app notification center (Prompt 12, Section 8) still delivers the alert; SMS queues and retries in background, doesn't block the triggering action |
| Payment gateway (JazzCash/Easypaisa) down | POS still accepts Cash/Card payment methods; the affected method is visibly disabled with a clear reason, not a generic checkout failure |
| Read replica lag/unavailable | Reporting queries fall back to primary (with a rate-limit safeguard to prevent this fallback itself overloading primary) rather than failing outright |
| Redis cache unavailable | Application falls back to direct DB reads (slower, but functional) rather than treating cache-miss-on-every-key as a hard failure — cache is an optimization layer, never a hard dependency for correctness |
| Biometric attendance device offline | HR Manager can still log attendance manually (Prompt 10, page 69) — the biometric feed is one input method, not the only one |

**Rule for every new feature going forward:** before shipping, explicitly answer "what happens to the rest of the platform if THIS specific piece breaks?" — if the honest answer is "everything goes down," that's a design flaw to fix before launch, not an acceptable risk to accept silently.

---

## 3. Circuit Breakers — Detailed Implementation (extends Prompt 01's mention)

- Every external/dependency call (AI service, payment gateway, SMS provider, FBR tax API, biometric device integration) wrapped in a circuit breaker with three states:
  - **Closed** (normal): requests flow through normally, failures counted.
  - **Open** (tripped): after N consecutive failures (or a failure-rate threshold over a rolling window) — stop calling the dependency entirely for a cooldown period, fail fast with the degraded behavior from Section 2, instead of letting every request hang waiting on a timeout against a known-broken dependency.
  - **Half-Open** (probing): after cooldown, allow a small number of test requests through — if they succeed, close the circuit (resume normal traffic); if they fail, re-open and extend cooldown.
- **Why this matters for stability specifically:** without circuit breakers, one slow/broken downstream dependency causes every request touching it to hang until timeout, which exhausts the app server's connection pool/thread capacity, which then makes the ENTIRE platform slow/unresponsive even for requests that don't touch the broken dependency — this is the single most common "one small thing broke and now the whole website is down" failure pattern, and circuit breakers are the direct countermeasure.
- Circuit breaker state changes logged and alertable — an open circuit breaker is itself a signal worth paging on (a dependency is down), separate from and in addition to the underlying dependency's own alerting.

---

## 4. Backpressure & Overload Protection

- **Queue depth limits:** background job queues (BullMQ, Prompt 01) have a maximum depth per queue — if exceeded (e.g., a sudden burst of AI defect-scan requests), new jobs are rejected with a clear "system busy, try again shortly" response rather than accepting unbounded work that will never drain in reasonable time and eventually exhausts worker memory.
- **Request queuing at the load balancer/API gateway level:** rather than every app pod accepting unlimited concurrent connections (which degrades ALL in-flight requests as memory/CPU is shared across too many concurrent operations), cap concurrent requests per pod and queue/reject beyond that — a controlled, fast rejection is more stable than an uncontrolled slow-motion collapse.
- **Database connection pool exhaustion protection:** PgBouncer (Prompt 01) enforces a hard connection ceiling — application code must handle "pool exhausted, please retry" gracefully (with backoff) rather than the failure mode being an unhandled crash.
- **POS burst handling specifically:** retail store-opening-hour bursts (Prompt 06, Section 5's identified peak-load shape) are the most predictable overload scenario in this specific business domain — pre-scale (scheduled HPA minimum replica increase, not purely reactive autoscaling) ahead of known peak windows per branch/timezone rather than relying solely on reactive autoscaling, which has a lag that reactive scaling alone won't cover fast enough for a sudden multi-branch simultaneous opening-time spike.

---

## 5. Resource Leak Prevention (the "system gets slow over time" failure mode)

- **Memory leaks:** every long-running process (app servers, workers, AI service) has memory-usage alerting on a rising trend (not just an absolute threshold) — a slow leak that would eventually OOM-crash a pod is caught and the pod recycled proactively during a low-traffic window, not discovered only when it crashes during peak hours.
- **Connection leaks:** every DB/Redis connection acquired must have a guaranteed release path (try/finally or equivalent in every language used) — code review checklist item, and connection-pool-usage-over-time is a monitored metric that would reveal a leak before it exhausts the pool.
- **Unbounded in-memory caches:** any in-process caching (should be minimal given the "stateless app tier" principle from Prompt 01, but where it exists — e.g., a small config cache) must have a bounded size/TTL, never allowed to grow unbounded with tenant/request-scoped data.
- **Scheduled restarts as a safety net, not a fix:** Kubernetes rolling-restart on a schedule (e.g., weekly) as a defense-in-depth measure against slow leaks that monitoring hasn't caught yet — this masks rather than fixes a real leak, so it's paired with, never a substitute for, the monitoring/root-causing above.

---

## 6. Database Query Stability

- **Slow query monitoring:** every query above a threshold (e.g., 500ms) logged with its execution plan, reviewed weekly — an unindexed query that works fine at 100 tenants can become the platform's single point of collapse at 10,000 tenants; catching this trend early (via monitoring) is vastly cheaper than an incident.
- **N+1 query prevention:** ORM (Prisma, per Prompt 01) usage reviewed in code review specifically for N+1 patterns (e.g., loading a list of batches, then separately querying each batch's material consumption in a loop) — a single N+1 pattern reaching production and then hitting real tenant-scale data volume is a classic, entirely preventable "website faty" cause.
- **Query timeouts:** every database query has an enforced maximum execution time (statement_timeout at the connection level) — a runaway query (buggy report filter, accidental full-table scan) is killed rather than allowed to hold a connection/lock indefinitely and starve the rest of the platform.
- **Long-running transaction limits:** similarly, no transaction is allowed to stay open indefinitely — long-held locks from a stuck transaction are a well-known cause of platform-wide write-stalls even when the underlying hardware is perfectly healthy.

---

## 7. Deployment Stability (don't let releases BE the outage cause)

- **Canary deployment enforcement** (extends Prompt 06, Section 6): the automated error-rate check after 5% canary traffic is a hard gate — a deploy that fails it auto-rolls-back with zero manual step required; the most stable systems assume a human WON'T be watching every deploy in real time and design the safety net accordingly.
- **Feature flags for risky changes:** any change to a high-traffic path (POS checkout, auth, inventory mutation logic) ships behind a feature flag, enabled gradually (internal tenants first, then a % rollout) rather than instantly for 100% of tenants — decouples "deploy the code" from "activate the behavior," so a bad change can be flagged off in seconds without a full rollback/redeploy cycle.
- **Database migration safety** (re-stated from Prompt 06): expand/contract pattern strictly enforced — a migration that locks a large table during business hours (e.g., adding a NOT NULL column without a safe default strategy) is a self-inflicted stability incident; migrations on high-volume tables (Prompt 02's partitioned tables) reviewed specifically for lock behavior before merge.
- **Load testing before, not after:** Prompt 06 Section 5's k6 load tests are a merge-gate for any change touching hot-path code, not a periodic nice-to-have — this is restated here because it is the single most direct link between "testing discipline" and "the website doesn't fall over," and deserves explicit ownership by whoever reviews stability-critical PRs.

---

## 8. Multi-Tenant "Noisy Neighbor" Protection

Specific to this platform's multi-tenant architecture (Prompt 01/02) — one tenant's unusual load pattern must never degrade the platform for other tenants:

- **Per-tenant rate limiting** (extends Prompt 17's per-API-key limits to the internal app too) — a single tenant running an unusually heavy reporting job, or an integration bug hammering the API, is throttled at the tenant level before it can consume disproportionate shared-infrastructure capacity.
- **Query resource governance:** consider statement-level resource limits (e.g., `work_mem` caps, cost-based query limits) so one tenant's poorly-filtered giant report query can't monopolize database resources that other tenants' fast, well-formed queries are also competing for.
- **Large-tenant isolation path:** per Prompt 02's noted future upgrade path (schema-per-tenant for large enterprise clients) — this exists specifically as a stability lever: if one very large tenant's legitimate scale genuinely risks impacting smaller tenants sharing the same database, isolating them is the architectural answer, not just throwing more hardware at the shared instance indefinitely.

---

## 9. Chaos Engineering & Proactive Stability Validation

- **Scheduled chaos experiments in staging** (extends Prompt 06's chaos testing mention): pod kills, forced replica failover, artificially injected latency on a dependency, simulated Redis unavailability — run these ROUTINELY (not just once before launch) so that Section 2's degradation behaviors and Section 3's circuit breakers are continuously verified to actually work, not just designed-on-paper.
- **Game Day integration:** combine with Prompt 18's DR Game Days — stability chaos-testing and disaster-recovery drilling are closely related disciplines and can share the same quarterly exercise cadence.
- **Synthetic monitoring:** automated synthetic transactions (a scripted "log in → view dashboard → create a test batch" flow, run every few minutes from outside the infrastructure) catch real user-facing breakage faster than waiting for internal metrics to cross an alert threshold or for a tenant to report it.

---

## 10. Capacity Planning Discipline (staying ahead of growth, not reacting to it)

- **Growth-based forecasting:** track tenant count, transaction volume, and data size trends monthly, and re-run Prompt 06's load tests against PROJECTED (not just current) load every quarter — the goal is to identify the next bottleneck (Section 3 of Prompt 06's DB scaling stages, for example) before it's actually been hit in production, not during an incident.
- **Headroom target:** infrastructure sized to handle at minimum 3x current peak load comfortably at all times — autoscaling handles bursts, but the BASELINE capacity plan should never assume the system is already running near its ceiling during normal operation, since that leaves no margin for an unexpected spike layered on top of already-high normal load.
- **Cost-vs-stability tradeoff transparency:** capacity headroom costs money (Prompt 06, Section 8) — this is a conscious business tradeoff to periodically revisit with Devnexes leadership, not a purely technical decision made once and forgotten.

---

## 11. Deliverable Expectations for AI Agent

1. SLO definitions (Section 1) implemented as actual monitored metrics + error-budget tracking dashboard (Grafana, per Prompt 06).
2. Circuit breaker library/middleware wrapping every external dependency call identified in Section 3, with configurable thresholds per dependency.
3. Graceful-degradation logic explicitly implemented (not just documented) for every dependency in Section 2's table — each with its own test case verifying the degraded-but-functional behavior.
4. Query timeout + slow-query-logging configuration at the database connection layer (Section 6).
5. A `STABILITY_CHECKLIST.md` — a required review checklist for any PR touching a hot-path (POS, auth, inventory mutation) service, covering: N+1 check, migration lock-safety check, feature-flag wrap decision, load-test requirement.
6. Chaos engineering experiment scripts (Section 9) integrated into the same Game Day tooling built for Prompt 18.

This prompt (`19`) extends the NexERP specification suite. Full suite is now `00`–`19`, 20 files total.
