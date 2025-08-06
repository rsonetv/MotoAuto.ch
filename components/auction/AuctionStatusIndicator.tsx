import React from 'react';

const AuctionStatusIndicator = ({ status }: { status: string }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'Live':
        return 'bg-green-500';
      case 'Ending Soon':
        return 'bg-yellow-500';
      case 'Finished':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className={`mb-4 rounded-full px-3 py-1 text-sm font-semibold text-white ${getStatusColor()}`}>
      {status}
    </div>
  );
};

export default AuctionStatusIndicator;