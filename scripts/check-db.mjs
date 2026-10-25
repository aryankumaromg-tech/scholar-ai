#!/usr/bin/env node
/**
 * Diagnose a Postgres/Supabase connection string end to end.
 *
 *   node scripts/check-db.mjs "postgresql://..."
 *   DATABASE_URL="postgresql://..." node scripts/check-db.mjs
 *
 * Tests, in order: URL parse → DNS → TCP → TLS → auth → tables.
 * Prints the failing stage with a concrete fix. Never prints the password.
 */
import { Client } from "pg";
import { lookup } from "node:dns/promises";
import net from "node:net";

const raw = process.argv[2] ?? process.env.DATABASE_URL;
if (!raw) {
  console.error("Missing connection string. Pass it as an argument or set DATABASE_URL.");
  process.exit(2);
}

const mask = (url) => {
  try {
    const u = new URL(url);
    if (u.password) u.password = "***";
    return u.toString();
  } catch {
    return "<unparseable>";
  }
};

const ok = (m) => console.log(`  \x1b[32m✓\x1b[0m ${m}`);
const bad = (m) => console.log(`  \x1b[31m✗\x1b[0m ${m}`);
const info = (m) => console.log(`  \x1b[2m·\x1b[0m ${m}`);
const stage = (m) => console.log(`\n\x1b[1m${m}\x1b[0m`);

console.log(`\nChecking ${mask(raw)}`);

let url;
try {
  url = new URL(raw);
  ok("URL parses");
} catch {
  bad("URL is not parseable — special characters in the password must be percent-encoded");
  console.log('    encode: postgresql://user:' + encodeURIComponent("p@ss#word") + "@host:6543/postgres");
  process.exit(1);
}

const host = url.hostname;
const port = Number(url.searchParams.get("port") ?? url.port ?? 5432);
const user = decodeURIComponent(url.username);
const isPooler = /pooler\.supabase\.com$/.test(host) || port === 6543;
const isDirectSupabase = /^db\.[a-z0-9]+\.supabase\.co$/i.test(host);

info(`host ${host}:${port} · user ${user} · database ${url.pathname.replace(/^\//, "") || "postgres"}`);
if (/supabase/.test(host)) {
  if (isPooler) ok("using Supabase pooler");
  else if (isDirectSupabase) bad("direct Supabase host (db.<ref>.supabase.co) is IPv6-only — switch to the pooler");
  if (isPooler && !/^postgres\.[a-z0-9]+$/.test(user) && user !== "postgres") {
    bad(`pooler username looks wrong ("${user}") — expected postgres.<project-ref>`);
  }
}

stage("DNS");
let addresses;
try {
  addresses = await lookup(host, { all: true });
  ok(`resolved ${addresses.map((a) => `${a.address} (v${a.family})`).join(", ")}`);
} catch (error) {
  bad(`cannot resolve host: ${error.code ?? error.message}`);
  console.log("    · Supabase direct hosts are IPv6-only; serverless runtimes often have no IPv6.");
  console.log("    · Use the pooler host: aws-0-<region>.pooler.supabase.com");
  process.exit(1);
}
const ipv4 = addresses.find((a) => a.family === 4);
if (!ipv4) bad("no IPv4 address — many hosts cannot reach this endpoint");

stage("TCP");
await new Promise((resolve) => {
  const socket = net.connect({ host: ipv4?.address ?? host, port });
  socket.setTimeout(8000);
  socket.once("connect", () => {
    ok(`port ${port} open`);
    socket.destroy();
    resolve();
  });
  socket.once("timeout", () => {
    bad("connection timed out — check the port and that the project is not paused");
    socket.destroy();
    resolve();
  });
  socket.once("error", (error) => {
    bad(`cannot connect: ${error.code ?? error.message}`);
    console.log("    · 6543 = transaction pooler, 5432 = session pooler / direct");
    socket.destroy();
    resolve();
  });
});

const isLocalHost = /^(localhost|127\.0\.0\.1|::1)$/.test(host);

// A bare TLS handshake is not a valid Postgres connection: the driver first
// sends an SSLRequest and only then upgrades. Probing TLS directly produces
// false failures (e.g. ERR_SSL_WRONG_VERSION_NUMBER against Supabase's pooler),
// so TLS is verified by the real client in the next stage instead.
stage("TLS");
if (isLocalHost) info("not used for localhost");
else info("negotiated by the driver during the connection below");

stage("Auth + query");
let client;
try {
  const clean = new URL(raw);
  for (const k of ["pgbouncer", "connection_limit", "pool_timeout", "sslmode"]) clean.searchParams.delete(k);
  client = new Client({
    connectionString: clean.toString(),
    ssl: /localhost|127\.0\.0\.1/.test(host) ? undefined : { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
    application_name: "scholarai-check",
  });
  await client.connect();
  ok("connected");
  const version = await client.query("select version() as v");
  info(version.rows[0].v.split(",")[0]);
  const current = await client.query("select current_database() as db, current_user as usr");
  info(`database ${current.rows[0].db} as ${current.rows[0].usr}`);
} catch (error) {
  const message = error.message ?? String(error);
  bad(`failed: ${message}`);
  if (/tenant\/user .* not found/i.test(message)) {
    console.log("    · Reached the pooler, but the username is unknown.");
    console.log("    · Use postgres.<project-ref> (the ref is in your project URL).");
  } else if (/password authentication failed/i.test(message)) {
    console.log("    · Wrong password. Reset it in Supabase → Settings → Database, then URL-encode it.");
  } else if (/tenants? not found|project .* not found/i.test(message)) {
    console.log("    · The project ref in the host/username does not exist or was deleted.");
  } else if (/self signed|SELF_SIGNED/i.test(message)) {
    console.log("    · Remove sslmode=require from the URL; the app configures SSL explicitly.");
  }
  process.exit(1);
}

stage("Schema");
const expected = ["papers", "analyses", "catalog_papers", "research_notes"];
try {
  const result = await client.query(
    "select table_name from information_schema.tables where table_schema = 'public'",
  );
  const found = new Set(result.rows.map((r) => r.table_name));
  for (const table of expected) {
    if (found.has(table)) ok(table);
    else bad(`${table} — run: DATABASE_URL="<session pooler url>" npx drizzle-kit push`);
  }
  const missing = expected.filter((t) => !found.has(t));
  if (missing.length === 0) {
    const count = await client.query("select count(*)::int as n from catalog_papers");
    info(`catalog_papers has ${count.rows[0].n} rows ${count.rows[0].n === 0 ? "(seeds on first page load)" : ""}`);
  }
} catch (error) {
  bad(`could not inspect schema: ${error.message}`);
} finally {
  await client.end();
}

console.log("\n\x1b[32mDone.\x1b[0m Run `curl -s <deployment>/api/health` to confirm the app sees it too.\n");
