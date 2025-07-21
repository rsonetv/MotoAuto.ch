import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import type { Database } from "@/lib/database.types"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

  const { data, error } = await supabase.auth.getSession()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!data?.session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (data.session.user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { adminPassword } = await request.json()

  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const setupSQL = `
    -- Enable necessary extensions
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pg_trgm";

    -- Switch to the role that owns the auth schema so we can manage auth.users
    SET LOCAL ROLE supabase_auth_admin;

    CREATE TABLE IF NOT EXISTS public.profiles (
      id UUID NOT NULL PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
      updated_at TIMESTAMP WITH TIME ZONE,
      username VARCHAR(150) UNIQUE,
      full_name VARCHAR(150),
      avatar_url VARCHAR(150),
      website VARCHAR(150),

      CONSTRAINT username_length CHECK (char_length(username) >= 3)
    );

    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Allow public read-only access." ON public.profiles FOR SELECT USING (TRUE);

    CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

    CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE WITH CHECK (auth.uid() = id);

    -- Set up Realtime!
    DROP PUBLICATION IF EXISTS supabase_realtime CASCADE;
    CREATE PUBLICATION supabase_realtime FOR ALL TABLES;

    -- Set up functions
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO public.profiles (id, username)
      VALUES (NEW.id, NEW.raw_user_meta_data->>'username');
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    CREATE OR REPLACE FUNCTION public.handle_user_update()
    RETURNS TRIGGER AS $$
    BEGIN
      UPDATE public.profiles
      SET username = NEW.raw_user_meta_data->>'username'
      WHERE id = NEW.id;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Set up triggers
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

    CREATE TRIGGER on_auth_user_updated
      AFTER UPDATE ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

    -- Revert back to the previous role
    RESET ROLE;
  `

  try {
    const { error: sqlError } = await supabase.rpc("run_sql", { sql: setupSQL })

    if (sqlError) {
      return NextResponse.json({ error: sqlError.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Database setup complete" }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
