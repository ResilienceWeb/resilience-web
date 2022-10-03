/*
  Warnings:

  - You are about to drop the `_LocationToPermission` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_LocationToPermission" DROP CONSTRAINT "_LocationToPermission_A_fkey";

-- DropForeignKey
ALTER TABLE "_LocationToPermission" DROP CONSTRAINT "_LocationToPermission_B_fkey";

-- AlterTable
ALTER TABLE "Location" ADD COLUMN     "permissionId" INTEGER;

-- DropTable
DROP TABLE "_LocationToPermission";

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE SET NULL ON UPDATE CASCADE;
