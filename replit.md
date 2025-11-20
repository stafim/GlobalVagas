# Operlist - Bilingual Job Board Platform

## Project Overview
Operlist is a comprehensive job board platform built with TypeScript, React, Express, and PostgreSQL. The platform is bilingual (Portuguese/English) and supports multiple user types: operators (job seekers), companies (employers), and administrators.

## Architecture

### Technology Stack
- **Frontend**: React + TypeScript + Vite
- **Backend**: Express + TypeScript
- **Database**: PostgreSQL (Neon-backed Replit database)
- **ORM**: Drizzle ORM
- **UI**: Shadcn UI + Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation

### Project Structure
- `client/` - React frontend application
- `server/` - Express backend API
- `shared/` - Shared TypeScript types and schemas
- `attached_assets/` - Static assets (images, etc.)

## User Types

### 1. Operators (Job Seekers)
- Profile with CPF, profession, skills, certifications
- Experience tracking
- Job application capabilities
- Profile photo support

### 2. Companies (Employers)
- Company profile with CNPJ
- Job posting capabilities
- Candidate management

### 3. Administrators
- System settings management
- Email configuration (SMTP)
- Content management (hero texts, statistics)
- User management

## Key Features

### Authentication
- Session-based authentication using express-session
- Separate login/registration for operators and companies
- Admin panel access control

