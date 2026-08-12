import { scryptSync } from "node:crypto";
import { prisma } from "../src/client.js";

function hashPassword(password: string) {
  const salt = "stock-hub-dev";
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

async function main() {
  const identifier = (process.env.ADMIN_IDENTIFIER ?? "admin").trim().toLowerCase();
  const email = process.env.ADMIN_EMAIL ?? "admin@stock.local";
  const password = process.env.ADMIN_PASSWORD ?? "12345678";
  const firstName = process.env.ADMIN_FIRST_NAME ?? "Admin";
  const lastName = process.env.ADMIN_LAST_NAME ?? "Stock";

  await prisma.user.upsert({
    where: { identifier },
    update: {
      identifier,
      email,
      firstName,
      lastName,
      passwordHash: hashPassword(password),
      active: true,
      roles: ["ADMIN_STOCK"]
    },
    create: {
      identifier,
      email,
      firstName,
      lastName,
      passwordHash: hashPassword(password),
      active: true,
      roles: ["ADMIN_STOCK"]
    }
  });

  console.log(`Admin user ready: ${identifier}`);
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });



