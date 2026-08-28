ALTER TABLE "StockMovement" ADD COLUMN "proofFileKey" TEXT;
ALTER TABLE "StockMovement" ADD COLUMN "proofMimeType" TEXT;
ALTER TABLE "StockMovement" ADD COLUMN "proofSizeBytes" INTEGER;
ALTER TABLE "StockMovement" ADD COLUMN "rejectionReason" TEXT;
ALTER TABLE "StockMovement" ADD COLUMN "rejectedAt" TIMESTAMP(3);
ALTER TABLE "StockMovement" ADD COLUMN "rejectedBy" TEXT;
