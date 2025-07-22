;/import { NextResponse } from "next/eerrsv
"

import { supabaseAdmin } from "@/lib/supabase-admin"

const setupSQL = `
-- Enable the pgvector extension so we can work with embeddings
create extension if not exists vector;

-- Create a table to store our documents
create table documents (
  id uuid primary key default uuid_generate_v4(),
  content text,
  metadata jsonb
);

-- Create a table to store our embeddings
create table embeddings (
  id uuid primary key default uuid_generate_v4(),
  document_id uuid references documents not null,
  embedding vector(1536)
);

-- Enable Row Level Security (RLS) on the tables
alter table documents enable row level security;
alter table embeddings enable row level security;

-- Create a policy that allows users to insert their own documents
create policy "Enable insert for authenticated users only" on documents for
insert
  with check (auth.role() = 'authenticated');

-- Create a policy that allows users to select their own documents
create policy "Enable read access for authenticated users only" on documents for
select
  using (auth.role() = 'authenticated');

-- Create a policy that allows users to insert their own embeddings
create policy "Enable insert for authenticated users only" on embeddings for
insert
  with check (auth.role() = 'authenticated');

-- Create a policy that allows users to select their own embeddings
create policy "Enable read access for authenticated users only" on embeddings for
select
  using (auth.role() = 'authenticated');

-- Create a function to handle new documents
create or replace function handle_new_document() returns trigger as $$
begin
  -- You can perform any additional actions here, such as updating a search index
  return new;
end;
$$ language plpgsql security definer;

-- Create a trigger that calls the handle_new_document function when a new document is inserted
create trigger on documents after
insert on documents for each row
  execute procedure handle_new_document();
`

export async function POST() {
  try {
    // ------------------------------------------------------------------
    // 1. QUICK connectivity test – can we read from the DB?
    // ------------------------------------------------------------------
    const ping = await supabaseAdmin.from("profiles").select("id").limit(1)
    if (ping.error) {
      console.error("Ping failed:", ping.error)
      return NextResponse.json(
        { success: false, error: "Cannot reach Supabase with service role key" },
        { status: 500 },
      )
    }

    // ------------------------------------------------------------------
    // 2. Run the whole schema-creation script via Supabase REST RPC
    //    execute_sql is a helper that ships with every Supabase project.
    //    It takes a JSON object { sql: "<your-sql>" }.
    // ------------------------------------------------------------------
    const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/execute_sql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // execute_sql requires an apikey + auth Bearer header
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY as string,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ sql: setupSQL }),
    })

    const { error } = await res.json()

    if (!res.ok || error) {
      console.error("execute_sql error:", error)
      return NextResponse.json({ success: false, error: error?.message ?? "execute_sql failed" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Database setup completed successfully",
    })
  } catch (err) {
    console.error("Setup database error:", err)
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    )
  }
}
