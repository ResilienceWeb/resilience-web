/*
  Warnings:
  - A unique constraint covering the columns `[email]` on the table `Permission` will be added. If there are existing duplicate values, this will fail.
*/
-- CreateIndex
CREATE UNIQUE INDEX "Permission_email_key" ON "Permission"("email");