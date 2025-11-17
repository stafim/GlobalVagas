# Operlist - Global Job Board Platform

## Overview

Operlist is a bilingual (Portuguese/English) job board platform connecting employers with job seekers worldwide. The platform enables companies to register, post job listings, and manage applications while providing job seekers with advanced search and filtering capabilities across 150+ countries. Built as a full-stack TypeScript application, it features a modern React frontend with shadcn/ui components and an Express backend with PostgreSQL database integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework:** React 18 with TypeScript
- **Routing:** Wouter (lightweight client-side routing)
- **UI Components:** shadcn/ui (Radix UI primitives with Tailwind CSS)
- **Styling:** Tailwind CSS with custom design system
- **State Management:** TanStack Query (React Query) for server state
- **Form Handling:** React Hook Form with Zod validation
- **Build Tool:** Vite

**Design System:**
- Material Design principles adapted for data-intensive job listings
- Custom spacing scale using Tailwind units (2, 3, 4, 6, 8, 12, 16)
- Typography: Inter (primary), DM Sans (accent), Outfit & Manrope (alternative fonts)
- Theme system supporting light/dark modes with CSS custom properties
- Responsive layout with max-width container (max-w-7xl)
- Component elevation system using shadow utilities (hover-elevate, active-elevate-2)

**Key Pages:**
- Home: Hero section, job listings, category browsing, statistics
- Login/Signup: Separate flows for companies and job seekers
- Company Dashboard: Job posting management and analytics
- Operator Dashboard: View stats, applications, saved jobs
- Operator Profile: View and edit operator profile information (displays real authenticated user data)
- Users List: Admin page displaying all registered companies and operators
- 404 Not Found handler

**Component Architecture:**
- Reusable UI components in `client/src/components/ui/`
- Feature components in `client/src/components/`
- Page components in `client/src/pages/`
- Path aliases configured (@/, @shared, @assets)

**Authentication Flow:**
- AuthProvider (`client/src/hooks/use-auth.tsx`) wraps entire application
- Checks authentication status on mount via `/api/auth/me`
- Protected pages (dashboards) redirect to login if unauthenticated
- Login/Register invalidate auth cache to trigger re-fetch
- Operator registration reduced to 2 steps (Personal Info → Professional Info)
- Unified login automatically detects user type (company or operator) without requiring selection

### Backend Architecture

**Technology Stack:**
- **Runtime:** Node.js with Express.js
- **Language:** TypeScript (ESM modules)
- **ORM:** Drizzle ORM
- **Database Driver:** @neondatabase/serverless (PostgreSQL)
- **Validation:** Zod schemas
- **Build Tool:** esbuild for production builds

**API Design:**
- RESTful endpoints under `/api` prefix
- JSON request/response format
- Session-based authentication with express-session
- Request logging middleware for API routes
- Error handling with Zod validation error formatting

**Authentication & Session Management:**
- Express-session middleware configured with 7-day cookie expiration
- Session data stored in-memory (MemoryStore for development)
- Sessions include userId and userType (company or operator)
- Frontend AuthProvider manages authentication state globally

**Current Endpoints:**
- `POST /api/companies/register` - Company registration with CNPJ validation
- `POST /api/companies/login` - Company authentication (legacy)
- `POST /api/operators/register` - Operator registration with CPF validation
- `POST /api/operators/login` - Operator authentication (legacy)
- `POST /api/auth/login` - Unified login endpoint (auto-detects user type)
- `GET /api/auth/me` - Verify current session and retrieve user data
- `POST /api/auth/logout` - Destroy session and logout user
- `GET /api/users/list` - List all registered companies and operators (excludes passwords)
- `GET /api/settings` - Retrieve all site configuration settings as key-value pairs
- `POST /api/settings` - Create or update a configuration setting (admin only)

**Storage Layer:**
- DatabaseStorage implementation using PostgreSQL
- Abstract IStorage interface for flexibility
- Persistent data storage with Drizzle ORM
- Storage methods: getAllCompanies(), getAllOperators() for listing all users
- Database connection configured in server/db.ts using @neondatabase/serverless

### Database Schema

**Tables:**

1. **users** (legacy - not currently used)
   - id: UUID primary key (auto-generated)
   - username: unique text
   - password: text (hashed)

