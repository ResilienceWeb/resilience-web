-- CreateTable
CREATE TABLE "listing_analytics_daily" (
    "id" SERIAL NOT NULL,
    "listing_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "event_type" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "listing_analytics_daily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "web_analytics_daily" (
    "id" SERIAL NOT NULL,
    "web_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "event_type" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "web_analytics_daily_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "listing_analytics_daily_listing_id_date_idx" ON "listing_analytics_daily"("listing_id", "date");

-- CreateIndex
CREATE INDEX "listing_analytics_daily_date_idx" ON "listing_analytics_daily"("date");

-- CreateIndex
CREATE UNIQUE INDEX "listing_analytics_daily_listing_id_date_event_type_key" ON "listing_analytics_daily"("listing_id", "date", "event_type");

-- CreateIndex
CREATE INDEX "web_analytics_daily_web_id_date_idx" ON "web_analytics_daily"("web_id", "date");

-- CreateIndex
CREATE INDEX "web_analytics_daily_date_idx" ON "web_analytics_daily"("date");

-- CreateIndex
CREATE UNIQUE INDEX "web_analytics_daily_web_id_date_event_type_key" ON "web_analytics_daily"("web_id", "date", "event_type");

-- AddForeignKey
ALTER TABLE "listing_analytics_daily" ADD CONSTRAINT "listing_analytics_daily_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "web_analytics_daily" ADD CONSTRAINT "web_analytics_daily_web_id_fkey" FOREIGN KEY ("web_id") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;
