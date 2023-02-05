/*
  Warnings:

  - A unique constraint covering the columns `[locationId,slug]` on the table `listings` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "listings_slug_key";

-- CreateIndex
CREATE UNIQUE INDEX "listings_locationId_slug_key" ON "listings"("locationId", "slug");
