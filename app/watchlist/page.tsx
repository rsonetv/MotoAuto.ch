import WatchlistClient from '@/components/watchlist/watchlist-client';
import { getTranslations } from 'next-intl/server';

export default async function WatchlistPage() {
  const t = await getTranslations('Watchlist');

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
      <WatchlistClient />
    </div>
  );
}