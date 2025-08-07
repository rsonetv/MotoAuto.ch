import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, ShieldCheck, Trophy } from 'lucide-react';

// Map badge names to icons
const badgeIcons: { [key: string]: React.ReactNode } = {
  'Wiarygodny Sprzedawca': <ShieldCheck className="w-4 h-4 mr-1" />,
  'Aktywny Licytant': <Trophy className="w-4 h-4 mr-1" />,
};

async function getUserProfile(id: string) {
  const supabase = createServerComponentClient({ cookies });
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, reputation_score, badges')
    .eq('id', id)
    .single();

  if (error || !profile) {
    notFound();
  }

  return profile;
}

export default async function UserProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const profile = await getUserProfile(params.id);

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="flex flex-row items-center space-x-4">
          <Avatar className="w-20 h-20">
            <AvatarImage src={profile.avatar_url || ''} alt={profile.full_name || 'User avatar'} />
            <AvatarFallback>{profile.full_name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">{profile.full_name}</CardTitle>
            <div className="flex items-center text-lg text-muted-foreground mt-2">
              <Star className="w-5 h-5 mr-2 text-yellow-400" />
              <span>Reputation: {profile.reputation_score?.toFixed(2) || 'N/A'}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div>
            <h3 className="text-lg font-semibold mb-2">Badges</h3>
            <div className="flex flex-wrap gap-2">
              {profile.badges && profile.badges.length > 0 ? (
                profile.badges.map((badgeName) => (
                  <Badge key={badgeName} variant="secondary" className="flex items-center">
                    {badgeIcons[badgeName] || null}
                    {badgeName}
                  </Badge>
                ))
              ) : (
                <p className="text-muted-foreground">No badges earned yet.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}