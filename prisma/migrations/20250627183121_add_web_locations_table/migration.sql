/*
  Warnings:

  - A unique constraint covering the columns `[locationId]` on the table `Location` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Location" ADD COLUMN     "locationId" INTEGER;

-- CreateTable
CREATE TABLE "web_locations" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "description" TEXT,

    CONSTRAINT "web_locations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Location_locationId_key" ON "Location"("locationId");

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "web_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
