-- AlterTable
ALTER TABLE "tags" ADD COLUMN     "key" TEXT,
ADD COLUMN     "retired_at" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "tags_key_key" ON "tags"("key");

-- A shared tag is the one with no web, and it is found by its key, so the two
-- go together (docs/adr/0001-shared-tags-are-one-row-across-webs.md).
ALTER TABLE "tags" ADD CONSTRAINT "tags_shared_has_key" CHECK (("webId" IS NULL) = ("key" IS NOT NULL));

-- The starter shared tags. Change the list with a new migration: never delete
-- a shared tag, retire it by setting retired_at. Then run
-- scripts/merge-web-tags-into-shared-tags.ts.
INSERT INTO "tags" ("key", "label", "icon") VALUES
  ('food-bank', 'Food Bank', 'gm:food-bank'),
  ('community-garden', 'Community Garden', 'gm:community-garden'),
  ('repair-cafe', 'Repair Café', 'gm:repair-shop'),
  ('reuse-and-swap', 'Reuse & Swap', 'gm:reuse-shop-or-market'),
  ('sharing-and-lending', 'Sharing & Lending', 'gm:rental-or-share'),
  ('recycling', 'Recycling', 'gm:recycling'),
  ('composting', 'Composting', 'gm:composting-site'),
  ('local-and-organic-food', 'Local & Organic Food', 'gm:organic-or-local-food'),
  ('farmers-market', 'Farmers'' Market', 'gm:farmers-or-local-market'),
  ('fair-trade', 'Fair Trade', 'gm:fair-trade'),
  ('social-enterprise', 'Social Enterprise', 'gm:social-enterprise'),
  ('volunteering', 'Volunteering', 'gm:volunteer-site'),
  ('environmental-education', 'Environmental Education', 'gm:environmental-education'),
  ('community-centre', 'Community Centre', 'gm:community-center'),
  ('support-services', 'Support Services', 'gm:social-service'),
  ('campaigning', 'Campaigning', 'gm:eco-justice-organization'),
  ('renewable-energy', 'Renewable Energy', 'gm:solar-energy-site'),
  ('energy-saving', 'Energy Saving', 'gm:energy-conservation'),
  ('cycling', 'Cycling', 'gm:bicycle-site'),
  ('wildlife-and-habitat', 'Wildlife & Habitat', 'gm:wildlife-habitat'),
  ('arts-and-culture', 'Arts & Culture', 'gm:art-spot'),
  ('online-resource', 'Online Resource', 'gm:online-resource'),
  ('wheelchair-accessible', 'Wheelchair Accessible', 'gm:wheelchair-accessible'),
  ('family-friendly', 'Family Friendly', 'gm:child-friendly-site'),
  ('older-people-friendly', 'Older People Friendly', 'gm:senior-friendly-site'),
  ('free', 'Free', 'Gift'),
  ('volunteer-run', 'Volunteer-run', 'HandsHelping');
