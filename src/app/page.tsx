import { AdminPanel } from "@/components/admin-panel";
import { AuthPanel } from "@/components/auth-panel";
import { UploadPanel } from "@/components/upload-panel";
import { VaultFeed } from "@/components/vault-feed";
import { getAdminMetrics, getRecentImages } from "@/lib/data";
import { AuthProvider } from "@/context/auth-context";
import { SiteHeader } from "@/components/site-header";

export default async function Home() {
  const [recentImages, metrics] = await Promise.all([
    getRecentImages(),
    getAdminMetrics(),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f4f1] via-[#f3f7f8] to-[#ecf1ff] text-slate-900">
      <AuthProvider>
        <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:gap-8 sm:px-8 sm:py-10 lg:px-12">
          <SiteHeader />

          <section id="upload" className="grid gap-6 lg:grid-cols-[2fr,1fr]">
            <UploadPanel initialImages={recentImages} />
            <AuthPanel />
          </section>

          <section id="feed" className="grid gap-6 lg:grid-cols-[2fr,1fr]">
            <VaultFeed images={recentImages} />
            <div id="admin">
              <AdminPanel metrics={metrics} />
            </div>
          </section>
        </main>
      </AuthProvider>
    </div>
  );
}
