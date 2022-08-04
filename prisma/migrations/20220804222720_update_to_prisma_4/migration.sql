-- CreateTable
CREATE TABLE "_related" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_related_AB_unique" ON "_related"("A", "B");

-- CreateIndex
CREATE INDEX "_related_B_index" ON "_related"("B");

-- AddForeignKey
ALTER TABLE "_related" ADD CONSTRAINT "_related_A_fkey" FOREIGN KEY ("A") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_related" ADD CONSTRAINT "_related_B_fkey" FOREIGN KEY ("B") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
