# AGENTS.md

This file provides guidance to AI agents when working with code in this repository.

## Project Overview

Resilience Web is a Next.js 16 application that serves as a directory platform for local groups and organizations working on social and environmental justice initiatives. The app supports multiple independent "webs" (communities), each with their own subdomain, listings, categories, and team members.


## Development Commands

```bash
# Start development server (Turbopack on port 4000)
npm run dev

# Database management
npm run db:up           # Start PostgreSQL 17 & Mailpit via Docker
npm run db:down         # Stop Docker containers
npm run db              # Open Prisma Studio on port 7777
npx prisma migrate reset # Reset DB and run migrations + seed

# Code quality
npm run quality:dry     # Run stylelint, eslint, prettier, and tsc checks
npm run quality:fix     # Auto-fix linting and formatting issues
npm run tsc             # TypeScript type checking

# Testing
npm run test:e2e        # Run Playwright tests in UI mode

# Background jobs
npm run trigger         # Start Trigger.dev development server

# Build & deployment
npm run build           # Production build
npm start               # Start production server
npx vercel deploy --target staging  # Deploy to Vercel staging
```

## Local Database Setup

1. Ensure `.env` file exists (copy from `.env.example`)
2. Set `RW_TEST_USER_EMAIL` to your valid email (authentication uses OTP codes)
3. Run `npm run db:up` to start PostgreSQL 17 and Mailpit containers
4. Run `npx prisma migrate reset` to initialize database with migrations and seed data
5. Access Mailpit at http://localhost:8025 for local email testing

## Architecture Overview

### Multi-Tenant Subdomain Routing

The app uses Next.js dynamic routing with `[subdomain]` to support multiple independent communities. Each "web" (organization) has:
- Its own subdomain (e.g., `bristol.resilienceweb.org.uk`)
- Independent listings, categories, and tags
- Team members with role-based access (OWNER, EDITOR)
- Soft-delete support via `deletedAt` timestamp

Key files:
- [app/[subdomain]/page.tsx](app/[subdomain]/page.tsx) - Main web page with network visualization
- [app/[subdomain]/[slug]/page.tsx](app/[subdomain]/[slug]/page.tsx) - Individual listing pages

### Authentication

Uses **Better Auth** (v1.4.9) with email OTP (one-time passcode) authentication:
- Configuration: [app/auth.ts](app/auth.ts)
- Client utilities: [lib/auth-client.ts](lib/auth-client.ts)
- Email templates: [components/emails/](components/emails/)
- OTP expires in 10 minutes
- Sessions tracked in `Session` model with IP and user agent

### Database Layer

**Prisma 7.2.0** with PostgreSQL 17:
- Schema: [prisma/schema.prisma](prisma/schema.prisma)
- Client instances:
  - `@prisma-rw` - Standard runtime client ([prisma/client.ts](prisma/client.ts))
  - `@prisma-rw-build` - Build-time client ([prisma/build-client.ts](prisma/build-client.ts))
- Repositories: [db/](db/) directory contains data access functions
  - [db/webRepository.ts](db/webRepository.ts) - Web/organization queries
  - [db/webAccessRepository.ts](db/webAccessRepository.ts) - Team member access control
  - [db/listingEditRepository.ts](db/listingEditRepository.ts) - Listing edit workflow
  - [db/permissionRepository.ts](db/permissionRepository.ts) - Legacy permissions

**Important models:**
- `Web` - Organizations/communities (soft deletes via `deletedAt`)
- `Listing` - Directory entries with locations, images, social media
- `ListingEdit` - Pending edits requiring approval
- `Category` - Per-web categories with colors and icons
- `Tag` - Per-web tags for listings
- `WebAccess` - Role-based team member access (OWNER, EDITOR)
- `User` - User accounts with email OTP auth

### TypeScript Path Aliases

Configured in [tsconfig.json](tsconfig.json):
- `@components/*` → `components/*`
- `@hooks/*` → `hooks/*`
- `@helpers/*` → `helpers/*`
- `@db/*` → `db/*`
- `@store/*` → `store/*`
- `@auth` → `app/auth.ts`
- `@auth-client` → `lib/auth-client.ts`
- `@prisma-rw` → `prisma/client.ts`
- `@prisma-client` → `prisma/generated/client`

### API Routes

REST API endpoints in [app/api/](app/api/):
- `/api/auth/*` - Better Auth endpoints
- `/api/listings/*` - CRUD for listings
- `/api/webs/*` - Web management
- `/api/users/*` - User management
- `/api/categories/*`, `/api/tags/*` - Category/tag management
- `/api/feedback` - Feedback collection (CORS enabled)

API routes have a 30-second timeout (configured in [vercel.json](vercel.json)).

### State Management

- **React Query (@tanstack/react-query)** - Server state management
  - Hooks organized in [hooks/](hooks/) by feature
  - Example: [hooks/listings/](hooks/listings/), [hooks/webs/](hooks/webs/)
- **React Context** - App-wide state
  - [store/AppContext.ts](store/AppContext.ts) and [store/StoreProvider.tsx](store/StoreProvider.tsx)
- **Nuqs** - URL query string state management
- **React Hook Form + Zod** - Form state and validation

