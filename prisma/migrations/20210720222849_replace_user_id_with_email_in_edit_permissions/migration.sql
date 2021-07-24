/*
  Warnings:

  - You are about to drop the column `invitationAccepted` on the `edit_permissions` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `edit_permissions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "edit_permissions" DROP COLUMN "invitationAccepted",
DROP COLUMN "userId",
ADD COLUMN     "email" TEXT NOT NULL DEFAULT E'TOREPLACE';