### Email Configuration
**Note**: Gmail SMTP integration is configured manually (not using Replit's native integration).
- Provider: Gmail SMTP or custom SMTP
- Settings stored in database
- Configuration available in Admin Settings page
- Requires Gmail App Password (16-character password, not regular Gmail password)
- SMTP settings:
  - Host: smtp.gmail.com
  - Port: 587 (TLS) or 465 (SSL)
  - User: Gmail email address
  - Password: Gmail App Password

### Object Storage
- Replit Object Storage integration configured
- Used for profile photos and event images
- Requires environment variables:
  - `PRIVATE_OBJECT_DIR` - Private storage path
  - `PUBLIC_OBJECT_SEARCH_PATHS` - Public storage paths

### Form Validation
- CPF validation with mask (000.000.000-00)
- CPF uniqueness check before advancing to step 2
- Real-time validation using Zod schemas
- Multi-step registration forms

## Database Schema

### Main Tables
- `users` - Basic user authentication
- `companies` - Company profiles
- `operators` - Operator (job seeker) profiles
- `experiences` - Work experience records
- `admins` - Administrator accounts
- `plans` - Subscription plans
- `clients` - White-label clients
- `purchases` - Plan purchases
- `email_settings` - Email SMTP configuration
- `sectors` / `subsectors` - Industry categorization
- `events` - Events/courses
- `banners` - Homepage banners
- `settings` - Site-wide settings (key-value store)

## Development

### Database Migrations
```bash
npm run db:push        # Push schema changes
npm run db:push --force # Force push (use when data loss warning appears)
```

### Running the Application
```bash
npm run dev  # Starts both frontend and backend
```

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (auto-configured)
- `PRIVATE_OBJECT_DIR` - Object storage private directory
- `PUBLIC_OBJECT_SEARCH_PATHS` - Object storage public paths

## Admin Credentials
- Email: admin@operlist.com
- Password: admin123

## Recent Changes

### November 17, 2025 - Job Posting System Implementation
- **Complete Job Management System for Companies**: Full CRUD system for job vacancies
  - New `jobs` table with comprehensive fields: title, description, requirements, responsibilities, benefits, location, work type, contract type, salary, experience level, education, etc.
  - Backend API endpoints: GET/POST/PUT/DELETE `/api/jobs`
  - Storage methods for job management in DatabaseStorage
  - Permission-based access control (companies can only manage their own jobs)
- **Intuitive 3-Step Wizard for Job Creation**: Easy-to-use multi-step form
  - Step 1: Basic Information (title, location, work type, contract type, number of vacancies)
  - Step 2: Detailed Description (description, requirements, responsibilities)
  - Step 3: Additional Details (salary, benefits, experience level, education)
  - Real-time form validation with error messages
  - Progress indicator showing current step
  - Navigation between steps with validation
- **Company Jobs Dashboard**: Complete job management interface
  - Statistics cards: Active Jobs, Total Jobs, Closed Jobs
  - Job listing with search functionality
  - Job cards displaying key information (location, work type, contract, salary, status)
  - "Visualizar Vaga" button on each job card that navigates to the public job page
  - Empty state with call-to-action for first job
  - Fully integrated with company sidebar navigation at `/empresa/vagas`
- **User Experience Enhancements**:
  - Form fields organized by relevance and flow
  - Optional fields clearly marked
  - Helpful placeholder text and descriptions
  - Responsive layout for all screen sizes
  - Professional card-based design with hover effects

### November 20, 2025 - Job Applications System
- **Complete Job Application Flow**: Operators can now apply to jobs
  - New `applications` table with job and operator relationships
  - Status tracking (pending, accepted, rejected)
  - Duplicate application prevention (one application per job per operator)
  - Automatic timestamps for application tracking
- **Job View Page**: Comprehensive job and company showcase at `/vaga/:id`
  - Company profile section with banner, logo, about, mission, and culture
  - Full job details: description, requirements, responsibilities, benefits
  - "Aplicar a vaga" button for operators to apply
  - Success message after successful application
  - Disabled state showing "Você já se candidatou" if already applied
  - Company contact information display
- **API Endpoints**:
  - POST `/api/applications` - Create job application
  - GET `/api/applications/check/:jobId` - Check if operator already applied
  - GET `/api/jobs/:id` - Get job details with company information
- **Storage Methods**: Full CRUD for applications in DatabaseStorage
  - `createApplication`, `getApplication`, `getApplicationsByJob`, `getApplicationsByOperator`
  - `checkExistingApplication`, `updateApplicationStatus`

### November 20, 2025 - Job Status Management System
- **Dual Status System for Jobs**: Vagas now have two distinct statuses
  - **Ativa (Active)**: Jobs visible to operators, accepting applications
  - **Suspensa (Suspended)**: Jobs temporarily paused, not visible/accepting applications
  - Status badge displayed with appropriate colors (green for Active, orange for Suspended)
- **Company Job Management**: Enhanced control panel at `/empresa/vagas`
  - Statistics updated: "Active Jobs", "Total Jobs", "Suspended Jobs" (replaced "Closed Jobs")
  - Toggle button (Play/Pause icon) on each job card to switch between Active/Suspended
  - Visual indicators: ● for Active, ⏸ for Suspended
  - Two-line description truncation with `line-clamp-2` for cleaner card display
- **Public Job View Protection**: `/vaga/:id` page enforces status rules
  - Suspended jobs display warning badge and message
  - Application button disabled for suspended jobs with explanatory text
  - Clear messaging: "Esta vaga foi temporariamente pausada pela empresa"
- **Backend Implementation**:
  - New endpoint: PATCH `/api/jobs/:id/status` - Update job status
  - Validation: Only accepts 'active' or 'suspended' values
  - Permission checks: Companies can only manage their own jobs
  - Status field indexed in database for efficient queries
- **Header Navigation**: Added standard site header to JobView page
  - Consistent navigation (Vagas, Feiras e Eventos, Admin, Login/User menu)
  - Logo clickable to home page
  - Theme toggle and language selection

### November 20, 2025 - Company Presentation Page
- **Company Profile Enhancement**: Complete redesign of company profile page
  - New "Página de Apresentação" section for companies to showcase themselves to candidates
  - **Banner Upload**: Companies can upload a presentation banner (1200x400px recommended)
  - **About Section**: Detailed company description, history, and presence in the market
  - **Mission Section**: Company's mission and objectives
  - **Culture & Values Section**: Company culture, benefits, work environment, and growth opportunities
  - Schema updated: Added `about`, `mission`, `culture`, `bannerUrl` fields to companies table
  - Fully functional edit mode with form validation
  - Separate sections for presentation content vs. basic company info
  - Inspired by professional job boards like Greenhouse
- **UI Improvements**:
  - Removed split-screen design from login page (now centered single-column form)
  - Removed colored left border from job cards (cleaner flat design)
  - Company Plan page showing purchased plans with status badges
  - Fixed CompanyProfile update errors (endpoint and ObjectUploader usage)

### November 17, 2025 - Financial Dashboard & Branding Updates
- **Complete Financial Reports System**: Implemented comprehensive sales analytics dashboard
  - Real-time statistics cards: Total Revenue, Total Sales, Active Sales, Active Clients
  - Interactive charts using Recharts: Revenue over time (line chart) and Top 10 clients (bar chart)
  - Advanced filtering system: date range, client selection, min/max amount
  - Sales table with detailed transaction information
  - API endpoints: `/api/purchases` (with filters) and `/api/purchases/stats`
  - Mock data removed - dashboard ready for real sales data
- **Operlist Branding**: Replaced Shield icons with official Operlist logo
  - Admin login page: Logo with click navigation to home page
  - Admin sidebar: Logo with click navigation to home page
  - Consistent brand identity across admin panel
- **Operator Profile Photos**: Default HardHat icon for operators without photos
- **Admin Header Simplified**: Removed redundant navigation menu
  - Removed: Logo in header (already in sidebar), Vagas and Eventos buttons
  - Kept: Sidebar toggle, page title/description, logout button
- **Client Logo Management**: All clients can now update logos
  - Upload/change logo button now available for ALL clients
  - Previously only available for admin-created clients
  - Now also enabled for site-registered companies
  - **Bug Fixes**:
    - Fixed logo not updating for site-registered companies
    - GET /api/clients now correctly returns logoUrl from companies table
    - PUT /api/clients/:id now updates correct table (clients OR companies)
    - Added cache-busting to force image refresh after upload

### CPF Validation Enhancement
- Added input mask for CPF (formats as user types)
- Added validation using Brazilian CPF algorithm
- Added duplicate CPF check before advancing to step 2 of registration
- CPF uniqueness verified via API endpoint `/api/operators/check-cpf/:cpf`

### Email Configuration
- Simplified to focus on Gmail SMTP
- Removed unused API key fields
- Auto-sets smtp.gmail.com when Gmail is selected
- Clear instructions for creating Gmail App Password
- Default port: 587 (TLS)

## User Preferences
- Focus on production-ready code
- Bilingual support (Portuguese/English)
- Clean, modern UI using Shadcn components
- Database-backed configuration (no hardcoded values)

## Notes
- Server restarts automatically when code changes
- Object Storage requires manual bucket creation in Replit UI
- Gmail SMTP configured manually (Replit integration was dismissed)
- All forms use controlled components with React Hook Form
- All API responses properly typed using shared schemas
