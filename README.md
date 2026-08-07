# KCST Document Delivery Tracking System (FMS)

ระบบติดตามการรับส่งเอกสารภายในองค์กร (KCST: Cover List of Document & ETC. Delivery)

## Architecture Stack

- **Frontend**: Quasar Framework (Vue 3, Composition API, Pinia, TypeScript, SCSS)
- **Backend / DB**: Supabase (Postgres, Auth, RLS, Storage, Realtime)
- **UX**: Adaptive Layout (Mobile-first bottom tabs vs Desktop sidebar master-detail)

## Setup & Running

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Database Migration

Run `supabase/migrations/20260807_initial_schema.sql` in your Supabase SQL Editor.

### 4. Development Mode

```bash
npm run dev
```

### 5. Typecheck & Lint

```bash
npm run typecheck
npm run lint
```

### 6. Production Build

```bash
npm run build
```
