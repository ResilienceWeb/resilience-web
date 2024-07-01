/*
  Warnings:

  - You are about to drop the column `latitude` on the `listings` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `listings` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[locationId]` on the table `listings` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "listings" DROP COLUMN "latitude",
DROP COLUMN "longitude",
ADD COLUMN     "locationId" INTEGER;

-- CreateTable
CREATE TABLE "listing_locations" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "description" TEXT,

    CONSTRAINT "listing_locations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "listings_locationId_key" ON "listings"("locationId");

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "listing_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
