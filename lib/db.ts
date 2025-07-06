import postgres from "postgres"

/**
 * Uses the pure-JavaScript "postgres" client (no native bindings, so it
 * deploys on Vercel without `libpq` / node-gyp issues).
 *
 * SUPABASE_DB_URL must be a full Postgres connection string, e.g.
 *  postgresql://postgres:<password>@db.xxx.supabase.co:5432/postgres
 */
const conn = process.env.SUPABASE_DB_URL
if (!conn) {
  throw new Error("Missing SUPABASE_DB_URL – copy it from Supabase → Settings → Database.")
}

// Create a singleton so we don't open many connections during hot-reloads
export const db = postgres(conn, {
  ssl: "require",
  max: 1, // Limit connections for serverless
})
