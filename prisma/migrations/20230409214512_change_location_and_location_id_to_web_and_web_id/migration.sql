-- DropForeignKey
ALTER TABLE "categories" DROP CONSTRAINT "categories_locationId_fkey";

-- DropForeignKey
ALTER TABLE "listings" DROP CONSTRAINT "listings_locationId_fkey";

-- DropForeignKey
ALTER TABLE "tags" DROP CONSTRAINT "tags_locationId_fkey";

-- DropIndex
DROP INDEX "categories_locationId_label_key";

-- DropIndex
DROP INDEX "listings_locationId_slug_key";

-- AlterTable
ALTER TABLE "categories" RENAME COLUMN "locationId" to "webId";

-- AlterTable
ALTER TABLE "listings" RENAME COLUMN "locationId" to "webId";

-- AlterTable
ALTER TABLE "tags" RENAME COLUMN "locationId" to "webId";

-- CreateIndex
CREATE UNIQUE INDEX "categories_webId_label_key" ON "categories"("webId", "label");

-- CreateIndex
CREATE UNIQUE INDEX "listings_webId_slug_key" ON "listings"("webId", "slug");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_webId_fkey" FOREIGN KEY ("webId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_webId_fkey" FOREIGN KEY ("webId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_webId_fkey" FOREIGN KEY ("webId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
