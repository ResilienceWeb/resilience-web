-- Speeds up "tags/categories for a web" lookups
-- (GET /api/tags?web=<slug> and GET /api/categories?web=<slug>).
-- Both queries filter by webId (resolved from the web slug) and order by id ASC.
-- These composite indexes let Postgres scan by webId already in id order,
-- avoiding a sort step and any sequential scan fallback on the tables.
CREATE INDEX "tags_webId_id_idx" ON "tags"("webId", "id");
CREATE INDEX "categories_webId_id_idx" ON "categories"("webId", "id");
