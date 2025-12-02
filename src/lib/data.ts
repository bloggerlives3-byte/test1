import { getServiceClient } from "./supabase";
import type { AdminMetrics, ImageRecord } from "./types";

export async function getRecentImages(limit = 12): Promise<ImageRecord[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return [];
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("images")
    .select("id, public_url, filename, created_at, expires_at, size, content_type")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    console.error("Failed to load images", error?.message);
    return [];
  }

  return data.map((item) => ({
    id: item.id,
    publicUrl: item.public_url,
    filename: item.filename,
    createdAt: item.created_at,
    expiresAt: item.expires_at,
    size: item.size,
    contentType: item.content_type,
  }));
}

export async function getAdminMetrics(): Promise<AdminMetrics> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      totalUploads: 0,
      expiringSoon: 0,
      lastUploadAt: null,
      totalBytes: 0,
    };
  }

  const supabase = getServiceClient();
  const { data, error, count } = await supabase
    .from("images")
    .select("created_at, expires_at, size", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(500);

  if (error || !data) {
    console.error("Failed to load metrics", error?.message);
    return {
      totalUploads: 0,
      expiringSoon: 0,
      lastUploadAt: null,
      totalBytes: 0,
    };
  }

  const totalBytes = data.reduce((acc, item) => acc + (item.size ?? 0), 0);
  const expiringSoon = data.filter((item) => {
    if (!item.expires_at) return false;
    const expires = new Date(item.expires_at).getTime();
    const now = Date.now();
    const inThreeDays = now + 3 * 24 * 60 * 60 * 1000;
    return expires < inThreeDays;
  }).length;

  const lastUploadAt = data[0]?.created_at ?? null;

  return {
    totalUploads: count ?? data.length,
    expiringSoon,
    lastUploadAt,
    totalBytes,
  };
}
