/*
  Warnings:

  - You are about to drop the column `webId` on the `listing_edits` table. All the data in the column will be lost.
  - Added the required column `userId` to the `listing_edits` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "listing_edits" DROP CONSTRAINT "listing_edits_webId_fkey";

-- AlterTable
ALTER TABLE "listing_edits" DROP COLUMN "webId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "listing_edits" ADD CONSTRAINT "listing_edits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
