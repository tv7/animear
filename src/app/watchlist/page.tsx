"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { WatchlistManager } from "@/components/watchlist/WatchlistManager";
import { ImportWatchlist } from "@/components/watchlist/ImportWatchlist";
import { WATCHLIST_STATUS } from "@/lib/constants";
import { Button } from "@/components/ui/Button";

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [filteredWatchlist, setFilteredWatchlist] = useState<any[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [selectedAnime, setSelectedAnime] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchWatchlist = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      try {
        const response = await fetch("/api/watchlist");
        const data = await response.json();
        if (data.data) {
          setWatchlist(data.data);
          setFilteredWatchlist(data.data);
        }
      } catch (error) {
        console.error("Error fetching watchlist:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, [supabase, router]);

  useEffect(() => {
    if (selectedStatus === "all") {
      setFilteredWatchlist(watchlist);
    } else {
      setFilteredWatchlist(
        watchlist.filter((item) => item.status === selectedStatus)
      );
    }
  }, [selectedStatus, watchlist]);

  const handleUpdate = () => {
    // Refresh watchlist
    fetch("/api/watchlist")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setWatchlist(data.data);
          if (selectedStatus === "all") {
            setFilteredWatchlist(data.data);
          } else {
            setFilteredWatchlist(
              data.data.filter((item: any) => item.status === selectedStatus)
            );
          }
        }
        setSelectedAnime(null);
      });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">قائمة المشاهدة</h1>
      </div>

      <div className="mb-6">
        <ImportWatchlist />
      </div>

      <div className="mb-6 flex gap-2 flex-wrap">
        <Button
          variant={selectedStatus === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedStatus("all")}
        >
          الكل
        </Button>
        <Button
          variant={selectedStatus === WATCHLIST_STATUS.WATCHING ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedStatus(WATCHLIST_STATUS.WATCHING)}
        >
          أشاهد
        </Button>
        <Button
          variant={selectedStatus === WATCHLIST_STATUS.COMPLETED ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedStatus(WATCHLIST_STATUS.COMPLETED)}
        >
          مكتمل
        </Button>
        <Button
          variant={selectedStatus === WATCHLIST_STATUS.PLAN_TO_WATCH ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedStatus(WATCHLIST_STATUS.PLAN_TO_WATCH)}
        >
          أخطط للمشاهدة
        </Button>
      </div>

      {filteredWatchlist.length === 0 ? (
        <p className="text-gray-500 text-center py-12">
          لا توجد عناصر في قائمة المشاهدة
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWatchlist.map((item) => {
            const anime = item.anime;
            return (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow"
              >
                <Link href={`/anime/${anime?.id}`}>
                  {anime?.cover && (
                    <div className="relative aspect-[2/3]">
                      <Image
                        src={anime.cover}
                        alt={anime.title_ar || anime.title_en}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </Link>
                <div className="p-4">
                  <Link href={`/anime/${anime?.id}`}>
                    <h3 className="font-semibold text-lg mb-2 hover:text-blue-600">
                      {anime?.title_ar || anime?.title_en}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-gray-500">
                      {item.status === WATCHLIST_STATUS.WATCHING && "أشاهد"}
                      {item.status === WATCHLIST_STATUS.COMPLETED && "مكتمل"}
                      {item.status === WATCHLIST_STATUS.PLAN_TO_WATCH && "أخطط للمشاهدة"}
                      {item.status === WATCHLIST_STATUS.ON_HOLD && "متوقف"}
                      {item.status === WATCHLIST_STATUS.DROPPED && "مهجور"}
                    </span>
                    {item.rating && (
                      <span className="text-sm text-yellow-600">
                        ⭐ {item.rating}/10
                      </span>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() =>
                      setSelectedAnime(
                        selectedAnime === anime?.id ? null : anime?.id || null
                      )
                    }
                  >
                    {selectedAnime === anime?.id ? "إخفاء" : "تعديل"}
                  </Button>
                  {selectedAnime === anime?.id && (
                    <div className="mt-4">
                      <WatchlistManager
                        animeId={anime?.id}
                        currentStatus={item.status}
                        currentRating={item.rating}
                        currentNotes={item.notes}
                        onUpdate={handleUpdate}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
