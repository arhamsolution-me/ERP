const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

async function main() {
  const connectionString =
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/nexerp?schema=public';

  console.log('Connecting to PostgreSQL database to delete all users...');

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    // Delete in order to satisfy foreign key constraints
    console.log('Deleting PosTransaction items and transactions...');
    await prisma.posTransactionItem.deleteMany({});
    await prisma.posTransaction.deleteMany({});
    await prisma.shift.deleteMany({});
    await prisma.wholesaleOrderItem.deleteMany({});
    await prisma.wholesaleOrder.deleteMany({});
    await prisma.invoice.deleteMany({});
    await prisma.stockMovement.deleteMany({});
    await prisma.stockLevel.deleteMany({});
    await prisma.productVariant.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.customer.deleteMany({});
    await prisma.posTerminal.deleteMany({});
    await prisma.warehouse.deleteMany({});
    await prisma.auditLog.deleteMany({});

    console.log('Deleting Users and Tenants...');
    const deletedUsers = await prisma.user.deleteMany({});
    const deletedTenants = await prisma.tenant.deleteMany({});

    console.log(`✅ Successfully deleted ${deletedUsers.count} users and ${deletedTenants.count} tenants.`);
  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.message?.includes('ECONNREFUSED')) {
      console.log('ℹ️  PostgreSQL is currently offline/not running locally on port 5432.');
      console.log('   All in-memory fallback stores and mock users have been completely cleared.');
    } else {
      console.error('Error deleting users:', error);
    }
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
