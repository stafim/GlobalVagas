# Operlist - Bilingual Job Board Platform

## Overview
Operlist is a comprehensive, bilingual (Portuguese/English) job board platform designed to connect job seekers (operators) with employers (companies). It facilitates job postings, applications, and user management for operators, companies, and administrators. The platform aims to provide a modern, efficient, and scalable solution for the job market, supporting various user profiles and offering robust administrative control.

## User Preferences
- Focus on production-ready code
- Bilingual support (Portuguese/English)
- Clean, modern UI using Shadcn components
- Database-backed configuration (no hardcoded values)

## System Architecture

### Technology Stack
- **Frontend**: React + TypeScript + Vite, Shadcn UI + Tailwind CSS, TanStack Query, React Hook Form + Zod
- **Backend**: Express + TypeScript
- **Database**: PostgreSQL (Neon-backed Replit database) with Drizzle ORM

### Core Features & Design
- **Bilingual Support**: Platform is fully bilingual (Portuguese/English).
- **User Management**: Supports distinct roles: Operators (job seekers), Companies (employers), and Administrators.
- **Authentication**: Session-based authentication using `express-session` with separate flows for operators and companies.
- **Job Management**:
    - Companies can create, update, and manage job postings through a 3-step wizard.
    - Jobs have dual statuses: "Ativa" (Active) and "Suspensa" (Suspended).
    - Public listing page displays all active jobs with search and filter capabilities.
- **Job Application System**: Operators can apply to jobs with duplicate application prevention.
- **Company Profiles**: Companies can create detailed profiles including presentation pages with banner uploads, mission, and culture sections.
- **Operator Profiles**: Operators can create profiles including experience tracking and profile photos.
- **Administration Panel**: Comprehensive admin interface for system settings, email configuration, content management, and user management.
- **Email Configuration**: Integrated SMTP for email notifications, configurable via the admin panel (supports Gmail SMTP with App Passwords).
- **Object Storage**: Replit Object Storage is utilized for handling user profile photos, company logos, and event images.
- **Form Validation**: Robust client-side and server-side validation using Zod, including CPF validation with input masks and uniqueness checks.
- **Financial Dashboard**: Provides administrators with sales analytics, including revenue, total sales, active sales, and client data with interactive charts and filtering.
- **UI/UX**: Emphasis on a clean, modern interface using Shadcn UI, responsive design, and intuitive workflows (e.g., multi-step forms, real-time statistics).

### Project Structure
- `client/` - React frontend application
- `server/` - Express backend API
- `shared/` - Shared TypeScript types and schemas

## External Dependencies
- **PostgreSQL**: Primary database for all application data, utilizing Neon for hosting.
- **Replit Object Storage**: Used for storing static assets like profile pictures and banners.
- **Gmail SMTP / Custom SMTP**: For sending transactional emails and notifications.
- **Vite**: Frontend build tool.
- **Tailwind CSS**: Utility-first CSS framework.
- **Shadcn UI**: UI component library.
- **TanStack Query (React Query)**: Data fetching and state management.
- **React Hook Form**: Form management library.
- **Zod**: Schema declaration and validation library.
- **Drizzle ORM**: TypeScript ORM for database interaction.
- **express-session**: Session management middleware for Express.
- **Recharts**: For data visualization in the financial dashboard.
## Recent Changes

### November 20, 2025 - Visit Counter System with Cookie Control
- **Automatic Visit Tracking**: Counts unique visits to the home page using cookies
  - **Cookie-Based Deduplication**: Uses `visit_tracked` cookie with 30-minute expiration
    - First visit without cookie: Increments counter and sets cookie
    - Subsequent visits with valid cookie: Does NOT increment counter
    - Cookie expires after 30 minutes, allowing re-counting
    - HttpOnly cookie for security (prevents JavaScript access)
    - SameSite: lax for CSRF protection
  - New backend methods in DatabaseStorage:
    - `incrementVisitCounter()` - Increments total and daily counters
    - `getVisitStats()` - Returns total and today's visit statistics
  - Uses `settings` table to store counter data:
    - `visit_counter_total` - Total visits all-time
    - `visit_counter_today` - Visits today (resets daily)
    - `visit_counter_date` - Date of today's counter
- **Backend Endpoints**:
  - POST `/api/track-visit` - Public endpoint, checks cookie before counting
    - Returns `{counted: true, totalVisits: N}` when visit is counted
    - Returns `{counted: false, message: "Visita já registrada"}` when cookie is valid
  - GET `/api/admin/visit-stats` - Admin-only endpoint, returns statistics
- **Technical Implementation**:
  - Express middleware: `cookie-parser` added to handle cookies
  - Cookie configuration: 30-minute expiration (1800000ms)
  - Backend validates cookie presence before incrementing counter
