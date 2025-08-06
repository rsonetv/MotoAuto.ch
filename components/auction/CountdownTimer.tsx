import React from 'react';
import { motion } from 'framer-motion';

const CountdownTimer = ({ time }: { time: number }) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  return (
    <div className="relative h-24 w-24">
      <motion.svg className="absolute top-0 left-0" viewBox="0 0 100 100">
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          className="stroke-current text-gray-200"
          strokeWidth="10"
          fill="transparent"
        />
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          className="stroke-current text-blue-500"
          strokeWidth="10"
          fill="transparent"
          strokeDasharray="283"
          strokeDashoffset={283 - (283 * time) / 60}
          transform="rotate(-90 50 50)"
        />
      </motion.svg>
      <div className="absolute top-0 left-0 flex h-full w-full items-center justify-center text-2xl font-bold">
        {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
      </div>
    </div>
  );
};

export default CountdownTimer;