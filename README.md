# Spice Hut Dashboard

Production-ready Next.js dashboard for Spice Hut with JWT auth, AI call ingestion, menu management, and AI menu payload sync.

## Tech Stack
- Frontend: Next.js (React, App Router) + TailwindCSS
- Backend: Next.js API Routes (REST)
- Database: PostgreSQL + Prisma ORM
- Auth: JWT (HTTP-only cookie) + bcrypt password hashing

## Folder Structure
```text
app/
  (auth)/login/page.tsx
  (dashboard)/
    overview/page.tsx
    call-logs/page.tsx
    menu/page.tsx
    ai-settings/page.tsx
  api/
    auth/login|me|logout/route.ts
    call-log-webhook/route.ts
    call-logs/route.ts
    call-logs/export/route.ts
    menu/route.ts
    menu/[id]/route.ts
    ai-menu-payload/route.ts
    overview/route.ts
    upload/route.ts
components/
  dashboard/
    shell.tsx
    sidebar.tsx
  ui/
lib/
  auth.ts db.ts jwt.ts password.ts validators.ts sanitize.ts rate-limit.ts
prisma/schema.prisma
scripts/seed.ts
```

## Frontend Component Structure (Redesigned)
```text
app/(dashboard)/
  layout.tsx                # Server-authenticated shell wrapper
  overview/page.tsx         # Premium KPI grid + summary sections
  call-logs/page.tsx        # Hybrid row-card list + accordion details
  menu/page.tsx             # POS-style item cards + slide-in add/edit drawer
  ai-settings/page.tsx      # Minimal endpoint cards + copy fields + status pulse

components/dashboard/
  shell.tsx                 # Top bar + mobile sidebar state
  sidebar.tsx               # Fixed desktop nav + collapsible mobile nav

components/ui/
  button.tsx                # Customized shadcn-style primitive
  input.tsx
  textarea.tsx
  card.tsx
```

## Database Schema
Defined in `prisma/schema.prisma` with:
- `User` (Admin/Manager roles)
- `CallLog` (AI telephony events + transcription + order summary)
- `MenuItem` (availability, category, price, description)

## Required Environment Variables
Copy `.env.example` to `.env` and configure:
- `DATABASE_URL`
- `DIRECT_URL`
- `JWT_SECRET`
- `WEBHOOK_SECRET`
- `AI_MENU_TOKEN`
- `NEXT_PUBLIC_APP_URL`

### Supabase DB Connection Mapping
- `DATABASE_URL`: Supabase pooler URL (port `6543`) for app runtime.
- `DIRECT_URL`: Supabase direct URL (port `5432`) for Prisma migrate/generate commands.
- Add `sslmode=require` in both URLs.

## Setup
```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

## Supabase Setup (Recommended for this project)
1. Create a Supabase project.
2. In Supabase Dashboard, open: `Project Settings -> Database -> Connection string`.
3. Copy both:
- Pooled connection string -> set as `DATABASE_URL`
- Direct connection string -> set as `DIRECT_URL`
4. Run:
```bash
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
```

Import full menu from CSV:
```bash
npm run menu:import
```

Default seeded admin:
- Email: `admin@spicehut.com`
- Password: `Password123!`

## API Endpoints
### Authentication
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

### AI Telephony
- `POST /api/call-log-webhook` (header: `x-webhook-secret`)
- `GET /api/call-logs`
- `GET /api/call-logs/export` (CSV)

### Menu
- `GET /api/menu`
- `POST /api/menu`
- `PATCH /api/menu/:id`
- `DELETE /api/menu/:id`
- `POST /api/upload` (image upload; for production use S3/R2 storage adapter)

### AI Menu Sync
- `GET /api/ai-menu-payload` (header: `x-ai-menu-token`)

### Dashboard KPI
- `GET /api/overview`

## Security Controls
- bcrypt password hashing
- JWT in HTTP-only cookies
- middleware protected routes
- webhook secret validation
- webhook rate limiting
- schema validation with Zod
- input sanitization
- security headers in `next.config.js`

## GoHighLevel AI Integration
- Configure the AI agent to push call data to `POST /api/call-log-webhook`
- Configure menu sync pull to `GET /api/ai-menu-payload`
- Include required auth headers (`x-webhook-secret`, `x-ai-menu-token`)

## Deployment
1. Provision PostgreSQL (Supabase/Neon/RDS)
2. Set all env vars in deployment platform
3. Build and run migrations during deploy:
```bash
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
npm run start
```
4. Host on Vercel, Railway, Render, or Dockerized Node runtime with HTTPS enabled.
