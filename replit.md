# Operlist - Bilingual Job Board Platform

## Overview
Operlist is a comprehensive, bilingual (Portuguese/English) job board platform designed to connect job seekers (operators) with employers (companies). It facilitates job postings, applications, and user management across various profiles. The platform aims to be an efficient, scalable solution for the job market, offering robust administrative control, a multi-step job creation wizard, dynamic questionnaires, and integrated communication tools to enhance the hiring process. Key ambitions include providing a user-friendly and efficient hiring ecosystem, enhancing market potential through bilingual support, and ensuring a scalable foundation for future growth.

## User Preferences
- Focus on production-ready code
- Bilingual support (Portuguese/English)
- Clean, modern UI using Shadcn components
- **Flat, minimalist design**: Neutral colors, simple icons, reduced visual noise
- **Color scheme**: Neutral gray-blue palette (hsl 210, 8%, 45%) for primary actions and branding
- Database-backed configuration (no hardcoded values)

## System Architecture

### Core Features & Design
- **User Management**: Supports distinct roles (Operators, Companies, Administrators) with session-based authentication. Includes profile completion requirements for operators, input masks for Brazilian phone numbers and CPF, and a unified login system. All passwords are hashed using bcrypt with automatic migration from legacy plaintext. Password strength indicators are provided during registration.
- **Job Management**: Companies use a 4-step wizard to create/manage jobs, including dynamic question selection, sector/subsector taxonomy, and tags. Features include job status (active/suspended), duplication, a credit-based publishing system, and public listing with search/filter capabilities.
- **Job Application System**: Operators apply to jobs and complete dynamic questionnaires, with validation for required questions and prevention of duplicate applications. Companies can manage applications with advanced filtering.
- **Profile Management**: Detailed profiles for Companies (presentation pages, banners, custom topics) and Operators (experience tracking, photos).
- **Administration Panel**: Comprehensive interface for system settings, user management, content, email configuration, and a financial dashboard.
- **Localization**: Full platform support for Portuguese and English.
- **UI/UX**: Clean, modern, responsive interface using Shadcn UI, emphasizing intuitive workflows, consistent design, and enhanced data visualization. Includes a minimalist flat design with neutral colors.
- **Analytics & Tracking**: Tracks unique home page visits, job views, and provides an "AO VIVO" (Live Dashboard) for administrators with real-time statistics, recent logins, company job rankings, and activity.
- **Events Management**: System for displaying trade shows and workshops.
- **Company Credits System**: Manages company credit purchases, usage, and transaction history, with automatic debiting from the oldest available plan.
- **Communication Tools**: Integrated WhatsApp contact and CV download features.
- **Questionnaire System**: Dynamic short and long answer questions for job applications.
- **Taxonomy System**: Centralized administration for platform-wide taxonomies (Tags, Sectors/Subsectors, Work Types, Contract Types).
- **Homepage Content Management**: Customizable "About Us" section and a banner system with configurable positions (top and middle of homepage) managed via the admin panel. Featured companies section showcasing selected businesses.
- **AI Integration (xAI Grok)**: Admin configuration panel for xAI (Grok) API key, model selection, temperature, max tokens, and custom system prompts. AI-powered candidate analysis feature compares job requirements with candidate CVs, providing match percentages, summaries, strengths, weaknesses, and recommendations.

### Technology Stack
- **Frontend**: React, TypeScript, Vite, Shadcn UI, Tailwind CSS, TanStack Query, React Hook Form, Zod.
- **Backend**: Express, TypeScript.
- **Database**: PostgreSQL (Neon-backed Replit database) with Drizzle ORM.

## External Dependencies
- **PostgreSQL**: Primary relational database.
- **Replit Object Storage**: For storing static assets like user photos and company logos (bucket: `operlist-storage`).
- **SMTP**: For email notifications and password recovery (e.g., Gmail SMTP).
- **Vite**: Frontend build tool.
- **Tailwind CSS**: Utility-first CSS framework.
- **Shadcn UI**: UI component library.
- **TanStack Query (React Query)**: Data fetching and state management.
- **React Hook Form**: Form management library.
- **Zod**: Schema validation library.
- **Drizzle ORM**: Object-Relational Mapper for database interaction.
- **express-session**: Middleware for session management.
- **cookie-parser**: Middleware for parsing cookies.
- **jsPDF**: Client-side PDF generation.
- **bcrypt**: For password hashing.
- **xAI Grok**: For AI-powered candidate analysis.
- **Recharts**: For data visualization in the admin dashboard.