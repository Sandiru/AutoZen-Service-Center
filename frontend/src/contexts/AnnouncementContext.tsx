
"use client";

import type { ReactNode } from "react";
import React, { createContext, useState, useContext, useCallback } from "react";

interface AnnouncementContextType {
  announcementMessage: string | null;
  showAnnouncement: (message: string, duration?: number) => void;
  hideAnnouncement: () => void;
}

const AnnouncementContext = createContext<AnnouncementContextType | undefined>(undefined);

export const AnnouncementProvider = ({ children }: { children: ReactNode }) => {
  const [announcementMessage, setAnnouncementMessage] = useState<string | null>(null);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const hideAnnouncement = useCallback(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setAnnouncementMessage(null);
  }, [timeoutId]);

  const showAnnouncement = useCallback((message: string, duration?: number) => {
    hideAnnouncement(); // Clear any existing announcement/timeout
    setAnnouncementMessage(message);

    if (duration) {
      const newTimeoutId = setTimeout(() => {
        hideAnnouncement();
      }, duration);
      setTimeoutId(newTimeoutId);
    }
  }, [hideAnnouncement]);


  return (
    <AnnouncementContext.Provider value={{ announcementMessage, showAnnouncement, hideAnnouncement }}>
      {children}
    </AnnouncementContext.Provider>
  );
};

export const useAnnouncement = () => {
  const context = useContext(AnnouncementContext);
  if (context === undefined) {
    throw new Error("useAnnouncement must be used within an AnnouncementProvider");
  }
  return context;
};
