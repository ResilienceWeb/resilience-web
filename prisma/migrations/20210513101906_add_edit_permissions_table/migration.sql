-- CreateTable
CREATE TABLE "edit_permissions" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "listingId" INTEGER NOT NULL,
    "invitationAccepted" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("id")
);
