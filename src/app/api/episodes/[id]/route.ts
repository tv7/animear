import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { animeProvider } from "@/lib/api/anime-provider";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get episode from database
    const { data: episode, error } = await supabase
      .from("episodes")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !episode) {
      return NextResponse.json(
        { error: "Episode not found" },
        { status: 404 }
      );
    }

    // Parse sources
    let sources = [];
    try {
      sources = typeof episode.sources === "string" 
        ? JSON.parse(episode.sources) 
        : episode.sources || [];
    } catch {
      sources = [];
    }

    // If no sources, try to fetch from provider
    if (sources.length === 0 && episode.provider_id) {
      const providerData = await animeProvider.getEpisodeSources(
        episode.provider_id
      );
      if (providerData?.sources) {
        sources = providerData.sources;
        // Update episode with new sources
        await supabase
          .from("episodes")
          .update({ sources: JSON.stringify(sources) })
          .eq("id", id);
      }
    }

    return NextResponse.json({
      ...episode,
      sources,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
