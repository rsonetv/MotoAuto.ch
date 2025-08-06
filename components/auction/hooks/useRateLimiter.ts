import { useState, useCallback } from 'react';

const useRateLimiter = (limit: number, interval: number) => {
  const [timestamps, setTimestamps] = useState<number[]>([]);

  const isRateLimited = useCallback(() => {
    const now = Date.now();
    const recentTimestamps = timestamps.filter(ts => now - ts < interval);
    if (recentTimestamps.length >= limit) {
      return true;
    }
    setTimestamps([...recentTimestamps, now]);
    return false;
  }, [timestamps, limit, interval]);

  return { isRateLimited };
};

export default useRateLimiter;