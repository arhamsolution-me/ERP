const { Client } = require('pg');

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('FATAL: Database wipe utility is strictly prohibited in production environment.');
  }

  const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/nexerp?schema=public";
  const client = new Client({
    connectionString,
  });

  try {
    await client.connect();
    console.log("Connected to PostgreSQL (Dev/Test). Wiping tables...");
    
    // Get all table names
    const res = await client.query(`SELECT tablename FROM pg_tables WHERE schemaname='public'`);
    const tables = res.rows
      .map(r => r.tablename)
      .filter(name => name !== '_prisma_migrations')
      .map(name => `"public"."${name}"`)
      .join(', ');

    if (tables.length > 0) {
      await client.query(`TRUNCATE TABLE ${tables} CASCADE;`);
      console.log("✅ Database successfully cleaned (truncated all tables in development).");
    } else {
      console.log("No tables found to wipe.");
    }
  } catch (error) {
    console.error("Error wiping database:", error);
  } finally {
    await client.end();
  }
}

main();
