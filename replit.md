# Operlist - Bilingual Job Board Platform

## Overview
Operlist is a comprehensive, bilingual (Portuguese/English) job board platform connecting job seekers (operators) with employers (companies). It supports job postings, applications, and user management across various profiles (operators, companies, administrators). The platform aims to be an efficient, scalable solution for the job market, offering robust administrative control, a multi-step job creation wizard, dynamic questionnaires, and integrated communication tools to enhance the hiring process.

## User Preferences
- Focus on production-ready code
- Bilingual support (Portuguese/English)
- Clean, modern UI using Shadcn components
- **Flat, minimalist design**: Neutral colors, simple icons, reduced visual noise
- Database-backed configuration (no hardcoded values)

## System Access Credentials

### Administrator Account
- **Email**: admin@operlist.com.br
- **Password**: Admin@2024
- **Type**: System Administrator
- **Access**: Full administrative panel with all permissions

**Security Notes**:
- All passwords are hashed using bcrypt (10 rounds)
- Passwords stored in plaintext from legacy system are automatically migrated to bcrypt on first login
- It is recommended to change the default administrator password after first login

## System Architecture

### Core Features & Design
- **User Management**: Distinct roles (Operators, Companies, Administrators) with session-based authentication. Operators must have ≥50% profile completion before applying to jobs, with an AlertDialog guiding them to required fields. Registration forms include input masks for Brazilian phone numbers (DDD + 9 digits: (XX) XXXXX-XXXX) and CPF formatting for operators.
- **Job Management**: Companies create/manage jobs via a 4-step wizard, including dynamic question selection, sector/subsector taxonomy, and tags. Jobs have 'active'/'suspended' statuses (stored lowercase in database) and are publicly listed with search/filter capabilities. A credit system dictates job publishing. Companies can duplicate existing jobs to quickly create similar positions with pre-filled data. Jobs can be categorized by Sector and Subsector, with subsector options filtered based on selected sector. Administrators can delete jobs through the admin panel with confirmation dialog.
- **Job Application System**: Operators apply to jobs and complete dynamic questionnaires. The system validates required questions and prevents duplicate applications. Features advanced filtering (search, status, location) for companies to manage applications efficiently.
- **Profile Management**: Detailed profiles for Companies (presentation pages, banner uploads) and Operators (experience tracking, photos). Operator profile completion tracked via 13 fields with 50% minimum threshold.
- **Administration Panel**: Comprehensive interface for system settings, email configuration, content, user management, and financial dashboard.
- **Localization**: Full platform support for Portuguese and English.
- **Email System**: Integrated SMTP for notifications and password recovery.
- **Object Storage**: Replit Object Storage for user photos, company logos, and event images.
- **Form Validation**: Client-side and server-side validation using Zod, including email format validation, CPF validation, and phone number formatting.
- **UI/UX**: Clean, modern, responsive interface using Shadcn UI, featuring intuitive workflows, enhanced job card visualization, and consistent header/footer across all public pages. Company sidebar navigation is reorganized for clarity.
- **Visit Counter System**: Tracks unique home page visits.
- **Job View Counter**: Each job tracks total views automatically when users access the job details page. Companies can see view counts alongside applications and other metrics.
- **Public Jobs Page**: `/vagas` page with advanced filtering and real-time search.
- **Events Management**: System for displaying trade shows and workshops.
- **Company Credits System**: Dashboard for companies to manage credits, view transaction history, and track balances for plan purchases and job postings. Each purchased plan is tracked individually with usage monitoring:
  - Plans have status: **"Disponível para uso"** (available) when credits remain, **"Concluído"** (completed) when 100% of credits are used.
  - System automatically debits from the oldest available plan first (FIFO).
  - Automatic status updates when credits are consumed through job posting.
- **Communication Tools**: WhatsApp contact button for direct communication and CV download feature for PDF resumes.
- **Questionnaire System**: Dynamic question selection during job creation and interactive questionnaires for operators, with companies viewing responses. Only 'Short Answer' (20 chars) and 'Long Answer' (1000 chars) are available.
- **Company Configuration CRUDs**: Management of company-specific `Work Types` and `Contract Types` via dedicated pages.
- **Unified Login System**: Single login page for all user types (Company, Operator, Admin) with automatic type detection and redirection.
- **Simplified Password Recovery**: Users only need to enter their email; the system automatically detects user type.
- **Flat UI Design**: Minimalist design using neutral colors and `text-muted-foreground` for icons, removing color gradients and vibrant accents for a cleaner look.
- **Taxonomia System**: Centralized admin hub for managing platform-wide taxonomies including Tags, Setores (Sectors/Subsectors), Global Work Types, and Global Contract Types. All taxonomy management is organized under a single admin interface with dedicated tabs.
- **Password Security**: All user passwords (Companies, Operators, Admins) are hashed using bcrypt with automatic migration from legacy plaintext passwords on login. Registration forms feature real-time password strength indicators with visual progress bars, color-coded strength levels (weak/medium/strong), and requirements checklist. Minimum password strength of 60% (Medium) is required, enforcing at least 8 characters, uppercase letter, lowercase letter, and number.
- **Admin Login History Filters**: Search and filter users by name, email, and user type (Company/Operator/Admin) in the login history page.
- **Currency Input Mask**: Brazilian Real (BRL) currency mask for plan prices with automatic formatting (R$ X.XXX,XX format). Users can type only numbers and the system automatically formats with currency symbol, thousand separators, and decimal places.
- **Favicon**: Official Operlist logo (red speech bubble with white text) applied as website favicon. Optimized for display across different devices and sizes (16x16, 32x32, 180x180 for Apple devices), maintaining brand consistency throughout the platform.
- **Company Custom Topics**: Companies can create, edit, and delete custom presentation topics on their profile page to highlight unique information about their business (e.g., Benefícios, Localização, Projetos, Clientes, etc.). Each topic has a title and content field that can be edited inline and saved automatically.
- **Banner System with Positions**: Administrators can create and manage banners with different positions on the home page:
  - **Banner do Topo**: Displayed in the "Explore por Categoria" section at the top
  - **Banner do Meio**: Displayed below the "Últimas Vagas Cadastradas" section
  - Each banner has title, subtitle, image, link, display order, and active/inactive status
  - Auto-rotation carousel with navigation arrows and indicators
  - Home page displays only 6 latest jobs to keep content focused
