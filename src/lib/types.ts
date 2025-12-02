export type ExpiryOption = "24h" | "7d" | "permanent";

export interface ImageRecord {
  id: string;
  publicUrl: string;
  filename: string;
  createdAt: string;
  expiresAt: string | null;
  size: number | null;
  contentType?: string | null;
}

export interface AdminMetrics {
  totalUploads: number;
  expiringSoon: number;
  lastUploadAt: string | null;
  totalBytes: number;
}
