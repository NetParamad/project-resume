import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { nanoid } from "nanoid";
import { createResumeSchema } from "@/lib/validation/resumes";
import { parseJsonBody } from "@/lib/validation/parse";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("resumes")
      .select("id, title, template, document_type, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/resumes error:", error);
    return NextResponse.json({ error: "Failed to fetch resumes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = await parseJsonBody(req, createResumeSchema);
    if (parsed.error) return parsed.error;
    const body = parsed.data;
    const shareSlug = nanoid(12);

    const { data, error } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,
        title: body.title || "Untitled Resume",
        document_type: body.document_type || "resume",
        template: body.template || (body.document_type === "cv" ? "academic" : "modern"),
        data: body.data || {},
        share_slug: shareSlug,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error("POST /api/resumes error:", error);
    return NextResponse.json({ error: "Failed to create resume" }, { status: 500 });
  }
}
