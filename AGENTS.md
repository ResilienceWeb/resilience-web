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
npm run test            # Unit + component (fast, no database)
npm run test:integration # Route handlers against real Postgres
npm run test:e2e        # Playwright, headless

# Background jobs
npm run trigger         # Start Trigger.dev development server

# Build & deployment
npm run build           # Production build
npm start               # Start production server
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

Uses **Better Auth** with email OTP (one-time passcode) authentication:
- Configuration: [app/auth.ts](app/auth.ts)
- Client utilities: [lib/auth-client.ts](lib/auth-client.ts)
- Email templates: [components/emails/](components/emails/)
- OTP expires in 10 minutes
- Sessions tracked in `Session` model with IP and user agent

### Database Layer

**Prisma 7** with PostgreSQL 17:
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

### State Management

- **React Query (@tanstack/react-query)** - Server state management
  - Hooks organized in [hooks/](hooks/) by feature
  - Example: [hooks/listings/](hooks/listings/), [hooks/webs/](hooks/webs/)
- **React Context** - App-wide state
  - [store/AppContext.ts](store/AppContext.ts) and [store/StoreProvider.tsx](store/StoreProvider.tsx)
- **Nuqs** - URL query string state management
- **React Hook Form + Zod** - Form state and validation

### Image Management

Images stored on **Supabase Storage** (S3-compatible) (soon to move to Supabase):
- Upload: [helpers/uploadImage.ts](helpers/uploadImage.ts)
- Delete: [helpers/deleteImage.ts](helpers/deleteImage.ts)
- Client: [lib/supabase-storage.ts](lib/supabase-storage.ts)
- Optimized with Sharp on server

### Background Jobs

**Trigger.dev** for scheduled tasks:
- [trigger/check-web-inactive.ts](trigger/check-web-inactive.ts) - Monitor inactive webs
- Config: [trigger.config.ts](trigger.config.ts)
- Run locally: `npm run trigger`

### Email System

- **Production**: Mailersend (via [helpers/email.ts](helpers/email.ts))
- **Local**: Mailpit (Docker container on port 8025)
- **Templates**: React Email components in [components/emails/](components/emails/)

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

**TinyMCE** for WYSIWYG editing:
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

Large page data (network visualization) is gzip-compressed (then base64-encoded) on the server and stays compressed across the wire, decompressed on the client:
- Compressed in [app/[subdomain]/page.tsx](app/[subdomain]/page.tsx) `getData()` via `compressJson()`
- Decompressed in [app/[subdomain]/Web.tsx](app/[subdomain]/Web.tsx) via `decompressJson()`
- Isomorphic gzip helpers (fflate-based): [helpers/compression.ts](helpers/compression.ts)
- Reduces the initial page load / RSC payload for webs with many listings

### Static Generation

- Uses `generateStaticParams()` for web pages
- Incremental Static Regeneration with `revalidate` config
- Dynamic rendering for authenticated pages

## Testing

Three layers, in the order you should reach for them.

```bash
npm run test              # unit + component (fast, no database)
npm run test:watch        # the same, in watch mode
npm run test:integration  # route handlers + repositories against real Postgres
npm run test:all          # all three Vitest projects
npm run test:e2e          # Playwright, headless
npm run test:e2e:ui       # Playwright, interactive UI mode
```

`npm run quality:dry` runs lint, format, tsc, and `npm run test`.

### 1. Unit — Vitest, `node` environment

Pure logic with no I/O: [lib/import/](lib/import/), [helpers/](helpers/).
Files are `*.test.ts` under a `__tests__/` folder next to the code.

### 2. Component — Vitest, `jsdom` + Testing Library

**This is where user-facing behaviour is tested.** Files are `*.test.tsx`.
Render the real component and drive it as a visitor would — type, click, select
— then assert on what they would see. Don't re-implement the component's logic
in the test, and don't assert on props or internal state.

Setup lives in [test/setup/components.tsx](test/setup/components.tsx). It stubs
the browser APIs Radix needs (`ResizeObserver`, pointer capture), and the
modules that have no implementation under jsdom:

- `next/navigation` — backed by [test/next-navigation.ts](test/next-navigation.ts),
  so a test can `setRoute()` or assert on `router.push`
- `next/image` and `next/link` — rendered as the plain `<img>` / `<a>` they
  become in the browser
- `@auth-client` — Better Auth keeps the session in the browser, so `useSession`
  reads from [test/session.ts](test/session.ts) instead; a test signs in with
  `signInAs()`, the same helper the integration tests use
- `@tinymce/tinymce-react` — the rich text editor downloads itself from a CDN,
  so it renders as the text box it stands in for and a test types into it
- `posthog-js` — analytics is an outbound edge; tests drive real journeys and
  must not report them anywhere

Keeping all of that in the setup file is deliberate: **the tests themselves
contain no Next-specific code**, so they survive a change of framework.

Writing one:

- Render with `renderPage()` from [test/render.tsx](test/render.tsx), which
  provides React Query and nuqs and hands back a `user`. Pass `searchParams` to
  start the test on a particular URL state, and `selectedWeb` to put an admin
  screen inside a particular web — that is what every one of them reads through
  `useAppContext`.
- Stub the API with **MSW**, not by mocking hooks — see
  [test/msw/handlers.ts](test/msw/handlers.ts) and the `stub*` helpers
  (`stubCategories`, `stubTags`, `stubListings`, `stubWeb`, `stubListingEdits`,
  `stubCanEditWeb`). Intercepting HTTP keeps the React Query hooks, their
  caching and their error handling real. An unstubbed request fails the test
  rather than resolving to something unexpected.
