-- AlterTable
ALTER TABLE "listings" ADD COLUMN     "inactive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "seeking_volunteers" BOOLEAN;
