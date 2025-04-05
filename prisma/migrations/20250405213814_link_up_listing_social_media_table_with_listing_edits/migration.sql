/*
  Warnings:

  - You are about to drop the column `facebook` on the `listing_edits` table. All the data in the column will be lost.
  - You are about to drop the column `instagram` on the `listing_edits` table. All the data in the column will be lost.
  - You are about to drop the column `twitter` on the `listing_edits` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "listing_social_media" DROP CONSTRAINT "listing_social_media_listingId_fkey";

-- AlterTable
ALTER TABLE "listing_edits" DROP COLUMN "facebook",
DROP COLUMN "instagram",
DROP COLUMN "twitter";

-- AlterTable
ALTER TABLE "listing_social_media" ADD COLUMN     "listingEditId" INTEGER,
ALTER COLUMN "listingId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "listing_social_media" ADD CONSTRAINT "listing_social_media_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_social_media" ADD CONSTRAINT "listing_social_media_listingEditId_fkey" FOREIGN KEY ("listingEditId") REFERENCES "listing_edits"("id") ON DELETE SET NULL ON UPDATE CASCADE;
