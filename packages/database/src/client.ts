import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL ?? "postgresql://stock_hub:stock_hub@localhost:55433/stock_hub_dev";
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  adapter: new PrismaPg({ connectionString })
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}