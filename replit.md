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