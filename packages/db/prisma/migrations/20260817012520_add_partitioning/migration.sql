-- Manually implement Native Table Partitioning for high-volume audit logs
-- Drop the default Prisma-generated table
DROP TABLE IF EXISTS "AuditLog";

-- Recreate as a partitioned table
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "user_id" UUID,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID NOT NULL,
    "before_json" JSONB,
    "after_json" JSONB,
    "ip_address" TEXT,
    "device_fingerprint" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id", "created_at")
) PARTITION BY RANGE ("created_at");

-- Create initial partitions
CREATE TABLE "AuditLog_y2026m08" PARTITION OF "AuditLog" FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');
CREATE TABLE "AuditLog_y2026m09" PARTITION OF "AuditLog" FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');
CREATE TABLE "AuditLog_y2026m10" PARTITION OF "AuditLog" FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');
CREATE TABLE "AuditLog_y2026m11" PARTITION OF "AuditLog" FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');
CREATE TABLE "AuditLog_y2026m12" PARTITION OF "AuditLog" FOR VALUES FROM ('2026-12-01') TO ('2027-01-01');

-- Recreate index
CREATE INDEX "AuditLog_tenant_id_created_at_idx" ON "AuditLog"("tenant_id", "created_at" DESC);
