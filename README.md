# humanities-in-tech-optimizer

Day 1 MVP for a humanities-to-tech CV and cover letter optimizer.

## What this includes (today)

- Supabase email magic-link auth
- Simple dashboard of applications
- Bounded application form (not chat)
- Save/create draft flow to Supabase
- Placeholder generation fields stored in DB

## Stack

- React + TypeScript + Vite
- Supabase Auth + Postgres
- Cloudflare Pages deployment target (static frontend)

## Local setup

1. Install deps:

```bash
npm install
```

2. Copy env file and fill values:

```bash
cp .env.example .env
```

3. Run app:

```bash
npm run dev
```

## Supabase setup

1. Create a Supabase project.
2. In Supabase SQL Editor, run `supabase/schema.sql`.
3. In Supabase Auth settings, enable Email auth + Magic Link.
4. Add your local + production URLs to redirect allow-list.

## Deploy to Cloudflare Pages

- Build command: `npm run build`
- Build output directory: `dist`
- Environment variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
