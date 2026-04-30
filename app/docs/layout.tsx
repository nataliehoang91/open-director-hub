import { Nav } from "@/components/nav";
import { Lock, Construction } from "lucide-react";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const isProduction = process.env.VERCEL_ENV === "production";

  if (isProduction) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Nav activeSection="docs" />

        {/* Full-page in-progress gate */}
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] px-4 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700">
            <Lock className="h-7 w-7 text-slate-400 dark:text-slate-500" />
          </div>

          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Internal Docs
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed mb-6">
            This section contains internal engineering documentation and is not available in the public release.
          </p>

          {/* In progress banner */}
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50 px-5 py-4 text-left max-w-sm">
            <Construction className="h-4 w-4 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 mb-1">In progress</p>
              <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                Access controls and visibility settings are being built. This section will be available to authorised team members soon.
              </p>
            </div>
          </div>

          <p className="mt-6 text-[11px] text-slate-300 dark:text-slate-700 font-mono">
            VERCEL_ENV=production · /docs blocked
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
