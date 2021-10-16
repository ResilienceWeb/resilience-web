/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `listings` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "listings_slug_key" ON "listings"("slug");
