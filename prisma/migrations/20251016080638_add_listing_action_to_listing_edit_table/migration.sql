-- AlterTable
ALTER TABLE "listing_action" ADD COLUMN     "listingEditId" INTEGER;

-- AddForeignKey
ALTER TABLE "listing_action" ADD CONSTRAINT "listing_action_listingEditId_fkey" FOREIGN KEY ("listingEditId") REFERENCES "listing_edits"("id") ON DELETE SET NULL ON UPDATE CASCADE;
