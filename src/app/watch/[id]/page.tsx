"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { VideoPlayer } from "@/components/player/VideoPlayer";
import { useWatchTracking } from "@/hooks/useWatchTracking";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";

interface Episode {
  id: string;
  number: number;
  title?: string;
  sources: Array<{
    url: string;
    quality: string;
    provider: string;
    type: string;
  }>;
}

export default function WatchPage() {
  const params = useParams();
  const episodeId = params.id as string;
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [anime, setAnime] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSource, setSelectedSource] = useState<string>("");
  const [nextEpisode, setNextEpisode] = useState<string | null>(null);
  const [prevEpisode, setPrevEpisode] = useState<string | null>(null);
  const supabase = createClient();
  const { saveProgress, getProgress } = useWatchTracking();

  useEffect(() => {
    const fetchEpisode = async () => {
      try {
        const response = await fetch(`/api/episodes/${episodeId}`);
        const data = await response.json();

        if (data.error) {
          console.error(data.error);
          return;
        }

        setEpisode(data);
        if (data.sources && data.sources.length > 0) {
          // Prefer HLS sources
          const hlsSource = data.sources.find(
            (s: any) => s.type === "hls" || s.url.includes(".m3u8")
          );
          setSelectedSource(hlsSource?.url || data.sources[0].url);
        }

        // Get anime info
        if (data.anime_id) {
          const animeResponse = await fetch(`/api/anime/${data.anime_id}`);
          const animeData = await animeResponse.json();
          setAnime(animeData);

          // Get next/prev episodes
          const episodesResponse = await fetch(
            `/api/anime/${data.anime_id}`
          );
          const fullAnime = await episodesResponse.json();
          const currentIndex = fullAnime.episodes?.findIndex(
            (e: any) => e.id === episodeId
          );
          if (currentIndex !== undefined && fullAnime.episodes) {
            if (currentIndex > 0) {
              setPrevEpisode(fullAnime.episodes[currentIndex - 1].id);
            }
            if (currentIndex < fullAnime.episodes.length - 1) {
              setNextEpisode(fullAnime.episodes[currentIndex + 1].id);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching episode:", error);
      } finally {
        setLoading(false);
      }
    };

    if (episodeId) {
      fetchEpisode();
    }
  }, [episodeId]);

  const handleTimeUpdate = async (currentTime: number, duration: number) => {
    if (episode && duration > 0) {
      await saveProgress(episode.id, currentTime, duration);
    }
  };

  const initialTime = episode ? getProgress(episode.id) : 0;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!episode || !selectedSource) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500">الحلقة غير متاحة</p>
          <Link href="/anime" className="text-blue-600 hover:underline mt-4 inline-block">
            العودة إلى قائمة الأنمي
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        {anime && (
          <Link
            href={`/anime/${anime.id}`}
            className="text-blue-600 hover:underline"
          >
            {anime.title_ar || anime.title_en}
          </Link>
        )}
        <h1 className="text-2xl font-bold mt-2">
          الحلقة {episode.number}
          {episode.title && `: ${episode.title}`}
        </h1>
      </div>

      <div className="aspect-video mb-4">
        <VideoPlayer
          src={selectedSource}
          onTimeUpdate={handleTimeUpdate}
          initialTime={initialTime}
          className="w-full h-full"
        />
      </div>

      {/* Episode Navigation */}
      <div className="flex justify-between items-center mb-6">
        {prevEpisode ? (
          <Link
            href={`/watch/${prevEpisode}`}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <ArrowRight className="h-5 w-5" />
            <span>الحلقة السابقة</span>
          </Link>
        ) : (
          <div></div>
        )}

        {nextEpisode && (
          <Link
            href={`/watch/${nextEpisode}`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <span>الحلقة التالية</span>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        )}
      </div>

      {/* Source Selection */}
      {episode.sources && episode.sources.length > 1 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">اختر جودة الفيديو:</h3>
          <div className="flex flex-wrap gap-2">
            {episode.sources.map((source, index) => (
              <button
                key={index}
                onClick={() => setSelectedSource(source.url)}
                className={`px-4 py-2 rounded-lg ${
                  selectedSource === source.url
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {source.quality || source.provider || `مصدر ${index + 1}`}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
