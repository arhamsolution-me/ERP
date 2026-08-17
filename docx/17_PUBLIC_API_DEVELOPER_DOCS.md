# MEGA PROMPT 17 — PUBLIC API & DEVELOPER DOCUMENTATION (WITH FULL SECURITY)
## NexERP — External Developer Platform Specification

**Role for AI Agent:** You are a Principal API Platform Engineer. This prompt defines a **separate, deliberately constrained public API surface** — distinct from the internal API in Prompt 04, which powers NexERP's own frontend. Tenants who want to connect their own tools (accounting software, e-commerce, custom BI, internal scripts) use THIS API. Treat every design decision here as security-first: this is the platform's largest external attack surface once it ships.

---

## 1. Public API vs Internal API — Why They're Separate

- The internal API (Prompt 04) is optimized for the frontend's exact needs and can change shape freely as the UI evolves — it is NOT a stable public contract.
- The Public API is a **stable, versioned, intentionally narrower contract** — exposing only what tenants legitimately need for integration (read/write on core entities: products, stock, orders, invoices, employees-limited), never raw internal implementation details (no `tenant_id` internals exposed as opaque as necessary, no direct exposure of internal RBAC role IDs, etc.).
- Rate limits, auth model, and versioning discipline are all stricter on the Public API than the internal one, because internal API consumers (the frontend) are trusted first-party code; public API consumers are third-party code the platform cannot fully vet.

---

## 2. Authentication Model

### API Keys (primary method for server-to-server integrations)
- Generated from the API Keys page (Prompt 10, page 89), scoped per-tenant.
- Format: a prefixed, high-entropy random token (e.g., `nex_live_sk_` + 32 bytes base62) — prefix identifies environment (`live`/`sandbox`) and key type at a glance, standard practice (mirrors Stripe-style key design) for easy identification in logs/leaked-secret scanning tools.
- **Stored hashed** (SHA-256 minimum) in the database — exactly like session tokens in Prompt 03, the plaintext key is shown to the user exactly once at creation time and never retrievable again.
- Each key has:
  - A human-readable label (set by the tenant, e.g., "QuickBooks Sync — Production")
  - Explicit **scopes** (see Section 3) — never a blanket "full access" key by default
  - Optional **IP allowlist** — tenant can restrict a key to specific server IPs, recommended for high-privilege integrations (financial data sync)
  - `created_at`, `last_used_at`, `expires_at` (optional but encouraged — keys can be set to auto-expire, forcing periodic rotation)
  - `revoked_at` — instant revocation, checked on every request (no caching of key validity beyond a few seconds TTL)

### OAuth 2.0 (for third-party apps built BY OTHERS for multiple NexERP tenants — e.g., a future app marketplace)
- Not required for v1 (API keys cover the primary use case of a tenant connecting their own single integration), but the API design must not preclude adding OAuth later — reserve `/oauth/authorize`, `/oauth/token` route namespace, design scopes (Section 3) to be reusable by both auth methods from day one so this isn't a breaking redesign later.
- When built: standard Authorization Code flow with PKCE, third-party app registration/review process before an app can request tenant-installable access (prevents malicious apps from harvesting broad tenant data access).

### Request Signing (webhooks — inbound TO tenant systems)
- Every outbound webhook payload (Section 6) is signed with an HMAC-SHA256 signature using a per-tenant webhook secret, sent in a header (e.g., `X-NexERP-Signature`) — receiving systems verify the signature to confirm the payload genuinely originated from NexERP and wasn't tampered with in transit or spoofed by an attacker who discovered the endpoint URL.
- Include a timestamp in the signed payload and reject/flag webhook deliveries with a stale timestamp (e.g., >5 minutes old) on the RECEIVING side's recommended implementation (document this in the developer docs) to prevent replay attacks — the platform can't enforce this on the tenant's server, but must document it clearly as a required practice.

---

## 3. Authorization Scopes (fine-grained, never all-or-nothing)

Every API key is issued with an explicit scope list — mirrors the internal permission codes (Prompt 03) but exposed as a smaller, public-facing set:

| Scope | Grants |
|---|---|
| `products:read` | List/get products & variants |
| `products:write` | Create/update products & variants |
| `inventory:read` | Read stock levels |
| `inventory:write` | Adjust stock, create transfers |
| `orders:read` | Read POS transactions & wholesale orders |
| `orders:write` | Create wholesale orders (never direct POS transaction creation via public API — POS integrity stays internal-only, see Section 8) |
| `finance:read` | Read invoices/payments (never bank account details or payment method tokens) |
| `finance:write` | Create invoices, record payments |
| `employees:read` | Read basic employee directory (name, role, branch — NEVER biometric data, NEVER payroll figures via public API, regardless of requested scope — hard-coded exclusion, not scope-configurable) |
| `webhooks:manage` | Register/manage webhook subscriptions |