- Assert on the change a component asked for with `recordRequests()`, which
  stubs a request and remembers what was sent — the URL and the body, whether
  it went as JSON or as a form.
- Build props with the fixtures in [test/fixtures/](test/fixtures/) —
  `webData([{ title, category }])` returns the compressed payload the web page
  expects, and `listing({ title })` a listing in the shape the client sees it.

```tsx
const { user } = renderPage(<Web data={webData(LISTINGS)} webSlug="bristol" />, {
  searchParams: { view: 'list' },
})

await user.type(await screen.findByPlaceholderText('Search'), 'food')

expect(screen.queryByRole('link', { name: /Sustainable Food/i })).toBeInTheDocument()
```

When a test passes, check it fails for the right reason: break the behaviour it
covers and confirm it goes red. An assertion on an element that never existed
(`queryByRole('list')` where nothing renders that role) passes forever.

### 3. Integration — Vitest against real Postgres

**This is the default place to test business logic.** Files are
`*.integration.test.ts`. Prefer testing **API route handlers** by importing the
exported `GET`/`POST` and calling them directly — that covers the same path the
browser takes (params, auth, Prisma, response shape) without a browser. Test
repositories directly only for logic that isn't reachable through one route,
such as the permission helpers in [db/webAccessRepository.ts](db/webAccessRepository.ts).

How it works:

- A separate `resilience_web_test` database on the Docker Postgres that
  `npm run db:up` starts. Created and migrated automatically by
  [test/setup/integration-global.ts](test/setup/integration-global.ts) on first run.
- [test/db/testDatabaseUrl.ts](test/db/testDatabaseUrl.ts) derives the URL from
  `DATABASE_URL` and **refuses to run against a non-local host or a database
  whose name doesn't end in `_test`**. Override with `TEST_DATABASE_URL`.
- Every table is truncated before each test ([test/db/reset.ts](test/db/reset.ts)),
  so tests start from an empty database rather than the seed.
- `DATABASE_URL` is redirected in [vitest.config.ts](vitest.config.ts), so the
  `@prisma-rw` singleton that route handlers import is already pointed at the
  test database.
- Outbound edges (email, MailerLite, image upload, `revalidatePath`) are stubbed
  in [test/setup/integration.ts](test/setup/integration.ts) alongside the
  per-test reset. Tests never send email or upload anything.

Writing one:

- Build data with the factories in [test/factories/](test/factories/) —
  `createWeb`, `createListing`, `createUserWithWebAccess`, `createListingEdit`, …
- Build requests with `request()` and `params()` from [test/http.ts](test/http.ts).
- Set the caller with `signInAs()` from [test/session.ts](test/session.ts).
  Sessions reset to anonymous before each test.

```ts
const web = await createWeb({ slug: 'bristol' })
const { user } = await createUserWithWebAccess(web.id, WebRole.EDITOR)
signInAs({ id: user.id, email: user.email })

const response = await PUT(
  request('/api/webs/bristol', { method: 'PUT', body: form }),
  params({ slug: 'bristol' }),
)
expect(response.status).toBe(403)
```

Integration tests run one file at a time (they share a database), so keep them
lean — the whole suite should stay in single-digit seconds.

### 4. End-to-end — Playwright

A thin smoke layer for journeys that genuinely need a browser. Specs live in
[tests/](tests/) and run against the dev server, which Playwright starts itself,
using the **dev** database — so run `npx prisma migrate reset` first if the seed
data is missing.

- `*.spec.ts` runs logged out.
- `*.authed.spec.ts` runs signed in as the seeded Cambridge owner/admin.
  [tests/auth.setup.ts](tests/auth.setup.ts) writes a one-time passcode straight
  into the `verifications` table and posts it to the real sign-in endpoint, then
  saves the session to `playwright/.auth/`. The cookie is genuine; only the
  email round trip is skipped.
- Browsers need installing once: `npx playwright install chromium`.

Seed script creates test data: [prisma/seed.ts](prisma/seed.ts)

## Environment Variables

Key variables (see [.env.example](.env.example)):
- `DATABASE_URL` - PostgreSQL connection string
- `RW_TEST_USER_EMAIL` - Email for test account creation
- `SENTRY_AUTH_TOKEN` - Sentry deployment token
- `NEXT_PUBLIC_POSTHOG_KEY` - PostHog project key
- Supabase Storage credentials for image storage
- Mailersend API key for production emails

## Code Quality Tools

- **ESLint** - [eslint.config.js](eslint.config.js)
  - TypeScript, React, Next.js, accessibility plugins
- **Prettier** - Code formatting
  - Plugin for Tailwind CSS class sorting
- **Stylelint** - CSS linting
- **TypeScript** - Strict mode disabled, but `noUncheckedIndexedAccess` enabled

## Working Agreements

- **Never run `git commit` unless explicitly asked to.** Leave finished work in
  the working tree and say what you changed; the decision about what becomes a
  commit, and when, is the user's. The same goes for `git push`, opening a PR,
  and any other outward-facing or hard-to-reverse action.

## Important Notes

- Port 4000 for development (not 3000)
- React Strict Mode disabled in [next.config.js](next.config.js)
- Turbopack used for faster dev builds
- Prisma client generated to `prisma/generated/` (not default location)
- Category icons come from the react-icons catalog in [helpers/icons.ts](helpers/icons.ts); canvas (network view) and Leaflet markers render them via [helpers/icon-render.ts](helpers/icon-render.ts) (SVG → cached image) — no icon webfont is shipped
- Node version specified in [.nvmrc](.nvmrc)
- Repository uses semantic commits from git history

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
