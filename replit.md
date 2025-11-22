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
- **User Management**: Distinct roles (Operators, Companies, Administrators) with session-based authentication. Operators must have 100% complete profiles before applying to jobs, with an AlertDialog guiding them to required fields.
- **Job Management**: Companies create/manage jobs via a 4-step wizard, including dynamic question selection. Jobs have 'Active'/'Suspended' statuses and are publicly listed with search/filter capabilities. A credit system dictates job publishing.
- **Job Application System**: Operators apply to jobs and complete dynamic questionnaires. The system validates required questions and prevents duplicate applications.
- **Profile Management**: Detailed profiles for Companies (presentation pages, banner uploads) and Operators (experience tracking, photos).
- **Administration Panel**: Comprehensive interface for system settings, email configuration, content, user management, and financial dashboard.
- **Localization**: Full platform support for Portuguese and English.
- **Email System**: Integrated SMTP for notifications and password recovery.
- **Object Storage**: Replit Object Storage for user photos, company logos, and event images.
- **Form Validation**: Client-side and server-side validation using Zod.
- **UI/UX**: Clean, modern, responsive interface using Shadcn UI, featuring intuitive workflows, enhanced job card visualization, and consistent header/footer across all public pages. Company sidebar navigation is reorganized for clarity.
- **Visit Counter System**: Tracks unique home page visits.
- **Public Jobs Page**: `/vagas` page with advanced filtering and real-time search.
- **Events Management**: System for displaying trade shows and workshops.
- **Company Credits System**: Dashboard for companies to manage credits, view transaction history, and track balances for plan purchases and job postings.
- **Communication Tools**: WhatsApp contact button for direct communication and CV download feature for PDF resumes.
- **Questionnaire System**: Dynamic question selection during job creation and interactive questionnaires for operators, with companies viewing responses. Only 'Short Answer' (20 chars) and 'Long Answer' (1000 chars) are available.
- **Company Configuration CRUDs**: Management of company-specific `Work Types` and `Contract Types` via dedicated pages.
- **Unified Login System**: Single login page for all user types (Company, Operator, Admin) with automatic type detection and redirection.
- **Simplified Password Recovery**: Users only need to enter their email; the system automatically detects user type.
- **Flat UI Design**: Minimalist design using neutral colors and `text-muted-foreground` for icons, removing color gradients and vibrant accents for a cleaner look.

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