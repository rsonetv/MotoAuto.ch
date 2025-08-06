import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useBiometricAuth from './hooks/useBiometricAuth';

const AutoBidModal = ({ isOpen, onClose, onSetAutoBid }: { isOpen: boolean, onClose: () => void, onSetAutoBid: (maxBid: number) => void }) => {
  const [maxBid, setMaxBid] = useState(0);
  const { isAuthenticating, authenticate } = useBiometricAuth();

  const handleSetAutoBid = async () => {
    const authenticated = await authenticate();
    if (authenticated) {
      onSetAutoBid(maxBid);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        >
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="w-full max-w-md rounded-md bg-white p-6"
          >
            <h2 className="text-lg font-bold">Set Auto Bid</h2>
            <input
              type="number"
              value={maxBid}
              onChange={e => setMaxBid(parseInt(e.target.value))}
              className="my-4 w-full rounded-md border p-2"
            />
            <div className="flex justify-end space-x-2">
              <button onClick={onClose} className="rounded-md bg-gray-300 px-4 py-2">
                Cancel
              </button>
              <button
                onClick={handleSetAutoBid}
                disabled={isAuthenticating}
                className="rounded-md bg-blue-500 px-4 py-2 text-white"
              >
                Set
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AutoBidModal;