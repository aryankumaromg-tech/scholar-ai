import { db, dbInfo } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

interface DbFailure {
  message: string;
  code?: string;
  hint?: string;
}

/** Drizzle wraps driver errors, so walk the cause chain to surface the real reason. */
function describeError(error: unknown): DbFailure {
  let current: unknown = error;
  let message = "Unknown database error";
  let code: string | undefined;

  for (let depth = 0; current && depth < 5; depth += 1) {
    const candidate = current as { message?: string; code?: string; cause?: unknown };
    if (candidate.message) message = candidate.message;
    if (candidate.code) code = candidate.code;
    current = candidate.cause;
  }

  const hints: Record<string, string> = {
    ENOTFOUND: "Host could not be resolved. Use the pooler host (…pooler.supabase.com) instead of db.<ref>.supabase.co.",
    ECONNREFUSED: "Nothing is listening on that host/port. Check the port (6543 = transaction pooler, 5432 = session).",
    ETIMEDOUT: "Connection timed out. Confirm the project is not paused and the region is reachable.",
    "28P01": "Password authentication failed. URL-encode special characters and include the project ref in the username (postgres.<ref>).",
    "28000": "Connection rejected — verify the Supabase database password and that the user exists.",
    "3D000": "Database does not exist. Supabase uses the database named postgres.",
    "42501": "Insufficient privilege for this role.",
    ECONNRESET: "Connection reset — likely TLS or pooler limits. Keep sslmode=require and reduce pool size.",
    DEPTH_ZERO_SELF_SIGNED_CERT: "TLS certificate rejected. Managed providers need ssl: { rejectUnauthorized: false }.",
    SELF_SIGNED_CERT_IN_CHAIN: "TLS chain not trusted. Managed providers need ssl: { rejectUnauthorized: false }.",
  };

  // Supabase's pooler answers (proving DNS + TLS worked) but rejects an unknown
  // tenant, which is almost always a malformed username.
  const tenantHint = /tenant\/user\s+\S+\s+not found/i.test(message)
    ? "Reached the Supabase pooler, but the username is unknown. Use postgres.<project-ref> and confirm the password is URL-encoded."
    : /password authentication failed/i.test(message)
      ? "Password rejected — check the Supabase database password and URL-encode special characters."
      : undefined;

  return { message, code, hint: tenantHint ?? (code ? hints[code] : undefined) };
}

export async function GET() {
  const startedAt = Date.now();
  const base = {
    provider: dbInfo.provider,
    host: dbInfo.host,
    pooled: dbInfo.pooled,
    ssl: dbInfo.ssl,
  };

  try {
    await db.execute(sql`select 1`);
    return Response.json({
      ok: true,
      database: { status: "up", latencyMs: Date.now() - startedAt, ...base },
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        database: {
          status: "down",
          latencyMs: Date.now() - startedAt,
          ...base,
          ...describeError(error),
        },
      },
      { status: 500 },
    );
  }
}
