# Specification: Data Import

This specification defines the CSV import capability for bulk importing listing data into Resilience Web.

## ADDED Requirements

### Requirement: Import Access Control
The system SHALL restrict CSV import functionality to authenticated users with OWNER or EDITOR role for the target web.

#### Scenario: Authorized user accesses import
- **GIVEN** a user is authenticated
- **AND** the user has OWNER or EDITOR role for web "bristol"
- **WHEN** the user navigates to `/bristol/admin/import`
- **THEN** the import wizard is displayed

#### Scenario: Unauthorized user blocked from import
- **GIVEN** a user is authenticated
- **AND** the user does NOT have OWNER or EDITOR role for web "bristol"
- **WHEN** the user attempts to navigate to `/bristol/admin/import`
- **THEN** the user is redirected to an error page
- **AND** an appropriate error message is displayed

#### Scenario: Unauthenticated user blocked from import
- **GIVEN** a user is not authenticated
- **WHEN** the user attempts to access any `/*/admin/import` URL
- **THEN** the user is redirected to the login page

### Requirement: CSV File Upload
The system SHALL accept CSV file uploads via drag-and-drop or file picker interface.

#### Scenario: Valid CSV file uploaded
- **GIVEN** a user is on the import wizard Step 1
- **WHEN** the user uploads a valid CSV file
- **THEN** the file is parsed successfully
- **AND** the user advances to Step 2 (column mapping)

#### Scenario: Invalid file format rejected
- **GIVEN** a user is on the import wizard Step 1
- **WHEN** the user uploads a non-CSV file (e.g., .xlsx, .txt)
- **THEN** an error message is displayed
- **AND** the file is rejected
- **AND** the user remains on Step 1

#### Scenario: File size limit exceeded
- **GIVEN** a user is on the import wizard Step 1
- **WHEN** the user uploads a CSV file larger than 5MB
- **THEN** a warning message is displayed
- **AND** the user is advised to split the file into smaller chunks

#### Scenario: Row count limit exceeded
- **GIVEN** a user uploads a CSV file
- **WHEN** the file contains more than 10,000 rows
- **THEN** a warning message is displayed
- **AND** the user is advised to split the file into smaller chunks

### Requirement: Column Mapping
The system SHALL provide an interface for mapping CSV columns to listing fields with auto-detection capabilities.

#### Scenario: Auto-detection of standard columns
- **GIVEN** a CSV file with headers: "Name", "Email", "Website", "Description"
- **WHEN** the file is parsed
- **THEN** "Name" is auto-mapped to the "name" field
- **AND** the "name" field maps to `Listing.title` in storage
- **AND** "Email" is auto-mapped to the "email" field
- **AND** "Website" is auto-mapped to the "website" field
- **AND** "Description" is auto-mapped to the "description" field

#### Scenario: Manual column mapping
- **GIVEN** a CSV file with non-standard header "Organization"
- **WHEN** the user is on Step 2 (column mapping)
- **THEN** the user can manually select "name" field for the "Organization" column
- **AND** the mapping is saved for preview

#### Scenario: Required field unmapped
- **GIVEN** the user is on Step 2 (column mapping)
- **AND** the "name" field is not mapped to any CSV column
- **WHEN** the user attempts to proceed to Step 3
- **THEN** an error message is displayed indicating "name" is required
- **AND** the user remains on Step 2

#### Scenario: Multiple columns mapped to same field
- **GIVEN** the user has mapped "Name" column to "name" field
- **WHEN** the user attempts to map "Organization" column to "name" field
- **THEN** the previous mapping is replaced
- **AND** a confirmation is shown

### Requirement: Data Preview and Validation
The system SHALL display a preview of mapped data and validate field values before import.

#### Scenario: Valid data preview
- **GIVEN** CSV data has been mapped to listing fields
- **WHEN** the user proceeds to Step 3 (preview)
- **THEN** a table displays the first 10 rows of mapped data
- **AND** all fields are validated according to listing schema
- **AND** a validation summary shows "0 errors, ready to import"

