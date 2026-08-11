CREATE TABLE IF NOT EXISTS "Employee" (
    "id" TEXT NOT NULL,
    "matricule" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "department" TEXT,
    "role" TEXT,
    "phone" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Employee_matricule_key" ON "Employee"("matricule");

ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "clientId" TEXT;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "projectManagerId" TEXT;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "region" TEXT;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "city" TEXT;