- **About Section (Quem Somos)**: Customizable "About Us" section on home page:
  - Displayed immediately after the hero section
  - Three configurable fields: **Quem Somos** (Who We Are), **Missão** (Mission), **Valores** (Values)
  - Administrators manage content through Settings panel
  - Automatically hides if no content is configured
  - Clean, centered layout with icons for each section
- **Featured Companies Section**: Showcase selected companies on homepage:
  - Displayed below the middle banner section on the home page
  - Administrators select companies via checkboxes in Settings panel (Admin → Configurações)
  - Shows company logo, name, industry, sector, size, and website
  - Clickable cards linking to company presentation pages (`/empresa/{id}`)
  - Displays message if no companies are selected
  - Clean grid layout with hover effects
  - Responsive: 1 column on mobile, 2 on tablets, 3 on desktop
  - **Backend**: `GET /api/featured-companies` endpoint fetches companies by IDs using Drizzle ORM's `inArray` function
  - **Storage**: Featured company IDs stored in settings table as JSON array under key `featured_companies`
- **AI Integration (xAI Grok)**: Complete AI configuration panel in admin settings and AI-powered candidate analysis:
  - **Admin Configuration Panel**:
    - Accessible via "Configurações de IA" menu item in admin sidebar with Bot icon
    - **Configuration Options**:
      - Enable/disable AI features platform-wide with toggle switch
      - API Key management for xAI (Grok) with secure storage
      - Model selection: Grok 4 (Flagship), Grok 3 (Balanced), Grok 3 Mini (Fast & Economic), Grok Vision (Images)
      - Temperature control (0-2): Adjust AI creativity vs focus
      - Max tokens configuration (1-256000): Control response length
      - Custom system prompt: Define AI behavior and context
    - **API Testing**: Built-in connection test to validate xAI API key before saving
    - Route: `/admin/ia`
  - **AI-Powered Candidate Analysis**:
    - "Analisar com IA" button in candidate cards on job applications page
    - Compares job requirements with candidate CV and qualifications
    - Displays comprehensive analysis in modal with:
      - Match percentage (0-100%)
      - Job summary (brief description of position)
      - Candidate summary (brief profile overview)
      - Strengths (3-5 positive points highlighting candidate's fit)
      - Weaknesses/Points of attention (areas for improvement or concerns)
      - Recommendation (Recomendado, Recomendado com ressalvas, Não recomendado)
    - Visual indicators: color-coded badges, progress bars, icons
    - Loading state with spinner while AI processes analysis
    - Analysis considers: job description, requirements, benefits, salary, candidate skills, experience, certifications, bio, and questionnaire responses
  - **Backend Endpoints**:
    - `GET /api/admin/ai-settings` - Fetch AI configuration
    - `POST /api/admin/ai-settings` - Save AI settings with validation
    - `POST /api/admin/ai-settings/test` - Test API connection with provided key
    - `POST /api/company/analyze-candidate` - Analyze candidate compatibility with job using Grok AI
  - **Storage**: All settings stored in settings table with keys: `ai_enabled`, `ai_model`, `ai_temperature`, `ai_max_tokens`, `ai_system_prompt`, `ai_api_key`
- **Live Dashboard (AO VIVO)**: Real-time statistics panel for administrators:
  - Accessible via "AO VIVO" menu item in admin sidebar with Radio icon
  - Displays platform-wide statistics updated automatically every 30 seconds
  - **Statistics Cards**: Total companies, total operators, total jobs (active/suspended), total site visits
  - **Recent Logins**: Shows last 10 logins across all user types (Company, Operator, Admin) with timestamps
  - **Companies Jobs Ranking**: Top 10 companies ranked by number of job postings with visual progress bars
    - Shows total jobs and active jobs per company
    - Medal icons for top 3 positions (gold, silver, bronze)
    - Percentage-based progress bars showing relative job count
  - **Companies Activity**: Lists 20 most recently active companies with last login timestamps
  - **Company Search & Summary**: Searchable combobox to quickly find and view detailed company information
    - Search by company name with auto-complete
    - Displays comprehensive company summary including:
      - Company details (CNPJ, industry, size, last access, registration date)
      - Statistics (total jobs, active/suspended jobs, available credits, total purchases)
      - Purchase history with credits usage and status
      - Recent jobs (last 5) with view counts and status
    - Real-time data updates when company is selected
  - Visual indicators: Red pulsing "live" badge, color-coded user type badges
  - **Backend**: 
    - `GET /api/admin/live-stats` endpoint aggregates data from all user types and jobs
    - `GET /api/admin/company-summary/:companyId` endpoint provides detailed company analytics
  - Route: `/admin/ao-vivo`

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
- **Replit Object Storage**: For static asset storage (bucket: `operlist-storage`).
  - Public path: `operlist-storage/public`
  - Private path: `operlist-storage/private`
  - See [OBJECT_STORAGE_SETUP.md](./OBJECT_STORAGE_SETUP.md) for details
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
- **bcrypt**: Password hashing for secure credential storage.