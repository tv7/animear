"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { animeProvider } from "@/lib/api/anime-provider";
import Link from "next/link";
import { Search, Plus } from "lucide-react";

export default function AdminAnimePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const results = await animeProvider.searchAnime(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (animeId: string) => {
    setImporting(animeId);
    try {
      const response = await fetch("/api/anime/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId: animeId }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`تم استيراد الأنمي بنجاح! (${data.episodesCount} حلقة)`);
        setSearchResults((prev) =>
          prev.filter((item) => item.id !== animeId)
        );
      } else {
        alert(`خطأ: ${data.error}`);
      }
    } catch (error) {
      console.error("Error importing:", error);
      alert("حدث خطأ أثناء الاستيراد");
    } finally {
      setImporting(null);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">إدارة الأنمي</h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
        <div className="flex gap-2">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="ابحث عن أنمي..."
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={loading}>
            <Search className="h-4 w-4 ml-2" />
            {loading ? "جاري البحث..." : "بحث"}
          </Button>
        </div>
      </div>

      {searchResults.length > 0 && (
        <div className="space-y-4">
          {searchResults.map((anime) => (
            <div
              key={anime.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4 flex-1">
                {anime.coverImage && (
                  <img
                    src={anime.coverImage}
                    alt={anime.title?.english || anime.title?.romaji}
                    className="w-16 h-24 object-cover rounded"
                  />
                )}
                <div>
                  <h3 className="font-semibold text-lg">
                    {anime.title?.english || anime.title?.romaji}
                  </h3>
                  {anime.title?.native && (
                    <p className="text-gray-500 text-sm">
                      {anime.title.native}
                    </p>
                  )}
                </div>
              </div>
              <Button
                onClick={() => handleImport(anime.id)}
                disabled={importing === anime.id}
              >
                <Plus className="h-4 w-4 ml-2" />
                {importing === anime.id ? "جاري الاستيراد..." : "استيراد"}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
