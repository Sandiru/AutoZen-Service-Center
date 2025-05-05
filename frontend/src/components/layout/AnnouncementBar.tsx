
"use client";

import { useAnnouncement } from "@/contexts/AnnouncementContext";
import { Button } from "@/components/ui/button";
import { Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function AnnouncementBar() {
  const { announcementMessage, hideAnnouncement } = useAnnouncement();

  if (!announcementMessage) {
    return null;
  }

  return (
    <div className="bg-primary/10 border-b border-primary/20 text-primary px-4 py-2 flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <Info className="h-4 w-4 flex-shrink-0" />
        <span>{announcementMessage}</span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={hideAnnouncement}
        className="h-6 w-6 text-primary hover:bg-primary/20"
        aria-label="Dismiss announcement"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
