-- AlterTable
ALTER TABLE "tags" ADD COLUMN     "key" TEXT,
ADD COLUMN     "retired_at" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "tags_key_key" ON "tags"("key");

-- A shared tag is the one with no web, and it is found by its key, so the two
-- go together (docs/adr/0001-shared-tags-are-one-row-across-webs.md).
ALTER TABLE "tags" ADD CONSTRAINT "tags_shared_has_key" CHECK (("webId" IS NULL) = ("key" IS NOT NULL));

-- CreateTable
-- The shared tags each web has chosen to use. A web starts with none.
CREATE TABLE "web_shared_tags" (
    "webId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "web_shared_tags_pkey" PRIMARY KEY ("webId","tagId")
);

-- CreateIndex
CREATE INDEX "web_shared_tags_tagId_idx" ON "web_shared_tags"("tagId");

-- AddForeignKey
ALTER TABLE "web_shared_tags" ADD CONSTRAINT "web_shared_tags_webId_fkey" FOREIGN KEY ("webId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "web_shared_tags" ADD CONSTRAINT "web_shared_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- The starter shared tags. Change the list with a new migration: never delete
-- a shared tag, retire it by setting retired_at. Then run
-- scripts/merge-web-tags-into-shared-tags.ts.
INSERT INTO "tags" ("key", "label", "icon") VALUES
  ('food-bank', 'Food Bank', 'gm:food-bank'),
  ('community-garden', 'Community Garden', 'gm:community-garden'),
  ('repair-cafe', 'Repair Café', 'gm:repair-shop'),
  ('reuse-and-swap', 'Reuse & Swap', 'gm:reuse-shop-or-market'),
  ('sharing-and-lending', 'Sharing & Lending', 'gm:rental-or-share'),
  ('local-and-organic-food', 'Local & Organic Food', 'gm:organic-or-local-food'),
  ('social-enterprise', 'Social Enterprise', 'gm:social-enterprise'),
  ('volunteering', 'Volunteering', 'gm:volunteer-site'),
  ('community-centre', 'Community Centre', 'gm:community-center'),
  ('support-services', 'Support Services', 'gm:social-service'),
  ('climate-justice', 'Climate Justice', 'gm:eco-justice-organization'),
  ('renewable-energy', 'Renewable Energy', 'gm:solar-energy-site'),
  ('energy-saving', 'Energy Saving', 'gm:energy-conservation'),
  ('cycling', 'Cycling', 'gm:bicycle-site'),
  ('wildlife-and-habitat', 'Wildlife & Habitat', 'gm:wildlife-habitat'),
  ('arts-and-culture', 'Arts & Culture', 'gm:art-spot'),
  ('online-resource', 'Online Resource', 'gm:online-resource'),
  ('wheelchair-accessible', 'Wheelchair Accessible', 'gm:wheelchair-accessible'),
  ('volunteer-run', 'Volunteer-run', 'HandsHelping');
