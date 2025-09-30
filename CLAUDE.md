# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 time tracking application built with TypeScript, Prisma (PostgreSQL), NextAuth.js, and Tailwind CSS. The app allows users to track work tasks with time logging, client management, and reporting features. It includes role-based access control with ADMIN and USER roles.

## Commands

**Development:**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

**Database:**
```bash
npx prisma generate  # Generate Prisma client (runs automatically on postinstall)
npx prisma migrate dev --name <migration_name>  # Create and apply migration
npx prisma studio    # Open Prisma Studio for database inspection
npx prisma db push   # Push schema changes without creating migration
```

## Architecture

### Directory Structure

- `app/` - Next.js 15 App Router directory
  - `api/` - API routes (tasks, users, clients, auth)
  - `admin/` - Admin-only pages (protected by role check in layout)
  - `components/` - Shared React components
  - `lib/` - Core utilities (auth.ts, prisma.ts)
  - `auth.ts` - NextAuth configuration export
  - `page.tsx` - Landing/login page
  - `dashboard/` - User dashboard
  - `reports/` - Reporting with PDF export
  - `tasks/` - Task management pages
- `prisma/schema.prisma` - Database schema
- `middleware.ts` - NextAuth middleware for route protection
- `types/` - TypeScript type definitions

### Authentication & Authorization

**Authentication:**
- Uses NextAuth.js v4 with JWT strategy
- Credentials provider with bcryptjs for password hashing
- Session configuration in `app/lib/auth.ts` (exported via `app/auth.ts`)
- Custom login page at `/login`

**Authorization:**
- Role-based access control: ADMIN and USER roles
- Middleware protects routes: `/dashboard`, `/reports`, `/users`, `/api/tasks`, `/api/users`
- Admin layout (`app/admin/layout.tsx`) checks `session.user.role === 'ADMIN'` and redirects if unauthorized
- Session extended with `id` and `role` via JWT callback

**Getting session:**
```typescript
// Server components
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth';
const session = await getServerSession(authOptions);

// Client components
import { useSession } from 'next-auth/react';
const { data: session } = useSession();
```

### Database Models

Core entities in Prisma schema:
- **User**: Has role (ADMIN/USER), password (hashed), tasks, clients (via UserClient), organizationId
- **Task**: Tracks title, description, startTime, endTime, duration, belongs to User and Client
- **Client**: Has name, email, phone, address; linked to Users via UserClient junction table
- **UserClient**: Many-to-many relationship between Users and Clients
- **Organization**: Groups users, clients, and tasks
- **Account/Session**: NextAuth models for authentication

### API Routes

All API routes follow Next.js 15 conventions with async params. Common patterns:

**Authentication check:**
```typescript
const session = await getServerSession(authOptions);
if (!session) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

**Key endpoints:**
- `GET/POST /api/tasks` - User's own tasks
- `GET /api/tasks/all` - All tasks (with filters: startDate, endDate, clientId, userId)
- `GET/PUT/DELETE /api/tasks/[id]` - Specific task operations
- `POST /api/tasks/[id]/stop` - Stop a running task
- `GET/POST /api/clients` - Client management
- `GET/PUT/DELETE /api/clients/[id]` - Specific client operations
- `GET/POST /api/users` - User management
- `GET/PUT/DELETE /api/users/[id]` - Specific user operations
- `GET /api/users/[id]/clients` - User's assigned clients

**Route params in Next.js 15:**
Dynamic route params are now async Promises:
```typescript
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // use id...
}
```

### Database Connection

Prisma client is instantiated as a singleton in `app/lib/prisma.ts` to prevent connection exhaustion in development. Import with:
```typescript
import prisma from '@/app/lib/prisma';
```

**Note:** Some API routes incorrectly create `new PrismaClient()` directly. Use the singleton from `@/app/lib/prisma` instead.

### State Management & Data Fetching

- Client components use `fetch` with `credentials: 'include'` for authenticated requests
- No global state library; local state with React hooks
- Reports page (`app/reports/page.tsx`) demonstrates filtering patterns with URL search params

### UI Components

- Tailwind CSS for styling
- Recharts for data visualization
- react-to-pdf for PDF report generation
- Forms use controlled inputs with Tailwind form plugin
- Polish language used in UI

### Environment Variables

Required environment variables (create `.env` file):
```
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="<generate-random-secret>"
NEXTAUTH_URL="http://localhost:3000"
```

### Configuration Files

- `next.config.js` - Output mode: standalone, ignore-loader for HTML files
- `tsconfig.json` - Path alias: `@/*` maps to project root
- `middleware.ts` - Protects authenticated routes with NextAuth

### Polish Language

UI is in Polish (e.g., "Zadania", "Klienci", "Użytkownicy", "Raporty"). When adding features, maintain Polish labels and messages.
