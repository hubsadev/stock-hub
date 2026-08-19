ALTER TABLE "Equipment"
  ADD COLUMN "supplierId" TEXT,
  ADD COLUMN "entryDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "origin" TEXT,
  ADD COLUMN "notes" TEXT;

CREATE TABLE "EquipmentHistory" (
  "id" TEXT NOT NULL,
  "equipmentId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "status" TEXT,
  "state" TEXT,
  "assignedTo" TEXT,
  "locationId" TEXT,
  "observation" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EquipmentHistory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EquipmentHistory_equipmentId_createdAt_idx" ON "EquipmentHistory"("equipmentId", "createdAt");
CREATE INDEX "Equipment_supplierId_idx" ON "Equipment"("supplierId");

ALTER TABLE "Equipment"
  ADD CONSTRAINT "Equipment_supplierId_fkey"
  FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "EquipmentHistory"
  ADD CONSTRAINT "EquipmentHistory_equipmentId_fkey"
  FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
