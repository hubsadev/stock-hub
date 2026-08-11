CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TeamService" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'SERVICE',
    "manager" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TeamService_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Client_code_key" ON "Client"("code");
CREATE UNIQUE INDEX "TeamService_code_key" ON "TeamService"("code");

ALTER TABLE "Location" ADD COLUMN "projectId" TEXT;
ALTER TABLE "StockMovement" ADD COLUMN "clientId" TEXT;
ALTER TABLE "StockMovement" ADD COLUMN "teamServiceId" TEXT;
ALTER TABLE "StockMovement" ADD COLUMN "siteLocationId" TEXT;

ALTER TABLE "Location" ADD CONSTRAINT "Location_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
