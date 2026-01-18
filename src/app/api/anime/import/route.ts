import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { animeProvider } from "@/lib/api/anime-provider";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const supabase = await createClient();
    const body = await request.json();
    const { animeId, providerId } = body;

    if (!animeId && !providerId) {
      return NextResponse.json(
        { error: "Anime ID or Provider ID is required" },
        { status: 400 }
      );
    }

    // Get anime info from provider
    const animeInfo = await animeProvider.getAnimeInfo(providerId || animeId);

    if (!animeInfo) {
      return NextResponse.json(
        { error: "Anime not found in provider" },
        { status: 404 }
      );
    }

    // Map provider data to our schema
    const animeData = {
      title_ar: animeInfo.title?.native || animeInfo.title?.romaji || "",
      title_en: animeInfo.title?.english || animeInfo.title?.romaji || "",
      description: animeInfo.description || "",
      cover: animeInfo.coverImage || "",
      banner: animeInfo.bannerImage || "",
      status:
        animeInfo.status?.toLowerCase() === "releasing"
          ? "ongoing"
          : animeInfo.status?.toLowerCase() === "completed"
          ? "completed"
          : "upcoming",
      genres: animeInfo.genres || [],
      year: animeInfo.year || null,
      rating: null,
    };

    // Insert or update anime
    const { data: anime, error: animeError } = await supabase
      .from("anime")
      .upsert(animeData, {
        onConflict: "title_en",
        ignoreDuplicates: false,
      })
      .select()
      .single();

    if (animeError) {
      return NextResponse.json(
        { error: "Failed to save anime", details: animeError.message },
        { status: 500 }
      );
    }

    // Import episodes if available
    if (animeInfo.episodes && Array.isArray(animeInfo.episodes)) {
      const episodesData = animeInfo.episodes.map((ep: any) => ({
        anime_id: anime.id,
        number: ep.number || 0,
        title: ep.title || null,
        sources: JSON.stringify(ep.sources || []),
        duration: ep.duration || null,
        thumbnail: ep.image || null,
      }));

      // Delete existing episodes and insert new ones
      await supabase.from("episodes").delete().eq("anime_id", anime.id);

      if (episodesData.length > 0) {
        const { error: episodesError } = await supabase
          .from("episodes")
          .insert(episodesData);

        if (episodesError) {
          console.error("Error importing episodes:", episodesError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      anime,
      episodesCount: animeInfo.episodes?.length || 0,
    });
  } catch (error: any) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
