import { getReleases } from "@/lib/releases";
import { ReleaseCard } from "@/components/release-card";
import { Nav } from "@/components/nav";

export const revalidate = 60;

export default async function HomePage() {
  const releases = await getReleases();

  const production = releases.filter((r) => r.environment === "production");
  const staging = releases.filter((r) => r.environment === "staging");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Nav count={releases.length} activeSection="releases" />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-8 space-y-10">

        {/* Production */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Production
            </h2>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          </div>
          {production.length === 0 ? (
            <p className="text-sm text-slate-400 italic">No production releases yet.</p>
          ) : (
            <div className="space-y-4">
              {production.map((release) => (
                <ReleaseCard key={release.id} release={release} />
              ))}
            </div>
          )}
        </section>

        {/* Staging */}
        {staging.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Staging
              </h2>
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            </div>
            <div className="space-y-4">
              {staging.map((release) => (
                <ReleaseCard key={release.id} release={release} />
              ))}
            </div>
          </section>
        )}

      </main>
    </div>
  );
}
