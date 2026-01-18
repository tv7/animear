import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { WatchlistButton } from "@/components/watchlist/WatchlistButton";

export default async function AnimeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: anime } = await supabase
    .from("anime")
    .select("*")
    .eq("id", id)
    .single();

  if (!anime) {
    notFound();
  }

  const { data: episodes } = await supabase
    .from("episodes")
    .select("*")
    .eq("anime_id", id)
    .order("number", { ascending: true });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          {anime.cover && (
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
              <Image
                src={anime.cover}
                alt={anime.title_ar || anime.title_en}
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>
        <div className="md:col-span-2 space-y-4">
          <h1 className="text-4xl font-bold">{anime.title_ar || anime.title_en}</h1>
          {anime.title_en && anime.title_ar && (
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {anime.title_en}
            </p>
          )}
          {anime.description && (
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {anime.description}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {anime.genres?.map((genre: string) => (
              <span
                key={genre}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
              >
                {genre}
              </span>
            ))}
          </div>
          <div className="flex gap-4 items-center flex-wrap">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              الحالة: {anime.status === "ongoing" ? "قيد العرض" : anime.status === "completed" ? "مكتمل" : "قادم"}
            </span>
            {anime.year && (
              <span className="text-sm text-gray-600 dark:text-gray-400">
                السنة: {anime.year}
              </span>
            )}
            <WatchlistButton animeId={anime.id} />
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">الحلقات</h2>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
          {episodes?.map((episode) => (
            <Link
              key={episode.id}
              href={`/watch/${episode.id}`}
              className="aspect-square flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-blue-600 hover:text-white transition-colors font-medium"
            >
              {episode.number}
            </Link>
          ))}
        </div>
        {(!episodes || episodes.length === 0) && (
          <p className="text-gray-500 text-center py-8">
            لا توجد حلقات متاحة حالياً
          </p>
        )}
      </div>
    </div>
  );
}
