/*
  Warnings:

  - You are about to drop the `edit_permissions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "edit_permissions" DROP CONSTRAINT "edit_permissions_listingId_fkey";

-- DropTable
DROP TABLE "edit_permissions";
