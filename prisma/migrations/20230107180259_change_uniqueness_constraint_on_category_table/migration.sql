/*
  Warnings:

  - A unique constraint covering the columns `[locationId,label]` on the table `categories` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "categories.label_unique";

-- CreateIndex
CREATE UNIQUE INDEX "categories_locationId_label_key" ON "categories"("locationId", "label");
