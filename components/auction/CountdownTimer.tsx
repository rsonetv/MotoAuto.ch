import React from 'react';
import { motion } from 'framer-motion';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Zap } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CountdownTimerProps {
  endTime: string;
  isExtended: boolean;
  extensionCount: number;
}

const CountdownTimer = ({ endTime, isExtended, extensionCount }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0, hours: 0, minutes: 0, seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(endTime) - +new Date();
      let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

      if (difference > 0) {
        timeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      }
      return timeLeft;
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  const totalSeconds = timeLeft.days * 86400 + timeLeft.hours * 3600 + timeLeft.minutes * 60 + timeLeft.seconds;
  const initialTotalSeconds = new Date(endTime).getTime() > new Date().getTime() ? (+new Date(endTime) - new Date().getTime()) / 1000 : 0;


  return (
    <div className="text-center p-4 border rounded-lg shadow-lg bg-white dark:bg-gray-800 relative">
      <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2 flex items-center justify-center">
        <Clock className="w-5 h-5 mr-2" />
        Czas do końca
      </h3>
      <div className="flex justify-center space-x-4 my-4">
        {Object.entries(timeLeft).map(([unit, value]) => (
          <div key={unit} className="flex flex-col items-center">
            <div className="text-4xl font-bold text-gray-900 dark:text-white">{String(value).padStart(2, '0')}</div>
            <div className="text-xs uppercase text-gray-500 dark:text-gray-400">{unit}</div>
          </div>
        ))}
      </div>
      {isExtended && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="absolute top-2 right-2 flex items-center text-yellow-500 animate-pulse">
                <Zap className="w-5 h-5" />
                <span className="ml-1 font-bold text-sm">x{extensionCount}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Aukcja została przedłużona z powodu oferty w ostatniej chwili.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default CountdownTimer;