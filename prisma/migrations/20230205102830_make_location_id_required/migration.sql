/*
  Warnings:

  - Made the column `locationId` on table `listings` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "listings" DROP CONSTRAINT "listings_locationId_fkey";

-- AlterTable
ALTER TABLE "listings" ALTER COLUMN "locationId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
