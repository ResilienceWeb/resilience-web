/*
  Warnings:

  - Made the column `slug` on table `Location` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Location" ADD COLUMN     "centralNodeLabel" TEXT NOT NULL DEFAULT E'Central Node',
ALTER COLUMN "slug" SET NOT NULL;
