# MEGA PROMPT 03 — SECURITY, AUTHENTICATION & SESSION HANDLING
## NexERP — Global Multi-Tenant Textile-to-Retail ERP

**Role for AI Agent:** You are a Principal Application Security Engineer. This system handles financial transactions, factory worker biometric data, and export/trade documents across international clients — treat it as a high-value target from day one. Build to OWASP ASVS Level 2 minimum.

---

## 1. Authentication Flow

**No public registration anywhere.** Account creation is exclusively via invite:
1. Owner/authorized role generates an invite (email/phone) scoped to a specific `role` + optional `branch_id`.
2. Invite token: single-use, cryptographically random (32 bytes), expires in 72 hours, stored hashed in DB (never plaintext).
3. Invitee sets password on first login — enforce minimum 12 characters, reject top-10k breached passwords (check against a local breached-password hash list, don't call a third-party API with the real password).

**Login flow:**
1. **Clerk.com Authentication:** Integrate **Clerk.com** as the primary identity provider. **Google Login** must be implemented and enabled via Clerk for seamless SSO.
2. Email/phone + password (if used alongside Google Login) → managed entirely by Clerk.
3. On success, session management (JWT access tokens, refresh tokens) is delegated to Clerk.com. Ensure Clerk's session durations are tuned to our security needs (e.g., short-lived active sessions).
4. MFA (TOTP, e.g. Google Authenticator) is **mandatory** for roles: Owner, General Manager, Accountant, HR Manager, Platform Admin. Configure MFA enforcement policies within the Clerk dashboard.
5. Rate limiting (e.g., 5 failed attempts → lockout) and brute-force protection are delegated to Clerk's security infrastructure.

**Tenant resolution:** every login request resolves tenant via subdomain (`{tenant}.nexerp.com`) or custom domain BEFORE credential check — a user's credentials are only ever checked against their own tenant's user table (enforced by the `tenant_id` scoping in Prompt 02).

---

## 2. Session Handling — Detailed

- **Access token (JWT):** short-lived (15 min), contains `user_id`, `tenant_id`, `role_ids`, `branch_scope` — signed with RS256 (asymmetric, so the AI/worker services can verify without holding the signing key).
- **Refresh token:** stored server-side (hashed) in the `sessions` table, tied to `device_fingerprint` + `ip_address` at issuance. On refresh:
  - Verify token hash matches, not expired, not revoked.
  - **Rotate**: issue a new refresh token, invalidate the old one immediately (refresh token reuse detection — if an already-rotated token is presented again, treat as a compromise signal and revoke the ENTIRE session family + force re-login + alert the user).
- Store tokens in **httpOnly, Secure, SameSite=Strict cookies** — never in localStorage (XSS exfiltration risk).
- Absolute session lifetime cap: 30 days regardless of activity — force full re-authentication after that.
- "Log out of all devices" must revoke every row in `sessions` for that `user_id` in one transaction.
- POS terminal sessions (retail cashiers) use a shorter absolute lifetime (12-hour shift-based) with PIN-based quick re-auth for mid-shift cashier swaps, without killing the terminal's own device session.

---

## 3. Authorization (RBAC) Enforcement

- Every API route declares required `permission` codes (from the `permissions` table in Prompt 02) via middleware decorator — **default deny**, a route with no explicit permission check must fail closed, not open.
- Permission check happens server-side on every request — never trust a role claim embedded in a JWT alone for sensitive actions; re-verify current role/permission state from DB (or a short-TTL Redis cache of it, max 60s TTL) so a revoked role takes effect quickly.
- Branch-scoped roles (Store Supervisor, Cashier) must have their queries automatically filtered to `branch_id IN (user's assigned branches)` at the middleware level, same pattern as tenant isolation.
- Field-level restriction where needed: e.g., Cashier role can read `stock_levels.quantity_on_hand` but never `products.unit_cost` (cost price hidden from retail floor staff) — implement via DTO/serializer allow-lists per role, not by trusting the frontend to hide fields.

---

## 4. Input Validation & Injection Defense

- Every API input validated against a schema (Zod/Joi) at the edge — reject unknown fields (`strict` mode), not just missing required ones.
- All DB access via parameterized queries/ORM (Prisma) — raw SQL string concatenation is banned; any exception requires explicit security review.
- File uploads (fabric images for AI defect detection, export documents): validate MIME type by content-sniffing (not just extension), enforce max size, scan with an antivirus step (ClamAV) before storage, store outside the web root in object storage with signed URLs only.

---

## 5. Transport & Infrastructure Security

- TLS 1.2+ everywhere, HSTS with `includeSubDomains` and `preload`.
- WAF (Cloudflare) in front of all traffic — rules for SQLi/XSS pattern blocking, and geo/velocity anomaly detection for login endpoints.
- Rate limiting per endpoint class: auth endpoints strictest, read-heavy dashboard endpoints looser, POS checkout endpoint has its own idempotency-key-based dedup rather than blunt rate limiting (a busy cashier legitimately fires many requests).
- Secrets (DB creds, JWT signing keys, payment gateway keys) in a secrets manager, injected as runtime env vars, rotated on a schedule (90 days) and immediately on suspected compromise.
- Database credentials scoped per service — the AI service gets a read-mostly DB role, never the app's full read-write credential.

---

## 6. Data Protection

- PII (CNIC/national ID, biometric templates, phone numbers) encrypted at rest using column-level encryption (pgcrypto or application-layer AES-256-GCM) — biometric templates especially, since these map to physical workers and are irrevocable if leaked.
- Bank account numbers, payment gateway tokens: encrypted at rest, decrypted only in-memory at point of use, never logged.
- Audit log (`audit_logs` table) captures every create/update/delete on sensitive entities — immutable, write-only from the app's perspective (no UPDATE/DELETE grants on that table for the app's DB role).
- PII data retention & right-to-erasure: soft-delete plus a documented hard-purge job for terminated employee biometric data after the legally required retention window per jurisdiction.

