-- Many-to-many between Listing and Web.
-- Moves slug, categoryId, featured, and tags from `listings` onto a new `listing_placements` join table
-- (each row represents a placement of a listing in a web).
-- Adds `web_id` to `listing_edits` and `listing_analytics_daily` so each row knows which web it applies to.

-- 1. Create the listing_placements table
CREATE TABLE "listing_placements" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "listing_id" INTEGER NOT NULL,
    "web_id" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "category_id" INTEGER,
    "featured" TIMESTAMP(3),

    CONSTRAINT "listing_placements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "listing_placements_listing_id_web_id_key" ON "listing_placements"("listing_id", "web_id");
CREATE UNIQUE INDEX "listing_placements_web_id_slug_key" ON "listing_placements"("web_id", "slug");
CREATE INDEX "listing_placements_web_id_idx" ON "listing_placements"("web_id");

-- AddForeignKey
ALTER TABLE "listing_placements" ADD CONSTRAINT "listing_placements_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "listing_placements" ADD CONSTRAINT "listing_placements_web_id_fkey" FOREIGN KEY ("web_id") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "listing_placements" ADD CONSTRAINT "listing_placements_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 2. Backfill listing_placements: one row per existing listing
INSERT INTO "listing_placements" ("listing_id", "web_id", "slug", "category_id", "featured", "created_at", "updated_at")
SELECT id, "webId", slug, "categoryId", featured, created_at, updated_at
FROM "listings";

-- 3. Create the new tag M2M table (ListingWeb <-> Tag)
CREATE TABLE "_ListingPlacementToTag" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ListingPlacementToTag_AB_pkey" PRIMARY KEY ("A", "B")
);

-- CreateIndex
CREATE INDEX "_ListingPlacementToTag_B_index" ON "_ListingPlacementToTag"("B");

-- AddForeignKey
ALTER TABLE "_ListingPlacementToTag" ADD CONSTRAINT "_ListingPlacementToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "listing_placements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_ListingPlacementToTag" ADD CONSTRAINT "_ListingPlacementToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 4. Backfill _ListingPlacementToTag from the old _ListingToTag, mapping listing_id -> listing_web_id
INSERT INTO "_ListingPlacementToTag" ("A", "B")
SELECT lw.id, lt."B"
FROM "_ListingToTag" lt
JOIN "listings" l ON l.id = lt."A"
JOIN "listing_placements" lw ON lw.listing_id = l.id AND lw.web_id = l."webId";

-- 5. Drop the old listing<->tag join
DROP TABLE "_ListingToTag";

-- 6. Add web_id to listing_edits (nullable, backfill from the edit's listing.webId, then NOT NULL)
ALTER TABLE "listing_edits" ADD COLUMN "web_id" INTEGER;

UPDATE "listing_edits" le
SET "web_id" = l."webId"
FROM "listings" l
WHERE l.id = le."listingId";

ALTER TABLE "listing_edits" ALTER COLUMN "web_id" SET NOT NULL;

CREATE INDEX "listing_edits_web_id_idx" ON "listing_edits"("web_id");

ALTER TABLE "listing_edits" ADD CONSTRAINT "listing_edits_web_id_fkey" FOREIGN KEY ("web_id") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 7. Add web_id to listing_analytics_daily, backfill, then NOT NULL. Replace the unique index.
ALTER TABLE "listing_analytics_daily" ADD COLUMN "web_id" INTEGER;

UPDATE "listing_analytics_daily" lad
SET "web_id" = l."webId"
FROM "listings" l
WHERE l.id = lad."listing_id";

ALTER TABLE "listing_analytics_daily" ALTER COLUMN "web_id" SET NOT NULL;

DROP INDEX "listing_analytics_daily_listing_id_date_event_type_key";
CREATE UNIQUE INDEX "listing_analytics_daily_listing_id_web_id_date_event_type_key"
    ON "listing_analytics_daily"("listing_id", "web_id", "date", "event_type");
CREATE INDEX "listing_analytics_daily_web_id_date_idx" ON "listing_analytics_daily"("web_id", "date");

ALTER TABLE "listing_analytics_daily" ADD CONSTRAINT "listing_analytics_daily_web_id_fkey" FOREIGN KEY ("web_id") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 8. Drop the per-listing copies of fields that are now on listing_placements
DROP INDEX "listings_webId_slug_key";

ALTER TABLE "listings" DROP CONSTRAINT IF EXISTS "listings_webId_fkey";
ALTER TABLE "listings" DROP CONSTRAINT IF EXISTS "listings_categoryId_fkey";

ALTER TABLE "listings"
    DROP COLUMN "webId",
    DROP COLUMN "categoryId",
    DROP COLUMN "slug",
    DROP COLUMN "featured";
