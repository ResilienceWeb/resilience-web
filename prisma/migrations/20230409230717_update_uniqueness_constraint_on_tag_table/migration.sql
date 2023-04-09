/*
  Warnings:

  - A unique constraint covering the columns `[webId,label]` on the table `tags` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "tags.label_unique";

-- CreateIndex
CREATE UNIQUE INDEX "tags_webId_label_key" ON "tags"("webId", "label");
