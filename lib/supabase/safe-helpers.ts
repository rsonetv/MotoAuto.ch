import { SupabaseClient, SignInWithPasswordCredentials } from '@supabase/supabase-js'

type SupabaseAuthResponse = {
  data: { user: any; session: any } | null;
  error: any | null;
}

type SafeSignInResult = {
  success: boolean;
  data?: { user: any; session: any } | null;
  error?: any | null;
}

export async function safeSignIn(
  supabase: SupabaseClient,
  credentials: SignInWithPasswordCredentials
): Promise<SafeSignInResult> {
  try {
    const { data, error }: SupabaseAuthResponse = await supabase.auth.signInWithPassword(credentials)

    if (error) {
      return { success: false, error }
    }
    
    return { success: true, data }
  } catch (exception) {
    return { success: false, error: exception }
  }
}
