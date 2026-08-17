-- ─────────────────────────────────────────────────────────────────────────────
-- NexERP PostgreSQL Row-Level Security (RLS) Policy Definitions
-- Enforces absolute tenant isolation at the database layer (Standard #1)
-- ─────────────────────────────────────────────────────────────────────────────

-- Helper function to extract the current tenant ID from session context
CREATE OR REPLACE FUNCTION current_tenant_id() RETURNS UUID AS $$
BEGIN
  RETURN NULLIF(current_setting('app.current_tenant_id', true), '')::UUID;
END;
$$ LANGUAGE plpgsql STABLE;

-- 1. Identity & Access
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_user ON "User";
CREATE POLICY tenant_isolation_user ON "User"
  FOR ALL
  USING (tenant_id = current_tenant_id())
  WITH CHECK (tenant_id = current_tenant_id());

ALTER TABLE "Role" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_role ON "Role";
CREATE POLICY tenant_isolation_role ON "Role"
  FOR ALL
  USING (tenant_id = current_tenant_id())
  WITH CHECK (tenant_id = current_tenant_id());

-- 2. POS & Sales
ALTER TABLE "PosTerminal" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_pos_terminal ON "PosTerminal";
CREATE POLICY tenant_isolation_pos_terminal ON "PosTerminal"
  FOR ALL
  USING (tenant_id = current_tenant_id())
  WITH CHECK (tenant_id = current_tenant_id());

ALTER TABLE "PosTransaction" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_pos_txn ON "PosTransaction";
CREATE POLICY tenant_isolation_pos_txn ON "PosTransaction"
  FOR ALL
  USING (tenant_id = current_tenant_id())
  WITH CHECK (tenant_id = current_tenant_id());

ALTER TABLE "WholesaleOrder" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_wholesale_order ON "WholesaleOrder";
CREATE POLICY tenant_isolation_wholesale_order ON "WholesaleOrder"
  FOR ALL
  USING (tenant_id = current_tenant_id())
  WITH CHECK (tenant_id = current_tenant_id());

-- 3. Inventory & Warehouses
ALTER TABLE "Warehouse" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_warehouse ON "Warehouse";
CREATE POLICY tenant_isolation_warehouse ON "Warehouse"
  FOR ALL
  USING (tenant_id = current_tenant_id())
  WITH CHECK (tenant_id = current_tenant_id());

ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_product ON "Product";
CREATE POLICY tenant_isolation_product ON "Product"
  FOR ALL
  USING (tenant_id = current_tenant_id())
  WITH CHECK (tenant_id = current_tenant_id());

ALTER TABLE "StockLevel" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_stock_level ON "StockLevel";
CREATE POLICY tenant_isolation_stock_level ON "StockLevel"
  FOR ALL
  USING (tenant_id = current_tenant_id())
  WITH CHECK (tenant_id = current_tenant_id());

ALTER TABLE "StockTransfer" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_stock_transfer ON "StockTransfer";
CREATE POLICY tenant_isolation_stock_transfer ON "StockTransfer"
  FOR ALL
  USING (tenant_id = current_tenant_id())
  WITH CHECK (tenant_id = current_tenant_id());

-- 4. Finance
ALTER TABLE "Invoice" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_invoice ON "Invoice";
CREATE POLICY tenant_isolation_invoice ON "Invoice"
  FOR ALL
  USING (tenant_id = current_tenant_id())
  WITH CHECK (tenant_id = current_tenant_id());

ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_payment ON "Payment";
CREATE POLICY tenant_isolation_payment ON "Payment"
  FOR ALL
  USING (tenant_id = current_tenant_id())
  WITH CHECK (tenant_id = current_tenant_id());

-- 5. Production & Manufacturing
ALTER TABLE "RawMaterial" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_raw_material ON "RawMaterial";
CREATE POLICY tenant_isolation_raw_material ON "RawMaterial"
  FOR ALL
  USING (tenant_id = current_tenant_id())
  WITH CHECK (tenant_id = current_tenant_id());

ALTER TABLE "ProductionBatch" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_production_batch ON "ProductionBatch";
CREATE POLICY tenant_isolation_production_batch ON "ProductionBatch"
  FOR ALL
  USING (tenant_id = current_tenant_id())
  WITH CHECK (tenant_id = current_tenant_id());

-- 6. HR & Payroll
ALTER TABLE "Employee" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_employee ON "Employee";
CREATE POLICY tenant_isolation_employee ON "Employee"
  FOR ALL
  USING (tenant_id = current_tenant_id())
  WITH CHECK (tenant_id = current_tenant_id());

ALTER TABLE "PayrollRun" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_payroll ON "PayrollRun";
CREATE POLICY tenant_isolation_payroll ON "PayrollRun"
  FOR ALL
  USING (tenant_id = current_tenant_id())
  WITH CHECK (tenant_id = current_tenant_id());

-- 7. Audit Log
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_audit_log ON "AuditLog";
CREATE POLICY tenant_isolation_audit_log ON "AuditLog"
  FOR ALL
  USING (tenant_id = current_tenant_id())
  WITH CHECK (tenant_id = current_tenant_id());
