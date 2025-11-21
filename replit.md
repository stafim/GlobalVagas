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

## Recent Changes

### November 21, 2025 - Password Recovery System Implementation
- **Complete Password Recovery Flow**: Implemented full password reset functionality with email verification
  - Created `password_reset_codes` database table to store 4-character verification codes
  - Codes expire after 15 minutes for security
  - Separate flows for Operators and Companies
- **3-Step Recovery Process**:
  - **Step 1 - Request Code**: User selects account type (Operator/Company) and enters email
  - **Step 2 - Verify Code**: User enters 4-digit code sent to email
  - **Step 3 - New Password**: User creates new password after code verification
- **Backend API Routes**:
  - `POST /api/auth/forgot-password` - Generates and sends 4-character code via email
  - `POST /api/auth/verify-reset-code` - Validates code and checks expiration
  - `POST /api/auth/reset-password` - Updates password after code verification
- **Email Integration**:
  - Professional HTML email template with recovery code
  - Uses existing `emailSettings` configuration from admin panel
  - Sends code to user's registered email with 15-minute expiration notice
  - Email template includes user name, security warnings, and Operlist branding
- **Frontend Page**: `/recuperar-senha` route with modern UI
  - Radio button selection for account type (Operator/Company)
  - 4-digit code input with automatic number formatting
  - Password confirmation with validation
  - Clear error messages and loading states
  - "Voltar para o login" link on all steps
- **Storage Methods**:
  - `createPasswordResetCode(code)` - Creates new reset code entry
  - `getPasswordResetCode(email, code)` - Retrieves and validates code
  - `markPasswordResetCodeAsUsed(id)` - Marks code as used after successful reset
- **Security Features**:
  - 15-minute code expiration
  - One-time use codes (marked as used after password reset)
  - Minimum 6-character password requirement
  - User type verification (prevents cross-account password resets)

### November 21, 2025 - Fixed "Nova Pergunta" Button in Company Questions
- **Bug Fix**: Corrected Dialog control issue preventing "Nova Pergunta" button from working
  - Removed conflicting `DialogTrigger` wrapper that was interfering with manual state control
  - Button now directly controls dialog state via `setIsCreateDialogOpen(true)`
  - Dialog remains controlled by `isCreateDialogOpen || !!editingQuestion` state
  - Modal opens correctly when creating new questions or editing existing ones
  - Proper separation between trigger button and dialog component

### November 21, 2025 - WhatsApp Contact Button in Job Applications
- **WhatsApp Integration**: Added WhatsApp button to contact candidates directly
  - Green WhatsApp button displayed in candidate details modal (replaced phone call button)
  - Clicking WhatsApp button opens a new tab with WhatsApp Web chat to candidate's phone number
  - Automatic phone number formatting (removes non-digit characters and adds country code +55)
  - Uses official WhatsApp icon from react-icons/si
  - Styled with green theme matching WhatsApp branding (bg-green-500/10, border-green-500/30)
  - Opens in new tab using window.open() with '_blank' target
  - Proper data-testid for automated testing
  - Removed phone call button in favor of WhatsApp-only communication

### November 21, 2025 - Enhanced Job Card Visualization
- **Improved Visual Separation**: Redesigned job cards in CompanyJobs page for better distinction
  - Each vaga now has a visible border (`border-2`) creating clear rectangular boundaries
  - Added subtle shadow (`shadow-sm`) to elevate cards from background
  - Increased internal padding from `p-4` to `p-6` for better content breathing room
  - Removed separators between cards - borders provide natural visual separation
  - Maintained `space-y-6` spacing between cards for clean layout
  - Cards now clearly stand out as individual, distinct units

