import { AdminPanel } from "@/components/admin-panel";
import { UploadPanel } from "@/components/upload-panel";
import { VaultFeed } from "@/components/vault-feed";
import { getAdminMetrics, getRecentImages } from "@/lib/data";

export default async function Home() {
  const [recentImages, metrics] = await Promise.all([
    getRecentImages(),
    getAdminMetrics(),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f4f1] via-[#f3f7f8] to-[#ecf1ff] text-slate-900">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-8 lg:px-12">
        <header className="flex flex-col gap-4 rounded-3xl bg-white/80 p-5 shadow-xl ring-1 ring-black/5 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2rem] text-slate-500">MVP v1.0</p>
            <h1 className="text-2xl font-semibold leading-tight sm:text-3xl lg:text-4xl">
              PicVault — private image hosting without the friction
            </h1>
            <p className="mt-2 max-w-3xl text-base text-slate-600 sm:text-lg">
              Built for quick sharing, auto-expiring links, and a zero-tracking experience.
              Drop a file, get a link, and stay in control of its lifespan.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm text-slate-600 sm:items-end">
            <div className="flex w-full items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 font-medium text-emerald-700 shadow-inner sm:w-auto">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              Live privacy mode
            </div>
            <div className="w-full rounded-full bg-slate-100 px-3 py-2 font-medium text-slate-700 shadow-inner sm:w-auto">
              Supabase storage + Next.js
            </div>
          </div>
        </header>

        <UploadPanel initialImages={recentImages} />

        <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <VaultFeed images={recentImages} />
          <AdminPanel metrics={metrics} />
        </section>
      </main>
    </div>
  );
}
