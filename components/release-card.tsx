import { GitCommit, GitMerge, User, CheckCircle2, XCircle, RotateCcw, Clock } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import type { Release, ReleaseStatus, ReleaseEnvironment } from "@/lib/types";

const ENV_STYLES: Record<ReleaseEnvironment, string> = {
  production: "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-800",
  staging:    "bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 ring-1 ring-purple-200 dark:ring-purple-800",
  preview:    "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 ring-1 ring-slate-200 dark:ring-slate-700",
};

const STATUS_CONFIG: Record<ReleaseStatus, { icon: React.ReactNode; cls: string; label: string }> = {
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
    <div className="timeline-card rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">{release.version}</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ENV_STYLES[release.environment]}`}>
            {release.environment}
          </span>
          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ring-1 ring-inset ${statusCfg.cls}`}>
            {statusCfg.icon}
            {statusCfg.label}
          </span>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {format(deployedAt, "dd MMM yyyy")}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {formatDistanceToNow(deployedAt, { addSuffix: true })}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4 space-y-2">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{release.title}</p>
        {release.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{release.description}</p>
        )}

        <div className="flex items-center gap-4 pt-1 flex-wrap">
          {release.commit_sha && (
            <span className="inline-flex items-center gap-1 text-xs font-mono text-slate-400 dark:text-slate-500">
              <GitCommit className="h-3 w-3" />
              {release.commit_sha.slice(0, 7)}
            </span>
          )}
          {release.commit_msg && (
            <span className="inline-flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 truncate max-w-xs">
              <GitMerge className="h-3 w-3 shrink-0" />
              {release.commit_msg}
            </span>
          )}
          {release.deployed_by && (
            <span className="inline-flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
              <User className="h-3 w-3" />
              {release.deployed_by}
            </span>
          )}
        </div>
      </div>

      {/* Footer — automation hint */}
      <div className="px-5 py-2 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
        <Clock className="h-3 w-3 text-slate-300 dark:text-slate-600" />
        <span className="text-[10px] text-slate-300 dark:text-slate-600 font-mono">
          PR details · build logs · deploy time · automated via webhook (coming soon)
        </span>
      </div>
    </div>
  );
}