### November 21, 2025 - CV Download Feature in Job Applications
- **PDF Download Button**: Added ability to download candidate curriculum vitae (CV) as PDF
  - Download icon (FileDown) appears in each candidate card
  - Clicking the button generates a professional PDF resume
  - PDF includes all candidate information:
    - Personal information (name, profession, contact details)
    - Professional experience (years, work type, availability)
    - Skills and certifications
    - Biography/About section
  - PDF footer shows job title and generation timestamp
  - File naming: `CV_[CandidateName]_[timestamp].pdf`
  - Uses jsPDF library for client-side PDF generation
  - Click event stops propagation to prevent opening candidate modal
- **UI Integration**:
  - Icon button placed next to application date in candidate card
  - Ghost variant button for subtle appearance
  - Tooltip shows "Baixar Currículo em PDF"
  - Proper data-testid for automated testing

### November 21, 2025 - Application Count Display in Job Cards
- **Enhanced Job Cards**: Added application count display to each job card in CompanyJobs page
  - Shows total number of candidates who applied to each job
  - Format: "X candidatura" or "X candidaturas" (singular/plural)
  - Displayed alongside job creation date and vacancy count
  - Uses UserCheck icon for visual consistency
  - Backend optimization: GET `/api/jobs` now includes `applicationCount` for each job
- **Backend Enhancement**:
  - Modified GET `/api/jobs` endpoint to enrich job data with application counts
  - Uses `getApplicationsByJob()` to fetch count for each job
  - Returns `JobWithApplicationCount` type with optional applicationCount field
- **Frontend Updates**:
  - Created `JobWithApplicationCount` type extending Job with applicationCount
  - Updated CompanyJobs query to use the new type
  - Added display in job card footer with icon and count
  - Proper singular/plural handling for Portuguese text

### November 21, 2025 - Complete Questionnaire System Integration
- **4-Step Job Creation Wizard**: Upgraded from 3 to 4 steps, adding question selection as final step
  - **Step 1**: Basic job information (title, location, salary, etc.)
  - **Step 2**: Detailed job description
  - **Step 3**: Job requirements and qualifications
  - **Step 4 (NEW)**: Select questions from company question bank for job questionnaire
  - Questions are optional - companies can skip this step if no questionnaire is needed
  - Display order is automatically assigned based on selection order
- **Job Application with Questionnaire Dialog**: Dynamic questionnaire system for operators
  - When applying to jobs with questions, operators see a dialog with all selected questions
  - Supports all 3 question types: text (short answer), textarea (long answer), multiple_choice (dropdown)
  - Operators must fill out questionnaire before final application submission
  - Application and answers saved together in a single transaction
  - If job has no questions, standard "Candidatar-se" flow without dialog
- **Candidate Answers Display**: Companies can view operator responses in candidate details
  - **New Section in JobApplications Modal**: "Respostas do Questionário" section
  - Displays each question with corresponding operator answer
  - Shows question number, question text, and operator's response
  - Empty state when job has no questions or operator hasn't answered
  - Clean card-based layout with subtle background for easy reading
- **Backend Enhancements**:
  - GET `/api/jobs/:jobId/questions` - Returns clean Question[] array (extracts from JobQuestion relations)
  - POST `/api/jobs/:jobId/questions` - Accepts questionIds array for bulk association with auto display_order
  - POST `/api/applications` - Saves both application AND answers in single request
  - GET `/api/applications/:applicationId/answers` - Returns ApplicationAnswer & { question: Question }[]
- **Storage Methods**:
  - `getJobQuestionsByJob(jobId)` - Returns JobQuestion & { question: Question }[]
  - `getApplicationAnswersByApplication(applicationId)` - Returns answers with full question data
  - All methods use proper JOINs to efficiently fetch related data
- **Data Flow**:
  1. Company creates/selects questions in CompanyQuestions page
  2. Company selects questions during job creation (Step 4)
  3. Operator views questions in dialog when applying to job
  4. Operator answers are saved with application
  5. Company views answers in candidate details modal
- **Integration Points**:
  - CompanyJobs.tsx: 4-step wizard with question selection
  - JobView.tsx: Questionnaire dialog for operators
  - JobApplications.tsx: Answers display in candidate modal
  - All pages properly typed with shared schema types