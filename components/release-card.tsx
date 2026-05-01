import Link from "next/link";
import { CheckCircle2, XCircle, RotateCcw, ChevronRight, User } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import type { Release, ReleaseStatus, ReleaseEnvironment } from "@/lib/types";

export const ENV_STYLES: Record<ReleaseEnvironment, string> = {
  production: "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-800",
  staging:    "bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 ring-1 ring-purple-200 dark:ring-purple-800",
  preview:    "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 ring-1 ring-slate-200 dark:ring-slate-700",
};

export const STATUS_CONFIG: Record<ReleaseStatus, { icon: React.ReactNode; cls: string; label: string }> = {
  deployed: {
    label: "Deployed",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    cls: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 ring-emerald-200 dark:ring-emerald-800",
  },
  failed: {
    label: "Failed",
    icon: <XCircle className="h-3.5 w-3.5" />,
    cls: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 ring-red-200 dark:ring-red-800",
  },
  rollback: {
    label: "Rollback",
    icon: <RotateCcw className="h-3.5 w-3.5" />,
    cls: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 ring-amber-200 dark:ring-amber-800",
  },
};

export function ReleaseCard({ release }: { release: Release }) {
  const deployedAt = new Date(release.deployed_at);
  const statusCfg = STATUS_CONFIG[release.status];

  return (
    <Link
      href={`/releases/${release.id}`}
      className="group block rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-200"
    >
      <div className="flex items-center gap-4 px-5 py-4">
        {/* Left: version + badges */}
        <div className="flex items-center gap-2.5 flex-wrap flex-1 min-w-0">
          <span className="font-mono font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {release.version}
          </span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ENV_STYLES[release.environment]}`}>
            {release.environment}
          </span>
          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ring-1 ring-inset ${statusCfg.cls}`}>
            {statusCfg.icon}
            {statusCfg.label}
          </span>
        </div>

        {/* Middle: title */}
        <p className="flex-1 text-sm text-slate-600 dark:text-slate-400 truncate hidden md:block">
          {release.title}
        </p>

        {/* Right: meta + arrow */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
              {format(deployedAt, "dd MMM yyyy")}
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center justify-end gap-1">
              {release.deployed_by && <><User className="h-2.5 w-2.5" />{release.deployed_by} · </>}
              {formatDistanceToNow(deployedAt, { addSuffix: true })}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>

      {/* Title on mobile */}
      <div className="px-5 pb-3 md:hidden border-t border-slate-50 dark:border-slate-800 pt-2">
        <p className="text-xs text-slate-500 dark:text-slate-400">{release.title}</p>
      </div>
    </Link>
  );
}
