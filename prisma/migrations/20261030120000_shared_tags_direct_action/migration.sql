-- Retire Energy Saving, add Direct Action.
UPDATE "tags" SET "retired_at" = CURRENT_TIMESTAMP WHERE "key" = 'energy-saving';

INSERT INTO "tags" ("key", "label", "icon") VALUES
  ('direct-action', 'Direct Action', 'FistRaised');
