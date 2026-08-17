export * from '@prisma/client';

import 'dotenv/config';
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const createPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL;
  // Enforce DB stability:
  // - statement_timeout: Kill any runaway query taking longer than 15s to protect the DB from locking up.
  // - connectionTimeoutMillis: Prevent the app from hanging forever if the DB is unreachable.
  const pool = new Pool({ 
    connectionString,
    connectionTimeoutMillis: 5000,
    statement_timeout: 15000,
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
