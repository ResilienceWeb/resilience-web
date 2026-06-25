-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "url" TEXT,
    "url_label" TEXT,
    "severity" TEXT NOT NULL DEFAULT 'info',
    "audience" TEXT NOT NULL DEFAULT 'ALL',
    "publish_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "created_by_id" TEXT NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_receipts" (
    "id" SERIAL NOT NULL,
    "notification_id" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "seen_at" TIMESTAMP(3),
    "clicked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_webs" (
    "notification_id" INTEGER NOT NULL,
    "web_id" INTEGER NOT NULL,

    CONSTRAINT "notification_webs_pkey" PRIMARY KEY ("notification_id", "web_id")
);

-- CreateIndex
CREATE INDEX "notifications_publish_at_idx" ON "notifications"("publish_at");

-- CreateIndex
CREATE INDEX "notifications_expires_at_idx" ON "notifications"("expires_at");

-- CreateIndex
CREATE INDEX "notification_receipts_user_id_idx" ON "notification_receipts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "notification_receipts_notification_id_user_id_key" ON "notification_receipts"("notification_id", "user_id");

-- CreateIndex
CREATE INDEX "notification_webs_web_id_idx" ON "notification_webs"("web_id");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_receipts" ADD CONSTRAINT "notification_receipts_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "notifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_receipts" ADD CONSTRAINT "notification_receipts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_webs" ADD CONSTRAINT "notification_webs_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "notifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_webs" ADD CONSTRAINT "notification_webs_web_id_fkey" FOREIGN KEY ("web_id") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;
