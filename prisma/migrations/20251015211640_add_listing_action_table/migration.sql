-- CreateTable
CREATE TABLE "listing_action" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "listingId" INTEGER,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "listing_action_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "listing_action" ADD CONSTRAINT "listing_action_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
