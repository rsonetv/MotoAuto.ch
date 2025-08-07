import { useState, useEffect } from 'react';

export function useCountdown(endDate: string) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!endDate) {
      setTimeLeft('N/A');
      return;
    }

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(endDate).getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeLeft('Zakończona');
        clearInterval(timer);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

      let timeLeftString = '';
      if (days > 0) {
        timeLeftString += `${days}d `;
      }
      if (hours > 0) {
        timeLeftString += `${hours}h `;
      }
      if (minutes > 0) {
        timeLeftString += `${minutes}m`;
      }

      setTimeLeft(timeLeftString.trim() || 'less than a minute');
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  return timeLeft;
}