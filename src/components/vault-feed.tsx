import Image from "next/image";
import type { ImageRecord } from "@/lib/types";

function formatDistance(dateString: string) {
  const date = new Date(dateString);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 48) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function VaultFeed({ images }: { images: ImageRecord[] }) {
  return (
    <div className="rounded-3xl bg-slate-900 text-white shadow-lg shadow-slate-400/10 ring-1 ring-white/10">
      <div className="border-b border-white/10 px-6 py-4">
        <p className="text-xs uppercase tracking-[0.2rem] text-slate-300">Vault pulse</p>
        <h3 className="text-xl font-semibold">Latest public links</h3>
        <p className="mt-1 text-sm text-slate-300">
          A rolling snapshot of the newest uploads (limit 12) to keep an eye on freshness.
        </p>
      </div>
      <div className="grid gap-2 p-6 sm:grid-cols-2">
        {images.length === 0 && (
          <div className="col-span-full rounded-xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-slate-200">
            No data yet. Connect Supabase and start uploading to see activity.
          </div>
        )}
        {images.map((image) => (
          <div
            key={image.id}
            className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
          >
            <div className="flex items-center justify-between">
              <p className="truncate text-sm font-semibold">{image.filename}</p>
              <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] font-semibold text-emerald-200">
                {image.expiresAt ? "Expiring" : "Permanent"}
              </span>
            </div>
            <div className="relative h-32 overflow-hidden rounded-lg border border-white/10 bg-black/20">
              <Image
                src={image.publicUrl}
                alt={image.filename}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover"
                priority={false}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-200/80">
              <span>{formatDistance(image.createdAt)}</span>
              <span>
                {image.size ? `${(image.size / 1024 / 1024).toFixed(2)} MB` : "Size unknown"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
