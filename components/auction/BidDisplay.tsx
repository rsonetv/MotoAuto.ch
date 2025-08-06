import React from 'react';
import { motion } from 'framer-motion';

const BidDisplay = ({ bid }: { bid: number }) => {
  return (
    <motion.div
      key={bid}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="text-3xl font-bold"
    >
      {bid} CHF
    </motion.div>
  );
};

export default BidDisplay;