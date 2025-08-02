'use client';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { FcGoogle } from 'react-icons/fc';

export function OAuthButtons() {
  const handleGoogle = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  };
  return (
    <>
      {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
        <Button
          variant="outline"
          className="w-full h-11 gap-2"
          onClick={handleGoogle}
        >
          <FcGoogle className="h-5 w-5" /> Zaloguj przez Google
        </Button>
      )}
    </>
  );
}