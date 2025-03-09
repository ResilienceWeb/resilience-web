-- Migrate existing social media data to the new ListingSocialMedia table

-- First, create entries for Facebook URLs
INSERT INTO "listing_social_media" ("listingId", "platform", "url", "created_at", "updated_at")
SELECT 
  id as "listingId", 
  'facebook' as "platform", 
  facebook as "url",
  NOW() as "created_at",
  NOW() as "updated_at"
FROM "listings"
WHERE facebook IS NOT NULL AND facebook != '';

-- Then, create entries for Twitter URLs
INSERT INTO "listing_social_media" ("listingId", "platform", "url", "created_at", "updated_at")
SELECT 
  id as "listingId", 
  'twitter' as "platform", 
  twitter as "url",
  NOW() as "created_at",
  NOW() as "updated_at"
FROM "listings"
WHERE twitter IS NOT NULL AND twitter != '';

-- Finally, create entries for Instagram URLs
INSERT INTO "listing_social_media" ("listingId", "platform", "url", "created_at", "updated_at")
SELECT 
  id as "listingId", 
  'instagram' as "platform", 
  instagram as "url",
  NOW() as "created_at",
  NOW() as "updated_at"
FROM "listings"
WHERE instagram IS NOT NULL AND instagram != '';