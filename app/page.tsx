import { getReleases } from "@/lib/releases";
import { ReleaseCard } from "@/components/release-card";
import { Nav } from "@/components/nav";
import { Construction, FlaskConical } from "lucide-react";

export const revalidate = 60;

export default async function HomePage() {
  const releases = await getReleases();

  const production = releases.filter((r) => r.environment === "production");
  const staging = releases.filter((r) => r.environment === "staging");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Nav count={releases.length} activeSection="releases" />

      {/* SAMPLE banner */}
      <div className="border-b border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-2.5 flex items-center gap-3">
          <FlaskConical className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <p className="text-xs text-amber-700 dark:text-amber-300">
            <span className="font-bold mr-1.5">SAMPLE DATA</span>
            This page shows placeholder release data. Deployment automation (GitHub → Vercel webhook) is coming soon — real deploys will appear here automatically.
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-8 space-y-10">

        {/* WIP notice */}
        <div className="flex items-start gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3.5 shadow-sm">
          <Construction className="h-4 w-4 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
            <p className="font-semibold text-slate-700 dark:text-slate-300">Work in progress</p>
            <p>Releases will be populated automatically once the Vercel deployment webhook is wired up. Each deployment will generate a changelog entry here showing environment, version, commit message, and deploy time.</p>
          </div>
        </div>

        {/* Production */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Production
            </h2>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          </div>
          {production.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-600 italic">No production releases yet.</p>
          ) : (
            <div className="space-y-4">
              {production.map((release) => (
                <ReleaseCard key={release.id} release={release} prs={release.prs} />
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
                <ReleaseCard key={release.id} release={release} prs={release.prs} />
              ))}
            </div>
          </section>
        )}

      </main>
    </div>
  );
}
