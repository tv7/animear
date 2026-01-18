"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [watchHistory, setWatchHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUser(user);

      // Fetch watch history
      const response = await fetch("/api/watch");
      const data = await response.json();
      if (data.data) {
        setWatchHistory(data.data);
      }

      setLoading(false);
    };

    fetchData();
  }, [supabase, router]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">الملف الشخصي</h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
            {user.email?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{user.email}</h2>
            <p className="text-gray-500 text-sm">عضو منذ {new Date(user.created_at).toLocaleDateString("ar")}</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">سجل المشاهدة</h2>
        {watchHistory.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            لا توجد سجلات مشاهدة بعد
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {watchHistory.map((item) => {
              const episode = item.episodes;
              const anime = episode?.anime;
              const progressPercent =
                episode && item.duration
                  ? (item.progress / item.duration) * 100
                  : 0;

              return (
                <Link
                  key={item.id}
                  href={`/watch/${episode?.id}`}
                  className="group relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 aspect-[2/3]"
                >
                  {anime?.cover && (
                    <Image
                      src={anime.cover}
                      alt={anime.title_ar || anime.title_en}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="text-white font-semibold text-sm line-clamp-2">
                        {anime?.title_ar || anime?.title_en}
                      </h3>
                      <p className="text-white/80 text-xs mt-1">
                        الحلقة {episode?.number}
                      </p>
                      {progressPercent > 0 && (
                        <div className="mt-2 h-1 bg-white/20 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
