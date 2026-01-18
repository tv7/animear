import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");
    const position = searchParams.get("position");
    const activeOnly = searchParams.get("active_only") === "true";

    let query = supabase.from("ads").select("*");

    if (type) {
      query = query.eq("type", type);
    }

    if (position) {
      query = query.eq("position", position);
    }

    if (activeOnly) {
      const now = new Date().toISOString();
      query = query
        .eq("active", true)
        .or(`start_date.is.null,start_date.lte.${now}`)
        .or(`end_date.is.null,end_date.gte.${now}`);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

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
    const { requireAdmin } = await import("@/lib/supabase/auth");
    await requireAdmin();
    const supabase = await createClient();
    const body = await request.json();
    const { type, position, content, active, start_date, end_date } = body;

    if (!type || !position || !content) {
      return NextResponse.json(
        { error: "type, position, and content are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("ads")
      .insert({
        type,
        position,
        content,
        active: active !== undefined ? active : true,
        start_date: start_date || null,
        end_date: end_date || null,
      })
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
