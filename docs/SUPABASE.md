# Supabase — Shima AK

## Project

| Setting | Value |
|--------|--------|
| Project ref | `idnehwkrufbgfmlkexvi` |
| API URL | `https://idnehwkrufbgfmlkexvi.supabase.co` |

Local env: copy `.env.example` → `.env` and set `VITE_SUPABASE_PUBLISHABLE_KEY` from **Project Settings → API → anon public**.

## Apply database schema (required once)

The new project is **empty** until migrations run. Choose one method:

### Option A — Supabase CLI (recommended)

```bash
npm run supabase:link    # enter DB password from Dashboard → Settings → Database
npm run supabase:push
```

Or: `npx supabase login` then `npx supabase link --project-ref idnehwkrufbgfmlkexvi` then `npx supabase db push`

### Option B — SQL Editor (no CLI)

1. If a previous run **failed partway**, run `supabase/RESET_BEFORE_BOOTSTRAP.sql` first (does not delete storage buckets — that must be done in Dashboard → Storage if needed).
2. Open [SQL Editor](https://supabase.com/dashboard/project/idnehwkrufbgfmlkexvi/sql/new)
3. Paste **`supabase/FRESH_PROJECT_BOOTSTRAP.sql`** (entire file) and **Run once**

Regenerate the file after migration changes: `npm run supabase:bootstrap-sql`

### Verify

```bash
npm run dev
```

Properties should load without `PGRST205` / missing table errors.

### Storage buckets

After migrations, create in the dashboard (or via MCP):

- `property-images` — public read for listing photos/videos
- `banners` — public read for hero banners (if used)

## Supabase MCP (Cursor)

Config: `.cursor/mcp.json` scopes MCP to this project.

1. Open **Cursor Settings → Tools & MCP**
2. Enable the **supabase** server (OAuth login when prompted)
3. Restart Cursor if tools do not appear
4. In Composer, type `@` and look for Supabase tools (SQL, migrations, types, etc.)

MCP URL: `https://mcp.supabase.com/mcp?project_ref=idnehwkrufbgfmlkexvi`

## Regenerate TypeScript types

After schema changes:

```bash
npx supabase gen types typescript --project-id idnehwkrufbgfmlkexvi > src/integrations/supabase/types.ts
```

## Admin user

Default credentials (change after first login in production):

- Email: `admin@admin.com`
- Password: `123456`

### Option A — Script (recommended)

1. Add `SUPABASE_SERVICE_ROLE_KEY` to `.env` from [API Settings](https://supabase.com/dashboard/project/idnehwkrufbgfmlkexvi/settings/api) (service_role, secret).
2. Run:

```bash
npm run admin:create
```

### Option B — Dashboard manually

1. **Authentication → Users → Add user** — email `admin@admin.com`, password `123456`, enable **Auto Confirm**.
2. Run `supabase/seed_admin_role.sql` in the SQL Editor.

### Login URLs

- Arabic: `/لوحة-التحكم/تسجيل-الدخول`
- English: `/admin/login`
