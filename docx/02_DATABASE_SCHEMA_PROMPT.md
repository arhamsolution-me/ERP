# MEGA PROMPT 02 — DATABASE SCHEMA & DATA LAYER
## NexERP — Global Multi-Tenant Textile-to-Retail ERP

**Role for AI Agent:** You are a Principal Database Architect. Design a PostgreSQL schema (via Prisma) for a multi-tenant ERP that must remain performant at 1,000,000+ users and thousands of tenants, with zero cross-tenant data leakage and full audit traceability.

---

## 1. Global Conventions (apply to every table)

- Primary keys: `UUID DEFAULT gen_random_uuid()` — never auto-increment integers (prevents enumeration attacks and simplifies multi-region future).
- Every tenant-scoped table includes: `tenant_id UUID NOT NULL REFERENCES tenants(id)`, `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`, `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`, `deleted_at TIMESTAMPTZ NULL` (soft delete — never hard delete business data).
- Every table has an RLS policy: `CREATE POLICY tenant_isolation ON <table> USING (tenant_id = current_setting('app.current_tenant_id')::uuid);`
- Money stored as `BIGINT` in minor units (paisa/cents) — never `FLOAT`/`DOUBLE` for currency.
- All timestamps `TIMESTAMPTZ`, never naive `TIMESTAMP`.

---

## 2. Platform-Level Tables (NOT tenant-scoped)

```sql
platform_admins (id, email, password_hash, mfa_secret, role, created_at)
tenants (id, business_name, business_type ENUM('textile','retail','hybrid'),
         subdomain, custom_domain, subscription_plan_id, status ENUM('active','suspended','trial'),
         country, default_currency, default_timezone, created_at)
subscription_plans (id, name, max_users, max_branches, price_monthly, features_json)
tenant_subscriptions (id, tenant_id, plan_id, status, current_period_end, payment_method_ref)
```

---

## 3. Identity & Access Tables

```sql
users (id, tenant_id, email, phone, password_hash, mfa_enabled, mfa_secret,
       status ENUM('active','suspended','invited'), invited_by UUID, last_login_at,
       failed_login_attempts, locked_until)

roles (id, tenant_id, name, is_system_role BOOLEAN, description)
-- system roles seeded per tenant: super_admin(platform only), owner, general_manager,
-- mill_manager, retail_manager, production_supervisor, store_supervisor,
-- floor_worker, cashier, accountant, hr_manager

permissions (id, code, module, description)
-- e.g. 'production.batch.create', 'pos.sale.create', 'finance.reconcile.approve'

role_permissions (role_id, permission_id)
user_roles (user_id, role_id, branch_id NULL)  -- branch_id scopes a role to one location

sessions (id, user_id, tenant_id, refresh_token_hash, device_fingerprint,
          ip_address, user_agent, created_at, expires_at, revoked_at)

audit_logs (id, tenant_id, user_id, action, entity_type, entity_id,
            before_json, after_json, ip_address, device_fingerprint, created_at)
-- append-only, no updated_at/deleted_at — immutable
```

---

## 4. Production Module (Textile)

```sql
raw_materials (id, tenant_id, name, category ENUM('yarn','dye','chemical','other'),
                unit ENUM('kg','meter','liter','piece'), reorder_threshold)

material_lots (id, tenant_id, raw_material_id, supplier_id, lot_number,
                quantity_received, quantity_remaining, unit_cost, received_at)

production_batches (id, tenant_id, batch_number, product_type, mill_id,
                     current_stage ENUM('spinning','weaving','dyeing','finishing','qc','completed'),
                     planned_quantity, actual_quantity, started_at, completed_at, status)

batch_stage_logs (id, tenant_id, batch_id, stage, supervisor_id, machine_id,
                   started_at, completed_at, wastage_qty, notes)

dyeing_recipes (id, tenant_id, name, color_code, chemical_composition_json)

machines (id, tenant_id, mill_id, name, type, status ENUM('running','idle','maintenance','down'))
machine_downtime_logs (id, tenant_id, machine_id, reason, started_at, resolved_at)

quality_checks (id, tenant_id, batch_id, checkpoint_stage, inspector_id,
                 result ENUM('pass','fail','rework'), defect_type, ai_confidence_score,
                 image_url, checked_at)
-- ai_confidence_score populated by the AI defect-detection service
```

---

## 5. Inventory & Warehouse Module