---

## 7. Application-Layer Attack Surface Hardening

- CSRF: since auth is cookie-based, implement double-submit CSRF tokens on all state-changing requests.
- CORS: explicit allow-list of tenant subdomains + custom domains — never `*` with credentials.
- Content-Security-Policy header restricting script/style sources, disallowing inline scripts on any page handling sensitive data.
- Clickjacking: `X-Frame-Options: DENY` / `frame-ancestors 'none'`.
- Dependency scanning (Dependabot/Snyk) in CI, blocking merge on critical CVEs.
- Secrets scanning (gitleaks) as a pre-commit hook and CI gate.

---

## 8. Security Monitoring & Incident Response

- Real-time alerting on: multiple failed logins across accounts from one IP, refresh-token-reuse detection firing, permission-denied spikes on a single account (possible privilege escalation probing), unusual data export volume (possible exfiltration).
- Quarterly access review: automated report of all users with elevated roles (Owner, Accountant, Platform Admin) sent to tenant Owners for confirmation.
- Documented incident response runbook: detection → containment (session revocation, account lock) → eradication → tenant notification requirements (especially for any suspected cross-tenant data exposure, which is treated as Sev-1).
- Annual third-party penetration test before onboarding any enterprise-tier client; internal automated security regression tests (OWASP ZAP baseline scan) on every release.

---

## 9. Deliverable Expectations for AI Agent

1. Auth middleware module (`packages/auth`) implementing token issuance, rotation, reuse-detection, and RBAC permission-check decorator.
2. MFA enrollment + verification flow (TOTP).
3. A security checklist file (`SECURITY_CHECKLIST.md`) mapping every item above to a pass/fail status, to be run before every production release.
4. Rate-limiting middleware configuration per endpoint class.

Proceed to `04_API_ROUTES_PROMPT.md`.
