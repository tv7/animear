import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ anime_id: string }> }
) {
  try {
    const user = await requireAuth();
    const { anime_id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("watchlist")
      .select("*")
      .eq("user_id", user.id)
      .eq("anime_id", anime_id)
      .single();

    if (error && error.code !== "PGRST116") {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: data || null });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ anime_id: string }> }
) {
  try {
    const user = await requireAuth();
    const { anime_id } = await params;
    const supabase = await createClient();
    const body = await request.json();
    const { status, rating, notes } = body;

    const { data, error } = await supabase
      .from("watchlist")
      .update({
        status,
        rating,
        notes,
      })
      .eq("user_id", user.id)
      .eq("anime_id", anime_id)
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
