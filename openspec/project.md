# Project Context

## Purpose

Resilience Web is an interactive directory platform for local environmental and social justice organizations. The platform enables communities to create their own "webs" - interactive digital maps showing relationships between organizations, initiatives, and resources within a specific geographic area.

**Goals:**
- Support multiple independent communities (webs) with subdomain-based multi-tenancy
- Provide interactive map and network visualization of community organizations
- Enable community-driven content with quality control through edit approval workflow
- Foster connections between organizations working on social and environmental justice

**Live Site:** https://resilienceweb.org.uk

## Tech Stack

### Core Framework
- **Next.js 16** (App Router, Turbopack, Server Components)
- **React 19** (Strict Mode disabled)
- **TypeScript** (with path aliases, `noUncheckedIndexedAccess` enabled)
- **Node.js 22** (see `.nvmrc`)

### Database & ORM
- **PostgreSQL 17** (via Docker for local development)
- **Prisma 7.2.0** (custom client path in `prisma/generated/`)
  - Runtime client: `@prisma-rw`
  - Build-time client: `@prisma-rw-build`

### Authentication & State
- **Better Auth v1.4.9** (Email OTP authentication, 10-minute expiry)
- **React Query (@tanstack/react-query)** - Server state management
- **React Context** - Global app state
- **Nuqs** - URL query string state
- **React Hook Form + Zod** - Form validation

### UI & Styling
- **Tailwind CSS 4**
- **Shadcn/ui** (Radix UI primitives)
- **Font Awesome 5 Free** (category icons)
- **Sonner** (toast notifications)

### Visualization
- **Leaflet** (interactive maps with marker clustering)
- **Vis-Network** (relationship graphs, custom fork: `vis-network-react`)

### External Services
- **DigitalOcean Spaces** (S3-compatible image storage)
- **Mailersend** (production emails)
- **Mailpit** (local email testing on port 8025)
- **Hygraph** (GraphQL headless CMS for blog/content)
- **Sentry** (error tracking & performance monitoring)
- **PostHog** (product analytics & feature flags)
- **Trigger.dev v4.1.2** (background job orchestration)

### Development Tools
- **ESLint** (TypeScript, React, Next.js, a11y plugins)
- **Prettier** (with Tailwind class sorting)
- **Stylelint** (CSS linting)
- **Playwright** (E2E testing)

### Other Libraries
- **Sharp** (server-side image optimization)
- **TinyMCE v8.3.1** (WYSIWYG rich text editor)
- **React Email** (email templates)
- **graphql-request** (Hygraph CMS client)
- **remark + remark-html** (Markdown processing)

## Project Conventions

### Code Style

- **TypeScript**: Use TypeScript for all code; strict mode is disabled but `noUncheckedIndexedAccess` is enabled
- **Path Aliases**: Use configured TypeScript aliases (see [AGENTS.md](../AGENTS.md#typescript-path-aliases))
  - `@components/*`, `@hooks/*`, `@helpers/*`, `@db/*`, `@store/*`
  - `@auth`, `@auth-client`, `@prisma-rw`, `@prisma-client`
- **Formatting**: Prettier with Tailwind CSS class sorting plugin
- **Linting**: ESLint with TypeScript, React, Next.js, and accessibility plugins
- **Naming**: Use semantic naming; Font Awesome 5 Free CSS classes for category icons

### Architecture Patterns

See [docs/architecture.md](../docs/architecture.md#key-architectural-patterns) for detailed patterns. Key patterns include:

1. **Repository Pattern** - Data access centralized in `/db` modules
2. **Edit-and-Approve Workflow** - Pending edit system for quality control
3. **Soft Delete Pattern** - `deletedAt` timestamp instead of physical deletion (Web model)
4. **Multi-Tenant Subdomain Routing** - `[subdomain]` dynamic routing for independent communities
5. **Static Generation with ISR** - Pre-rendering with Incremental Static Regeneration
6. **Client-Side State Management** - React Query for server state, Context for global state, Nuqs for URL state

### Testing Strategy

- **E2E Testing**: Playwright tests in UI mode (`npm run test:e2e`)
- **Test Data**: Seed script generates test data (`npx prisma db seed`)
- **Quality Checks**: Run `npm run quality:dry` before committing
- **Type Safety**: Run `npm run tsc` to verify TypeScript compilation

### Git Workflow

- **Main Branch**: `main` (used for PRs and production deployments)
- **Commit Style**: Semantic commits (inferred from git history)
- **Deployment**:
  - Production: Automatic on push to main
  - Staging: Manual via `npx vercel deploy --target staging`

## Domain Context

### Multi-Tenancy Model

Each "web" (community/organization) operates independently:
- **Subdomain**: e.g., `bristol.resilienceweb.org.uk`
- **Data Isolation**: Foreign key relationships to `Web` model
- **Team Access**: Role-based control (OWNER, EDITOR) via `WebAccess` model
- **Custom Content**: Each web has its own listings, categories, tags

### Core Entities

- **Web**: Organization/community with subdomain, location, team, settings
- **Listing**: Directory entry with description, location, images, social links
- **ListingEdit**: Pending edit proposals requiring approval from web editors/owners
- **Category**: Per-web categorization with colors and Font Awesome icons
- **Tag**: Per-web tagging system
- **User**: Email OTP authenticated accounts
- **WebAccess**: Team member roles (OWNER, EDITOR)

### Edit Workflow

1. User proposes edit via form
2. `ListingEdit` record created with pending status
3. Web editors/owners review in admin dashboard
4. On approval, changes merged to `Listing` model
5. Related data handled via `ListingSocialMedia`, `ListingAction`, `ListingLocation`

## Important Constraints

### Technical Constraints

- **Development Port**: 4000 (not 3000)
- **API Timeout**: 30 seconds (configured in `vercel.json`)
- **React Strict Mode**: Disabled in `next.config.js`
- **Prisma Client**: Generated to `prisma/generated/` (non-default location)
- **Build Tool**: Turbopack for development builds

### Database Constraints

- **Soft Deletes**: `Web` model uses `deletedAt` timestamp; queries must filter `WHERE deletedAt IS NULL`
- **Data Compression**: Large network visualization data compressed using base64 encoding

### Authentication Constraints

- **OTP Expiry**: Email OTP codes expire in 10 minutes
- **Test Email**: `RW_TEST_USER_EMAIL` must be valid for local development (receives actual OTP codes)

## External Dependencies

### Required Services (Production)

- **PostgreSQL 17**: Primary database
- **DigitalOcean Spaces**: Image and media storage (S3-compatible)
- **Mailersend**: Transactional email delivery
- **Hygraph**: GraphQL CMS for blog posts and static content
- **Sentry**: Error tracking and performance monitoring
- **PostHog**: Product analytics and feature flags
- **Trigger.dev**: Background job orchestration
- **Better Auth**: Email OTP authentication provider
- **Vercel**: Hosting platform (serverless)

### Development Services

- **Docker**: Required for local PostgreSQL 17 and Mailpit containers
- **Mailpit**: Local SMTP testing server (port 8025)
- **Prisma Studio**: Database GUI (port 7777, via `npm run db`)

### API Integrations

- **Leaflet Geosearch**: Location lookup for addresses
- **Leaflet MarkerCluster**: Map marker clustering
- **React Email**: Email template rendering

### Configuration Files

- `.env`: Environment variables (copy from `.env.example`)
- `vercel.json`: API timeout configuration
- `next.config.js`: Next.js config, remote image patterns, Sentry integration
- `tsconfig.json`: TypeScript path aliases
- `components.json`: Shadcn/ui configuration
