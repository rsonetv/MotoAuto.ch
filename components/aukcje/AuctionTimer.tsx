'use client';

import { useState, useEffect } from 'react';

interface AuctionTimerProps {
  endsAt: string; // ISO datetime
  softClose: boolean;
  extensionSec: number;
  onTimeExtended?: (newEndTime: string) => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function AuctionTimer({ 
  endsAt, 
  softClose, 
  extensionSec,
  onTimeExtended 
}: AuctionTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);
  const [wasExtended, setWasExtended] = useState(false);

  const calculateTimeLeft = (endTime: string): TimeLeft => {
    const difference = new Date(endTime).getTime() - new Date().getTime();
    
    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    }
    
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  };

  const checkForSoftClose = (timeLeft: TimeLeft) => {
    if (!softClose || wasExtended) return;
    
    const totalSecondsLeft = timeLeft.days * 86400 + timeLeft.hours * 3600 + timeLeft.minutes * 60 + timeLeft.seconds;
    
    // Jeśli zostało mniej niż 5 minut (300 sekund)
    if (totalSecondsLeft <= 300 && totalSecondsLeft > 0) {
      const newEndTime = new Date(Date.now() + extensionSec * 1000).toISOString();
      setWasExtended(true);
      onTimeExtended?.(newEndTime);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(endsAt);
      setTimeLeft(newTimeLeft);
      
      checkForSoftClose(newTimeLeft);
      
      if (newTimeLeft.days === 0 && newTimeLeft.hours === 0 && 
          newTimeLeft.minutes === 0 && newTimeLeft.seconds === 0) {
        setIsExpired(true);
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endsAt, softClose, extensionSec, wasExtended]);

  const formatTime = (value: number): string => {
    return value.toString().padStart(2, '0');
  };

  if (isExpired) {
    return (
      <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-800 dark:text-red-200 font-semibold text-center">
          Aukcja zakończona
        </p>
      </div>
    );
  }

  const isLastMinutes = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes < 5;

  return (
    <div className={`p-4 rounded-lg border ${
      isLastMinutes 
        ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800' 
        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
    }`}>
      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {isLastMinutes ? 'OSTATNIE MINUTY!' : 'Do końca aukcji:'}
        </p>
        
        <div className="flex justify-center space-x-2 text-2xl font-mono font-bold">
          {timeLeft.days > 0 && (
            <>
              <div className="flex flex-col items-center">
                <span className={isLastMinutes ? 'text-red-600 dark:text-red-400' : 'text-brand'}>
                  {formatTime(timeLeft.days)}
                </span>
                <span className="text-xs text-gray-500">dni</span>
              </div>
              <span className="self-start mt-1">:</span>
            </>
          )}
          
          <div className="flex flex-col items-center">
            <span className={isLastMinutes ? 'text-red-600 dark:text-red-400' : 'text-primary'}>
              {formatTime(timeLeft.hours)}
            </span>
            <span className="text-xs text-gray-500">godz</span>
          </div>
          <span className="self-start mt-1">:</span>
          
          <div className="flex flex-col items-center">
            <span className={isLastMinutes ? 'text-red-600 dark:text-red-400' : 'text-primary'}>
              {formatTime(timeLeft.minutes)}
            </span>
            <span className="text-xs text-gray-500">min</span>
          </div>
          <span className="self-start mt-1">:</span>
          
          <div className="flex flex-col items-center">
            <span className={isLastMinutes ? 'text-red-600 dark:text-red-400' : 'text-primary'}>
              {formatTime(timeLeft.seconds)}
            </span>
            <span className="text-xs text-gray-500">sek</span>
          </div>
        </div>
        
        {softClose && isLastMinutes && (
          <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
            ⚠️ Oferta w ostatnich 5 min przedłuży aukcję o {extensionSec / 60} min
          </p>
        )}
        
        {wasExtended && (
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
            🔄 Aukcja została przedłużona
          </p>
        )}
      </div>
    </div>
  );
}
