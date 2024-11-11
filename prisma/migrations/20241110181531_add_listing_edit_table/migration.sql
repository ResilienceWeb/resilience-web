-- AlterTable
ALTER TABLE "tags" ADD COLUMN     "listingEditId" INTEGER;

-- CreateTable
CREATE TABLE "listing_edits" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "listingId" INTEGER NOT NULL,
    "title" TEXT,
    "website" TEXT,
    "description" TEXT,
    "facebook" TEXT,
    "twitter" TEXT,
    "instagram" TEXT,
    "email" TEXT,
    "categoryId" INTEGER,
    "image" TEXT,
    "slug" TEXT,
    "webId" INTEGER,
    "locationId" INTEGER,

    CONSTRAINT "listing_edits_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_listingEditId_fkey" FOREIGN KEY ("listingEditId") REFERENCES "listing_edits"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_edits" ADD CONSTRAINT "listing_edits_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_edits" ADD CONSTRAINT "listing_edits_webId_fkey" FOREIGN KEY ("webId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_edits" ADD CONSTRAINT "listing_edits_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_edits" ADD CONSTRAINT "listing_edits_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "listing_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
