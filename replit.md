# Operlist - Bilingual Job Board Platform

## Project Overview
Operlist is a comprehensive job board platform built with TypeScript, React, Express, and PostgreSQL. The platform is bilingual (Portuguese/English) and supports multiple user types: operators (job seekers), companies (employers), and administrators.

## Architecture

### Technology Stack
- **Frontend**: React + TypeScript + Vite
- **Backend**: Express + TypeScript
- **Database**: PostgreSQL (Neon-backed Replit database)
- **ORM**: Drizzle ORM
- **UI**: Shadcn UI + Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation

### Project Structure
- `client/` - React frontend application
- `server/` - Express backend API
- `shared/` - Shared TypeScript types and schemas
- `attached_assets/` - Static assets (images, etc.)

## User Types

### 1. Operators (Job Seekers)
- Profile with CPF, profession, skills, certifications
- Experience tracking
- Job application capabilities
- Profile photo support

### 2. Companies (Employers)
- Company profile with CNPJ
- Job posting capabilities
- Candidate management

### 3. Administrators
- System settings management
- Email configuration (SMTP)
- Content management (hero texts, statistics)
- User management

## Key Features

### Authentication
- Session-based authentication using express-session
- Separate login/registration for operators and companies
- Admin panel access control

### Email Configuration
**Note**: Gmail SMTP integration is configured manually (not using Replit's native integration).
- Provider: Gmail SMTP or custom SMTP
- Settings stored in database
- Configuration available in Admin Settings page
- Requires Gmail App Password (16-character password, not regular Gmail password)
- SMTP settings:
  - Host: smtp.gmail.com
  - Port: 587 (TLS) or 465 (SSL)
  - User: Gmail email address
  - Password: Gmail App Password

### Object Storage
- Replit Object Storage integration configured
- Used for profile photos and event images
- Requires environment variables:
  - `PRIVATE_OBJECT_DIR` - Private storage path
  - `PUBLIC_OBJECT_SEARCH_PATHS` - Public storage paths

### Form Validation
- CPF validation with mask (000.000.000-00)
- CPF uniqueness check before advancing to step 2
- Real-time validation using Zod schemas
- Multi-step registration forms

## Database Schema

### Main Tables
- `users` - Basic user authentication
- `companies` - Company profiles
- `operators` - Operator (job seeker) profiles
- `experiences` - Work experience records
- `admins` - Administrator accounts
- `plans` - Subscription plans
- `clients` - White-label clients
- `purchases` - Plan purchases
- `email_settings` - Email SMTP configuration
- `sectors` / `subsectors` - Industry categorization
- `events` - Events/courses
- `banners` - Homepage banners
- `settings` - Site-wide settings (key-value store)

## Development

### Database Migrations
```bash
npm run db:push        # Push schema changes
npm run db:push --force # Force push (use when data loss warning appears)
```

### Running the Application
```bash
npm run dev  # Starts both frontend and backend
```

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (auto-configured)
- `PRIVATE_OBJECT_DIR` - Object storage private directory
- `PUBLIC_OBJECT_SEARCH_PATHS` - Object storage public paths

## Admin Credentials
- Email: admin@operlist.com
- Password: admin123

## Recent Changes

### November 17, 2025 - Financial Dashboard & Branding Updates
- **Complete Financial Reports System**: Implemented comprehensive sales analytics dashboard
  - Real-time statistics cards: Total Revenue, Total Sales, Active Sales, Active Clients
  - Interactive charts using Recharts: Revenue over time (line chart) and Top 10 clients (bar chart)
  - Advanced filtering system: date range, client selection, min/max amount
  - Sales table with detailed transaction information
  - API endpoints: `/api/purchases` (with filters) and `/api/purchases/stats`
  - Mock data removed - dashboard ready for real sales data
- **Operlist Branding**: Replaced Shield icons with official Operlist logo
  - Admin login page: Logo with click navigation to home page
  - Admin sidebar: Logo with click navigation to home page
  - Consistent brand identity across admin panel
- **Operator Profile Photos**: Default HardHat icon for operators without photos

### CPF Validation Enhancement
- Added input mask for CPF (formats as user types)
- Added validation using Brazilian CPF algorithm
- Added duplicate CPF check before advancing to step 2 of registration
- CPF uniqueness verified via API endpoint `/api/operators/check-cpf/:cpf`

### Email Configuration
- Simplified to focus on Gmail SMTP
- Removed unused API key fields
- Auto-sets smtp.gmail.com when Gmail is selected
- Clear instructions for creating Gmail App Password
- Default port: 587 (TLS)

## User Preferences
- Focus on production-ready code
- Bilingual support (Portuguese/English)
- Clean, modern UI using Shadcn components
- Database-backed configuration (no hardcoded values)

## Notes
- Server restarts automatically when code changes
- Object Storage requires manual bucket creation in Replit UI
- Gmail SMTP configured manually (Replit integration was dismissed)
- All forms use controlled components with React Hook Form
- All API responses properly typed using shared schemas
