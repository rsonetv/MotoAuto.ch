'use client';

import { useState } from 'react';
import AuctionTimer from './AuctionTimer';
import BidForm from './BidForm';
import BidHistory from './BidHistory';
import { AuctionDetails } from './auction-details';

interface AuctionPageProps {
  auctionId: string;
  auction: {
    id: string;
    title: string;
    description: string;
    image_urls?: string[];
    starting_price: number;
    current_bid: number;
    min_increment: number;
    reserve_price?: number;
    reserve_met: boolean;
    ends_at: string;
    soft_close: boolean;
    extension_seconds: number;
    condition: string;
    year?: number;
    make?: string;
    model?: string;
    mileage?: number;
    fuel_type?: string;
    transmission?: string;
    location?: string;
    seller: {
      username: string;
      rating: number;
      total_sales: number;
    };
    views: number;
    watchers: number;
    currency?: string;
  };
  bids: Array<{
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
  }>;
  isLoggedIn?: boolean;
}

export default function AuctionPage({ 
  auctionId, 
  auction, 
  bids, 
  isLoggedIn = false 
}: AuctionPageProps) {
  const [currentBids, setCurrentBids] = useState(bids);
  const [currentBid, setCurrentBid] = useState(auction.current_bid);
  const [auctionEndTime, setAuctionEndTime] = useState(auction.ends_at);

  const handleNewBid = async (amount: number) => {
    // Symulacja API call
    console.log(`Składanie oferty: ${amount} ${auction.currency || 'CHF'}`);
    
    // W rzeczywistej aplikacji tutaj byłby request do API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Aktualizacja stanu po udanej ofercie
    const newBid = {
      id: `bid-${Date.now()}`,
      amount,
      bidder: {
        id: 'current-user',
        username: 'TwojaOferta',
        avatar: undefined
      },
      timestamp: new Date().toISOString(),
      isWinning: true,
      isRetracted: false
    };

    // Oznacz poprzednie oferty jako nie wygrywające
    const updatedBids = currentBids.map(bid => ({
      ...bid,
      isWinning: false
    }));

    setCurrentBids([newBid, ...updatedBids]);
    setCurrentBid(amount);
  };

  const handleTimeExtended = (newEndTime: string) => {
    setAuctionEndTime(newEndTime);
    console.log(`Aukcja przedłużona do: ${newEndTime}`);
  };

  const handleLoginRequired = () => {
    // Przekierowanie do logowania
    console.log('Wymagane logowanie');
    // router.push('/auth/login');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Główna kolumna - szczegóły aukcji */}
        <div className="lg:col-span-2">
          <AuctionDetails auction={auction} />
        </div>

        {/* Boczna kolumna - panel licytacji */}
        <div className="space-y-6">
          {/* Timer aukcji */}
          <AuctionTimer
            endsAt={auctionEndTime}
            softClose={auction.soft_close}
            extensionSec={auction.extension_seconds}
            onTimeExtended={handleTimeExtended}
          />

          {/* Formularz licytacji */}
          <BidForm
            currentBid={currentBid}
            minIncrement={auction.min_increment}
            reservePrice={auction.reserve_price}
            reserveMet={auction.reserve_met}
            currency={auction.currency}
            isLoggedIn={isLoggedIn}
            onSubmit={handleNewBid}
            onLoginRequired={handleLoginRequired}
          />

          {/* Historia ofert */}
          <BidHistory
            auctionId={auctionId}
            bids={currentBids}
            currency={auction.currency}
            isLive={true}
          />
        </div>
      </div>
    </div>
  );
}
