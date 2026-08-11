import { prisma } from "../src/client.js";

async function counts() {
  return {
    users: await prisma.user.count(),
    suppliers: await prisma.supplier.count(),
    projects: await prisma.project.count(),
    locations: await prisma.location.count(),
    articles: await prisma.article.count(),
    equipments: await prisma.equipment.count(),
    stockLevels: await prisma.stockLevel.count(),
    movements: await prisma.stockMovement.count(),
    movementLines: await prisma.stockMovementLine.count(),
    vehicles: await prisma.vehicle.count(),
    auditLogs: await prisma.auditLog.count(),
    importBatches: await prisma.importBatch.count()
  };
}

async function main() {
  const before = await counts();

  await prisma.stockMovementLine.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.stockLevel.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.article.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.project.deleteMany();
  await prisma.location.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.importBatch.deleteMany();

  const after = await counts();
  console.log(JSON.stringify({ before, after }, null, 2));
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });