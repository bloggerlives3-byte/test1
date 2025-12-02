import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getServiceClient } from "@/lib/supabase";
import type { ExpiryOption } from "@/lib/types";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const DEFAULT_BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? "images";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "Supabase environment variables are missing." },
      { status: 500 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const expiresIn = (formData.get("expiresIn") as ExpiryOption | null) ?? "permanent";

  if (!file) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  if (!ACCEPTED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Unsupported file type." }, { status: 400 });
  }

  const supabase = getServiceClient();
  const arrayBuffer = await file.arrayBuffer();
  const fileExt = file.name.split(".").pop();
  const id = randomUUID();
  const filePath = `${id}.${fileExt ?? "img"}`;

  const expiresAt = (() => {
    const now = new Date();
    if (expiresIn === "24h") {
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
    if (expiresIn === "7d") {
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    }
    return null;
  })();

  const { error: uploadError } = await supabase.storage
    .from(DEFAULT_BUCKET)
    .upload(filePath, Buffer.from(arrayBuffer), {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json(
      { error: "Upload failed", details: uploadError.message },
      { status: 500 },
    );
  }

  const { data: publicData } = supabase.storage.from(DEFAULT_BUCKET).getPublicUrl(filePath);
  const publicUrl = publicData?.publicUrl ?? "";

  const { error: insertError, data: inserted } = await supabase
    .from("images")
    .insert({
      id,
      path: filePath,
      public_url: publicUrl,
      filename: file.name,
      size: file.size,
      content_type: file.type,
      expires_at: expiresAt ? expiresAt.toISOString() : null,
    })
    .select("*")
    .single();

  if (insertError || !inserted) {
    return NextResponse.json(
      { error: "Metadata save failed", details: insertError?.message },
      { status: 500 },
    );
  }

  return NextResponse.json({
    id,
    url: publicUrl,
    filename: file.name,
    expiresAt: expiresAt ? expiresAt.toISOString() : null,
  });
}
