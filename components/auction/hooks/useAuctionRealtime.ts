import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Bid } from '@/types/bids';

interface AuctionState {
  status: string;
  timeRemaining: number;
  currentBid: number;
  bids: Bid[];
  isAutoBidModalOpen: boolean;
  placeBid: (amount: number) => void;
  closeAutoBidModal: () => void;
  setAutoBid: (maxBid: number) => void;
}

const useAuctionRealtime = (auctionId: string) => {
  const [data, setData] = useState<AuctionState>({
    status: 'loading',
    timeRemaining: 0,
    currentBid: 0,
    bids: [],
    isAutoBidModalOpen: false,
    placeBid: () => {},
    closeAutoBidModal: () => {},
    setAutoBid: () => {},
  });

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(`auction:${auctionId}`);

    channel
      .on('broadcast', { event: 'new_bid' }, (payload: { payload: any }) => {
        console.log('New bid!', payload);
        // Handle new bid logic here
        setData(prevData => ({
          ...prevData,
          currentBid: payload.payload.newBid,
          bids: [...prevData.bids, payload.payload.bid],
        }));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [auctionId]);

  return data;
};

export default useAuctionRealtime;