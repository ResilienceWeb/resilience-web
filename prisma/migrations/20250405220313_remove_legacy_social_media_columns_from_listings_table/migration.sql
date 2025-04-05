/*
  Warnings:

  - You are about to drop the column `facebook` on the `listings` table. All the data in the column will be lost.
  - You are about to drop the column `instagram` on the `listings` table. All the data in the column will be lost.
  - You are about to drop the column `twitter` on the `listings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "listings" DROP COLUMN "facebook",
DROP COLUMN "instagram",
DROP COLUMN "twitter";
