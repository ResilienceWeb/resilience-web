/*
  Warnings:

  - You are about to drop the column `permissionId` on the `Location` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Location" DROP CONSTRAINT "Location_permissionId_fkey";

-- AlterTable
ALTER TABLE "Location" DROP COLUMN "permissionId";

-- CreateTable
CREATE TABLE "_LocationToPermission" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_LocationToPermission_AB_unique" ON "_LocationToPermission"("A", "B");

-- CreateIndex
CREATE INDEX "_LocationToPermission_B_index" ON "_LocationToPermission"("B");

-- AddForeignKey
ALTER TABLE "_LocationToPermission" ADD CONSTRAINT "_LocationToPermission_A_fkey" FOREIGN KEY ("A") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LocationToPermission" ADD CONSTRAINT "_LocationToPermission_B_fkey" FOREIGN KEY ("B") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
