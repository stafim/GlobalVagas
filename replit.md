# Operlist - Bilingual Job Board Platform

## Overview
Operlist is a comprehensive, bilingual (Portuguese/English) job board platform connecting job seekers (operators) with employers (companies). It supports job postings, applications, and user management across various profiles (operators, companies, administrators). The platform aims to be an efficient, scalable solution for the job market, offering robust administrative control, a multi-step job creation wizard, dynamic questionnaires, and integrated communication tools to enhance the hiring process.

## User Preferences
- Focus on production-ready code
- Bilingual support (Portuguese/English)
- Clean, modern UI using Shadcn components
- Database-backed configuration (no hardcoded values)

## System Architecture

### Core Features & Design
- **User Management**: Distinct roles (Operators, Companies, Administrators) with session-based authentication. Operators must have 100% complete profiles before applying to jobs, with an AlertDialog guiding them to required fields (birthDate, experienceYears, preferredLocation, skills, bio).
- **Job Management**: Companies create/manage jobs via a 4-step wizard, including dynamic question selection. Jobs have 'Active'/'Suspended' statuses and are publicly listed with search/filter capabilities.
- **Job Application System**: Operators apply to jobs and complete dynamic questionnaires. The system validates only required questions, indicated visually, and prevents duplicate applications. Unauthenticated users are redirected to log in.
- **Profile Management**: Detailed profiles for Companies (presentation pages, banner uploads) and Operators (experience tracking, photos).
- **Administration Panel**: Comprehensive interface for system settings, email configuration, content, and user management, including a financial dashboard.
- **Localization**: Full platform support for Portuguese and English.
- **Email System**: Integrated SMTP for notifications and password recovery.
- **Object Storage**: Replit Object Storage for user photos, company logos, and event images.
- **Form Validation**: Client-side and server-side validation using Zod.
- **UI/UX**: Clean, modern, responsive interface using Shadcn UI, featuring intuitive workflows, enhanced job card visualization, and consistent header/footer across all public pages. Company sidebar navigation is reorganized into distinct sections (Menu Principal, Questionários, Cadastros Básicos) for clarity.
- **Visit Counter System**: Tracks unique home page visits.
- **Public Jobs Page**: `/vagas` page with advanced filtering and real-time search.
- **Events Management**: System for displaying trade shows and workshops.
- **Company Credits System**: Dashboard for companies to manage credits, view transaction history, and track balances for plan purchases and job postings. Purchasing plans automatically assigns credits.
- **Communication Tools**: WhatsApp contact button for direct communication and CV download feature for PDF resumes.
- **Questionnaire System**: Dynamic question selection during job creation and interactive questionnaires for operators, with companies viewing responses.
- **Company Configuration CRUDs**: Management of company-specific `Work Types` and `Contract Types` with full CRUD functionality via dedicated pages (`/empresa/tipos-trabalho`, `/empresa/tipos-contrato`). These are used for job categorization.

### Technology Stack
- **Frontend**: React + TypeScript + Vite, Shadcn UI + Tailwind CSS, TanStack Query, React Hook Form + Zod
- **Backend**: Express + TypeScript
- **Database**: PostgreSQL (Neon-backed Replit database) with Drizzle ORM

### Project Structure
- `client/` - React frontend application
- `server/` - Express backend API
- `shared/` - Shared TypeScript types and schemas

## External Dependencies
- **PostgreSQL**: Primary database.
- **Replit Object Storage**: For static asset storage.
- **Gmail SMTP / Custom SMTP**: For email notifications.
- **Vite**: Frontend build tool.
- **Tailwind CSS**: Utility-first CSS framework.
- **Shadcn UI**: UI component library.
- **TanStack Query (React Query)**: Data fetching and state management.
- **React Hook Form**: Form management.
- **Zod**: Schema validation.
- **Drizzle ORM**: Database interaction.
- **express-session**: Session management.
- **Recharts**: For data visualization.
- **cookie-parser**: Express middleware for cookie handling.
- **jsPDF**: Client-side PDF generation.

## Recent Changes

### November 21, 2025 - Profile Completion Requirement with Friendly Toast Notification
- **Complete Profile Enforcement**: Operators must have 100% complete profiles before applying to jobs
  - **Required Fields**: birthDate, experienceYears, preferredLocation, skills, bio
  - **Backend Validation**:
    - Created `isOperatorProfileComplete()` function in `storage.ts`
    - Returns object with `complete` boolean and `missingFields` array
    - New endpoint: `GET /api/operator/profile-complete`
    - Enhanced `POST /api/applications` to check profile completion before allowing applications
    - Returns 400 error with `profileIncomplete: true` flag when profile is incomplete
  - **Frontend Experience** (`JobView.tsx`):
    - **Friendly toast notification** with soft colors (no destructive red)
    - Uses default toast styling for a welcoming, non-alarming experience
    - Clear title: "Complete seu perfil para se candidatar"
    - Helpful description: "Para se candidatar a vagas, você precisa completar 100% do seu perfil com todos os dados obrigatórios"
    - **Action button integrated in toast**: "Completar Perfil" button redirects to `/perfil/operador`
    - Toast auto-dismisses or can be manually closed
  - **User Flow**:
    1. Operator clicks "Candidatar-me" on job listing
    2. If profile incomplete, backend returns 400 error with `profileIncomplete: true`
    3. Frontend displays friendly toast notification with action button
    4. Toast uses soft colors (not red/destructive) for better UX
    5. Operator clicks "Completar Perfil" button in toast
    6. Redirects to profile page to fill missing fields
    7. After completing profile, operator can successfully apply
- **Purpose**: 
  - Ensures companies receive complete candidate information
  - Improves data quality for hiring decisions
  - Guides operators with friendly, actionable notifications
  - Better user experience with soft colors and integrated action button
  - Non-alarming approach encourages profile completion
  - Better matching between operators and opportunities