### Image Management

Images stored on **DigitalOcean Spaces** (S3-compatible):
- Upload: [helpers/uploadImage.ts](helpers/uploadImage.ts)
- Delete: [helpers/deleteImage.ts](helpers/deleteImage.ts)
- Client: [lib/digitalocean.ts](lib/digitalocean.ts)
- Optimized with Sharp on server
- Next.js Image component handles optimization

Remote patterns configured in [next.config.js](next.config.js) for DigitalOcean CDN and other image sources.

### Background Jobs

**Trigger.dev** (v4.1.2) for scheduled tasks:
- [trigger/check-web-inactive.ts](trigger/check-web-inactive.ts) - Monitor inactive webs
- [trigger/unfeature-listing.ts](trigger/unfeature-listing.ts) - Auto-unfeature listings
- Config: [trigger.config.ts](trigger.config.ts)
- Run locally: `npm run trigger`

### Email System

- **Production**: Mailersend (via [helpers/email.ts](helpers/email.ts))
- **Local**: Mailpit (Docker container on port 8025)
- **Templates**: React Email components in [components/emails/](components/emails/)
- **Rendering**: @react-email/render

### Map Visualization

**Leaflet** with React wrapper:
- Components: [components/listings-map/](components/listings-map/)
- Marker clustering via Leaflet MarkerCluster
- Geosearch for location lookup
- Location data stored in `ListingLocation` and `WebLocation` models

### Network Visualization

**Vis-network** for relationship graphs:
- Components: [components/network/](components/network/)
- Shows relationships between listings, categories, and webs
- Custom fork: `vis-network-react` from DinerIsmail/vis-network-react

### CMS Integration

**Hygraph** (GraphQL headless CMS) for content:
- Blog posts: [app/news/](app/news/)
- About page: [app/about/](app/about/)
- GraphQL client: `graphql-request`
- Markdown processing: `remark` + `remark-html`

### Monitoring & Analytics

- **Sentry** - Error tracking and performance monitoring
  - Config: [instrumentation.ts](instrumentation.ts)
  - Next.js integration: [next.config.js](next.config.js)
- **PostHog** - Product analytics and feature flags
  - Provider: [app/providers.tsx](app/providers.tsx)
  - Page tracking: [helpers/page-tracker/](helpers/page-tracker/)

### UI Components

**Shadcn/ui** components in [components/ui/](components/ui/):
- Built on Radix UI primitives
- Styled with Tailwind CSS 4
- Config: [components.json](components.json)
- Toast notifications: Sonner

### Rich Text Editing

**TinyMCE** (v8.3.1) for WYSIWYG editing:
- Used in listing descriptions and web content
- Wrapper: `@tinymce/tinymce-react`

## Key Architectural Patterns

### Listing Edit Workflow

1. User proposes edit via edit form
2. `ListingEdit` record created with pending status
3. Web editors/owners review in admin dashboard
4. On approval, changes merged to `Listing` and `ListingEdit.accepted = true`
5. Images and related data handled separately via `ListingSocialMedia`, `ListingAction`, `ListingLocation`

### Soft Deletes

The `Web` model uses soft deletes:
- `deletedAt` field (nullable DateTime)
- Queries filter: `WHERE deletedAt IS NULL`
- Deletion endpoint: [app/api/webs/[slug]/delete/route.ts](app/api/webs/[slug]/delete/route.ts)

### Data Compression

Large page data (network visualization) compressed using base64 encoding:
- See [app/[subdomain]/page.tsx](app/[subdomain]/page.tsx) `getData()` function
- Reduces initial page load payload

### Static Generation

- Uses `generateStaticParams()` for web pages
- Incremental Static Regeneration with `revalidate` config
- Dynamic rendering for authenticated pages

## Testing

- **Playwright** - E2E tests
  - Config: [playwright.config.ts](playwright.config.ts)
  - Run with UI: `npm run test:e2e`
- Seed script creates test data: [prisma/seed.ts](prisma/seed.ts)

## Environment Variables

Key variables (see [.env.example](.env.example)):
- `DATABASE_URL` - PostgreSQL connection string
- `RW_TEST_USER_EMAIL` - Email for test account creation
- `SENTRY_AUTH_TOKEN` - Sentry deployment token
- `NEXT_PUBLIC_POSTHOG_KEY` - PostHog project key
- DigitalOcean Spaces credentials for image storage
- Mailersend API key for production emails

## Code Quality Tools

- **ESLint** - [eslint.config.js](eslint.config.js)
  - TypeScript, React, Next.js, accessibility plugins
- **Prettier** - Code formatting
  - Plugin for Tailwind CSS class sorting
- **Stylelint** - CSS linting
- **TypeScript** - Strict mode disabled, but `noUncheckedIndexedAccess` enabled

## Important Notes

- Port 4000 for development (not 3000)
- React Strict Mode disabled in [next.config.js](next.config.js)
- Turbopack used for faster dev builds
- Prisma client generated to `prisma/generated/` (not default location)
- Font Awesome 5 Free used for category icons via CSS classes
- Node version specified in [.nvmrc](.nvmrc) (currently Node 22)
- Repository uses semantic commits from git history
