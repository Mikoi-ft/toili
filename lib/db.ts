// NOTE: Prisma 6 is used (not 7). The generator uses provider = "prisma-client"
// with output = "../lib/generated/prisma". We import PrismaClient from the generated
// path for full type safety. "@prisma/client" re-exports `any` types when a custom
// output path is used, so we import directly from the generated module.
//
// MIGRATION PENDING: Run `npx prisma migrate dev --name init_invitation` once
// the Neon Postgres database is created and DATABASE_URL is set in .env.

import { PrismaClient } from "@/lib/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
