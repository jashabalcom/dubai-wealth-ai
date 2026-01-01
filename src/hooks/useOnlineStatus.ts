import { useState, useEffect, useCallback } from 'react';

interface OnlineStatus {
  isOnline: boolean;
  wasOffline: boolean;
  isReconnecting: boolean;
  lastOnline: Date | null;
}

export function useOnlineStatus(): OnlineStatus {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [wasOffline, setWasOffline] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [lastOnline, setLastOnline] = useState<Date | null>(
    typeof navigator !== 'undefined' && navigator.onLine ? new Date() : null
  );

  const handleOnline = useCallback(() => {
    setIsReconnecting(true);
    
    // Brief reconnecting state for UI feedback
    setTimeout(() => {
      setIsOnline(true);
      setIsReconnecting(false);
      setLastOnline(new Date());
      
      if (!isOnline) {
        setWasOffline(true);
        // Reset the wasOffline flag after a short delay
        setTimeout(() => setWasOffline(false), 5000);
      }
    }, 1000);
  }, [isOnline]);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
    setIsReconnecting(false);
  }, []);

  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  return { isOnline, wasOffline, isReconnecting, lastOnline };
}
