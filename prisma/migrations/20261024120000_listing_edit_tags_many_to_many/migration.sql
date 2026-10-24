-- CreateTable
CREATE TABLE "_ListingEditToTag" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ListingEditToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ListingEditToTag_B_index" ON "_ListingEditToTag"("B");

-- AddForeignKey
ALTER TABLE "_ListingEditToTag" ADD CONSTRAINT "_ListingEditToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "listing_edits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ListingEditToTag" ADD CONSTRAINT "_ListingEditToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: carry over each tag's single proposal link before the column goes
INSERT INTO "_ListingEditToTag" ("A", "B")
SELECT "listingEditId", "id" FROM "tags" WHERE "listingEditId" IS NOT NULL;

-- DropForeignKey
ALTER TABLE "tags" DROP CONSTRAINT "tags_listingEditId_fkey";

-- AlterTable
ALTER TABLE "tags" DROP COLUMN "listingEditId";
