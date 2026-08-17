# MEGA PROMPT 04 — API ROUTE MAP
## NexERP — Global Multi-Tenant Textile-to-Retail ERP

**Role for AI Agent:** You are a Lead Backend Engineer. Build a versioned REST API (`/api/v1/...`) implementing every route below. Every route must declare: required permission code (from Prompt 03), whether it's tenant-scoped, whether it's branch-scoped, and whether it requires an idempotency key.

**Global rules for every route:**
- All routes prefixed `/api/v1`, tenant resolved from subdomain/domain before hitting any handler.
- All list endpoints support `?page=&limit=&sort=&filter=` with a max `limit` of 100.
- All mutating endpoints (`POST`/`PUT`/`PATCH`/`DELETE`) return the full updated resource, not just a success flag.
- All financial/inventory mutating endpoints require header `Idempotency-Key`.
- Standard error shape: `{ error: { code, message, field_errors? } }` with correct HTTP status codes — never 200 on failure.

---

## Auth & Identity
```
POST   /auth/login                          public
POST   /auth/refresh                        public (refresh cookie)
POST   /auth/logout                         authenticated
POST   /auth/logout-all-devices             authenticated
POST   /auth/mfa/enroll                     authenticated
POST   /auth/mfa/verify                     authenticated
POST   /invites                             perm: users.invite
GET    /invites/:token                      public (validate invite)
POST   /invites/:token/accept                public (sets password, creates user)
GET    /users                               perm: users.read
GET    /users/:id                           perm: users.read
PATCH  /users/:id                           perm: users.update
POST   /users/:id/suspend                   perm: users.suspend
GET    /users/:id/sessions                  perm: users.read.self_or_admin
DELETE /users/:id/sessions/:sessionId       perm: users.revoke_session
```

## Roles & Permissions (Owner/Admin config)
```
GET    /roles                               perm: roles.read
POST   /roles                               perm: roles.create        (custom roles beyond system defaults)
PATCH  /roles/:id/permissions               perm: roles.update
```

## Production Module (Textile)
```
GET    /production/materials                perm: production.material.read
POST   /production/materials                perm: production.material.create
POST   /production/materials/:id/lots       perm: production.material.receive
GET    /production/batches                  perm: production.batch.read
POST   /production/batches                  perm: production.batch.create        [idempotent]
GET    /production/batches/:id              perm: production.batch.read
PATCH  /production/batches/:id/stage        perm: production.batch.update_stage
POST   /production/batches/:id/qc           perm: production.qc.create
POST   /production/batches/:id/qc/:qcId/ai-scan   perm: production.qc.ai_scan   (calls AI service)
GET    /production/machines                 perm: production.machine.read
POST   /production/machines/:id/downtime    perm: production.machine.log_downtime
GET    /production/dyeing-recipes           perm: production.recipe.read
POST   /production/dyeing-recipes           perm: production.recipe.create
```

## Inventory & Warehouse
```
GET    /inventory/warehouses                perm: inventory.warehouse.read
POST   /inventory/warehouses                perm: inventory.warehouse.create
GET    /inventory/products                  perm: inventory.product.read
POST   /inventory/products                  perm: inventory.product.create
GET    /inventory/products/:id/variants     perm: inventory.product.read
GET    /inventory/stock                     perm: inventory.stock.read           branch-scoped
POST   /inventory/stock/adjust              perm: inventory.stock.adjust         [idempotent]
POST   /inventory/transfers                 perm: inventory.transfer.create      [idempotent]
PATCH  /inventory/transfers/:id/receive     perm: inventory.transfer.receive
GET    /inventory/low-stock-alerts          perm: inventory.stock.read           branch-scoped
```

## Sales & POS (Retail)
```
GET    /pos/terminals                       perm: pos.terminal.read
POST   /pos/transactions                    perm: pos.sale.create      [idempotent, branch-scoped]
POST   /pos/transactions/sync-batch         perm: pos.sale.create      (offline queue sync, array of idempotent txns)
GET    /pos/transactions                    perm: pos.sale.read        branch-scoped
POST   /pos/transactions/:id/refund         perm: pos.refund.create    [idempotent]
GET    /customers                           perm: customer.read
POST   /customers                           perm: customer.create
POST   /wholesale-orders                    perm: wholesale.order.create   [idempotent]
PATCH  /wholesale-orders/:id/confirm        perm: wholesale.order.confirm
PATCH  /wholesale-orders/:id/fulfill        perm: wholesale.order.fulfill
```

## Finance
```
GET    /finance/invoices                    perm: finance.invoice.read
POST   /finance/invoices                    perm: finance.invoice.create
POST   /finance/payments                    perm: finance.payment.record   [idempotent]
GET    /finance/reconciliation              perm: finance.reconcile.read
POST   /finance/reconciliation/match        perm: finance.reconcile.approve
POST   /finance/export-documents            perm: finance.export_doc.create
GET    /finance/reports/pnl                 perm: finance.report.read       branch-scoped/optional
```

## HR & Payroll
```
GET    /hr/employees                        perm: hr.employee.read
POST   /hr/employees                        perm: hr.employee.create
POST   /hr/attendance/check-in              perm: hr.attendance.self_or_supervisor
POST   /hr/attendance/check-out             perm: hr.attendance.self_or_supervisor
GET    /hr/attendance                       perm: hr.attendance.read
POST   /hr/payroll-runs                     perm: hr.payroll.create
PATCH  /hr/payroll-runs/:id/approve         perm: hr.payroll.approve
POST   /hr/leave-requests                   perm: hr.leave.self
PATCH  /hr/leave-requests/:id/decide        perm: hr.leave.approve
```

## AI Layer
```
POST   /ai/defect-scan                      perm: production.qc.ai_scan   → proxies to AI microservice
GET    /ai/forecast/:productId              perm: inventory.forecast.read
POST   /ai/query                            perm: ai.query.use            (natural language dashboard queries)
```

## Platform Admin (Devnexes-only, separate auth realm)
```
GET    /platform/tenants                    platform_admin only
POST   /platform/tenants                    platform_admin only
PATCH  /platform/tenants/:id/suspend        platform_admin only
GET    /platform/tenants/:id/usage          platform_admin only
```

## System
```
GET    /healthz                             public, no auth
GET    /readyz                              public, no auth
GET    /metrics                             internal network only (Prometheus scrape)
```

---

## Deliverable Expectations for AI Agent

1. OpenAPI 3.1 spec generated from the route map above, including request/response schemas tied to the Prisma models from Prompt 02.
2. Middleware chain order enforced identically on every route: `tenantResolver → authenticate → authorizePermission → branchScope → validateSchema → idempotencyCheck (where applicable) → handler`.
3. Postman/Bruno collection covering every route with example payloads per role.

Proceed to `05_FRONTEND_SEO_PERFORMANCE_PROMPT.md`.
