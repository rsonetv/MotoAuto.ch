import postgres from "postgres"

/**
 * Uses the pure-JavaScript "postgres" client (no native bindings, so it
 * deploys on Vercel without `libpq` / node-gyp issues).
 *
 * SUPABASE_DB_URL must be a full Postgres connection string, e.g.
 *  postgresql://postgres:<password>@db.xxx.supabase.co:5432/postgres
 */

// Create a mock DB client for build time
class MockDB {
  async query(sql: string, ...params: any[]) {
    console.log("Mock DB query:", sql, params);
    return [];
  }
}

// For build time, use a mock DB client
let db: any;

// Check if we're in a build environment
if (process.env.NODE_ENV === "production" && process.env.VERCEL_ENV === "preview") {
  console.log("Using mock DB client for build");
  db = new MockDB();
} else {
  // For runtime, use the real DB client
  const conn = process.env.SUPABASE_DB_URL || "postgresql://postgres:password@localhost:5432/postgres";
  
  // Create a singleton so we don't open many connections during hot-reloads
  db = postgres(conn, {
    ssl: "require",
    max: 1, // Limit connections for serverless
  });
}

export { db };
