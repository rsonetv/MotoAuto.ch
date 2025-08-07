"use client";

import React, { useState } from 'react';
import BidDisplay from './BidDisplay';
import CountdownTimer from './CountdownTimer';
import QuickBidButtons from './QuickBidButtons';
import AutoBidModal from './AutoBidModal';
import BidHistory from './BidHistory';
import AuctionStatusIndicator from './AuctionStatusIndicator';
import { FirstBidQuiz } from '@/components/quiz/FirstBidQuiz';
import { Auction } from '@/types/auctions';
import { Tables } from '@/types/supabase';

interface LiveAuctionInterfaceProps {
  auctionData: Auction;
  isExtended: boolean;
  extensionCount: number;
  profile: Tables<'profiles'> | null;
  onBid: (amount: number) => void;
}

const LiveAuctionInterface = ({ auctionData, isExtended, extensionCount, profile, onBid }: LiveAuctionInterfaceProps) => {
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [quizPassed, setQuizPassed] = useState(profile?.has_passed_quiz || false);

  if (!auctionData) {
    return <div>Loading auction...</div>;
  }

  const handleBidAttempt = (amount: number) => {
    if (profile && !quizPassed) {
      setIsQuizOpen(true);
    } else {
      onBid(amount);
    }
  };

  const handleQuizCompleted = () => {
    setIsQuizOpen(false);
    setQuizPassed(true);
  };

  return (
    <div className="space-y-4">
      <AuctionStatusIndicator status={auctionData.status} />
      <CountdownTimer
        endTime={auctionData.auction_end_time || new Date().toISOString()}
        isExtended={isExtended}
        extensionCount={extensionCount}
      />
      <BidDisplay bid={auctionData.current_bid || 0} />
      <QuickBidButtons onBid={handleBidAttempt} />
      {/* <BidHistory bids={auctionData.bids} /> */}
      <AutoBidModal
        isOpen={false}
        onClose={() => {}}
        onSetAutoBid={() => {}}
      />
      {profile && (
        <FirstBidQuiz
          isOpen={isQuizOpen}
          onClose={() => setIsQuizOpen(false)}
          onQuizCompleted={handleQuizCompleted}
        />
      )}
    </div>
  );
};

export default LiveAuctionInterface;