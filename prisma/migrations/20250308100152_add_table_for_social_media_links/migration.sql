-- AlterTable
ALTER TABLE "_ListingToPermission" ADD CONSTRAINT "_ListingToPermission_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ListingToPermission_AB_unique";

-- AlterTable
ALTER TABLE "_ListingToTag" ADD CONSTRAINT "_ListingToTag_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ListingToTag_AB_unique";

-- AlterTable
ALTER TABLE "_OwnershipToWeb" ADD CONSTRAINT "_OwnershipToWeb_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_OwnershipToWeb_AB_unique";

-- AlterTable
ALTER TABLE "_PermissionToWeb" ADD CONSTRAINT "_PermissionToWeb_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_PermissionToWeb_AB_unique";

-- AlterTable
ALTER TABLE "_related" ADD CONSTRAINT "_related_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_related_AB_unique";

-- CreateTable
CREATE TABLE "listing_social_media" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "listingId" INTEGER NOT NULL,
    "platform" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "listing_social_media_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "listing_social_media" ADD CONSTRAINT "listing_social_media_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
