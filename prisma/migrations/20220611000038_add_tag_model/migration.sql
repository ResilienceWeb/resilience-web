-- CreateTable
CREATE TABLE "tags" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "locationId" INTEGER,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ListingToTag" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "tags.label_unique" ON "tags"("label");

-- CreateIndex
CREATE UNIQUE INDEX "_ListingToTag_AB_unique" ON "_ListingToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_ListingToTag_B_index" ON "_ListingToTag"("B");

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ListingToTag" ADD CONSTRAINT "_ListingToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ListingToTag" ADD CONSTRAINT "_ListingToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
