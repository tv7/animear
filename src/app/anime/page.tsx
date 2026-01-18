import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { Loading } from "@/components/ui/Loading";

async function AnimeGrid() {
  const supabase = await createClient();
  const { data: animeList } = await supabase
    .from("anime")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  if (!animeList || animeList.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        لا توجد أنمي متاحة حالياً
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {animeList.map((anime) => (
        <Link
          key={anime.id}
          href={`/anime/${anime.id}`}
          className="group relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 aspect-[2/3] transition-transform hover:scale-105"
        >
          {anime.cover && (
            <Image
              src={anime.cover}
              alt={anime.title_ar || anime.title_en}
              fill
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <h3 className="text-white font-semibold text-sm line-clamp-2">
                {anime.title_ar || anime.title_en}
              </h3>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function AnimeListPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">جميع الأنمي</h1>
      <Suspense fallback={<Loading className="py-12" />}>
        <AnimeGrid />
      </Suspense>
    </div>
  );
}
