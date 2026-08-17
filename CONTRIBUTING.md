# Contributing to NexERP

Thank you for contributing to NexERP. This project enforces strict enterprise-grade quality, security, and architectural discipline across all modules.

---

## 🛠 Build Order Roadmap

All modules adhere to the sequential dependency model defined in `docx/00_MASTER_OVERVIEW.md`:

1. **Architecture (`01_ARCHITECTURE_PROMPT.md`):** Monorepo structure, service boundaries, and scalability patterns.
2. **Database & Isolation (`02_DATABASE_SCHEMA_PROMPT.md`):** PostgreSQL schema with Row-Level Security (`tenant_id`).
3. **Security & Auth (`03_SECURITY_AUTH_SESSION_PROMPT.md`):** Clerk authentication, RBAC, branch-scoping, and field-level permissions.
4. **API Routes (`04_API_ROUTES_PROMPT.md`):** Idempotent REST API endpoints and error contracts.
5. **Frontend & POS (`05_FRONTEND_SEO_PERFORMANCE_PROMPT.md`):** Next.js 16 SSR/SSG/ISR, offline IndexedDB POS.
6. **DevOps & Stability (`06_DEVOPS_SCALABILITY_PROMPT.md`):** CI/CD, Kubernetes, circuit breakers, and observability.
7. **Page Implementations (`07–11_PAGES_*.md`):** 97 element-specified UI pages across all functional modules.

---

## 🚦 Pull Request Review Bar

Every Pull Request must satisfy the following merge gates:

1. **Test Coverage Bar:**
   - Minimum **70% automated test coverage** on every modified or new module (Non-Negotiable Standard #10).
   - Unit tests for guards, middleware, and business logic.
   - Integration / E2E tests for state-mutating workflows.

2. **Multi-Tenant Isolation Guarantees:**
   - Every database query must explicitly filter by `tenant_id` or operate under active PostgreSQL RLS.
   - Cross-tenant access attempts must be tested and proven blocked (returning HTTP 403).

3. **Idempotency Enforcement:**
   - Every mutating endpoint touching money or stock (`POST`/`PUT`/`PATCH`) must accept and enforce an `Idempotency-Key` header.

4. **Zero-Secret Policy:**
   - Never commit `.env` files, API keys, tokens, or credentials to git.

5. **Linting & Typechecking:**
   ```bash
   pnpm check-types
   pnpm lint
   pnpm test
   pnpm build
   ```

---

## 🧪 Local Workflow

1. Create a feature branch: `git checkout -b feat/your-feature-name`
2. Run test suites locally before pushing: `pnpm test`
3. Commit with semantic commit messages: `feat: ...`, `fix: ...`, `docs: ...`, `test: ...`
4. Open a Pull Request referencing the relevant `docx/` specification file.
