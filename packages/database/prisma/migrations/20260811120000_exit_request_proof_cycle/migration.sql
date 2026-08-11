ALTER TABLE "StockMovement" ADD COLUMN "sourceRequestId" TEXT;
ALTER TABLE "StockMovement" ADD COLUMN "proofFileName" TEXT;
ALTER TABLE "StockMovement" ADD COLUMN "proofUploadedAt" TIMESTAMP(3);
ALTER TABLE "StockMovement" ADD COLUMN "proofUploadedBy" TEXT;

CREATE INDEX "StockMovement_sourceRequestId_idx" ON "StockMovement"("sourceRequestId");

ALTER TABLE "StockMovement"
  ADD CONSTRAINT "StockMovement_sourceRequestId_fkey"
  FOREIGN KEY ("sourceRequestId") REFERENCES "StockMovement"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