```sql
warehouses (id, tenant_id, name, type ENUM('mill_store','distribution_center','retail_branch'), address, geo_lat, geo_lng)

products (id, tenant_id, sku, name, category, unit, hsn_code, is_active)
product_variants (id, tenant_id, product_id, size, color, barcode)

stock_levels (id, tenant_id, warehouse_id, variant_id, quantity_on_hand,
              quantity_reserved, reorder_point)
              -- UNIQUE(tenant_id, warehouse_id, variant_id)

stock_movements (id, tenant_id, warehouse_id, variant_id, movement_type
                  ENUM('inbound','outbound','transfer','adjustment','sale','return'),
                  quantity, reference_type, reference_id, moved_by, created_at)
                  -- PARTITIONED BY RANGE (created_at), high-volume table

stock_transfers (id, tenant_id, from_warehouse_id, to_warehouse_id, status
                  ENUM('pending','in_transit','received','disputed'), initiated_by, received_by)
```

---

## 6. Sales & POS Module

```sql
customers (id, tenant_id, name, phone, email, customer_type ENUM('retail','wholesale'), credit_limit)

pos_terminals (id, tenant_id, branch_id, terminal_code, last_synced_at)

pos_transactions (id, tenant_id, branch_id, terminal_id, cashier_id, customer_id,
                   idempotency_key UNIQUE, subtotal, tax_amount, discount_amount, total,
                   payment_method ENUM('cash','card','jazzcash','easypaisa','credit'),
                   sync_status ENUM('synced','pending','conflict'), offline_created_at, created_at)
                   -- PARTITIONED BY RANGE (created_at)

pos_transaction_items (id, tenant_id, transaction_id, variant_id, quantity, unit_price, line_total)

wholesale_orders (id, tenant_id, customer_id, branch_id, status
                   ENUM('draft','confirmed','fulfilled','invoiced'), total_amount, created_by)
wholesale_order_items (id, tenant_id, order_id, variant_id, quantity, unit_price)
```

---

## 7. Finance Module

```sql
invoices (id, tenant_id, invoice_number UNIQUE, entity_type ENUM('sale','purchase','export'),
          reference_id, amount, tax_amount, status ENUM('draft','sent','paid','overdue'), due_date)

payments (id, tenant_id, invoice_id, amount, method, transaction_ref, reconciled BOOLEAN, paid_at)

bank_accounts (id, tenant_id, bank_name, account_number_encrypted, currency)
bank_reconciliations (id, tenant_id, bank_account_id, statement_line_ref, matched_payment_id, status)

export_documents (id, tenant_id, batch_id, document_type ENUM('LC','invoice','packing_list'),
                   document_number, file_url, status)
```

---

## 8. HR & Payroll Module

```sql
employees (id, tenant_id, user_id NULL, employee_code, full_name, role_type
           ENUM('factory_worker','retail_staff','management'), pay_type ENUM('piece_rate','fixed'),
           base_rate, branch_id, biometric_id)

attendance_logs (id, tenant_id, employee_id, check_in, check_out, source ENUM('biometric','manual','mobile'))

payroll_runs (id, tenant_id, period_start, period_end, status ENUM('draft','approved','paid'), approved_by)
payroll_line_items (id, tenant_id, payroll_run_id, employee_id, gross_amount, deductions, net_amount)

leave_requests (id, tenant_id, employee_id, type, start_date, end_date, status, approved_by)
```

---

## 9. AI Layer Support Tables

```sql
demand_forecasts (id, tenant_id, product_id, branch_id, forecast_period,
                   predicted_quantity, confidence_interval_json, model_version, generated_at)

ai_query_logs (id, tenant_id, user_id, query_text, response_text, resolved_intent, created_at)
```

---

## 10. Indexing Strategy

- Every foreign key gets an index automatically (Prisma does this — verify explicitly).
- Composite index `(tenant_id, created_at DESC)` on all high-read transactional tables for dashboard queries.
- Composite index `(tenant_id, sku)` unique on products, `(tenant_id, barcode)` unique on variants.
- Partial index on `sessions(user_id) WHERE revoked_at IS NULL` for fast active-session lookups.
- GIN index on any `jsonb` columns that get queried (e.g., `features_json`, `confidence_interval_json`).

## 11. Partitioning & Archival

- `stock_movements`, `pos_transactions`, `audit_logs`, `attendance_logs`: monthly range partitions.
- Automated job: partitions older than 18 months moved to cold storage (export to Parquet on S3), then detached and dropped from primary — keeps hot table size bounded regardless of platform-wide growth.

## 12. Deliverable Expectations for AI Agent

1. Full `schema.prisma` implementing every table above with correct relations, enums, and `@@index`/`@@unique` annotations.
2. A raw SQL migration file adding RLS policies for every tenant-scoped table (Prisma doesn't manage RLS — hand-write this).
3. A seed script creating the 11 system roles with their default `role_permissions` mapping per the role list in `00_MASTER_OVERVIEW.md`.
4. Document every partitioning/archival job as a scheduled worker task (reference `06_DEVOPS_SCALABILITY_PROMPT.md` for the job scheduler).

Proceed to `03_SECURITY_AUTH_SESSION_PROMPT.md`.
