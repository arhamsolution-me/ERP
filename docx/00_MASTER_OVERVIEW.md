# NexERP — Global Multi-Tenant Textile-to-Retail ERP
## Master Build Prompt Suite — Index & Usage Guide

**Project Class:** Enterprise / Global-Scale SaaS
**Target Load:** 1,000,000+ concurrent-capable users, multi-region ready
**Tenancy Model:** Multi-tenant SaaS (shared infra, isolated data per client)
**Core Stack:** Node.js (backend), Next.js (frontend), PostgreSQL (primary DB), Redis (cache/session), Docker + Kubernetes (orchestration)

---

## How To Use These Files

Each file in this suite is a **standalone mega-prompt**. Feed each one individually to an AI coding agent (Claude Code, Cursor, etc.) or hand to a human dev team as a spec — each is written to be indepth enough to build that layer without additional clarification. Build order matters — follow this sequence:

| # | File | Purpose | Build Order |
|---|------|---------|-------------|
| 1 | `01_ARCHITECTURE_PROMPT.md` | System design, service boundaries, scalability model | Read first — foundation for all others |
| 2 | `02_DATABASE_SCHEMA_PROMPT.md` | Full PostgreSQL schema, multi-tenant isolation, indexing | Build 2nd — everything depends on data layer |
| 3 | `03_SECURITY_AUTH_SESSION_PROMPT.md` | Auth, RBAC, session handling, OWASP hardening | Build 3rd — wrap around DB before routes |
| 4 | `04_API_ROUTES_PROMPT.md` | Full REST/API route map per module per role | Build 4th |
| 5 | `05_FRONTEND_SEO_PERFORMANCE_PROMPT.md` | Next.js UI, SEO, Core Web Vitals, accessibility | Build 5th |
| 6 | `06_DEVOPS_SCALABILITY_PROMPT.md` | Infra, caching, load balancing, monitoring for 1M users | Build parallel to all — ops layer |

---

## Non-Negotiable Global Standards (apply across ALL files)

1. **Multi-tenant isolation is absolute** — no query, cache key, file path, or log line may ever cross tenant boundaries. Every table, every cache key, every S3 path is tenant-scoped.
2. **No public self-registration** — invite-only account creation across the entire platform (Super Admin → Owner → all downstream roles).
3. **Zero-downtime deploys** — rolling deployments only, DB migrations must be backward-compatible per release.
4. **Every write is audited** — who, what, when, from where (IP + device fingerprint), stored in immutable audit log.
5. **Fail closed, not open** — on any auth/permission ambiguity, deny access by default.
6. **Idempotency on all financial/inventory mutations** — every POST/PUT that touches stock or money must accept an idempotency key.
7. **Horizontal scalability by default** — stateless application servers; nothing in-memory that isn't reproducible from Redis/DB.
8. **Offline-first for POS layer** — retail POS must queue transactions locally and sync when connectivity resumes, with conflict resolution rules defined.
9. **All secrets in vault, never in code/env committed to repo** — use a secrets manager (AWS Secrets Manager / HashiCorp Vault).
10. **Every module ships with automated tests** — unit + integration minimum 70% coverage before merge.

---

## Business Context (for AI agent grounding)

NexERP unifies textile manufacturing (yarn → weaving → dyeing → finishing) with retail distribution (B2B wholesale + B2C POS) under one platform, built by **Devnexes Digital Solutions**. It targets Pakistani textile mills and retail chains first, architected from day one to scale internationally (multi-currency, multi-language, multi-tax-jurisdiction) as a white-label SaaS product resellable to other markets.

Proceed to `01_ARCHITECTURE_PROMPT.md`.