- **Frontend Integration**:
  - Home page (`Home.tsx`) automatically tracks visits on load using `useEffect`
  - Silent tracking - doesn't interrupt user experience on failure
- **Admin Dashboard Display**:
  - New "Visitas ao Site" card showing total visits
  - Shows today's visits as secondary metric ("X hoje")
  - Eye icon for visual clarity
  - Responsive 4-column grid layout (2 cols on tablet, 4 on desktop)
  - Loading skeletons during data fetch

### November 20, 2025 - Public Jobs Listing Page with Advanced Filters
- **Complete Public Jobs Page**: New page accessible via Header "Vagas" menu at `/vagas`
  - Lists ALL active jobs from ALL companies in the system
  - No authentication required - publicly accessible
  - New backend endpoint: GET `/api/public/jobs` (public, no auth needed)
  - Returns only active jobs with company information (name, logo)
- **Real-Time Search Autocomplete in Hero Section**: Live job search with instant results
  - **Search as you type**: Results appear instantly while typing (no need to press "Buscar")
  - **Dropdown with top 5 results**: Shows up to 5 matching jobs with company logo, title, location, and work type
  - **Click to view job**: Clicking any result opens the job details page
  - **Empty state**: Shows message when no jobs match the search term
  - **"Ver todas" link**: Button to view all matching jobs on `/vagas` page
  - **Clear button**: X button to clear search and close dropdown
  - **Click outside to close**: Dropdown closes when clicking outside
  - **Smart filtering**: Searches across job title, company name, location, and description
  - **Fallback button**: "Buscar" button redirects to `/vagas?busca=termo` for full results
- **Latest Jobs Section on Home Page**: Displays the 10 most recently created jobs
  - Shows last 10 jobs sorted by creation date (newest first)
  - Grid layout: 2 columns on desktop, 1 column on mobile
  - Each card displays: company logo, job title, company name, description, work type, contract type, salary, location, and posting date
  - Click on any job card to view full details
  - "Ver Mais Vagas" button at the bottom redirects to `/vagas` page
  - Loading skeletons while data is fetching
  - Empty state when no jobs are available
  - Fully integrated with real database data
- **Advanced Filter Sidebar**: Comprehensive filtering system
  - **Tipo de Trabalho**: Presencial, Remoto, Híbrido
  - **Tipo de Contrato**: CLT, PJ, Estágio, Temporário
  - **Localização**: Dynamic list based on available job locations
  - **Empresa**: Dynamic list based on companies with active jobs
  - Filter toggle button with active filter count badge
  - "Limpar" button to clear all filters at once
  - Sticky positioning for easy access while scrolling
  - Collapsible sidebar (show/hide filters)
- **Search and Filter**: Combined search and filter functionality
  - Real-time text search by job title, company name, location, or description
  - Multi-criteria filtering (all filters work together)
  - Results count display updates dynamically
  - Checkboxes with proper labels for accessibility
  - URL parameter support for deep linking and sharing
- **Job Cards**: Clean, informative job cards with hover effects and click navigation
- **Responsive Layout**: 
  - Sidebar: Full width on mobile, fixed 320px on desktop
  - Grid: 1 column (mobile), 2 columns (tablet without sidebar), 3 columns (desktop with sidebar collapsed)
  - Flexible layout adapts when filters are hidden
- **Empty States**: Handled for no jobs or no search results
- **Loading States**: Skeleton cards during data fetch

### November 20, 2025 - Mining and Heavy Machinery Events
- **5 New Trade Shows and Workshops**: Created mining and heavy machinery related events with AI-generated images
  - **Expo Mineração & Tecnologia 2025** (Belo Horizonte/MG, Mar 15-18, 2025): Largest mining equipment trade show in Latin America, featuring excavators, off-road trucks, drilling rigs, and automation systems
  - **Workshop: Operação Segura de Equipamentos Pesados** (Itabira/MG, Feb 20-21, 2025): 2-day intensive hands-on training for heavy equipment operation with certified instructors
  - **Congresso Internacional de Mineração** (São Paulo/SP, Apr 10-13, 2025): International mining congress focusing on sustainability, technological innovation, and operational safety
  - **Feira de Tecnologia para Mineração Subterrânea** (São Paulo/SP, May 22-24, 2025): Specialized underground mining technology fair with drilling rigs, transport vehicles, and automation systems
  - **Expo Máquinas Pesadas & Construção** (Rio de Janeiro/RJ, Jun 5-8, 2025): Free large-scale construction and mining equipment expo with bulldozers, loaders, and articulated trucks
  - All events include: detailed descriptions, pricing (R$150-890 or free), capacity (30-10,000 attendees), organizer contact information, and professional cover images
  - High-quality AI-generated cover images featuring: exhibition halls, heavy machinery displays, training sessions, industrial equipment, and professional event settings
