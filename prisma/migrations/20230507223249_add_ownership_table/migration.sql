-- AlterTable
ALTER TABLE "Location" ADD COLUMN     "ownershipId" INTEGER;

-- CreateTable
CREATE TABLE "ownership" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,

    CONSTRAINT "ownership_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ownership_email_key" ON "ownership"("email");

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_ownershipId_fkey" FOREIGN KEY ("ownershipId") REFERENCES "ownership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ownership" ADD CONSTRAINT "ownership_email_fkey" FOREIGN KEY ("email") REFERENCES "users"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
