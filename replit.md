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

### November 20, 2025 - Visit Counter System
- **Automatic Visit Tracking**: Counts every visit to the home page
  - New backend methods in DatabaseStorage:
    - `incrementVisitCounter()` - Increments total and daily counters
    - `getVisitStats()` - Returns total and today's visit statistics
  - Uses `settings` table to store counter data:
    - `visit_counter_total` - Total visits all-time
    - `visit_counter_today` - Visits today (resets daily)
    - `visit_counter_date` - Date of today's counter
- **Backend Endpoints**:
  - POST `/api/track-visit` - Public endpoint, increments counter when called
  - GET `/api/admin/visit-stats` - Admin-only endpoint, returns statistics
- **Frontend Integration**:
  - Home page (`Home.tsx`) automatically tracks visits on load using `useEffect`
  - Silent tracking - doesn't interrupt user experience on failure
- **Admin Dashboard Display**:
  - New "Visitas ao Site" card showing total visits
  - Shows today's visits as secondary metric ("X hoje")
  - Eye icon for visual clarity
  - Responsive 4-column grid layout (2 cols on tablet, 4 on desktop)
  - Loading skeletons during data fetch

### November 20, 2025 - Public Jobs Listing Page
- **Complete Public Jobs Page**: New page accessible via Header "Vagas" menu at `/vagas`
  - Lists ALL active jobs from ALL companies in the system
  - No authentication required - publicly accessible
  - New backend endpoint: GET `/api/public/jobs` (public, no auth needed)
  - Returns only active jobs with company information (name, logo)
- **Search and Filter**: Real-time search functionality
  - Search by job title, company name, location, or description
  - Live filtering as user types
  - Results count display
- **Job Cards**: Clean, informative job cards with hover effects and click navigation
- **Responsive Grid Layout**: 1 column (mobile), 2 columns (tablet), 3 columns (desktop)
- **Empty States**: Handled for no jobs or no search results
- **Loading States**: Skeleton cards during data fetch
