# Change: Add CSV Import for Listings

## Why

Web administrators currently need to manually create listings one by one, which is time-consuming and error-prone when onboarding existing organizations or migrating from other platforms. A CSV import feature will enable bulk import of listing data, significantly reducing the time and effort required to populate a new web or update multiple listings at once.

## What Changes

- Add a new "Import" menu item to the admin sidebar navigation
- Create a multi-step CSV import workflow with:
  1. File upload step (drag & drop or file picker)
  2. Column mapping step (map CSV columns to listing fields)
  3. Data preview and validation step (review mapped data before import)
  4. Import execution step (process records with progress feedback)
- Support column mapping with intelligent auto-detection based on CSV headers
- Provide field validation and error reporting during import
- Generate import summary with success/failure counts and detailed error messages
- Support importing core listing fields: name, description, location, email, website, phone, social media links
- Handle duplicate detection based on listing name/email within the same web

## Impact

- **Affected specs**: `data-import` (new capability)
- **Affected code**:
  - `app/[subdomain]/admin/layout.tsx` - Add "Import" sidebar menu item
  - `app/[subdomain]/admin/import/page.tsx` - New import page component
  - `app/api/listings/import/route.ts` - New API endpoint for processing imports
  - `components/import/` - New import UI components (file upload, column mapping, preview, progress)
  - `lib/import/` - Import processing utilities (CSV parser, validator, mapping logic)
  - `db/listingRepository.ts` - Bulk insert/upsert methods
- **Dependencies**: Will evaluate `papaparse` for CSV parsing, reference `sadmann7/csv-importer` for component patterns
- **Data model**: No schema changes required; uses existing `Listing` and related models
- **User experience**: Adds new admin workflow accessible only to web OWNER/EDITOR roles
