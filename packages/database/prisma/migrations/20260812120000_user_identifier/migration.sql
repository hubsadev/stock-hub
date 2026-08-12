ALTER TABLE "User" ADD COLUMN "identifier" TEXT;

UPDATE "User"
SET "identifier" = LOWER(
  REGEXP_REPLACE(
    COALESCE(NULLIF(SPLIT_PART("email", '@', 1), ''), 'user-' || SUBSTRING("id" FROM 1 FOR 8)),
    '[^a-zA-Z0-9._-]+',
    '-',
    'g'
  )
)
WHERE "identifier" IS NULL;

ALTER TABLE "User" ALTER COLUMN "identifier" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL;

CREATE UNIQUE INDEX "User_identifier_key" ON "User"("identifier");