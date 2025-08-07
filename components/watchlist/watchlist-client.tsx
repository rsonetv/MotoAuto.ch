'use client';

import { useEffect, useState } from 'react';
import { Auction } from '@/types/auctions';
import AuctionCard from '@/components/aukcje/auction-card';
import { getStatusIndicator } from '@/lib/utils';

export default function WatchlistClient() {
  const [watchlist, setWatchlist] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        const response = await fetch('/api/user/watchlist');
        if (response.ok) {
          const data = await response.json();
          setWatchlist(data);
        }
      } catch (error) {
        console.error('Failed to fetch watchlist', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {watchlist.length > 0 ? (
        watchlist.map((auction) => (
          <div key={auction.id} className="relative">
            <AuctionCard auction={auction} />
            <span
              className={`absolute top-2 right-2 w-4 h-4 rounded-full ${getStatusIndicator(
                auction.status
              )}`}
            ></span>
          </div>
        ))
      ) : (
        <p>Your watchlist is empty.</p>
      )}
    </div>
  );
}