- A key requesting a scope the tenant's own subscription plan doesn't include (e.g., Finance API access on a Starter plan) is rejected at key-creation time, not silently granted.
- Scopes are checked on every request identically to the internal RBAC enforcement pattern (Prompt 03) — same "default deny, fail closed" principle applies.

---

## 4. Rate Limiting & Abuse Prevention

- Per-API-key rate limits, tiered by subscription plan (e.g., Starter: 60 req/min, Professional: 300 req/min, Enterprise: custom/negotiated) — returned via standard headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`) so integrators can build proper backoff logic.
- `429 Too Many Requests` response with a `Retry-After` header on limit breach — never silently drop or degrade requests without signaling the reason.
- Separate, much stricter limits on expensive/bulk endpoints (bulk export, large list queries) vs. simple single-resource lookups.
- Anomaly detection: a sudden, sustained spike from one key (possible credential compromise or runaway integration bug) triggers an alert to the tenant Owner and, above a severity threshold, automatic temporary throttling pending tenant confirmation — same posture as the security monitoring in Prompt 03, Section 8, extended to the public API surface.
- Sandbox/test-mode keys (see Section 7) have separate, generous limits since they're used for development/testing, not production traffic.

---

## 5. Versioning Strategy

- URL-based versioning: `/api/public/v1/...` — the version is explicit and stable, never silently changed under a consumer's feet.
- **Backward-compatible changes** (adding a new optional field, a new endpoint) ship without a version bump.
- **Breaking changes** (removing/renaming a field, changing a field's type, changing required-ness) require a new version (`v2`), with the previous version supported for a documented deprecation window (minimum 6-12 months, communicated via changelog + email to all integration owners) before sunset.
- A `Deprecation` and `Sunset` HTTP header (per RFC 8594 convention) returned on any deprecated endpoint call, so well-behaved client code can detect and alert on upcoming breakage programmatically, not just via documentation reading.
- Every version's full spec remains in the documentation site (Section 9) even after deprecation announcement, until actual sunset.

---

## 6. Webhooks (outbound event notifications)

### Event Catalog (initial set)
```
product.created / product.updated
inventory.low_stock_triggered
order.wholesale.created / order.wholesale.fulfilled
invoice.created / invoice.paid / invoice.overdue
batch.stage_advanced / batch.qc_failed
```

### Delivery Mechanics
- Tenant registers an HTTPS endpoint URL (HTTP-only URLs rejected outright — no exception, this is a hard platform rule) per event type they want.
- Retry policy on delivery failure: exponential backoff (e.g., 1min, 5min, 30min, 2hr, 12hr) up to a defined max attempt count, then the event is marked failed and viewable in a delivery log — never infinite silent retries, never silent permanent drop without visibility.
- Delivery log (visible in Prompt 10's API Keys & Webhooks page) shows every attempt, response code, and payload for the tenant's own debugging — this is a frequently-underbuilt feature that causes major integrator frustration when absent.
- "Redeliver" action lets a tenant manually replay a specific failed webhook event from the log.
- Signature verification requirement (Section 2) documented prominently as the FIRST thing in the webhook docs — a shockingly common integration security failure across the industry is skipping signature verification entirely; the docs must make this impossible to miss.

---

## 7. Environments: Sandbox vs Live

- Every tenant gets an isolated **sandbox environment** with synthetic/seeded data, using `nex_test_sk_`-prefixed keys — fully functional API surface but writes never touch real production data, real payment gateways are mocked.
- Sandbox exists specifically so integration developers can build and test without any risk to live inventory/financial data — a frequent real-world integration bug is a developer accidentally testing against production and corrupting real stock counts; the platform must make sandbox the obviously-easier default path (e.g., sandbox key generation requires zero extra approval, live key generation requires an explicit "I understand this affects real data" confirmation).

---

## 8. Explicit API Boundaries — What is NEVER Exposed via Public API

This is a security-critical exclusion list, not an oversight to fill in later:
- **No direct POS transaction creation** — POS integrity (offline queue, idempotency, cashier session binding per Prompt 05) is too tightly coupled to the internal POS client to safely expose as a generic public write endpoint; a compromised API key must never be able to fabricate retail sales.
- **No biometric data, ever**, under any scope.
- **No payroll figures or bank account details**, under any scope — even `finance:read` excludes these; a dedicated, harder-to-obtain scope or no public exposure at all, decided deliberately rather than defaulted into.
- **No user/session management** (creating users, changing passwords, modifying roles) via public API — this remains an internal-only, invite-flow-governed process (Prompt 03) to prevent API-key compromise from escalating into full account takeover.
- **No cross-tenant data under any circumstance** — identical isolation guarantees as Prompt 02's RLS apply to every public API query without exception.

---

## 9. Developer Documentation Site Structure

Build as a dedicated docs subdomain (`developers.nexerp.com`), separate from both marketing and dashboard (own SEO/indexing rules — this SHOULD be indexed, unlike the dashboard, since good public API docs are themselves a discoverability/credibility asset).

### Required Pages
1. **Getting Started** — auth setup, first API call in under 5 minutes (a "quickstart" is the single highest-leverage docs page for developer adoption)
2. **Authentication** — API keys, scopes, IP allowlisting, full detail from Sections 2-3
3. **Rate Limits & Errors** — Section 4 detail + standard error response shape reference
4. **Versioning & Changelog** — Section 5 policy + a live, chronological changelog of every API change
5. **Resource Reference** (per entity: Products, Inventory, Orders, Invoices, Employees) — full field definitions, example requests/responses, generated from the OpenAPI spec (never hand-maintained separately from the spec — they will drift out of sync)
6. **Webhooks Guide** — Section 6 detail, including a signature-verification code sample in multiple languages (Node.js, Python, PHP at minimum, given the target markets)
7. **Sandbox Guide** — Section 7, how to seed test data
8. **SDKs & Client Libraries** — if/when official SDKs are built (Node.js and Python are the highest-value first targets given typical integrator stacks); until then, clear cURL + raw HTTP examples suffice
9. **Security Best Practices for Integrators** — a dedicated page telling THIRD-PARTY developers how to handle their NexERP API keys safely (never commit to a public repo, use environment variables/secrets managers, rotate periodically, use IP allowlisting where feasible) — platform security is a shared responsibility, and integrators need explicit guidance, not just an assumption they'll know this.
10. **Interactive API Explorer** — a live, authenticated "try it" console (Swagger UI/Redoc-based, generated from the same OpenAPI spec) so developers can test calls directly from the docs using their sandbox key.

### Documentation Generation Discipline
- The OpenAPI 3.1 spec is the single source of truth — the reference docs (item 5) and interactive explorer (item 10) are both GENERATED from it, never hand-written duplicates that drift from the actual API behavior over time.
- Every endpoint's spec includes real example values (not `"string"`/`"integer"` placeholder junk) — genuinely useful examples dramatically reduce integration support burden.

---

## 10. Security Monitoring Specific to the Public API Surface

- All public API requests logged with `request_id`, `api_key_id` (never the raw key), `tenant_id`, endpoint, response code, latency — feeding the same observability stack as Prompt 06, but queryable specifically by API-key for the tenant's own audit needs AND for Devnexes' platform-wide anomaly detection.
- A key compromise response runbook (extends Prompt 06, Section 9's DR runbooks): tenant reports/platform detects a leaked key → immediate revocation capability (single click, Prompt 10 page 89) → forced review of that key's recent request log for damage assessment → tenant notified with a clear incident summary.
- Quarterly automated scan of public code-hosting platforms (GitHub, GitLab public repos) for accidentally-committed NexERP API keys matching the `nex_live_sk_`/`nex_test_sk_` prefix pattern — proactive leak detection rather than waiting for abuse to surface it; standard practice among API platforms at this scale (Stripe, GitHub, and others run equivalent secret-scanning partnerships).
- Penetration testing scope (extends Prompt 03, Section 8) explicitly includes the public API surface as its own dedicated test target before general availability launch, not folded generically into the internal-app pentest.

---

## 11. Deliverable Expectations for AI Agent

1. A separate OpenAPI 3.1 spec (`public-api-v1.yaml`) covering only the intentionally-exposed resources from Section 3/8 — distinct from the internal spec in Prompt 04.
2. API key issuance/hashing/scope-enforcement middleware, built as its own module distinct from the internal session-based auth in Prompt 03 (different auth mechanism, same underlying security rigor).
3. Webhook delivery worker (queue-based, per Prompt 01's BullMQ worker tier) implementing the retry/signature/logging behavior from Section 6.
4. The developer documentation site (Section 9), generated from the OpenAPI spec, deployed at `developers.nexerp.com`.
5. Sandbox environment provisioning logic — seeded synthetic data generator per tenant on sandbox key first use.
6. Rate-limiting middleware configured per the tiers in Section 4, reusing the Redis-based rate-limit infrastructure pattern already established in Prompt 03.

This prompt (`17`) extends the NexERP specification suite. Full suite is now `00`–`17`, 18 files total.
