# Operlist - Bilingual Job Board Platform

## Overview
Operlist is a comprehensive, bilingual (Portuguese/English) job board platform connecting job seekers (operators) with employers (companies). It facilitates job postings, applications, and user management across various profiles (operators, companies, administrators). The platform aims to be a modern, efficient, and scalable solution for the job market, offering robust administrative control and supporting diverse user needs.

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
- **Bilingual Support**: Full platform localization for Portuguese and English.
- **User Management**: Distinct roles for Operators, Companies, and Administrators with session-based authentication.
- **Job Management**: Companies can create/manage jobs via a 4-step wizard (including question selection). Jobs have 'Active'/'Suspended' statuses. Public listing with search/filter.
- **Job Application System**: Operators can apply to jobs, with dynamic questionnaires for specific jobs, and duplicate application prevention.
- **Profile Management**: Detailed profiles for Companies (presentation pages, banner uploads) and Operators (experience tracking, photos).
- **Administration Panel**: Comprehensive interface for system settings, email configuration, content, and user management. Includes a financial dashboard with sales analytics.
- **Email Configuration**: Integrated SMTP for notifications, configurable via admin panel.
- **Object Storage**: Replit Object Storage for user photos, company logos, and event images.
- **Form Validation**: Client-side and server-side validation using Zod, including CPF validation.
- **UI/UX**: Clean, modern interface with Shadcn UI, responsive design, and intuitive workflows (e.g., multi-step forms, real-time statistics).
- **Visit Counter System**: Tracks unique visits to the home page using cookies with daily and total statistics.
- **Public Jobs Page**: Accessible `/vagas` page listing all active jobs with advanced filtering (work type, contract, location, company) and real-time search.
- **Events Management**: System for displaying trade shows and workshops, including details, pricing, capacity, and cover images.

### Project Structure
- `client/` - React frontend application
- `server/` - Express backend API
- `shared/` - Shared TypeScript types and schemas

## External Dependencies
- **PostgreSQL**: Primary database (Neon-hosted).
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