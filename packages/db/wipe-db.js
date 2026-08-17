const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres:postgres@localhost:5432/nexerp?schema=public"
  });

  try {
    await client.connect();
    console.log("Connected to PostgreSQL. Wiping tables...");
    
    // Get all table names
    const res = await client.query(`SELECT tablename FROM pg_tables WHERE schemaname='public'`);
    const tables = res.rows
      .map(r => r.tablename)
      .filter(name => name !== '_prisma_migrations')
      .map(name => `"public"."${name}"`)
      .join(', ');

    if (tables.length > 0) {
      await client.query(`TRUNCATE TABLE ${tables} CASCADE;`);
      console.log("✅ Database successfully cleaned (truncated all tables).");
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
