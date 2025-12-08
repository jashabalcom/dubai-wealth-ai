import React, { createContext, useContext, ReactNode } from 'react';
import { useOnlinePresence } from '@/hooks/useOnlinePresence';

interface OnlinePresenceContextType {
  onlineUsers: Set<string>;
  isUserOnline: (userId: string) => boolean;
  onlineCount: number;
}

const OnlinePresenceContext = createContext<OnlinePresenceContextType | undefined>(undefined);

export function OnlinePresenceProvider({ children }: { children: ReactNode }) {
  const presence = useOnlinePresence();

  return (
    <OnlinePresenceContext.Provider value={presence}>
      {children}
    </OnlinePresenceContext.Provider>
  );
}

export function useOnlineStatus() {
  const context = useContext(OnlinePresenceContext);
  if (context === undefined) {
    throw new Error('useOnlineStatus must be used within an OnlinePresenceProvider');
  }
  return context;
}
