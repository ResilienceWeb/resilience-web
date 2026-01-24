# Implementation Tasks: CSV Import

## 1. Dependencies and Setup
- [ ] 1.1 Install `papaparse` and `@types/papaparse` for CSV parsing
- [ ] 1.2 Review `sadmann7/csv-importer` implementation for component patterns
- [ ] 1.3 Create `lib/import/` directory for import utilities

## 2. Backend Implementation

### 2.1 Import Utilities
- [ ] 2.1.1 Create `lib/import/types.ts` - TypeScript types for import data structures
- [ ] 2.1.2 Create `lib/import/validator.ts` - Zod schemas for validating imported data (name, description, email, website, phone, address, social links)
- [ ] 2.1.3 Create `lib/import/mapper.ts` - Logic for column mapping and auto-detection (including phone and social media fields)
- [ ] 2.1.4 Create `lib/import/processor.ts` - Chunked processing and duplicate detection
- [ ] 2.1.5 Create `lib/import/geocoder.ts` - Address geocoding logic using Leaflet Geosearch

### 2.2 Database Layer
- [ ] 2.2.1 Add `bulkCreateListings()` method to `db/listingRepository.ts`
- [ ] 2.2.2 Add `bulkCreateListingLocations()` method for batch location inserts
- [ ] 2.2.3 Add `bulkCreateListingSocialMedia()` method for batch social media inserts
- [ ] 2.2.4 Add `findDuplicateListings()` method for duplicate detection by name/web
- [ ] 2.2.5 Add transaction support for batch inserts with rollback capability

### 2.3 API Endpoint
- [ ] 2.3.1 Create `app/api/listings/import/route.ts` POST handler
- [ ] 2.3.2 Implement access control (verify OWNER or EDITOR role for current web)
- [ ] 2.3.3 Implement request validation (validate CSV data and mappings)
- [ ] 2.3.4 Implement address geocoding for location data during import
- [ ] 2.3.5 Implement social media links creation during import
- [ ] 2.3.6 Implement chunked processing (process in batches of 50)
- [ ] 2.3.7 Return import results (success count, error count, error details)
- [ ] 2.3.8 Add error handling with detailed error messages
- [ ] 2.3.9 Ensure CSV data is not persisted server-side (process in memory only)

## 3. Frontend Implementation

### 3.1 Import Components
- [ ] 3.1.1 Create `components/import/ImportWizard.tsx` - Main wizard container with step state
- [ ] 3.1.2 Create `components/import/ImportStepIndicator.tsx` - Step progress indicator
- [ ] 3.1.3 Create `components/import/FileUploadZone.tsx` - Drag & drop file upload (Step 1)
- [ ] 3.1.4 Create `components/import/ColumnMappingTable.tsx` - Column mapping UI (Step 2)
- [ ] 3.1.5 Create `components/import/ColumnSelect.tsx` - Dropdown for field selection (including phone, address, social media fields)
- [ ] 3.1.6 Create `components/import/DataPreviewTable.tsx` - Preview mapped data (Step 3)
- [ ] 3.1.7 Create `components/import/ValidationSummary.tsx` - Show validation errors
- [ ] 3.1.8 Create `components/import/ImportProgress.tsx` - Progress bar and status (Step 4)
- [ ] 3.1.9 Create `components/import/ImportResults.tsx` - Success/failure summary with downloadable error report
- [ ] 3.1.10 Create `components/import/ErrorReportDownload.tsx` - Download errors as CSV button

### 3.2 Import Page
- [ ] 3.2.1 Create `app/[subdomain]/admin/import/page.tsx` - Import page route
- [ ] 3.2.2 Implement access control (check OWNER/EDITOR role)
- [ ] 3.2.3 Integrate `ImportWizard` component
- [ ] 3.2.4 Add page metadata and title

### 3.3 Navigation
- [ ] 3.3.1 Update `app/[subdomain]/admin/layout.tsx` - Add "Import" sidebar menu item
- [ ] 3.3.2 Add appropriate icon for Import menu item (Upload or FileUp icon)

### 3.4 Client-Side Logic
- [ ] 3.4.1 Create `hooks/import/useCSVParser.ts` - Hook for parsing CSV with papaparse
- [ ] 3.4.2 Create `hooks/import/useColumnMapping.ts` - Hook for managing column mappings
- [ ] 3.4.3 Create `hooks/import/useImportMutation.ts` - React Query mutation for import API
- [ ] 3.4.4 Implement auto-detection logic for common column names (including phone, address, social media variations)
- [ ] 3.4.5 Implement client-side validation before submission
- [ ] 3.4.6 Implement error report CSV generation from import results

## 4. UI/UX Polish
- [ ] 4.1 Add loading states for each step
- [ ] 4.2 Add error states with retry functionality
- [ ] 4.3 Add empty states (no file uploaded, no data, etc.)
- [ ] 4.4 Add file size validation (5MB limit)
- [ ] 4.5 Add row count validation (10,000 row limit)
- [ ] 4.6 Implement virtual scrolling for large preview tables
- [ ] 4.7 Add toast notifications for key events (upload success, import complete)
- [ ] 4.8 Ensure responsive design (mobile-friendly where possible)

## 5. Testing
- [ ] 5.1 Create sample CSV files for testing (valid, invalid, edge cases)
- [ ] 5.2 Test file upload with various CSV formats (different delimiters, encodings)
- [ ] 5.3 Test column mapping auto-detection with various header formats (including phone, address, social media)
- [ ] 5.4 Test data validation and error reporting
- [ ] 5.5 Test duplicate detection logic (case-insensitive)
- [ ] 5.6 Test address geocoding during import (valid addresses, invalid addresses, geocoding failures)
- [ ] 5.7 Test social media links import and validation
- [ ] 5.8 Test phone field import and validation
- [ ] 5.9 Test chunked processing with large files (>1000 rows)
- [ ] 5.10 Test API timeout handling
- [ ] 5.11 Test access control (non-admin users blocked)
- [ ] 5.12 Test web isolation (imports don't affect other webs)
- [ ] 5.13 Test error report CSV download functionality
- [ ] 5.14 Verify CSV data is not persisted server-side after import
- [ ] 5.15 Add Playwright E2E test for complete import flow

## 6. Documentation
- [ ] 6.1 Add JSDoc comments to import utilities
- [ ] 6.2 Create CSV template file with example data (including all supported fields: name, description, email, website, phone, address, social media)
- [ ] 6.3 Add import feature documentation to knowledge base (separate task)
- [ ] 6.4 Document supported fields and formats (core fields + social media platforms)
- [ ] 6.5 Document geocoding behavior and limitations

## 7. Performance Optimization
- [ ] 7.1 Add database indexes if needed for duplicate detection
- [ ] 7.2 Optimize bulk insert performance (batch size tuning)
- [ ] 7.3 Profile memory usage for large file parsing

## 8. Validation & Quality Checks
- [ ] 8.1 Run `npm run quality:dry` and fix any issues
- [ ] 8.2 Run `npm run tsc` and resolve type errors
- [ ] 8.3 Test import with real-world data from web admins
- [ ] 8.4 Security review (ensure no CSV injection vulnerabilities)
