-- AlterTable
ALTER TABLE "listings" ADD COLUMN     "proposerId" TEXT;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_proposerId_fkey" FOREIGN KEY ("proposerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
