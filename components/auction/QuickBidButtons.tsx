import React from 'react';
import { motion } from 'framer-motion';
import useBiometricAuth from './hooks/useBiometricAuth';
import useRateLimiter from './hooks/useRateLimiter';

const QuickBidButtons = ({ onBid }: { onBid: (amount: number) => void }) => {
  const { isAuthenticating, authenticate } = useBiometricAuth();
  const { isRateLimited } = useRateLimiter(3, 10000); // 3 bids per 10 seconds

  const handleBid = async (amount: number) => {
    if (isRateLimited()) {
      console.log('Rate limited!');
      return;
    }
    const authenticated = await authenticate();
    if (authenticated) {
      onBid(amount);
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }
    }
  };

  return (
    <div className="flex space-x-2">
      {[100, 500, 1000].map(amount => (
        <motion.button
          key={amount}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={isAuthenticating}
          onClick={() => handleBid(amount)}
          className="rounded-md bg-blue-500 px-4 py-2 text-white"
        >
          +{amount} CHF
        </motion.button>
      ))}
    </div>
  );
};

export default QuickBidButtons;