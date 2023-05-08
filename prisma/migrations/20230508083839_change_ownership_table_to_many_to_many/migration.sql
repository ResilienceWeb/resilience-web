-- DropForeignKey
ALTER TABLE "Location" DROP CONSTRAINT "Location_ownershipId_fkey";

-- CreateTable
CREATE TABLE "_LocationToOwnership" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_LocationToOwnership_AB_unique" ON "_LocationToOwnership"("A", "B");

-- CreateIndex
CREATE INDEX "_LocationToOwnership_B_index" ON "_LocationToOwnership"("B");

-- AddForeignKey
ALTER TABLE "_LocationToOwnership" ADD CONSTRAINT "_LocationToOwnership_A_fkey" FOREIGN KEY ("A") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LocationToOwnership" ADD CONSTRAINT "_LocationToOwnership_B_fkey" FOREIGN KEY ("B") REFERENCES "ownership"("id") ON DELETE CASCADE ON UPDATE CASCADE;
