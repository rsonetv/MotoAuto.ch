import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

// Function to check for admin privileges
async function isAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (error || !profile) {
    return false;
  }

  return profile.role === 'admin';
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();

  const adminCheck = await isAdmin(supabase);
  if (!adminCheck) {
    return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
  }

  const auctionId = params.id;
  const { verification_report_url, verified_by } = await req.json();

  if (!verification_report_url || !verified_by) {
    return NextResponse.json({ error: 'Missing required fields: verification_report_url and verified_by' }, { status: 400 });
  }

  const { error } = await supabase
    .from('auctions')
    .update({ 
      is_verified: true,
      verification_report_url: verification_report_url,
      verified_by: verified_by,
      verification_requested: false // Reset the request flag
    })
    .eq('id', auctionId);

  if (error) {
    console.error('Error verifying auction:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}