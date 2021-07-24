-- AddForeignKey
ALTER TABLE "edit_permissions" ADD FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
