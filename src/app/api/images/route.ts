import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ images: [] });
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("images")
    .select("id, public_url, filename, created_at, expires_at, size")
    .order("created_at", { ascending: false })
    .limit(12);

  if (error || !data) {
    return NextResponse.json({ images: [], error: error?.message }, { status: 500 });
  }

  return NextResponse.json({
    images: data.map((item) => ({
      id: item.id,
      publicUrl: item.public_url,
      filename: item.filename,
      createdAt: item.created_at,
      expiresAt: item.expires_at,
      size: item.size,
    })),
  });
}
