import { prisma } from "../src/client.js";

async function main() {
  await prisma.user.upsert({
    where: { email: "admin@stock.local" },
    update: {},
    create: {
      email: "admin@stock.local",
      firstName: "Admin",
      lastName: "Stock",
      roles: ["ADMIN_STOCK"],
      active: true
    }
  });

  await prisma.user.upsert({
    where: { email: "gestionnaire@stock.local" },
    update: {},
    create: {
      email: "gestionnaire@stock.local",
      firstName: "Awa",
      lastName: "Stock",
      roles: ["GESTIONNAIRE_STOCK"],
      active: true
    }
  });

  await prisma.user.upsert({
    where: { email: "audit@stock.local" },
    update: {},
    create: {
      email: "audit@stock.local",
      firstName: "Jean",
      lastName: "Audit",
      roles: ["AUDIT"],
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
    where: { code: "MAT-0018" },
    update: {},
    create: {
      code: "MAT-0018",
      designation: "Cable reseau Cat6",
      category: "MATERIEL_RESEAU",
      unit: "U",
      trackingMode: "QUANTITY",
      minimumStock: 10,
      referencePrice: 1500
    }
  });

  const pc = await prisma.article.upsert({
    where: { code: "INF-0001" },
    update: {},
    create: {
      code: "INF-0001",
      designation: "PC Dell Latitude",
      category: "EQUIPEMENT_IT",
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