CREATE TABLE "VehicleHistory" (
  "id" TEXT NOT NULL,
  "vehicleId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "assignment" TEXT,
  "previousAssignment" TEXT,
  "driverName" TEXT,
  "previousDriverName" TEXT,
  "apprenticeName" TEXT,
  "previousApprenticeName" TEXT,
  "status" TEXT,
  "previousStatus" TEXT,
  "observation" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "VehicleHistory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "VehicleHistory_vehicleId_createdAt_idx" ON "VehicleHistory"("vehicleId", "createdAt");

ALTER TABLE "VehicleHistory"
  ADD CONSTRAINT "VehicleHistory_vehicleId_fkey"
  FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
