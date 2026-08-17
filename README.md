# NexERP — Global Multi-Tenant Textile-to-Retail ERP Platform
> Built by **Devnexes Digital Solutions** — *"We Don't Just Build — We Solve"*

NexERP is an enterprise SaaS platform engineered to unify **Textile Manufacturing (Yarn → Weaving → Dyeing → Finishing → QC)** with **Retail & Wholesale Distribution (B2B Wholesale + B2C Offline-First POS)** under a single, highly resilient multi-tenant architecture designed to scale to 1,000,000+ users.

---

## 🏗 System Architecture

NexERP is designed as a **Modular Monolith** with service-oriented boundaries and an independent AI microservice tier:

```
                               ┌────────────────────────┐
                               │   Cloudflare CDN / WAF  │
                               └───────────┬────────────┘
                                           │
                    ┌──────────────────────┴──────────────────────┐
                    │                                             │
         ┌──────────▼──────────┐                       ┌──────────▼──────────┐
         │   apps/web (Next.js)│                       │   apps/api (NestJS)  │
         │   - Marketing (SSG) │                       │   - Multi-Tenant REST│
         │   - ERP Dashboard   │                       │   - Idempotent APIs  │
         │   - Offline PWA POS │                       │   - WebSocket Gateway│
         └──────────┬──────────┘                       └──────────┬──────────┘
                    │                                             │
                    ├──────────────────────┬──────────────────────┤
                    │                      │                      │
         ┌──────────▼──────────┐┌──────────▼──────────┐┌──────────▼──────────┐
         │ PostgreSQL Primary  ││    Redis Cluster    ││ Python AI Service   │
         │ (Row-Level Security)││(Cache/PubSub/Queue) ││ (Defect/Forecasting)│
         └─────────────────────┘└─────────────────────┘└─────────────────────┘
```

### 10 Non-Negotiable Core Standards:
1. **Absolute Multi-Tenant Isolation:** Database Row-Level Security (RLS) + ORM middleware + Redis key scoping (`tenant:{id}:*`).
2. **Invite-Only Registration:** No public signup; strictly role-governed user invitation.
3. **Zero-Downtime Deployments:** Rolling updates with backward-compatible migrations.
4. **Immutable Audit Trails:** Every state mutation is logged with user, tenant, IP, device, and payload diffs.
5. **Fail-Closed Security:** Strict RBAC with default-deny on authorization ambiguity.
6. **Idempotency on Mutations:** All financial and inventory endpoints require an `Idempotency-Key` header.
7. **Stateless App Servers:** Horizontal scaling via Kubernetes HPA; no in-process state.
8. **Offline-First POS:** Client-side queue (IndexedDB) with server-authoritative conflict resolution.
9. **Secrets Vault Management:** Environment variables managed via secure secrets manager.
10. **Automated Test Quality Bar:** Minimum 70% automated test coverage across packages.

---

## 📁 Repository Structure

```
nexerp/
├── apps/
│   ├── api/          # NestJS backend API & WebSocket gateway
│   ├── web/          # Next.js 16 (Turbopack) frontend & offline POS PWA
│   └── docs/         # Developer documentation portal (Next.js)
├── packages/
│   ├── db/           # Prisma client, PostgreSQL schema, RLS policies
│   ├── ui/           # Shared React design system & tokens
│   ├── eslint-config/# Shared ESLint rules
│   └── typescript-config/ # Shared TS configurations
├── docx/             # Master 22-document system architecture & page specs (00–21)
├── deploy/           # Kubernetes manifests & deployment configurations
├── docker-compose.yml       # Local development services (PostgreSQL, Redis)
└── docker-compose.prod.yml  # Multi-container production deployment setup
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: `>= 18.0.0` (v20+ recommended)
- **pnpm**: `^9.0.0`
- **Docker & Docker Compose**

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/arhamsolution-me/ERP.git
cd ERP
pnpm install
```

### 2. Configure Environment Variables
Copy the example environment files:
```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

### 3. Start Local Infrastructure
```bash
docker compose up -d
```

### 4. Database Setup & Migrations
```bash
pnpm --filter @repo/db db:generate
pnpm --filter @repo/db db:push
```

### 5. Run Development Servers
```bash
pnpm dev
```

- **Web Application & POS:** [http://localhost:3000](http://localhost:3000)
- **REST API:** [http://localhost:3001/api/v1](http://localhost:3001/api/v1)
- **Swagger Documentation:** [http://localhost:3001/api/docs](http://localhost:3001/api/docs)
- **Developer Docs:** [http://localhost:3002](http://localhost:3002)

---

## 🧪 Testing & Quality Gates

Run full test suite with coverage:
```bash
pnpm test
```

Run TypeScript verification across all workspaces:
```bash
pnpm check-types
```

Run production build:
```bash
pnpm build
```

---

## 📚 Specification Suite Index (`docx/`)

The system architecture and element-level page designs are documented across 22 prompts in [`docx/`](file:///c:/Users/Huzaifa%20Ali/Desktop/coding/projects/devnexes.project/erp/docx/):

- `00_MASTER_OVERVIEW.md` — Global standards & build roadmap
- `01_ARCHITECTURE_PROMPT.md` — Monolith modular design & scalability
- `02_DATABASE_SCHEMA_PROMPT.md` — Complete PostgreSQL schema & RLS
- `03_SECURITY_AUTH_SESSION_PROMPT.md` — Clerk auth, RBAC & security
- `04_API_ROUTES_PROMPT.md` — REST API route map
- `05_FRONTEND_SEO_PERFORMANCE_PROMPT.md` — Next.js architecture & PWA POS
- `06_DEVOPS_SCALABILITY_PROMPT.md` — Kubernetes, CI/CD, and Observability
- `07–11_PAGES_*.md` — Element-level UI specifications for all 97 pages
- `12–21_*.md` — UX states, Procurement, Legal, Branding, Public API, DR & Audits

---

## 📄 License & Ownership
Copyright © 2026 Devnexes Digital Solutions. All rights reserved.
