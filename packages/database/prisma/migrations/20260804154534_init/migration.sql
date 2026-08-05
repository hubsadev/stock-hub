-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN_STOCK', 'GESTIONNAIRE_STOCK', 'AUDIT', 'RH', 'DIRECTION', 'CHEF_PROJET');

-- CreateEnum
CREATE TYPE "TrackingMode" AS ENUM ('QUANTITY', 'INDIVIDUAL');

-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('ENTRY', 'EXIT_REQUEST', 'EXIT', 'RETURN', 'TRANSFER', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "MovementStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'PREPARED', 'COMPLETED', 'REJECTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "roles" "UserRole"[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "client" TEXT,
    "site" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "trackingMode" "TrackingMode" NOT NULL DEFAULT 'QUANTITY',
    "minimumStock" INTEGER NOT NULL DEFAULT 0,
    "referencePrice" DECIMAL(18,2),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipment" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "serialNumber" TEXT,
    "articleId" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'GOOD',
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "assignedTo" TEXT,
    "locationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockLevel" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "type" "MovementType" NOT NULL,
    "status" "MovementStatus" NOT NULL DEFAULT 'DRAFT',
    "date" TIMESTAMP(3) NOT NULL,
    "supplierId" TEXT,
    "projectId" TEXT,
    "fromLocationId" TEXT,
    "toLocationId" TEXT,
    "requestedBy" TEXT,
    "handledBy" TEXT,
    "receivedBy" TEXT,
    "deliveredBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockMovementLine" (
    "id" TEXT NOT NULL,
    "movementId" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "requestedQuantity" INTEGER,
    "expectedQuantity" INTEGER,
    "completedQuantity" INTEGER,
    "unitPrice" DECIMAL(18,2),
    "observation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockMovementLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "before" JSONB,
    "after" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportBatch" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "summary" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportBatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_code_key" ON "Supplier"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Project_code_key" ON "Project"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Location_code_key" ON "Location"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Article_code_key" ON "Article"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Equipment_code_key" ON "Equipment"("code");

-- CreateIndex
CREATE UNIQUE INDEX "StockLevel_articleId_locationId_key" ON "StockLevel"("articleId", "locationId");

-- CreateIndex
CREATE UNIQUE INDEX "StockMovement_reference_key" ON "StockMovement"("reference");

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockLevel" ADD CONSTRAINT "StockLevel_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockLevel" ADD CONSTRAINT "StockLevel_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovementLine" ADD CONSTRAINT "StockMovementLine_movementId_fkey" FOREIGN KEY ("movementId") REFERENCES "StockMovement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovementLine" ADD CONSTRAINT "StockMovementLine_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
