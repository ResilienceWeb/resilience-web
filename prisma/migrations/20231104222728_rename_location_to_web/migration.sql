/*
  Warnings:

  - You are about to drop the `_LocationToOwnership` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_LocationToPermission` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_LocationToOwnership" DROP CONSTRAINT "_LocationToOwnership_A_fkey";

-- DropForeignKey
ALTER TABLE "_LocationToOwnership" DROP CONSTRAINT "_LocationToOwnership_B_fkey";

-- DropForeignKey
ALTER TABLE "_LocationToPermission" DROP CONSTRAINT "_LocationToPermission_A_fkey";

-- DropForeignKey
ALTER TABLE "_LocationToPermission" DROP CONSTRAINT "_LocationToPermission_B_fkey";

-- DropTable
DROP TABLE "_LocationToOwnership";

-- DropTable
DROP TABLE "_LocationToPermission";

-- CreateTable
CREATE TABLE "_PermissionToWeb" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_OwnershipToWeb" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_PermissionToWeb_AB_unique" ON "_PermissionToWeb"("A", "B");

-- CreateIndex
CREATE INDEX "_PermissionToWeb_B_index" ON "_PermissionToWeb"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_OwnershipToWeb_AB_unique" ON "_OwnershipToWeb"("A", "B");

-- CreateIndex
CREATE INDEX "_OwnershipToWeb_B_index" ON "_OwnershipToWeb"("B");

-- AddForeignKey
ALTER TABLE "_PermissionToWeb" ADD CONSTRAINT "_PermissionToWeb_A_fkey" FOREIGN KEY ("A") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionToWeb" ADD CONSTRAINT "_PermissionToWeb_B_fkey" FOREIGN KEY ("B") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OwnershipToWeb" ADD CONSTRAINT "_OwnershipToWeb_A_fkey" FOREIGN KEY ("A") REFERENCES "ownership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OwnershipToWeb" ADD CONSTRAINT "_OwnershipToWeb_B_fkey" FOREIGN KEY ("B") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;
