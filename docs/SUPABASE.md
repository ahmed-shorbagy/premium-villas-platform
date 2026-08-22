# Supabase — Shima AK

## Project

| Setting | Value |
|--------|--------|
| Project ref | `pumuujvmjpcbipjnckoe` |
| API URL | `https://pumuujvmjpcbipjnckoe.supabase.co` |

Local env: copy `.env.example` → `.env` and set `VITE_SUPABASE_PUBLISHABLE_KEY` from **Project Settings → API → anon public**.

## Apply database schema (required once)

The new project is **empty** until migrations run. Choose one method:

### Option A — Supabase CLI (recommended)

```bash
npm run supabase:link    # enter DB password from Dashboard → Settings → Database
npm run supabase:push
```

Or: `npx supabase login` then `npx supabase link --project-ref pumuujvmjpcbipjnckoe` then `npx supabase db push`

> Production was bootstrapped without CLI migration-history rows. Do not run
> `db push` against the existing production project until its migration history
> has been reconciled; apply new idempotent migrations individually.

### Option B — SQL Editor (no CLI)

1. If a previous run **failed partway**, run `supabase/RESET_BEFORE_BOOTSTRAP.sql` first (does not delete storage buckets — that must be done in Dashboard → Storage if needed).
2. Open [SQL Editor](https://supabase.com/dashboard/project/pumuujvmjpcbipjnckoe/sql/new)
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

MCP URL: `https://mcp.supabase.com/mcp?project_ref=pumuujvmjpcbipjnckoe`

## Regenerate TypeScript types

After schema changes:

```bash
npx supabase gen types typescript --project-id pumuujvmjpcbipjnckoe > src/integrations/supabase/types.ts
```

## Admin user

### Option A — Script (recommended)

1. Add `SUPABASE_SERVICE_ROLE_KEY` to `.env` from [API Settings](https://supabase.com/dashboard/project/pumuujvmjpcbipjnckoe/settings/api) (service_role, secret).
2. Run:

```bash
npm run admin:create
```

### Option B — Dashboard manually

1. **Authentication → Users → Add user** — use a unique admin email and a password-manager-generated password, then enable **Auto Confirm**.
2. Run `supabase/seed_admin_role.sql` in the SQL Editor.

### Login URLs

- Arabic: `/لوحة-التحكم/تسجيل-الدخول`
- English: `/admin/login`

## Villa owner links

Owner access uses reusable bearer links. The raw secret is shown only when an
admin creates or rotates a link; the database stores only its SHA-256 hash.
Owners never receive direct table privileges: both Edge Functions and database
functions verify the token-to-villa assignment.

Deploy the owner backend after applying
`supabase/migrations/20260822093000_owner_access.sql`:

```bash
npx supabase functions deploy owner-access-admin
npx supabase functions deploy owner-portal
```

Production origins `https://nuzuul.com` and `https://www.nuzuul.com` are
allowed by default. Add preview/custom origins as a comma-separated function
secret when needed:

```bash
npx supabase secrets set OWNER_PORTAL_ALLOWED_ORIGINS=https://preview.example.com
```

Run the rollback-safe authorization test against the linked project:

```bash
npx supabase db query --linked --file supabase/tests/owner_access_security.sql
```

The database password that was previously embedded in repository scripts must
be rotated in **Project Settings → Database**. Backup/restore scripts now read
their connection strings only from environment variables.
