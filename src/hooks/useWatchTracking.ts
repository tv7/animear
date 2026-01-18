"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function useWatchTracking() {
  const [progressCache, setProgressCache] = useState<Record<string, number>>(
    {}
  );
  const supabase = createClient();

  useEffect(() => {
    // Load cached progress from localStorage
    const cached = localStorage.getItem("watch_progress");
    if (cached) {
      try {
        setProgressCache(JSON.parse(cached));
      } catch (e) {
        console.error("Error loading cached progress:", e);
      }
    }
  }, []);

  const getProgress = (episodeId: string): number => {
    // Check cache first
    if (progressCache[episodeId]) {
      return progressCache[episodeId];
    }

    // Check localStorage
    const cached = localStorage.getItem(`progress_${episodeId}`);
    if (cached) {
      const parsed = parseFloat(cached);
      if (!isNaN(parsed)) {
        return parsed;
      }
    }

    return 0;
  };

  const saveProgress = async (
    episodeId: string,
    currentTime: number,
    duration: number
  ) => {
    // Update cache
    setProgressCache((prev) => ({
      ...prev,
      [episodeId]: currentTime,
    }));

    // Save to localStorage immediately
    localStorage.setItem(`progress_${episodeId}`, currentTime.toString());

    // Save to database (debounced)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase.from("watch_history").upsert(
          {
            user_id: user.id,
            episode_id: episodeId,
            progress: Math.floor(currentTime),
            duration: Math.floor(duration),
          },
          {
            onConflict: "user_id,episode_id",
          }
        );
      }
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  return {
    getProgress,
    saveProgress,
  };
}
