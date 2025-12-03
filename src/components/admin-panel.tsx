import type { AdminMetrics } from "@/lib/types";

function formatBytes(bytes: number) {
  if (!bytes) return "0 MB";
  const mb = bytes / 1024 / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}

export function AdminPanel({ metrics }: { metrics: AdminMetrics }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-lg shadow-slate-200/40 ring-1 ring-black/5 backdrop-blur sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2rem] text-slate-500">Admin</p>
          <h3 className="text-xl font-semibold text-slate-900">Health dashboard</h3>
          <p className="mt-1 text-sm text-slate-600">
            Quick signal on storage usage, churn risk, and the latest activity.
          </p>
        </div>
        <div className="w-full rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 sm:w-auto">
          MVP
        </div>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.15rem] text-slate-500">
            Total uploads
          </p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">
            {metrics.totalUploads}
          </p>
          <p className="text-xs text-slate-500">Records counted in Supabase</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.15rem] text-slate-500">
            Storage used
          </p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">
            {formatBytes(metrics.totalBytes)}
          </p>
          <p className="text-xs text-slate-500">Across tracked uploads</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.15rem] text-slate-500">
            Expiring soon
          </p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">
            {metrics.expiringSoon}
          </p>
          <p className="text-xs text-slate-500">Within the next 72 hours</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.15rem] text-slate-500">
            Last upload
          </p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">
            {metrics.lastUploadAt ? new Date(metrics.lastUploadAt).toLocaleString() : "—"}
          </p>
          <p className="text-xs text-slate-500">Server-rendered snapshot</p>
        </div>
      </div>
    </div>
  );
}
