# Connecting ScholarAI to Supabase

The app talks to Postgres through Drizzle ORM + `node-postgres`. Supabase is a
drop-in replacement — you only change one environment variable.

## 1. Create the project

1. [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
2. Pick a region close to your deployment (same region as Vercel = lowest latency)
3. Save the database password — it appears **once**

## 2. Copy the right connection string

Supabase dashboard → **Project Settings → Database → Connection string**.

| Mode | Port | Use it for |
| --- | --- | --- |
| **Transaction pooler** | `6543` | **Vercel / serverless** — recommended default |
| Session pooler | `5432` | Long-lived servers, scripts, migrations |
| Direct connection | `5432` | Local tools, `drizzle-kit` (IPv6-only on newer projects) |

The URL looks like:

```bash
# transaction pooler
postgresql://postgres.<project-ref>:<PASSWORD>@aws-0-<region>.pooler.supabase.com:6543/postgres?sslmode=require
```

Three things matter:

- **Username includes the project ref:** `postgres.abcdefghijklmnop`, not plain `postgres`
- **Password must be URL-encoded** — `@`, `#`, `/`, `?` break a URL. Use
  `encodeURIComponent(password)`.
- **Keep `?sslmode=require`** — managed Postgres rejects unencrypted connections.

> If your connection string starts with `postgresql://postgres:<password>@db.<ref>.supabase.co:5432`,
> that is the **direct** host and is IPv6-only on newer projects. Serverless
> platforms and many home networks can't reach it — use the pooler instead.

## 3. Configure the environment

**Locally** — edit `.env`:

```bash
DATABASE_URL="postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?sslmode=require"
```

**On Vercel** — Project → Settings → Environment Variables:

```bash
vercel env add DATABASE_URL production
```

Apply it to Preview and Development too if you want previews to work.

## 4. Create the tables

The schema lives in `src/db/schema.ts`. Push it once:

```bash
DATABASE_URL="<session pooler or direct URL>" npx drizzle-kit push
```

Use the **session pooler / direct** connection for this step, not the
transaction pooler: DDL plus introspection is happier on a real session.

You should then see four tables in **Table editor**: `papers`, `analyses`,
`catalog_papers`, `research_notes`.

You do **not** need to seed the catalog by hand — `catalog_papers` fills itself
on the first page load (idempotent, `onConflictDoNothing`).

## 5. Verify

```bash
curl -s https://<your-deployment>/api/health | jq
```

```json
{
  "ok": true,
  "database": {
    "status": "up",
    "latencyMs": 42,
    "provider": "supabase",
    "host": "aws-0-eu-central-1.pooler.supabase.com",
    "pooled": true,
    "ssl": true
  }
}
```

`provider`, `pooled` and `ssl` are detected automatically from the URL, so you
can confirm you're on the pooler without leaking credentials.

## What the code already handles

`src/db/index.ts` normalises the connection so Supabase works with no code edits:

- enables SSL for managed hosts (Supabase, Neon, Vercel Postgres) and disables it for `localhost`
- strips Prisma-only params (`pgbouncer`, `connection_limit`, …) that `pg` rejects
- keeps the pool small (3 connections) in serverless/pooler mode so you stay under Supabase's client limit
- caches the pool on `globalThis` so HMR reloads and warm lambdas reuse connections
- logs idle-client errors instead of crashing the process

## Troubleshooting

| Symptom | Cause & fix |
| --- | --- |
| `password authentication failed` | Wrong password, or the project ref is missing from the username (`postgres.<ref>`) |
| `getaddrinfo ENOTFOUND db.<ref>.supabase.co` | Direct host is IPv6-only — switch to the pooler string |
| `self signed certificate in certificate chain` | Handled by the app; if you set `ssl` elsewhere, use `{ rejectUnauthorized: false }` |
| `too many connections` | Use the transaction pooler (6543), or lower `max` in `src/db/index.ts` |
| `relation "papers" does not exist` | Step 4 wasn't run against this database |
| Works locally, fails on Vercel | `DATABASE_URL` missing from the **Production** environment |
| Slow first response, fast after | Cold start + new pool; expected on serverless |

## Row Level Security

This app connects with the **database password** (a server-side role), so RLS
does not apply — there are no public Supabase client keys in the browser. If you
later add Supabase Auth and query from the client, enable RLS on all four tables
and add policies before exposing an `anon` key.
