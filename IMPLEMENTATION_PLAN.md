# The Dividend — Implementation Plan

## Architecture Overview

```
/app
  /(public)           → Public pages (home, blog, bookstore, article, contact)
  /(auth)             → Auth pages (login, signup, callback)
  /(dashboard)        → Protected pages (profile, bookmarks, messages, settings)
  /(admin)            → Admin pages (dashboard, write, manage)
  /api                → API routes (paystack webhook, notifications, etc.)
/components
  /ui                 → Reusable UI primitives (Button, Input, Modal, etc.)
  /layout             → Header, Footer, Sidebar
  /home               → Homepage-specific sections
  /articles           → Article cards, comments, etc.
  /bookstore          → Book cards, checkout
  /admin              → Dashboard cards, post editor
  /messages           → Chat UI
  /notifications      → Notification bell, list
/lib
  /supabase           → Client & server Supabase configs
  /utils              → Helpers (slugify, format date, etc.)
  /types              → TypeScript interfaces
  /hooks              → Custom hooks
  /constants          → App constants
/public               → Static assets
```

## Phase 1: Foundation (Current)
1. ✅ Dependencies installed
2. Create Supabase client configs
3. Create database schema SQL
4. Create TypeScript types
5. Create .env.example
6. Set up global styles & design tokens
7. Set up fonts (serif + sans)
8. Create UI primitives

## Phase 2: Layout & Navigation
1. Header (sticky, responsive, user dropdown)
2. Footer
3. Dark mode toggle
4. Mobile menu

## Phase 3: Pages
1. Home page (hero, categories, articles, editor's picks)
2. Blog/Articles listing page
3. Article detail page
4. Bookstore page
5. Book detail page
6. Auth pages (login, signup)
7. Profile page
8. Admin dashboard
9. Write/Edit post page
10. Messages page
11. Contact page

## Phase 4: Features
1. Auth (Supabase + Google OAuth)
2. Comments system
3. Bookmarks
4. Messaging
5. Notifications
6. Search
7. Paystack integration
8. Rich text editor (TipTap)

## Phase 5: Polish
1. SEO meta tags
2. Error boundaries
3. Loading states
4. Empty states
5. Responsive polish
6. Performance optimization
