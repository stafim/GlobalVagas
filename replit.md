# Operlist - Bilingual Job Board Platform

## Overview
Operlist is a comprehensive, bilingual (Portuguese/English) job board platform designed to connect job seekers (operators) with employers (companies). It facilitates job postings, applications, and user management across various profiles (operators, companies, administrators). The platform aims to provide a modern, efficient, and scalable solution for the job market, offering robust administrative control and supporting diverse user needs with features like a multi-step job creation wizard, dynamic questionnaires, and integrated communication tools.

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
- **User Management**: Distinct roles (Operators, Companies, Administrators) with session-based authentication.
- **Job Management**: Companies can create/manage jobs via a 4-step wizard (including question selection). Jobs have 'Active'/'Suspended' statuses and are publicly listed with search/filter capabilities.
- **Job Application System**: Operators can apply to jobs, complete dynamic questionnaires, and are prevented from duplicate applications. Unauthenticated users are redirected to login for application.
- **Profile Management**: Detailed profiles for Companies (presentation pages, banner uploads) and Operators (experience tracking, photos).
- **Administration Panel**: Comprehensive interface for system settings, email configuration, content, and user management, including a financial dashboard.
- **Bilingual Support**: Full platform localization for Portuguese and English.
- **Email Configuration**: Integrated SMTP for notifications, configurable via admin panel. Includes a password recovery system with email verification.
- **Object Storage**: Replit Object Storage for user photos, company logos, and event images.
- **Form Validation**: Client-side and server-side validation using Zod.
- **UI/UX**: Clean, modern, responsive interface using Shadcn UI, featuring intuitive workflows like multi-step forms and real-time statistics. Enhanced job card visualization with clear borders and shadows.
- **Visit Counter System**: Tracks unique home page visits with daily and total statistics.
- **Public Jobs Page**: Accessible `/vagas` page with advanced filtering and real-time search.
- **Events Management**: System for displaying trade shows and workshops.
- **Company Credits System**: Dashboard for companies to manage credits, view transaction history, and track balances for plan purchases and job postings.
- **Communication Tools**: WhatsApp contact button for companies to communicate directly with candidates, and a CV download feature for generating PDF resumes of candidates.
- **Questionnaire System**: Dynamic question selection during job creation and interactive questionnaires for operators during application. Companies can view operator responses.

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

### November 21, 2025 - Standardized Navigation: Header Across All Pages
- **Consistent Navigation**: Added Header and Footer components to all public pages
  - Updated Login page to include Header and Footer
  - Updated ForgotPassword page to include Header and Footer
  - Ensured consistent user experience across authentication flows
  - All public pages now have standard top navigation and footer
  - Users can navigate to other sections (Vagas, Eventos) even from login/signup pages
  - Improved accessibility with consistent layout structure

### November 21, 2025 - Reorganized Navigation: Banco de Perguntas as Submenu
- **Navigation Restructure**: Moved "Banco de Perguntas" to be a submenu item under "Configurações"
  - Updated CompanySidebar to support collapsible menu items with submenus
  - Implemented using Shadcn Collapsible component for smooth expand/collapse
  - Changed route from `/empresa/configuracoes` to `/empresa/banco-perguntas`
  - Menu automatically expands when submenu item is active
  - Updated all internal links to use new route
  - Improved menu organization for better UX

### November 21, 2025 - Bug Fixes: Job Creation & Question Options UI
- **Fixed 400 Error**: Corrected `displayOrder` field type issue when adding questions to jobs
  - Problem: Field expected string but received number
  - Solution: Convert displayOrder to string: `String(i + 1)`
  - Job creation with questions now works correctly
- **Improved Multiple Choice UI**: Enhanced question creation form for better clarity
  - Added explicit instruction: "Digite cada opção em uma linha separada"
  - Added visual warning icon to emphasize one-option-per-line requirement
  - Improved placeholder text with clearer examples
  - Increased textarea rows from 5 to 6 for better visibility

### November 21, 2025 - Fix: Questions Not Appearing in Job Creation Wizard
- **Bug Fix**: Corrected endpoint in job creation wizard (step 4 - Questionnaire)
  - Changed from non-existent `/api/questions` to correct `/api/company/questions`
  - Questions now properly load and display during job creation
  - Companies can now select questions when creating new job postings
  - Issue: The frontend was calling an endpoint that didn't exist on the backend
  - Solution: Updated `CompanyJobs.tsx` to use the proper company-specific questions endpoint

### November 21, 2025 - Automatic Credit Assignment on Plan Purchase
- **Purchase Flow Integration**: Implemented automatic credit assignment when companies purchase plans
  - Created `POST /api/companies/purchase-plan` endpoint for plan purchases
  - System automatically creates or finds client record by company CNPJ
  - Creates purchase record linking company to plan
  - **Automatically credits** the plan's `vacancyQuantity` to company account
  - Creates transaction record documenting the credit addition
  - Updates company credits balance in real-time
- **Enhanced Company Plans Page**:
  - Added "Planos Disponíveis" section showing all active plans
  - Each plan card displays: name, description, price, and credits included
  - "Adquirir Plano" button to purchase plans
  - Real-time balance updates after purchase
  - Success notification showing credits received
  - Automatic cache invalidation for credits and transactions
- **Integration Points**:
  - Plan purchase → Client creation/lookup → Purchase record → Credit transaction → Balance update
  - Full transactional integrity with proper error handling
  - 1-year validity period for purchased plans
  - Invalidates relevant caches: purchases, credits, transactions