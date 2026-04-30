import Link from "next/link";
import { Rocket } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

interface NavProps {
  count?: number;
  activeSection?: "releases" | "docs" | "api";
}

const WIP = () => (
  <span className="text-[9px] font-bold px-1 py-px rounded bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 ring-1 ring-inset ring-amber-200 dark:ring-amber-700 leading-tight">
    WIP
  </span>
);

export function Nav({ count, activeSection }: NavProps) {
  const isProduction = process.env.VERCEL_ENV === "production";

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10 backdrop-blur-sm bg-white/90 dark:bg-slate-900/90">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <Rocket className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-slate-900 dark:text-slate-100">Open Director</span>
          </Link>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <nav className="flex items-center gap-1">
            <Link
              href="/"
              className={`flex items-center gap-1.5 text-sm px-2.5 py-1 rounded-md transition-colors ${
                activeSection === "releases" || !activeSection
                  ? "text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 font-medium"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              Releases
              <WIP />
            </Link>

            {/* Docs — disabled in production */}
            {isProduction ? (
              <span
                title="Internal docs — not available in production"
                className="flex items-center gap-1.5 text-sm px-2.5 py-1 rounded-md cursor-not-allowed text-slate-300 dark:text-slate-600 select-none"
              >
                Docs
                <WIP />
              </span>
            ) : (
              <Link
                href="/docs"
                className={`flex items-center gap-1.5 text-sm px-2.5 py-1 rounded-md transition-colors ${
                  activeSection === "docs"
                    ? "text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 font-medium"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                Docs
                <WIP />
              </Link>
            )}

            <Link
              href="/api-docs"
              className={`text-sm px-2.5 py-1 rounded-md transition-colors ${
                activeSection === "api"
                  ? "text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 font-medium"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              API
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {count !== undefined && (
            <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:inline">
              {count} release{count !== 1 ? "s" : ""}
            </span>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
