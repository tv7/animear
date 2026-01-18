import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const episodeId = searchParams.get("episode_id");

    let query = supabase
      .from("watch_history")
      .select(
        `
        *,
        episodes (
          id,
          number,
          title,
          anime_id,
          anime:anime_id (
            id,
            title_ar,
            title_en,
            cover
          )
        )
      `
      )
      .eq("user_id", user.id)
      .order("watched_at", { ascending: false });

    if (episodeId) {
      query = query.eq("episode_id", episodeId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: data || [] });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const supabase = await createClient();
    const body = await request.json();
    const { episode_id, progress, duration } = body;

    if (!episode_id || progress === undefined) {
      return NextResponse.json(
        { error: "episode_id and progress are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("watch_history")
      .upsert(
        {
          user_id: user.id,
          episode_id,
          progress: Math.floor(progress),
          duration: duration ? Math.floor(duration) : null,
        },
        {
          onConflict: "user_id,episode_id",
        }
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
