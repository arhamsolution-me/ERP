# NexERP — Sales Module API Specification

This document defines the complete API contracts for all endpoints implemented in `apps/web/app/api/sales/*`.

---

## 1. Authentication & Security Policy
- **Authentication**: Cookie session via `getSession()` (`lib/auth-session.ts`).
- **Multi-Tenant Isolation**: Strict DB queries filtered by `session.tenantId`.
- **Financial Precision**: All money fields stored as `BigInt` (pkr/paise).
- **Idempotency**: All mutation endpoints accept/generate `x-idempotency-key`.
- **Auditing**: Every mutating event invokes `createAuditLog()`.

---

## 2. Endpoints Summary

### POS & Shifts
- `GET /api/sales/shifts/current` — Returns the currently active cash drawer shift, running metrics, and expected till balance.
- `POST /api/sales/shifts/open` — Opens a new till shift with `openingCash`. Rejects if a shift is already open.
- `POST /api/sales/shifts/close` — Reconciles cash drawer, computes `expected_cash = opening_cash + cash_sales`, computes `variance = closing_cash - expected_cash`.
- `POST /api/sales/checkout` — Processes retail checkout, validates pricing server-side, deducts inventory (`StockLevel` & `StockMovement`), creates `PosTransaction`.

### Transaction History & Refunds
- `GET /api/sales/transactions` — Queries historical sales with date range, customer, and payment method filters.
- `POST /api/sales/refunds` — Authorizes full/partial refunds with line item selection, reverses stock movements, enforces anti-double-refund check.

### Wholesale Order Lifecycle
- `GET /api/sales/wholesale-orders` — Returns commercial wholesale orders filtered by status (`draft`, `confirmed`, `fulfilled`, `invoiced`).
- `POST /api/sales/wholesale-orders` — Creates wholesale order in `draft` or `confirmed` status.
- `PATCH /api/sales/wholesale-orders/:id/confirm` — Locks pricing and reserves stock on `StockLevel.quantity_reserved`.
- `PATCH /api/sales/wholesale-orders/:id/fulfill` — Confirms dispatch, deducts physical stock on hand, writes `StockMovement` row.
- `POST /api/sales/wholesale-orders/:id/generate-invoice` — Generates linked `Invoice` in Finance module, sets order status to `invoiced`.

### Sales Analytics
- `GET /api/sales/dashboard` — Returns live KPIs (today's revenue, order count, yesterday comparison %, 7-day revenue trend, payment method breakdown, top-selling products).
