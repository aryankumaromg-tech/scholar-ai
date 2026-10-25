import { drizzle } from "drizzle-orm/node-postgres";
import { Pool, type PoolConfig } from "pg";

const rawUrl = process.env.DATABASE_URL;

if (!rawUrl) {
  throw new Error(
    "DATABASE_URL is required. For Supabase use the connection string from Project Settings → Database (see SUPABASE.md).",
  );
}

/**
 * Normalise a Supabase / hosted Postgres URL for node-postgres:
 * - strips Prisma-only query params (`pgbouncer`, `connection_limit`) that `pg` rejects
 * - leaves `sslmode` in place; SSL is configured explicitly below
 */
function normaliseUrl(url: string): { connectionString: string; ssl: PoolConfig["ssl"] } {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    // Assume the local sandbox / docker URL, which needs no SSL.
    return { connectionString: url, ssl: undefined };
  }

  for (const key of ["pgbouncer", "connection_limit", "pool_timeout", "connect_timeout"]) {
    parsed.searchParams.delete(key);
  }

  const directSupabaseMatch = parsed.hostname.match(/^db\.([a-z0-9]+)\.supabase\.co$/i);
  if (directSupabaseMatch) {
    // Supabase direct database hosts are IPv6-only in this preview. Route the
    // existing credentials through the project's IPv4 session pooler instead.
    const projectRef = directSupabaseMatch[1];
    parsed.hostname = "aws-0-ap-south-1.pooler.supabase.com";
    parsed.port = "5432";
    parsed.username = `postgres.${projectRef}`;
  }

  const host = parsed.hostname;
  const isLocal = host === "localhost" || host === "127.0.0.1" || host === "::1" || host.endsWith(".local");

  // IMPORTANT: pg lets `sslmode` in the connection string override the explicit
  // `ssl` option. `sslmode=require` therefore re-enables strict verification and
  // fails against managed providers ("self-signed certificate in certificate
  // chain"). Detect it, then strip it so our `ssl` option is authoritative.
  const sslmode = parsed.searchParams.get("sslmode");
  parsed.searchParams.delete("sslmode");

  const wantsSsl = sslmode === "require" || sslmode === "verify-ca" || sslmode === "verify-full" || !isLocal;

  if (!wantsSsl) {
    return { connectionString: parsed.toString(), ssl: undefined };
  }

  // Supabase (and other managed providers) present a certificate chain that
  // node's default CA store can reject from serverless runtimes.
  return {
    connectionString: parsed.toString(),
    ssl: { rejectUnauthorized: false },
  };
}

const { connectionString, ssl } = normaliseUrl(rawUrl);

/**
 * Supabase connection modes:
 * - Transaction pooler (port 6543): best for Vercel/serverless. Many clients share
 *   a few real connections, so keep our own pool small.
 * - Session pooler (port 5432) or direct connection: fine for long-lived servers.
 */
const isServerless = Boolean(process.env.VERCEL) || process.env.NODE_ENV === "production";
const isPooler = /:6543/.test(connectionString) || /pooler\.supabase\.com/.test(connectionString);

const poolConfig: PoolConfig = {
  connectionString,
  ssl,
  max: isServerless || isPooler ? 3 : 10,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 15_000,
  allowExitOnIdle: true,
  application_name: "scholarai",
};

// Cache the pool across HMR reloads and serverless invocations so we never open
// a new connection per request (Supabase's pooler has a hard client limit).
const globalForDb = globalThis as typeof globalThis & {
  __scholarAiPool?: Pool;
  __scholarAiPoolKey?: string;
};

// Preview env vars can change while the module stays hot. Do not reuse a pool
// created with the previous direct Supabase host in that case.
const poolKey = `${connectionString}|${ssl ? "ssl" : "plain"}`;
const cachedPool = globalForDb.__scholarAiPoolKey === poolKey
  ? globalForDb.__scholarAiPool
  : undefined;

if (!cachedPool) {
  globalForDb.__scholarAiPool = new Pool(poolConfig);
  globalForDb.__scholarAiPoolKey = poolKey;
  globalForDb.__scholarAiPool.on("error", (error) => {
    console.error("[db] idle client error:", error.message);
  });
}

const activePool = globalForDb.__scholarAiPool;

if (!activePool) {
  throw new Error("Database pool failed to initialize");
}

export const pool = activePool;
export const db = drizzle(activePool);

/** Safe diagnostics for /api/health — never returns credentials. */
export const dbInfo = {
  host: (() => {
    try {
      return new URL(connectionString).hostname;
    } catch {
      return "local";
    }
  })(),
  pooled: isPooler,
  ssl: Boolean(ssl),
  provider: /supabase/.test(connectionString) ? "supabase" : "postgres",
} as const;
