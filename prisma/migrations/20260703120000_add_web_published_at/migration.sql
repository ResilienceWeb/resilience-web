-- AlterTable
ALTER TABLE "Location" ADD COLUMN "published_at" TIMESTAMP(3);

-- Backfill: assume existing published webs were published when they were created
UPDATE "Location" SET "published_at" = "created_at" WHERE "published" = true;
