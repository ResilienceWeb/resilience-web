/*
  Warnings:

  - A unique constraint covering the columns `[title]` on the table `Location` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Location_title_key" ON "Location"("title");
