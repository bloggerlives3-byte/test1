# PicVault MVP (Next.js + Supabase)

A privacy-first image host: drag-and-drop uploads, instant share links, and optional expirations (24h, 7d, or permanent). Built with Next.js App Router, Tailwind, and Supabase storage.

## Quick start
1) Install deps (allow a minute for downloads): `npm install`
2) Copy envs: `cp .env.example .env.local` and fill in Supabase credentials.
3) Start dev server: `npm run dev` → app at http://localhost:3000.

## Environment variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=images
ADMIN_METRICS_KEY=picvault-admin
```

## Supabase setup
1) **Create a storage bucket** named `images` (public).  
2) **Create the table**:
```sql
create table if not exists public.images (
  id uuid primary key,
  path text not null,
  public_url text not null,
  filename text not null,
  size bigint,
  content_type text,
  expires_at timestamp with time zone,
  created_at timestamp with time zone default now()
);
```
3) **Policies** (MVP: allow inserts from service role, selects for anon feed):
```sql
-- allow read for anonymous (for the public feed)
create policy "Public read images" on public.images
for select using (true);

-- service role will bypass RLS for inserts; keep RLS enabled elsewhere.
```

## Features delivered
- Drag & drop uploader with file validation (JPG/PNG/GIF/WebP, max 10MB).
- Expiry controls: 24h, 7d, or permanent; stored alongside metadata.
- Session gallery (persists in this browser only) plus a global “Vault pulse” feed (latest 12).
- Instant share links with copy-to-clipboard.
- Lightweight admin snapshot (counts, storage used, upcoming expiries).
- Zero tracking/analytics; privacy badges surfaced in UI.

## API routes
- `POST /api/upload` — receives `file` (FormData) + `expiresIn` (`24h` | `7d` | `permanent`), uploads to Supabase storage, stores metadata, returns `{ id, url, expiresAt }`.
- `GET /api/images` — returns the latest 12 records for the global feed.

## Notes & next steps
- Add cron to purge expired objects + rows (Supabase scheduled function or external job).
- Harden validation (image type sniffing, size limits per plan).
- Gate admin metrics with a key or session-based auth once available.
