/*
  Warnings:

  - Made the column `color` on table `categories` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "icon" TEXT NOT NULL DEFAULT 'default',
ALTER COLUMN "color" SET NOT NULL;
