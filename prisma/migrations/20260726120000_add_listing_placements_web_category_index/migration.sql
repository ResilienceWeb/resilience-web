-- Lets the per-web category listing counts in /api/categories run as an
-- index-only scan instead of an index scan plus heap fetches
-- CreateIndex
CREATE INDEX "listing_placements_web_id_category_id_idx" ON "listing_placements"("web_id", "category_id");
