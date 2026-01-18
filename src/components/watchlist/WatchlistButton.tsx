"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { WATCHLIST_STATUS } from "@/lib/constants";

interface WatchlistButtonProps {
  animeId: string;
  onStatusChange?: (status: string | null) => void;
}

export function WatchlistButton({
  animeId,
  onStatusChange,
}: WatchlistButtonProps) {
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const checkWatchlist = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/watchlist/${animeId}`);
        const data = await response.json();
        if (data.data) {
          setIsInWatchlist(true);
          setStatus(data.data.status);
        }
      } catch (error) {
        console.error("Error checking watchlist:", error);
      } finally {
        setLoading(false);
      }
    };

    checkWatchlist();
  }, [animeId, supabase]);

  const handleToggle = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    if (isInWatchlist) {
      // Remove from watchlist
      try {
        await fetch(`/api/watchlist?anime_id=${animeId}`, {
          method: "DELETE",
        });
        setIsInWatchlist(false);
        setStatus(null);
        if (onStatusChange) {
          onStatusChange(null);
        }
      } catch (error) {
        console.error("Error removing from watchlist:", error);
      }
    } else {
      // Add to watchlist
      try {
        const response = await fetch("/api/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            anime_id: animeId,
            status: WATCHLIST_STATUS.PLAN_TO_WATCH,
          }),
        });
        const data = await response.json();
        if (data.data) {
          setIsInWatchlist(true);
          setStatus(data.data.status);
          if (onStatusChange) {
            onStatusChange(data.data.status);
          }
        }
      } catch (error) {
        console.error("Error adding to watchlist:", error);
      }
    }
  };

  if (loading) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Bookmark className="h-4 w-4 ml-2" />
        جاري التحميل...
      </Button>
    );
  }

  return (
    <Button
      variant={isInWatchlist ? "default" : "outline"}
      size="sm"
      onClick={handleToggle}
    >
      {isInWatchlist ? (
        <>
          <BookmarkCheck className="h-4 w-4 ml-2" />
          في القائمة
        </>
      ) : (
        <>
          <Bookmark className="h-4 w-4 ml-2" />
          أضف إلى القائمة
        </>
      )}
    </Button>
  );
}
