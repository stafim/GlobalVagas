# Design Guidelines: Global Job Board Platform

## Design Approach
**System-Based Approach**: Using Material Design principles adapted for a data-intensive job platform. Drawing patterns from LinkedIn, Indeed, and AngelList for proven job search experiences while maintaining modern aesthetics.

## Core Design Principles
1. **Information Clarity**: Scannable job cards with clear visual hierarchy
2. **Efficient Navigation**: Quick filtering and search without overwhelming users
3. **Global Accessibility**: Intuitive for international audiences with bilingual support
4. **Trust & Professionalism**: Clean, credible interface that employers and candidates trust

---

## Layout System

### Spacing Scale
Use Tailwind units: **2, 3, 4, 6, 8, 12, 16** for consistent rhythm
- Compact spacing (2, 3, 4): Card internals, badges, small gaps
- Medium spacing (6, 8): Between sections, component padding
- Large spacing (12, 16): Page margins, section separation

### Grid Structure
- **Container**: `max-w-7xl mx-auto px-4 md:px-6 lg:px-8`
- **Search/Filters**: Fixed sidebar (320px) + flexible main content
- **Job Listings**: Single column cards on mobile, maintain single column on desktop for scannability
- **Homepage**: Multi-section layout with featured jobs, stats, categories

---

## Typography Hierarchy

### Font System
- **Primary Font**: Inter (via Google Fonts CDN) - excellent for UI and data display
- **Accent Font**: DM Sans - for headlines and company names

### Type Scale
```
Headings:
- H1: text-4xl md:text-5xl font-bold (Page titles)
- H2: text-2xl md:text-3xl font-bold (Section headers)
- H3: text-xl font-semibold (Job titles, card headers)
- H4: text-lg font-semibold (Subsections)

Body:
- Large: text-base (Job descriptions, primary content)
- Regular: text-sm (Company info, metadata, filters)
- Small: text-xs (Tags, timestamps, secondary info)

Special:
- Salary/Compensation: text-lg font-bold
- Location: text-sm with icon prefix
- Company Name: text-base font-medium
```

---

## Component Library

### Navigation Header
- **Sticky header** with logo, main search bar, language toggle (PT/EN), "Post Job" CTA
- Search bar: Full-width on mobile, centered max-w-2xl on desktop with search icon
- Mobile: Hamburger menu with slide-out navigation

### Job Cards (Primary Component)
**Structure for each card:**
- Company logo (48x48px rounded)
- Job title (H3)
- Company name + verification badge
- Location with map pin icon + Remote/Hybrid/Onsite badge
- Salary range (if available)
- Contract type badge (Full-time, Part-time, Contract, Freelance)
- 2-line job description excerpt
- Posted time + Application count
- Bookmark icon (top-right)
- Border on hover, subtle shadow lift

**Layout**: `p-6 rounded-lg border` with `gap-3` internal spacing

### Filter Sidebar
**Filter Groups (collapsible accordions):**
- Search by keyword (text input with icon)
- Location (country dropdown + city autocomplete)
- Work Type (checkboxes: Remote, Hybrid, Onsite)
- Job Category (multi-select with popular options)
- Experience Level (Junior, Mid, Senior, Lead)
- Salary Range (dual-range slider)
- Posted Date (radio buttons: 24h, Week, Month, Any)

Active filters shown as dismissible badges above results

### Job Detail Page
**Two-column layout on desktop:**
- **Main Column (2/3 width):**
  - Job title (H1)
  - Company info bar with logo, name, industry, size
  - Salary + benefits badges
  - Full job description with formatted sections
  - Requirements (bulleted list)
  - Responsibilities (bulleted list)
  - "About Company" section
  
- **Sidebar (1/3 width, sticky):**
  - "Apply Now" CTA button (large, prominent)
  - Quick stats (posted date, applicants, views)
  - Location details + map embed
  - Share buttons
  - Similar jobs widget

### Interactive Map
- **Homepage Section**: Full-width map showing job density by country
- Hover states showing job count
- Click to filter by region
- Legend with job count indicators

### Category Browse Section
Grid of category cards (2 cols mobile, 4 cols desktop):
- Icon representing category (from Heroicons)
- Category name
- Job count badge
- Background with subtle pattern

### Stats Banner
Horizontal row showing platform metrics:
- Active Jobs | Companies | Countries | Average Salary
- Large numbers with animated counter on scroll
- Icons from Heroicons

### Footer
**Comprehensive footer with:**
- Logo + tagline
- Quick links (Browse Jobs, Post Job, Companies, About, Contact)
- Location links (Jobs by Country - top 8 countries)
- Category links (Jobs by Industry - top 6)
- Newsletter signup (email input + subscribe button)
- Social media icons
- Language selector
- Trust badges (secure, verified employers)
- Copyright + legal links

---

## Forms & Inputs

### Search Input
- Large size (h-12), rounded-lg
- Left icon (search), right button (CTA)
- Placeholder text with examples

### Filter Controls
- **Checkboxes**: Custom styled, 20x20px with check icon
- **Dropdowns**: Native select enhanced with chevron icon
- **Range Sliders**: Custom dual-thumb for salary range
- All form elements: `rounded-md` with consistent padding

### Apply/CTA Buttons
- **Primary**: Large (h-12 md:h-14), rounded-lg, full-width on mobile
- **Secondary**: Medium (h-10), outlined style
- **Icon Buttons**: Square (40x40px) for bookmark, share

---

## Icons
**Heroicons** (via CDN) - outline style for consistency:
- Search, map-pin, briefcase, clock, users, currency-dollar
- Building-office, globe, filter, chevron-down, x-mark, bookmark
- All icons: 20x20px (small), 24x24px (regular)

---

## Images

### Hero Section
**Large hero image**: Full-width, gradient overlay
- Image: Diverse professionals collaborating in modern office/remote setting
- Height: 60vh on desktop, 40vh on mobile
- Overlay gradient for text readability
- Centered search bar with blurred background card (backdrop-blur-md)
- Headline: "Find Your Dream Job Anywhere in the World"
- Subheading with job count stat

### Company Logos
Displayed in job cards and detail pages:
- Square format, 48x48px (cards), 80x80px (detail page)
- Rounded corners, subtle border
- Fallback: Company initial in colored circle

### Map Visualization
Interactive world map in homepage section showing job density

### Category/Industry Icons
Illustrative icons or simple graphics representing job categories (tech, healthcare, finance, etc.)

---

## Responsive Behavior

### Breakpoints
- Mobile: Base styles (single column, stacked filters)
- Tablet (md: 768px): Two-column layouts emerge
- Desktop (lg: 1024px): Full sidebar + main content, multi-column grids
- Wide (xl: 1280px): Max container width, optimal spacing

### Mobile Considerations
- Bottom sheet for filters (slide up)
- Sticky "Show Results" button when filtering
- Simplified job cards with essential info only
- Tap-friendly targets (minimum 44x44px)

---

## Animations
**Minimal, purposeful motion:**
- Page transitions: Fade in content (200ms)
- Card hover: Subtle lift with shadow (150ms ease)
- Filter apply: Smooth height transition
- Counter animation: Stats number increment on view

No decorative animations, parallax, or complex scroll effects.

---

This design creates a professional, scannable job platform that prioritizes information density and user efficiency while maintaining visual appeal and trust signals essential for both job seekers and employers.