-- CreateEnum
CREATE TYPE "public"."WebRole" AS ENUM ('OWNER', 'EDITOR');

-- CreateTable
CREATE TABLE "public"."web_access" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_email" TEXT NOT NULL,
    "web_id" INTEGER NOT NULL,
    "role" "public"."WebRole" NOT NULL DEFAULT 'EDITOR',

    CONSTRAINT "web_access_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "web_access_user_email_web_id_key" ON "public"."web_access"("user_email", "web_id");

-- AddForeignKey
ALTER TABLE "public"."web_access" ADD CONSTRAINT "web_access_user_email_fkey" FOREIGN KEY ("user_email") REFERENCES "public"."users"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."web_access" ADD CONSTRAINT "web_access_web_id_fkey" FOREIGN KEY ("web_id") REFERENCES "public"."Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;
