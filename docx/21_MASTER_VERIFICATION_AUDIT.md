# MEGA PROMPT 21 — MASTER VERIFICATION & AUDIT PROMPT
## NexERP — "Has Everything Actually Been Built?" Compliance Check

**Role for AI Agent:** You are a Principal QA/Audit Engineer performing an independent verification pass. You did NOT necessarily write this code — treat every claim of completeness with skepticism and VERIFY against the actual codebase, database, deployed infrastructure, and running system. Do not mark anything "done" based on a file existing with a plausible-sounding name — inspect the actual implementation. Where you cannot verify directly (e.g., no access to deployed infra), explicitly say so rather than assuming compliance.

**Output format required:** for every item below, respond with one of:
- ✅ **VERIFIED** — actually implemented and confirmed working (state HOW you confirmed it)
- ⚠️ **PARTIAL** — exists but incomplete/incorrect (state exactly what's missing)
- ❌ **MISSING** — not implemented at all
- ❓ **UNABLE TO VERIFY** — no access to check (state what access/tool would be needed)

Produce this as a structured `AUDIT_REPORT.md` at the end, organized by the section numbers below, with an executive summary counting totals in each category.

---

## 1. Architecture Compliance (Prompt 01)

- [ ] Monorepo structure matches the specified layout (`/apps/web`, `/apps/api`, `/apps/worker`, `/apps/ai-service`, `/packages/*`)
- [ ] AI service is genuinely deployed as an independent Python microservice, not folded into the main API
- [ ] Multi-tenancy: verify `tenant_id` column exists and is NOT NULL on every tenant-scoped table (query the actual schema, don't trust documentation)
- [ ] Stateless app tier confirmed: no in-process session storage found in code (grep for in-memory session objects)
- [ ] Read replicas actually provisioned and reporting/dashboard queries actually routed to them (not just documented as an intention)
- [ ] Redis Cluster (not single node) confirmed in the actual deployed configuration
- [ ] Offline-first POS: test by disabling network on a POS client and confirming a sale can still be completed and later synced
- [ ] Health check endpoints (`/healthz`, `/readyz`) exist and return correct status codes under both healthy and degraded conditions

## 2. Database Compliance (Prompt 02)

- [ ] Every table has `created_at`, `updated_at`, `deleted_at` — query `information_schema` to confirm across ALL tables, not a sample
- [ ] RLS policies exist and are ENABLED (not just defined but disabled) on every tenant-scoped table — test by attempting a cross-tenant query directly against the DB with a session variable set to a different tenant and confirming zero rows return
- [ ] Money columns are `BIGINT`/integer minor-units, never `FLOAT`/`DOUBLE` — grep schema for violations
- [ ] Partitioning actually implemented on the specified high-volume tables (`stock_movements`, `pos_transactions`, `audit_logs`, `attendance_logs`) — confirm via `\d+` or equivalent, not assumed
- [ ] Seed script creates all 11 system roles with correct default permission mappings — run it against a clean DB and verify role_permissions rows
- [ ] Indexes specified in Prompt 02, Section 10 actually exist — query `pg_indexes`, compare against the spec, list any missing

## 3. Security Compliance (Prompt 03)

- [ ] Invite-only enforced: attempt a direct signup request against the API with no invite token — confirm it's rejected
- [ ] Passwords hashed with argon2id (inspect the actual hashing library/config in code, not just assumed from a dependency being installed)
- [ ] MFA is genuinely mandatory (not just available) for Owner/GM/Accountant/HR Manager/Platform Admin roles — attempt login as each role without MFA enrolled and confirm it's blocked
- [ ] Refresh token rotation + reuse detection: manually replay an already-used refresh token and confirm the entire session family is revoked
- [ ] Tokens stored in httpOnly/Secure/SameSite cookies — inspect actual browser cookie attributes in dev tools, not just server code intent
- [ ] RBAC enforced server-side on every route — attempt at least 10 sample requests as a low-privilege role (Cashier) against high-privilege endpoints (e.g., payroll approval) and confirm 403s
- [ ] Branch-scoping actually filters query results — test as a Store Supervisor scoped to Branch A, confirm Branch B's data is genuinely inaccessible, not just hidden in the UI
- [ ] Field-level restriction confirmed: inspect actual API response payload for a Cashier's product list request — confirm `unit_cost` field is absent from the response body, not just hidden in the frontend
- [ ] TLS 1.2+ enforced, HSTS header present — check via an actual request/curl against production
- [ ] Rate limiting actually triggers 429s under real repeated requests (test, don't assume from config alone)
- [ ] Biometric/PII fields encrypted at rest — confirm via direct database inspection that the raw column value is NOT plaintext-readable

## 4. API Routes Compliance (Prompt 04)

- [ ] Every route listed in Prompt 04 actually exists and responds — systematically call each one (via the OpenAPI spec if generated) and confirm none 404
- [ ] Every mutating endpoint requires and correctly enforces `Idempotency-Key` — send the same request twice with the same key, confirm no duplicate side-effect occurred
- [ ] Standard error shape (`{ error: { code, message } }`) actually returned consistently — spot-check across multiple endpoints, not just one
- [ ] Middleware chain order verified in actual code (tenantResolver → authenticate → authorizePermission → branchScope → validateSchema → idempotencyCheck → handler) — confirm no route skips a step

## 5. Frontend/SEO/Performance Compliance (Prompt 05)

- [ ] Lighthouse CI actually configured as a merge-blocking check (not just present but set to non-blocking/advisory)
- [ ] Marketing pages confirmed SSG/ISR (view page source — content should be present without JS execution)
- [ ] Dashboard bundle isolation confirmed: inspect actual network tab — Cashier login should NOT download Finance module JS chunks
- [ ] Virtualized lists actually implemented on tables exceeding 200 rows — load a large dataset and inspect DOM node count (should stay bounded, not grow with row count)
- [ ] PWA/offline capability actually installable and functional with airplane mode enabled on the POS surface
- [ ] Accessibility: run axe-core (or equivalent) against every page, not just a sample — report actual violation count, don't assume AA compliance
- [ ] i18n scaffolding present even if only one language ships (no hardcoded English strings outside the i18n system — grep for hardcoded UI text)

## 6. DevOps/Scalability Compliance (Prompt 06)

- [ ] Terraform state actually reflects the specified topology (VPC, cluster, DB, Redis, S3) — run `terraform plan` against the live state and confirm zero unexpected drift
- [ ] HPA configs actually active on the specified deployments — check current replica counts and scaling behavior under a load test, not just that a YAML file exists
- [ ] CI/CD pipeline actually executes every stage specified (lint, test, Lighthouse CI, ZAP baseline, canary, auto-rollback) — trigger a deliberately-broken PR and confirm it's actually blocked at the right stage
- [ ] Canary auto-rollback tested: deploy a deliberately broken version to canary in staging and confirm automatic rollback actually fires within the specified window
- [ ] Backup restore drill actually performed at least once (not just scheduled) — request evidence/logs of an actual completed drill
- [ ] k6 load tests exist for all three peak-load shapes and have actually been run with results recorded (not just scripts sitting unused in the repo)

## 7. Page-Level Compliance (Prompts 07–11)

- [ ] All 97 pages from the sitemap actually exist and are reachable via navigation — systematically visit each one, flag any 404/placeholder/"coming soon"
- [ ] For a sample of at least 15 pages across different modules, verify EVERY element listed in Prompts 08–11's tables is actually present and functional (not just visually rendered but non-functional)
- [ ] Role-based visibility confirmed: log in as each of the 11 system roles and confirm sidebar/page access matches the specified permissions exactly — flag any role that can see/do something it shouldn't, or is missing something it should have

## 8. Extra Detailing / States Compliance (Prompt 12)

- [ ] Empty states actually implemented (not generic) — check at least 10 list/table pages with genuinely empty data and confirm each has a purpose-built empty state matching Prompt 12's table, not a blank table or generic "no data" text
- [ ] Loading skeletons match actual layout (not a generic spinner) — verify on slow-network simulation
- [ ] Double-submit prevention actually works — rapidly double-click a Submit/Charge button and confirm only one request fires
- [ ] Destructive-action confirmations present on every specified action (Suspend User, Delete Product, Reject Leave, etc.) — attempt each and confirm no single-click destructive path exists
- [ ] `UI_STATES_CHECKLIST.md` exists and has actually been completed per-page, not left as an empty template

## 9. Purchase/Vendor Compliance (Prompt 13)

- [ ] Full requisition → approval → PO → receipt → payment workflow actually functions end-to-end — walk through one real test transaction across every stage
- [ ] Spend-threshold approval routing actually enforced (test both above and below the configured threshold)
- [ ] Partial receipt handling confirmed: receive a PO partially, verify status correctly shows `partially_received`, then complete it and verify transition to `received`

## 10. Legal/Compliance Compliance (Prompt 14)

- [ ] ToS/Privacy Policy consent actually blocks onboarding submission until checked — attempt to submit without checking
- [ ] Version tracking actually stores `accepted_version`/`accepted_at` — inspect the database record after a real acceptance
- [ ] Data retention scheduled jobs actually exist and have run at least once (check job execution logs) — not just a policy table with no enforcing worker
- [ ] Data export request feature actually produces a complete, usable export when triggered — test it, inspect the output file
- [ ] **Confirm explicitly that a lawyer has reviewed the actual published ToS/Privacy Policy** — this is a documentation/process check, not a code check, but must be confirmed rather than assumed

## 11. Branding/Design Compliance (Prompt 15)

- [ ] Design tokens in `packages/ui/tokens.ts` actually match the finalized (lawyer/brand-confirmed) values, not still placeholder proposals from the original prompt
- [ ] Logo asset variants (full-color, white, black, icon-only) all actually exist as files, not just the primary variant
- [ ] Spot-check color contrast on primary/accent color combinations against WCAG AA using an actual contrast checker tool

## 12. SEO Compliance (Prompt 16)

- [ ] `sitemap.xml` and `robots.txt` actually live and correctly exclude dashboard/api/auth/pos — fetch them directly and inspect
- [ ] Structured data present and VALID — run every applicable page through Google's Rich Results Test, not just confirm JSON-LD exists in the source
- [ ] Every marketing page has a unique title/meta description — scrape and diff-check for duplicates
- [ ] Google Search Console actually connected and receiving data (not just theoretically integrated)
- [ ] Tenant subdomains actually return `noindex` — fetch a real tenant subdomain response and inspect headers/meta

## 13. Public API Compliance (Prompt 17)

- [ ] API keys actually stored hashed, never plaintext — inspect the database directly
- [ ] Scope enforcement actually works — create a key with only `products:read`, confirm every other endpoint correctly returns 403
- [ ] Sandbox environment genuinely isolated from production data — write via a sandbox key, confirm zero impact on live tenant data
- [ ] Hard exclusions from Section 8 (no POS transaction creation, no biometric data, no payroll, no user management) — actively attempt each excluded action via the public API and confirm all are blocked, don't just trust they were never built
- [ ] Webhook signature verification example code actually produces a valid signature matching what the platform sends — test end-to-end, not just review the doc page

## 14. DR Runbooks Compliance (Prompt 18)

- [ ] Every runbook (A–E) has actually been exercised at least once in a Game Day — request evidence/records, not just confirmation the document exists
- [ ] Soft-delete recovery (Runbook B) actually tested — soft-delete a test record, confirm the "clear `deleted_at`" recovery path genuinely restores it correctly
- [ ] Incident command roles (IC, Tech Lead, Comms Lead, Scribe) have actually been assigned to real people with a documented rotation, not left as abstract role descriptions
- [ ] Status page templates (Section 10, deliverable 3) actually exist and are ready-to-use, not still to-be-written

## 15. Stability Compliance (Prompt 19)

- [ ] SLO dashboards actually exist and show real measured data (not targets with no actual measurement wired up)
- [ ] Circuit breakers actually trip under a simulated dependency failure — kill the AI service in staging and confirm QC page degrades gracefully per Section 2's table, doesn't hang/crash
- [ ] Query timeouts actually enforced — run a deliberately slow query and confirm it's killed at the configured threshold, not left to run indefinitely
- [ ] Canary rollback actually fires automatically on a deliberately broken staging deploy (cross-check with Prompt 06 verification item)
- [ ] `STABILITY_CHECKLIST.md` actually used in recent PR reviews — check recent PR history for evidence of its application, not just that the file exists

## 16. Real-Time Layer Compliance (Prompt 20)

- [ ] WebSocket connections actually require valid auth — attempt an unauthenticated connection and confirm rejection
- [ ] Room authorization actually enforced server-side — attempt to subscribe to a room outside the test user's tenant/branch/permission scope and confirm rejection
- [ ] Session revocation actually kills live WebSocket connections within the specified window — revoke a session while a dashboard is live-connected, time how long until it disconnects
- [ ] Confirm NO financial/inventory mutation actually flows through a WebSocket write path — audit the gateway's message handlers for any write capability beyond subscribe/unsubscribe

---

## 17. Cross-Cutting Sanity Checks (things that slip through even when individual items pass)

- [ ] **End-to-end smoke test:** simulate a genuinely realistic full business day — Owner invites a Mill Manager → Mill Manager creates a batch → advances it through stages → QC passes it → Inventory receives finished stock → Retail Manager creates a wholesale order → Accountant generates an invoice → Payment recorded → HR runs payroll for the period. If this full chain doesn't work end-to-end, no amount of individually-passing checklist items matters.
- [ ] **Cross-tenant leak test:** create two test tenants, populate both with data, and systematically attempt to access Tenant B's data while authenticated as a Tenant A user across EVERY module (not just one) — this is the single highest-severity thing to verify given Prompt 18's Runbook C.
- [ ] **Consistency check between documentation and reality:** for any item marked ✅ VERIFIED, confirm the actual behavior matches what was SPECIFIED, not just that something resembling it exists — a common audit failure mode is confirming "a login page exists" without confirming it matches the MFA/rate-limit/error-message requirements actually specified.
- [ ] **Regression check:** confirm that fixing/building a later-numbered prompt (e.g., 19/20) didn't silently break something verified earlier (e.g., did adding the real-time layer accidentally introduce a new cross-tenant leak vector, per Prompt 20 Section 4's explicit warning).

---

## 18. Audit Report Requirements

Produce `AUDIT_REPORT.md` with:
1. Executive summary: total counts of ✅/⚠️/❌/❓ across all sections.
2. Every ❌ and ⚠️ item listed with specific remediation steps, not just flagged.
3. A prioritized list: which gaps are SEV-1-equivalent (security/data-isolation failures — treat with the same urgency as Prompt 18) versus lower-priority polish gaps.
4. An honest confidence statement: which sections could be fully verified with available access/tools, and which require follow-up with someone who has production access, a lawyer, or other resources this audit pass didn't have.

**Do not soften or round up findings to make the report look better.** An audit that quietly overlooks gaps to present a clean report is actively harmful — it gives false confidence exactly where real risk (especially cross-tenant data isolation and financial-mutation integrity) is concentrated.

This prompt (`21`) completes the NexERP specification suite as its verification counterpart. Full suite is now `00`–`21`, 22 files total — `00`–`20` specify what to build, `21` verifies whether it was actually built correctly.
