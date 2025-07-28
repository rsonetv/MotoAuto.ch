'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';

interface Bid {
  id: string;
  amount: number;
  bidder: {
    id: string;
    username: string;
    avatar?: string;
  };
  timestamp: string;
  isWinning: boolean;
  isRetracted?: boolean;
}

interface BidHistoryProps {
  auctionId: string;
  bids: Bid[];
  currency?: string;
  isLive?: boolean;
  onNewBid?: (bid: Bid) => void;
}

export default function BidHistory({
  auctionId,
  bids: initialBids,
  currency = 'CHF',
  isLive = false,
  onNewBid
}: BidHistoryProps) {
  const [bids, setBids] = useState<Bid[]>(initialBids);
  const [isLoading, setIsLoading] = useState(false);

  // Real-time updates for live auctions
  useEffect(() => {
    if (!isLive) return;

    // Symulacja WebSocket połączenia
    const interval = setInterval(() => {
      // W rzeczywistej aplikacji tutaj byłoby WebSocket
      // fetchLatestBids();
    }, 5000);

    return () => clearInterval(interval);
  }, [isLive, auctionId]);

  const formatBidderName = (username: string) => {
    if (username.length <= 3) return username;
    return username.substring(0, 2) + '*'.repeat(username.length - 2);
  };

  const getBidderInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase();
  };

  const sortedBids = [...bids].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Historia ofert
        </h3>
        {isLive && (
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            Na żywo
          </Badge>
        )}
      </div>

      {bids.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p className="text-sm">Brak ofert</p>
          <p className="text-xs mt-1">Bądź pierwszym, który złoży ofertę!</p>
        </div>
      ) : (
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {sortedBids.map((bid, index) => (
              <div
                key={bid.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  bid.isWinning
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : bid.isRetracted
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 opacity-60'
                    : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={bid.bidder.avatar} />
                    <AvatarFallback className="text-xs">
                      {getBidderInitials(bid.bidder.username)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatBidderName(bid.bidder.username)}
                      </span>
                      {bid.isWinning && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Wygrywa
                        </Badge>
                      )}
                      {bid.isRetracted && (
                        <Badge variant="destructive" className="text-xs">
                          Wycofana
                        </Badge>
                      )}
                      {index === 0 && !bid.isRetracted && (
                        <Badge variant="secondary" className="text-xs">
                          Najnowsza
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(new Date(bid.timestamp), { 
                        addSuffix: true, 
                        locale: pl 
                      })}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className={`font-bold ${
                    bid.isWinning 
                      ? 'text-green-600 dark:text-green-400' 
                      : bid.isRetracted
                      ? 'text-red-600 dark:text-red-400 line-through'
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {bid.amount.toLocaleString()} {currency}
                  </p>
                  {index === 0 && !bid.isRetracted && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Aktualna oferta
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Statystyki */}
      {bids.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {bids.filter(bid => !bid.isRetracted).length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Ofert</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {new Set(bids.map(bid => bid.bidder.id)).size}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Licytujących</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-primary">
                {Math.max(...bids.filter(bid => !bid.isRetracted).map(bid => bid.amount)).toLocaleString()} {currency}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Najwyższa</p>
            </div>
          </div>
        </div>
      )}

      {/* Informacja o anonimowości */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-xs text-blue-800 dark:text-blue-200">
          🔒 <strong>Prywatność:</strong> Nazwy użytkowników są częściowo ukryte dla ochrony prywatności
        </p>
      </div>
    </div>
  );
}