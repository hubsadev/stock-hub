ALTER TABLE "Supplier" ADD COLUMN "fiscalId" TEXT,
ADD COLUMN "category" TEXT,
ADD COLUMN "address" TEXT;

ALTER TABLE "Project" ADD COLUMN "startDate" TIMESTAMP(3),
ADD COLUMN "endDate" TIMESTAMP(3);

ALTER TABLE "Location" ADD COLUMN "responsible" TEXT,
ADD COLUMN "region" TEXT,
ADD COLUMN "city" TEXT,
ADD COLUMN "address" TEXT;

ALTER TABLE "Article" ADD COLUMN "securityStock" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "defaultSupplierId" TEXT,
ADD COLUMN "defaultLocationId" TEXT;
