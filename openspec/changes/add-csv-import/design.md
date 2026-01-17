# Design: CSV Import Feature

## Context

The Resilience Web platform uses a multi-tenant architecture where each web operates independently. Web administrators need an efficient way to import multiple listings from CSV files, particularly when:
- Onboarding a new web with existing organization data
- Migrating from spreadsheets or other platforms
- Performing bulk updates to listing information

Reference implementation: `sadmann7/csv-importer` provides patterns for multi-step import flow with column mapping.

**Constraints:**
- Must respect web isolation (imports only affect current web)
- Must enforce role-based access (OWNER/EDITOR only)
- API timeout of 30 seconds requires chunked processing for large imports
- Need to handle various CSV formats and encodings

## Goals / Non-Goals

**Goals:**
- Enable bulk import of listings from CSV files
- Provide user-friendly column mapping with auto-detection
- Validate data before import with clear error messages
- Show progress feedback for long-running imports
- Support common CSV formats and field variations
- Handle duplicate detection gracefully

**Non-Goals:**
- Importing categories/tags (only listings)
- Scheduled/automated imports (manual only)
- Export functionality (separate feature)
- Updating existing listings (insert-only for v1, can add update mode later)
- Import from formats other than CSV (JSON, Excel, etc.)

## Decisions

### 1. Multi-Step Wizard Pattern

**Decision:** Use a 4-step wizard flow: Upload → Map → Preview → Execute

**Rationale:**
- Separates concerns and reduces cognitive load
- Allows validation at each step before proceeding
- Matches pattern from `sadmann7/csv-importer` reference
- Enables users to review and correct before committing

**Alternatives considered:**
- Single-step upload with automatic processing: Too error-prone without preview
- Two-step (upload + confirm): Insufficient control over column mapping

### 2. Client-Side CSV Parsing

**Decision:** Parse CSV file in browser using `papaparse` library

**Rationale:**
- Avoids uploading large files to server for preview/mapping
- Provides immediate feedback on file structure
- Reduces server load and API timeout concerns
- `papaparse` is well-maintained, handles edge cases (quotes, line breaks)

**Alternatives considered:**
- Server-side parsing: Requires file upload, complicates timeout handling
- Native browser CSV parsing: Insufficient support for edge cases

### 3. Column Mapping Strategy

**Decision:** Auto-detect mappings based on CSV headers with manual override

**Rationale:**
- Reduces friction for well-formatted CSVs
- Flexibility for non-standard formats
- Clear visual feedback of mapping state

**Auto-detection rules:**
- Case-insensitive matching of common field names
- Fuzzy matching for variations (e.g., "organization name" → "name", "website" → "website URL")
- Required fields flagged if unmapped

**Alternatives considered:**
- Manual mapping only: Too tedious for standard formats
- Template-based (must match exact format): Too rigid, poor UX

### 4. Server-Side Import Processing

**Decision:** Process imports server-side with chunked processing for large files

**Rationale:**
- Ensures data validation using existing Zod schemas
- Enforces access control and web isolation
- Handles database transactions properly
- Chunking prevents API timeout for large imports

**Implementation:**
- Send CSV data + mappings to API endpoint
- Process in batches of 50 records
- Return progress updates via streaming response or polling
- Transaction per batch for partial rollback capability

**Alternatives considered:**
- Client-side database writes: Security risk, violates access control
- Single transaction for all records: Timeout risk, all-or-nothing reduces flexibility

### 5. Duplicate Handling Strategy

**Decision:** Detect duplicates by name+web combination, skip with warning

**Rationale:**
- Prevents accidental duplicate creation
- Name is most reliable unique identifier for listings
- Allows users to review and handle manually if needed

**Future enhancement:** Add "Update existing" mode to modify matched records

**Alternatives considered:**
- Email-based matching: Not all listings have emails
- Allow duplicates: Creates data quality issues
- Auto-merge: Too risky without user review

### 6. UI Component Structure

**Decision:** Follow `sadmann7/csv-importer` pattern with shadcn/ui components

**Component hierarchy:**
```
<ImportWizard>
  └─ <ImportStepIndicator />
  └─ <ImportStep step={1}>
       └─ <FileUploadZone />
  └─ <ImportStep step={2}>
       └─ <ColumnMappingTable>
            └─ <ColumnSelect />
  └─ <ImportStep step={3}>
       └─ <DataPreviewTable />
       └─ <ValidationSummary />
  └─ <ImportStep step={4}>
       └─ <ImportProgress />
       └─ <ImportResults />
```

**Rationale:**
- Composable, maintainable structure
- Reuses existing shadcn/ui primitives (Table, Select, Button, Progress)
- Clear separation of concerns

## Risks / Trade-offs

### Risk: Large File Performance
**Impact:** Browser may slow/crash with very large CSV files (>10,000 rows)

**Mitigation:**
- Add file size validation (warn if >5MB)
- Implement virtual scrolling for preview table
- Process in chunks client-side before sending to server

### Risk: CSV Format Variations
**Impact:** Some CSV files may not parse correctly (encoding, delimiters, malformed data)

**Mitigation:**
- Use `papaparse` auto-detection for delimiters
- Support UTF-8 and common encodings
- Provide clear error messages for unparseable files
- Show sample data during mapping for validation

### Risk: API Timeout During Import
**Impact:** Large imports may exceed 30-second API timeout

**Mitigation:**
- Implement chunked processing (50 records per request)
- Use optimistic UI with progress tracking
- Consider background job processing (Trigger.dev) for very large imports (future)

### Trade-off: Insert-only vs. Update Mode
**Current:** Insert-only (skip duplicates)

**Rationale:** Simpler implementation, lower risk of data corruption

**Future:** Add "Update existing" toggle for upsert behavior

## Migration Plan

No database migrations required. Feature is purely additive.

**Rollout:**
1. Deploy import UI and API endpoints
2. Enable for beta web admins first
3. Monitor error rates and performance
4. Roll out to all web admins
5. Add documentation to knowledge base

**Rollback:**
- Remove "Import" menu item from admin sidebar
- API endpoint can remain (not publicly discoverable)

## Open Questions

1. **Should we support category/tag import in v1?**
   - **Decision:** No, focus on listings only. Categories/tags are fewer and easier to create manually.

2. **What fields should be required vs. optional in import?**
   - **Decision:** Only "name" required (matches Listing model). All other fields optional but validated if provided.

3. **How to handle location data (address vs. lat/lng)?**
   - **Decision:** Accept address text, use existing geocoding logic (Leaflet Geosearch) server-side. Add lat/lng columns as optional for pre-geocoded data.

4. **Should we preserve import history/logs?**
   - **Decision:** Not in v1. Show results summary on completion but don't persist. Can add audit log later if needed.

5. **Maximum file size limit?**
   - **Decision:** 5MB file size limit, ~10,000 row limit. Display warning and suggest chunking if exceeded.
