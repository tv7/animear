import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { getUserAniListList, mapAniListStatus } from "@/lib/api/anilist";
import { animeProvider } from "@/lib/api/anime-provider";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const supabase = await createClient();
    const body = await request.json();
    const { username } = body;

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    // Fetch AniList list
    const anilistEntries = await getUserAniListList(username);

    if (anilistEntries.length === 0) {
      return NextResponse.json(
        { error: "No entries found or user not found" },
        { status: 404 }
      );
    }

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    // Process each entry
    for (const entry of anilistEntries) {
      try {
        const media = entry.media;
        const title = media.title?.english || media.title?.romaji || "";

        if (!title) continue;

        // Search for anime in our database
        const { data: existingAnime } = await supabase
          .from("anime")
          .select("id")
          .or(`title_en.ilike.%${title}%,title_ar.ilike.%${title}%`)
          .limit(1)
          .single();

        let animeId = existingAnime?.id;

        // If not found, try to import from provider
        if (!animeId) {
          const searchResults = await animeProvider.searchAnime(title);
          if (searchResults.length > 0) {
            // Import the first result
            const importResponse = await fetch(
              `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/anime/import`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Cookie: request.headers.get("cookie") || "",
                },
                body: JSON.stringify({
                  providerId: searchResults[0].id,
                }),
              }
            );

            if (importResponse.ok) {
              const importData = await importResponse.json();
              animeId = importData.anime?.id;
            }
          }
        }

        if (animeId) {
          // Add to watchlist
          const status = mapAniListStatus(entry.status);
          await supabase.from("watchlist").upsert(
            {
              user_id: user.id,
              anime_id: animeId,
              status,
              rating: entry.score > 0 ? entry.score / 10 : null,
              notes: entry.notes || null,
            },
            {
              onConflict: "user_id,anime_id",
            }
          );
          imported++;
        } else {
          skipped++;
        }
      } catch (error: any) {
        errors.push(`${entry.media.title?.english || "Unknown"}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      total: anilistEntries.length,
      errors: errors.slice(0, 10), // Limit errors
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
