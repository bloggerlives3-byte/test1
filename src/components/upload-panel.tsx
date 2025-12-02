"use client";

import Image from "next/image";
import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ExpiryOption, ImageRecord } from "@/lib/types";

type UploadStatus = "idle" | "uploading" | "ready" | "error";

type SessionUpload = {
  id: string;
  filename: string;
  url: string;
  expiresAt: string | null;
  status: UploadStatus;
  message?: string;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const STORAGE_KEY = "picvault-uploads";

function formatExpiry(expiresAt: string | null) {
  if (!expiresAt) return "Permanent";
  return new Date(expiresAt).toLocaleString();
}

export function UploadPanel({ initialImages }: { initialImages: ImageRecord[] }) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [expiry, setExpiry] = useState<ExpiryOption>("7d");
  const [error, setError] = useState<string | null>(null);
  const [uploads, setUploads] = useState<SessionUpload[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = sessionStorage.getItem(STORAGE_KEY);
    const nextUploads =
      saved !== null
        ? (JSON.parse(saved) as SessionUpload[])
        : initialImages.map((item) => ({
            id: item.id,
            filename: item.filename,
            url: item.publicUrl,
            expiresAt: item.expiresAt,
            status: "ready" as UploadStatus,
          }));

    startTransition(() => {
      setUploads(nextUploads);
    });
  }, [initialImages]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (uploads.length === 0) {
      sessionStorage.removeItem(STORAGE_KEY);
      return;
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(uploads));
  }, [uploads]);

  const uploadFile = useCallback(
    async (file: File) => {
      setError(null);
      const tempId = crypto.randomUUID();
      setUploads((prev) => [
        {
          id: tempId,
          filename: file.name,
          url: "",
          expiresAt: null,
          status: "uploading",
        },
        ...prev,
      ]);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("expiresIn", expiry);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const message = "Upload failed. Please retry.";
        setUploads((prev) =>
          prev.map((item) =>
            item.id === tempId ? { ...item, status: "error", message } : item,
          ),
        );
        setError(message);
        return;
      }

      const payload = await response.json();
      setUploads((prev) =>
        prev.map((item) =>
          item.id === tempId
            ? {
                ...item,
                id: payload.id,
                url: payload.url,
                expiresAt: payload.expiresAt,
                status: "ready",
              }
            : item,
        ),
      );
    },
    [expiry],
  );

  const onFilesSelected = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const list = Array.from(files);
      list.forEach((file) => {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          setError("Only JPG, PNG, GIF, or WebP are allowed.");
          return;
        }
        if (file.size > MAX_FILE_SIZE) {
          setError("Files are limited to 10MB for the MVP.");
          return;
        }
        uploadFile(file);
      });
    },
    [uploadFile],
  );

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      onFilesSelected(event.dataTransfer.files);
    },
    [onFilesSelected],
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const selectExpiry = useMemo(
    () => [
      { value: "24h", label: "24 hours" },
      { value: "7d", label: "7 days" },
      { value: "permanent", label: "Permanent" },
    ],
    [],
  );

  const copyLink = async (url: string) => {
    await navigator.clipboard.writeText(url);
  };

  return (
    <div className="rounded-3xl bg-white/80 p-6 shadow-xl ring-1 ring-black/5 backdrop-blur">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2rem] text-slate-500">PicVault</p>
          <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">
            Anonymous uploads with instant links
          </h1>
          <p className="mt-2 max-w-2xl text-base text-slate-600">
            Drag & drop images to store them in Supabase storage. Choose how long each file
            lives before it auto-expires.
          </p>
        </div>
        <div className="flex gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">
          <span className="inline-flex h-2 w-2 translate-y-1.5 rounded-full bg-emerald-500" />
          Privacy mode on — no tracking
        </div>
      </div>

      <div
        className={`mt-6 flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed bg-slate-50/70 px-6 py-10 transition ${
          isDragging ? "border-emerald-500 bg-emerald-50" : "border-slate-200"
        }`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        <p className="text-sm font-semibold uppercase tracking-[0.2rem] text-slate-500">
          Drop images
        </p>
        <h2 className="text-2xl font-semibold text-slate-900 text-center">
          Secure, fast uploads in one move
        </h2>
        <p className="max-w-xl text-center text-sm text-slate-600">
          Supports JPG, PNG, GIF, and WebP up to 10MB. Anonymous by default—no cookies or
          accounts required.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {selectExpiry.map((option) => (
            <button
              key={option.value}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                expiry === option.value
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200"
                  : "bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-emerald-500"
              }`}
              onClick={() => setExpiry(option.value as ExpiryOption)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-200 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-300"
            type="button"
            onClick={() => fileInputRef.current?.click()}
          >
            Choose files
          </button>
          <span className="text-sm text-slate-500">or drag files into this area</span>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            multiple
            className="hidden"
            onChange={(event) => onFilesSelected(event.target.files)}
          />
        </div>
        {error ? <p className="text-sm text-red-500">{error}</p> : null}
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2rem] text-slate-500">Session</p>
            <h3 className="text-xl font-semibold text-slate-900">Your recent uploads</h3>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            Auto-saves to this browser only
          </span>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {uploads.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
              Nothing here yet. Upload an image to see it appear instantly.
            </div>
          )}
          {uploads.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-white px-4 py-4 shadow-sm ring-1 ring-black/5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {item.filename}
                  </p>
                  <p className="text-xs text-slate-500">Expires: {formatExpiry(item.expiresAt)}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    item.status === "uploading"
                      ? "bg-amber-100 text-amber-700"
                      : item.status === "ready"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {item.status === "uploading"
                    ? "Uploading"
                    : item.status === "ready"
                      ? "Ready"
                      : "Error"}
                </span>
              </div>
              {item.url ? (
                <div className="relative h-40 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                  <Image
                    src={item.url}
                    alt={item.filename}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition duration-300 hover:scale-[1.02]"
                    priority={false}
                  />
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
                  {item.status === "uploading" ? "Uploading…" : "Preview unavailable"}
                </div>
              )}
              {item.url && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-700">
                    <span className="truncate">{item.url}</span>
                    <button
                      className="shrink-0 rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-white transition hover:-translate-y-0.5 hover:shadow"
                      type="button"
                      onClick={() => copyLink(item.url)}
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">
                    Share the link anywhere. Links stay live until their expiry hits.
                  </p>
                </div>
              )}
              {item.status === "error" && item.message ? (
                <p className="text-xs text-rose-600">{item.message}</p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
