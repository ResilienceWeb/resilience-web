-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "password" TEXT,
ADD COLUMN     "refresh_token_expires" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "sessions" ADD COLUMN     "impersonatedBy" TEXT;
