-- CreateTable
CREATE TABLE "web_features" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "webId" INTEGER NOT NULL,
    "feature" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "web_features_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "web_features_feature_key" ON "web_features"("feature");

-- CreateIndex
CREATE UNIQUE INDEX "web_features_webId_feature_key" ON "web_features"("webId", "feature");

-- AddForeignKey
ALTER TABLE "web_features" ADD CONSTRAINT "web_features_webId_fkey" FOREIGN KEY ("webId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
