'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Crown, TrendingUp, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';

interface Bid {
  id: string;
  amount: number;
  bidder: {
    id: string;
    name: string;
  };
  timestamp: string;
  isWinning: boolean;
}

interface BidHistoryProps {
  bids: Bid[];
  currency: string;
  isLive?: boolean;
}

export default function BidHistory({ bids, currency, isLive = false }: BidHistoryProps) {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTimeAgo = (timestamp: string): string => {
    try {
      return formatDistanceToNow(new Date(timestamp), { 
        addSuffix: true, 
        locale: pl 
      });
    } catch {
      return 'Nieznany czas';
    }
  };

  if (bids.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Historia ofert
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Brak ofert</p>
            <p className="text-sm">Bądź pierwszy i złóż ofertę!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Historia ofert
          {isLive && (
            <Badge variant="secondary" className="ml-auto">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
              Na żywo
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {bids.map((bid, index) => (
            <div
              key={bid.id}
              className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                bid.isWinning 
                  ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800' 
                  : 'bg-muted/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className={
                      bid.isWinning 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                        : ''
                    }>
                      {getInitials(bid.bidder.name)}
                    </AvatarFallback>
                  </Avatar>
                  {bid.isWinning && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                      <Crown className="h-3 w-3 text-yellow-800" />
                    </div>
                  )}
                </div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{bid.bidder.name}</span>
                    {bid.isWinning && (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                        Prowadzi
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatTimeAgo(bid.timestamp)}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className={`text-lg font-bold ${
                  bid.isWinning ? 'text-green-600 dark:text-green-400' : ''
                }`}>
                  {formatCurrency(bid.amount)}
                </div>
                {index === 0 && bids.length > 1 && (
                  <div className="text-xs text-muted-foreground">
                    +{formatCurrency(bid.amount - bids[1].amount)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {bids.length > 5 && (
          <div className="text-center mt-4">
            <button className="text-sm text-primary hover:underline">
              Zobacz wszystkie oferty ({bids.length})
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}