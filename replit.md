# Operlist - Bilingual Job Board Platform

## Overview
Operlist is a comprehensive, bilingual (Portuguese/English) job board platform connecting job seekers (operators) with employers (companies). It supports job postings, applications, and user management across various profiles (operators, companies, administrators). The platform aims to be an efficient, scalable solution for the job market, offering robust administrative control, a multi-step job creation wizard, dynamic questionnaires, and integrated communication tools to enhance the hiring process.

## User Preferences
- Focus on production-ready code
- Bilingual support (Portuguese/English)
- Clean, modern UI using Shadcn components
- **Flat, minimalist design**: Neutral colors, simple icons, reduced visual noise
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

### November 21, 2025 - Simplified Password Recovery (No User Type Selection)
- **Simplified Password Recovery**: Removed user type selection from forgot password flow
  - **Auto-Detection**: Backend automatically detects user type by searching both Company and Operator tables
  - **User Experience**: Users only need to enter their email address
  - **Consistent with Login**: Matches the unified login system behavior
  - **Backend Changes**:
    - Updated `/api/auth/forgot-password` to accept only email (no userType)
    - Searches Company table first, then Operator table
    - Automatically determines user type and name for email
  - **Frontend Changes**:
    - Removed RadioGroup selection for account type
    - Simplified form to single email input field
    - Added helper text: "Digite o e-mail cadastrado na sua conta"
    - Updated KeyRound icon to use neutral design (bg-muted)

### November 21, 2025 - Simplified Flat UI Design
- **Flat Icon Design**: Removed colorful icons across the entire platform for a cleaner, more professional look
  - **Removed Color Gradients**: Eliminated all colored gradients (`from-blue-500/10 to-blue-600/10`) from stat cards
  - **Neutral Icons**: Changed all icons to use `text-muted-foreground` instead of specific colors (blue, green, yellow, purple, orange)
  - **Simplified Backgrounds**: Icon containers now use `bg-muted` instead of colored backgrounds (`bg-blue-500/10`, etc.)
  - **Cleaner Cards**: All cards use standard borders without colored accents
  - **Neutral Badges**: Status badges use `variant="secondary"` or `variant="outline"` for consistency
  - **Affected Pages**: 
    - CompanyCredits: Stats cards and transaction history
    - CompanyDashboard: Stats overview cards
    - CompanyPlan: Plan stats, active/expired purchase cards
    - Credit transaction icons (ArrowUpCircle/ArrowDownCircle) now neutral
  - **Design Philosophy**: Minimalist, professional, flat design that reduces visual noise and improves focus on content
  - **Dark Mode Compatible**: All neutral colors adapt perfectly to both light and dark themes

### November 21, 2025 - Unified Login System for All User Types
- **Single Login Page**: All user types (Company, Operator, Admin) now use the same login page at `/login`
  - **Backend Unification**: Enhanced `/api/auth/login` endpoint to automatically detect user type
    - Checks Company users first
    - Then Operator users
    - Then Admin users
    - Returns appropriate `userType` flag for routing
  - **Frontend Intelligence**: Login page redirects based on user type:
    - Company → `/dashboard/empresa`
    - Operator → `/dashboard/operador`
    - Admin → `/admin`
  - **Route Consolidation**: `/admin/login` now redirects to unified `/login` page
  - **User Experience**: Simplified login process - users just enter credentials without selecting user type
  - **Security**: Session management properly configured for all user types including admin

### November 21, 2025 - Simplified Question Types
- **Question Types Reduced**: Only 2 question types available for company questionnaires
  - **Resposta Curta (20 caracteres)**: For brief, concise answers
  - **Resposta Longa (1000 caracteres)**: For detailed, open-ended responses
  - **Removed**: Multiple choice questions to simplify the system
  - **Cleaner UI**: Removed options field and conditional logic from question creation form

### November 21, 2025 - Credit System for Job Publishing & Fixed Application Dashboard
- **Credit Verification Popup**: Companies must have credits before publishing jobs
  - **Popup Dialog**: When clicking "Nova Vaga", an AlertDialog shows:
    - Current available credits with badge (green if available, red if none)
    - Cost of publication: 1 credit
    - Confirmation message explaining 1 credit will be deducted
    - Warning message if no credits available
    - "Continuar" button to proceed (if credits available)
    - "Comprar Créditos" button to purchase credits (if no credits)
  - **Backend Validation**:
    - POST `/api/jobs` endpoint checks credits before creating job
    - Returns error with `insufficientCredits: true` if no credits
    - Automatically deducts 1 credit after successful job creation
    - Creates credit transaction record with job details
  - **User Experience**:
    - Credits query is invalidated after job creation to show updated balance
    - Success toast shows "1 crédito foi debitado da sua conta"
    - Error toast with "Comprar Créditos" button if insufficient credits
    - Prevents job creation without credits at both frontend and backend levels

- **Fixed Operator Applications Dashboard**:
  - **Backend**: Created `getApplicationsWithJobByOperator()` function in storage
    - Returns applications with full job details (title, location, company)
    - Uses JOIN to fetch related job and company data
  - **Frontend**: Updated OperatorDashboard to display applications properly
    - Shows up to 5 recent applications with job details
    - Each card displays: job title, company name, location, status badge, application date
    - Status badges: "Pendente" (secondary), "Aceita" (default), "Rejeitada" (destructive)
    - Cards are clickable and redirect to job details page
    - "Ver Todas" button appears if more than 5 applications
    - Proper empty state with "Explorar Vagas" button
    - Safe rendering with null-check filter for job data

### November 21, 2025 - Profile Completion Requirement with Light, Friendly Toast
- **Complete Profile Enforcement**: Operators must have 100% complete profiles before applying to jobs
  - **Required Fields**: birthDate, experienceYears, preferredLocation, skills, bio
  - **Backend Validation**:
    - Created `isOperatorProfileComplete()` function in `storage.ts`
    - Returns object with `complete` boolean and `missingFields` array
    - New endpoint: `GET /api/operator/profile-complete`
    - Enhanced `POST /api/applications` to check profile completion before allowing applications
    - Returns 400 error with `profileIncomplete: true` flag when profile is incomplete
  - **Frontend Experience** (`JobView.tsx`):
    - **Ultra-friendly light toast notification** - non-aggressive, welcoming design
    - **Blue info icon** (Info from lucide-react) for soft, informative appearance
    - Clean, modern title: "Complete seu perfil" with icon
    - Encouraging description: "Para se candidatar a esta vaga, precisamos que você complete seu perfil com todas as informações obrigatórias. É rápido e simples!"
    - **Blue action button**: "Completar Agora" with blue-500 background (no red/destructive colors)
    - Button redirects to `/perfil/operador` for easy profile completion
    - Toast auto-dismisses or can be manually closed
    - Light box appearance - bright, airy, and non-threatening
  - **User Flow**:
    1. Operator clicks "Candidatar-me" on job listing
    2. If profile incomplete, backend returns 400 error with `profileIncomplete: true`
    3. Frontend displays ultra-friendly light toast with blue info icon
    4. Toast uses soft blue colors and encouraging language
    5. Operator clicks "Completar Agora" button in toast
    6. Redirects to profile page to fill missing fields
    7. After completing profile, operator can successfully apply
- **Purpose**: 
  - Ensures companies receive complete candidate information
  - Improves data quality for hiring decisions
  - Guides operators with extremely friendly, non-aggressive notifications
  - Light, airy design encourages action without alarming users
  - Blue theme (not red) creates calm, positive experience
  - Clear call-to-action with encouraging messaging
  - Better matching between operators and opportunities