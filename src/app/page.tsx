import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: popularAnime } = await supabase
    .from("anime")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(12);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center space-y-6 mb-12">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white">
          مرحباً بك في موقع الأنمي
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          استمتع بمشاهدة أفضل مسلسلات الأنمي بجودة عالية وترجمة عربية
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/anime">
            <Button size="lg">استكشف الأنمي</Button>
          </Link>
        </div>
      </div>

      {popularAnime && popularAnime.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">الأكثر شعبية</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {popularAnime.map((anime) => (
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
        </div>
      )}
    </div>
  );
}