#### Scenario: Invalid data detected
- **GIVEN** CSV data contains invalid email addresses in the "email" column
- **WHEN** validation runs on Step 3
- **THEN** the validation summary shows error count
- **AND** invalid rows are highlighted in the preview table
- **AND** error messages explain the validation failures

#### Scenario: Missing required field data
- **GIVEN** CSV data has empty values in the "name" column
- **WHEN** validation runs on Step 3
- **THEN** rows with missing names are marked as invalid
- **AND** an error message indicates "Name is required"
- **AND** the user can choose to skip invalid rows or go back to fix mappings

### Requirement: Duplicate Detection
The system SHALL detect duplicate listings based on name within the same web and handle them gracefully.

#### Scenario: Duplicate listing detected
- **GIVEN** a listing with name "Green Community Garden" exists in web "bristol"
- **AND** CSV data includes a row with name "Green Community Garden"
- **WHEN** import processing runs
- **THEN** the duplicate is detected
- **AND** the row is skipped with a warning
- **AND** the import summary notes "1 skipped (duplicate)"

#### Scenario: Case-insensitive duplicate detection
- **GIVEN** a listing with name "Green Community Garden" exists
- **AND** CSV data includes "green community garden" (lowercase)
- **WHEN** duplicate detection runs
- **THEN** the row is identified as a duplicate
- **AND** the row is skipped

### Requirement: Chunked Import Processing
The system SHALL process CSV imports in batches to prevent API timeouts and provide progress feedback.

#### Scenario: Large import processed in chunks
- **GIVEN** a CSV file contains 500 valid rows
- **WHEN** the user initiates import on Step 4
- **THEN** rows are processed in batches of 50
- **AND** progress updates after each batch
- **AND** all 500 rows are processed successfully

#### Scenario: Partial failure in batch
- **GIVEN** batch 3 contains an invalid row that fails validation
- **WHEN** the batch is processed
- **THEN** the batch transaction is rolled back
- **AND** the error is logged
- **AND** processing continues with the next batch
- **AND** the final summary reports the failed rows

### Requirement: Import Progress Feedback
The system SHALL display real-time progress during import execution.

#### Scenario: Progress bar updates during import
- **GIVEN** an import is in progress
- **WHEN** each batch completes
- **THEN** the progress bar updates to reflect completion percentage
- **AND** the current row count is displayed (e.g., "150 / 500 rows processed")

#### Scenario: Import completion summary
- **GIVEN** an import has completed
- **WHEN** the user is on Step 4
- **THEN** a summary shows:
  - Total rows processed
  - Successfully imported count
  - Skipped count (duplicates)
  - Error count
- **AND** a detailed error log is available for download or review

### Requirement: Import Results and Error Reporting
The system SHALL provide detailed results after import completion including success, skipped, and failed records.

#### Scenario: Successful import with no errors
- **GIVEN** all CSV rows are valid and not duplicates
- **WHEN** import completes
- **THEN** the results show "100% successful (N imported, 0 skipped, 0 errors)"
- **AND** a success message is displayed
- **AND** a link to view imported listings is provided

#### Scenario: Partial success with skipped duplicates
- **GIVEN** CSV contains 100 rows
- **AND** 10 rows are duplicates
- **WHEN** import completes
- **THEN** the results show "90 imported, 10 skipped (duplicates), 0 errors"
- **AND** a list of skipped row numbers is available

#### Scenario: Import with validation errors
- **GIVEN** CSV contains rows with invalid data
- **WHEN** import completes
- **THEN** the results show error count
- **AND** a downloadable error report lists:
  - Row number
  - Field name
  - Error message
- **AND** the user can download the error report as CSV

### Requirement: Web Isolation in Import
The system SHALL ensure imported listings are only added to the current web and do not affect other webs.

#### Scenario: Import scoped to current web
- **GIVEN** a user is importing data for web "bristol"
- **WHEN** the import executes
- **THEN** all created listings have `webId` set to "bristol" web ID
- **AND** listings are not visible in other webs

### Requirement: Supported Import Fields
The system SHALL support importing the following listing fields from CSV: name, description, email, website, notes, category, tags, and social media links.

