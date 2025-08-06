import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Bid {
  id: string;
  amount: number;
  bidder: string;
}

const BidHistory = ({ bids }: { bids: Bid[] }) => {
  return (
    <div className="h-64 overflow-y-auto">
      <AnimatePresence>
        {bids.map(bid => (
          <motion.div
            key={bid.id}
            layout
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="mb-2 rounded-md border p-2"
          >
            <p>
              <span className="font-bold">{bid.bidder}</span> bid {bid.amount} CHF
            </p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default BidHistory;