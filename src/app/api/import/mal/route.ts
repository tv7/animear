import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { getUserMALList, mapMALStatus } from "@/lib/api/myanimelist";
import { animeProvider } from "@/lib/api/anime-provider";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const supabase = await createClient();
    const body = await request.json();
    const { accessToken } = body;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Access token is required" },
        { status: 400 }
      );
    }

    // Fetch MAL list
    const malEntries = await getUserMALList(accessToken);

    if (malEntries.length === 0) {
      return NextResponse.json(
        { error: "No entries found" },
        { status: 404 }
      );
    }

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    // Process each entry
    for (const entry of malEntries) {
      try {
        const anime = entry.node;
        const title = anime.title;

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
          const status = mapMALStatus(entry.list_status.status);
          await supabase.from("watchlist").upsert(
            {
              user_id: user.id,
              anime_id: animeId,
              status,
              rating: entry.list_status.score > 0 ? entry.list_status.score / 10 : null,
              notes: null,
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
        errors.push(`${entry.node.title || "Unknown"}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      total: malEntries.length,
      errors: errors.slice(0, 10), // Limit errors
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
