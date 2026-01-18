"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Import } from "lucide-react";

export function ImportWatchlist() {
  const [anilistUsername, setAnilistUsername] = useState("");
  const [malAccessToken, setMalAccessToken] = useState("");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"anilist" | "mal">("anilist");

  const handleAniListImport = async () => {
    if (!anilistUsername.trim()) {
      alert("يرجى إدخال اسم المستخدم");
      return;
    }

    setImporting(true);
    setResult(null);

    try {
      const response = await fetch("/api/import/anilist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: anilistUsername }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error importing from AniList:", error);
      setResult({ error: "حدث خطأ أثناء الاستيراد" });
    } finally {
      setImporting(false);
    }
  };

  const handleMALImport = async () => {
    if (!malAccessToken.trim()) {
      alert("يرجى إدخال رمز الوصول");
      return;
    }

    setImporting(true);
    setResult(null);

    try {
      const response = await fetch("/api/import/mal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: malAccessToken }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error importing from MAL:", error);
      setResult({ error: "حدث خطأ أثناء الاستيراد" });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-4">
      <h2 className="text-2xl font-bold mb-4">استيراد قائمة المشاهدة</h2>

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab("anilist")}
          className={`px-4 py-2 font-medium ${
            activeTab === "anilist"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500"
          }`}
        >
          AniList
        </button>
        <button
          onClick={() => setActiveTab("mal")}
          className={`px-4 py-2 font-medium ${
            activeTab === "mal"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500"
          }`}
        >
          MyAnimeList
        </button>
      </div>

      {activeTab === "anilist" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              اسم مستخدم AniList
            </label>
            <Input
              type="text"
              value={anilistUsername}
              onChange={(e) => setAnilistUsername(e.target.value)}
              placeholder="username"
            />
          </div>
          <Button
            onClick={handleAniListImport}
            disabled={importing}
            className="w-full"
          >
            <Import className="h-4 w-4 ml-2" />
            {importing ? "جاري الاستيراد..." : "استيراد من AniList"}
          </Button>
        </div>
      )}

      {activeTab === "mal" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              رمز الوصول (Access Token)
            </label>
            <Input
              type="text"
              value={malAccessToken}
              onChange={(e) => setMalAccessToken(e.target.value)}
              placeholder="Access Token"
            />
            <p className="text-sm text-gray-500 mt-1">
              يمكنك الحصول على رمز الوصول من{" "}
              <a
                href="https://myanimelist.net/apiconfig"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                إعدادات API
              </a>
            </p>
          </div>
          <Button
            onClick={handleMALImport}
            disabled={importing}
            className="w-full"
          >
            <Import className="h-4 w-4 ml-2" />
            {importing ? "جاري الاستيراد..." : "استيراد من MyAnimeList"}
          </Button>
        </div>
      )}

      {result && (
        <div
          className={`p-4 rounded-lg ${
            result.error
              ? "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400"
              : "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400"
          }`}
        >
          {result.error ? (
            <p>{result.error}</p>
          ) : (
            <div>
              <p className="font-semibold">تم الاستيراد بنجاح!</p>
              <p>تم استيراد: {result.imported} عنصر</p>
              {result.skipped > 0 && (
                <p>تم تخطي: {result.skipped} عنصر (غير موجود)</p>
              )}
              {result.errors && result.errors.length > 0 && (
                <div className="mt-2">
                  <p className="font-semibold">أخطاء:</p>
                  <ul className="list-disc list-inside text-sm">
                    {result.errors.map((error: string, i: number) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
