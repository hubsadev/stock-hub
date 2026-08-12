import { scryptSync } from "node:crypto";
import { prisma } from "../src/client.js";

function hashPassword(password: string) {
  const salt = "stock-hub-dev";
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

async function main() {
  const initialPasswordHash = hashPassword("12345678");

  await prisma.user.upsert({
    where: { identifier: "admin" },
    update: { identifier: "admin", email: "admin@stock.local", passwordHash: initialPasswordHash, active: true, roles: ["ADMIN_STOCK"] },
    create: {
      identifier: "admin",
      email: "admin@stock.local",
      firstName: "Admin",
      lastName: "Stock",
      roles: ["ADMIN_STOCK"],
      passwordHash: initialPasswordHash,
      active: true
    }
  });

  await prisma.user.upsert({
    where: { identifier: "gestionnaire" },
    update: { identifier: "gestionnaire", email: "gestionnaire@stock.local", passwordHash: initialPasswordHash, active: true, roles: ["GESTIONNAIRE_STOCK"] },
    create: {
      identifier: "gestionnaire",
      email: "gestionnaire@stock.local",
      firstName: "Awa",
      lastName: "Stock",
      roles: ["GESTIONNAIRE_STOCK"],
      passwordHash: initialPasswordHash,
      active: true
    }
  });

  await prisma.user.upsert({
    where: { identifier: "audit" },
    update: { identifier: "audit", email: "audit@stock.local", passwordHash: initialPasswordHash, active: true, roles: ["AUDIT"] },
    create: {
      identifier: "audit",
      email: "audit@stock.local",
      firstName: "Jean",
      lastName: "Audit",
      roles: ["AUDIT"],
      passwordHash: initialPasswordHash,
      active: true
    }
  });
  const magasin = await prisma.location.upsert({
    where: { code: "MAG-001" },
    update: {},
    create: { code: "MAG-001", name: "Magasin principal", type: "MAGASIN" }
  });

  await prisma.location.upsert({
    where: { code: "SITE-RIV" },
    update: {},
    create: { code: "SITE-RIV", name: "Site Riviera", type: "CHANTIER" }
  });

  await prisma.supplier.upsert({
    where: { code: "FRN-001" },
    update: {},
    create: { code: "FRN-001", name: "Fournisseur A", contact: "Awa Stock", email: "contact@fournisseur-a.com" }
  });

  await prisma.project.upsert({
    where: { code: "PROJ-2026-014" },
    update: {},
    create: { code: "PROJ-2026-014", name: "Projet Riviera", client: "MITO-CI", site: "Site Riviera" }
  });

  const cable = await prisma.article.upsert({
    where: { code: "FO-0001" },
    update: {},
    create: {
      code: "FO-0001",
      designation: "Cable reseau Cat6",
      category: "FO",
      unit: "U",
      trackingMode: "QUANTITY",
      minimumStock: 10,
      referencePrice: 1500
    }
  });

  const pc = await prisma.article.upsert({
    where: { code: "GSM-0001" },
    update: {},
    create: {
      code: "GSM-0001",
      designation: "PC Dell Latitude",
      category: "GSM",
      unit: "Piece",
      trackingMode: "INDIVIDUAL",
      minimumStock: 1,
      referencePrice: 350000
    }
  });

  await prisma.stockLevel.upsert({
    where: { articleId_locationId: { articleId: cable.id, locationId: magasin.id } },
    update: { quantity: 4 },
    create: { articleId: cable.id, locationId: magasin.id, quantity: 4 }
  });

  await prisma.equipment.upsert({
    where: { code: "PC-INV-014" },
    update: {},
    create: {
      code: "PC-INV-014",
      serialNumber: "SN-DL-90821",
      articleId: pc.id,
      status: "AVAILABLE",
      state: "GOOD",
      locationId: magasin.id
    }
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });



