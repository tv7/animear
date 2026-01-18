"use client";

import { useEffect, useState } from "react";

interface AdSidebarProps {
  position: string;
  className?: string;
}

export function AdSidebar({ position, className }: AdSidebarProps) {
  const [ad, setAd] = useState<any>(null);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const response = await fetch(
          `/api/ads?type=sidebar&position=${position}&active_only=true`
        );
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          const activeAd = data.data.find((ad: any) => {
            if (!ad.active) return false;
            const now = new Date();
            if (ad.start_date && new Date(ad.start_date) > now) return false;
            if (ad.end_date && new Date(ad.end_date) < now) return false;
            return true;
          });
          if (activeAd) {
            setAd(activeAd);
          }
        }
      } catch (error) {
        console.error("Error fetching ad:", error);
      }
    };

    fetchAd();
  }, [position]);

  if (!ad) return null;

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: ad.content }}
    />
  );
}
