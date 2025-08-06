import React from 'react';
import BidDisplay from './BidDisplay';
import CountdownTimer from './CountdownTimer';
import QuickBidButtons from './QuickBidButtons';
import AutoBidModal from './AutoBidModal';
import BidHistory from './BidHistory';
import AuctionStatusIndicator from './AuctionStatusIndicator';
import useAuctionRealtime from './hooks/useAuctionRealtime';

const LiveAuctionInterface = ({ auctionId }: { auctionId: string }) => {
  const auctionState = useAuctionRealtime(auctionId);

  if (!auctionState) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <AuctionStatusIndicator status={auctionState.status} />
      <CountdownTimer time={auctionState.timeRemaining} />
      <BidDisplay bid={auctionState.currentBid} />
      <QuickBidButtons onBid={auctionState.placeBid} />
      <BidHistory bids={auctionState.bids} />
      <AutoBidModal 
        isOpen={auctionState.isAutoBidModalOpen} 
        onClose={auctionState.closeAutoBidModal} 
        onSetAutoBid={auctionState.setAutoBid} 
      />
    </div>
  );
};

export default LiveAuctionInterface;