2. **companies** (employers)
   - id: UUID primary key (auto-generated via gen_random_uuid())
   - email: unique text
   - password: text (stored as plaintext for development)
   - companyName: text
   - cnpj: unique text (Brazilian company registration)
   - phone: text
   - website: optional text
   - description: optional text
   - industry: optional text
   - size: optional text

3. **operators** (workers/job seekers)
   - id: UUID primary key (auto-generated via gen_random_uuid())
   - email: unique text
   - password: text (stored as plaintext for development)
   - fullName: text
   - cpf: unique text (Brazilian individual registration)
   - phone: text
   - birthDate: optional text
   - profession: text
   - experienceYears: optional text
   - certifications: optional text
   - availability: optional text
   - preferredLocation: optional text
   - workType: optional text
   - skills: optional text
   - bio: optional text

4. **settings** (site configuration)
   - id: serial primary key (auto-generated)
   - key: unique text (configuration key)
   - value: text (configuration value)
   - Stores key-value pairs for site-wide settings
   - Used for configurable Hero Section texts (hero_title, hero_subtitle)
   - Supports dynamic site configuration without code changes

**Schema Management:**
- Drizzle Kit for migrations (npm run db:push)
- Type-safe schema definitions using drizzle-zod
- Shared schema types between client and server (@shared/schema)
- PostgreSQL database hosted on Neon (serverless)

**Rationale:**
- PostgreSQL chosen for relational data integrity and ACID compliance
- UUID primary keys for distributed scalability
- Unique constraints on email/CNPJ/CPF prevent duplicate registrations
- Separation of companies and operators supports distinct user types
- Data persists across server restarts (unlike previous MemStorage)

### Development Environment

**Development Server:**
- Vite dev server with HMR (Hot Module Replacement)
- Express middleware mode integration
- Custom error overlay for runtime errors
- Development banner for Replit environment
- File system security restrictions

**Build Process:**
- Client: Vite builds to `dist/public`
- Server: esbuild bundles to `dist/index.js`
- Production: Static file serving with fallback to index.html
- TypeScript compilation checking without emit

**Environment Configuration:**
- `NODE_ENV` determines development/production behavior
- Database URL required via `DATABASE_URL` environment variable
- Incremental TypeScript compilation for faster rebuilds

## External Dependencies

### Third-Party UI Libraries
- **Radix UI:** Accessible component primitives (accordion, dialog, dropdown, select, etc.)
- **Lucide React:** Icon library
- **React Icons:** Additional icon set (Google, LinkedIn social icons)
- **embla-carousel-react:** Carousel/slider functionality
- **cmdk:** Command palette component
- **date-fns:** Date formatting and manipulation

### Database & ORM
- **@neondatabase/serverless:** PostgreSQL serverless driver
- **Drizzle ORM:** TypeScript ORM with schema generation
- **drizzle-zod:** Zod schema generation from Drizzle tables
- **connect-pg-simple:** PostgreSQL session store for Express

### Validation & Forms
- **Zod:** Runtime type validation
- **React Hook Form:** Form state management
- **@hookform/resolvers:** Zod resolver integration
- **zod-validation-error:** Human-readable error messages

### Styling & Design
- **Tailwind CSS:** Utility-first CSS framework
- **class-variance-authority:** Type-safe variant styling
- **tailwind-merge:** Conditional Tailwind class merging
- **clsx:** Conditional className composition

### Development Tools (Replit Integration)
- **@replit/vite-plugin-runtime-error-modal:** Error overlay
- **@replit/vite-plugin-cartographer:** Code mapping
- **@replit/vite-plugin-dev-banner:** Development indicator

### Build & Tooling
- **Vite:** Frontend build tool and dev server
- **esbuild:** JavaScript bundler for server code
- **tsx:** TypeScript execution for development
- **PostCSS:** CSS processing with autoprefixer

### Rationale for Key Dependencies
- Radix UI provides unstyled, accessible primitives allowing full design control
- Drizzle ORM offers type-safety without runtime overhead compared to traditional ORMs
- Zod enables shared validation between client and server via @shared schemas
- TanStack Query simplifies server state management with caching and background updates
- Wouter chosen over React Router for minimal bundle size while maintaining functionality