#### Scenario: Import core listing fields
- **GIVEN** CSV columns are mapped to: name, description, email, website
- **WHEN** import executes
- **THEN** listings are created with all mapped field values
- **AND** unmapped optional fields are left empty

#### Scenario: Import tags and category by label
- **GIVEN** CSV contains columns: "Category" and "Tags"
- **AND** "Tags" contains a semicolon-separated list (e.g., "food;community;climate")
- **WHEN** mapped to category and tags fields
- **THEN** the category is resolved by label within the current web
- **AND** tags are resolved by label within the current web
- **AND** missing tags are created within the current web

#### Scenario: Unknown category label rejected
- **GIVEN** CSV contains a "Category" column mapped to category
- **AND** a row contains an unknown category label for the current web
- **WHEN** validation runs on Step 3
- **THEN** the row is marked invalid
- **AND** an error message indicates the category label must match an existing category

#### Scenario: Import social media links
- **GIVEN** CSV contains columns: "Facebook", "Instagram", "X", "LinkedIn"
- **WHEN** mapped to social media link fields
- **THEN** `ListingSocialMedia` records are created with the respective platform and URL
- **AND** invalid URLs are reported in validation

### Requirement: Slug Generation and Uniqueness
The system SHALL ensure each imported listing has a unique `slug` within the target web.

#### Scenario: Slug generated from title when not provided
- **GIVEN** a CSV row provides a name but no slug
- **WHEN** import executes
- **THEN** the system generates a slug from the name
- **AND** the listing is created with that slug

#### Scenario: Slug collision handled safely
- **GIVEN** a listing with slug "green-community-garden" already exists in the target web
- **AND** a CSV row would generate the same slug
- **WHEN** import executes
- **THEN** the system generates a unique slug variant (e.g., "green-community-garden-2")
- **AND** the listing is created without violating uniqueness constraints

### Requirement: CSV Parsing Compatibility
The system SHALL parse common CSV variants safely including UTF-8 encoded files, quoted fields, and Windows line endings.

#### Scenario: UTF-8 CSV with quoted fields parses correctly
- **GIVEN** a CSV file contains UTF-8 characters and quoted fields with commas/newlines
- **WHEN** the file is parsed on Step 1
- **THEN** rows and columns are parsed correctly
- **AND** special characters are preserved

#### Scenario: Header row missing
- **GIVEN** a CSV file does not include a header row
- **WHEN** the file is uploaded
- **THEN** an error message is displayed indicating headers are required
- **AND** the user remains on Step 1

### Requirement: Import Data Normalization
The system SHALL normalize imported field values prior to validation and storage (e.g., trimming whitespace and normalizing URLs).

#### Scenario: Whitespace trimmed and URL normalized
- **GIVEN** a CSV row contains title "  Green Community Garden  " and website "example.org"
- **WHEN** validation runs on Step 3
- **THEN** the title is treated as "Green Community Garden"
- **AND** the website is treated as "https://example.org"

### Requirement: Import Cancellation
The system SHALL allow users to cancel an in-progress import.

#### Scenario: User cancels an in-progress import
- **GIVEN** an import is in progress on Step 4
- **WHEN** the user clicks "Cancel import"
- **THEN** the system stops processing additional batches
- **AND** the user is shown a summary of what was imported before cancellation

### Requirement: Import Data Privacy
The system SHALL avoid persisting the uploaded CSV file server-side beyond what is necessary to complete the import and produce results.

#### Scenario: Uploaded CSV is not retained after completion
- **GIVEN** an import completes (successfully or with errors)
- **WHEN** the user leaves the results screen
- **THEN** the uploaded CSV contents are not stored for later retrieval

### Requirement: Import Navigation
The system SHALL provide a navigation menu item to access the import feature from the admin sidebar.

#### Scenario: Import menu item visible to admin
- **GIVEN** a user has OWNER or EDITOR role
- **WHEN** the user views the admin sidebar
- **THEN** an "Import" menu item is displayed
- **AND** clicking the item navigates to the import wizard

#### Scenario: Import menu item hidden from non-admin
- **GIVEN** a user does not have OWNER or EDITOR role
- **WHEN** the user views the admin sidebar (if accessible)
- **THEN** the "Import" menu item is not displayed
