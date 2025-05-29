-- CreateTable
CREATE TABLE "_related_webs" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_related_webs_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_related_webs_B_index" ON "_related_webs"("B");

-- AddForeignKey
ALTER TABLE "_related_webs" ADD CONSTRAINT "_related_webs_A_fkey" FOREIGN KEY ("A") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_related_webs" ADD CONSTRAINT "_related_webs_B_fkey" FOREIGN KEY ("B") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;
