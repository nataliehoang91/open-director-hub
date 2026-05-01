import Link from "next/link";
import { CheckCircle2, XCircle, RotateCcw, ChevronRight, User, GitPullRequest, ExternalLink } from "lucide-react";
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

interface ReleaseCardProps {
  release: Release;
  prs?: { service: string; pr_number: number; pr_title: string; pr_url: string; pr_author: string }[];
}

export function ReleaseCard({ release, prs = [] }: ReleaseCardProps) {
  const deployedAt = new Date(release.deployed_at);
  const statusCfg = STATUS_CONFIG[release.status];
  const hasPRs = prs.length > 0;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-200">
      {/* Main row — clickable to detail */}
      <Link href={`/releases/${release.id}`} className="group flex items-center gap-4 px-5 py-4">
        <div className="flex items-center gap-2.5 flex-wrap flex-1 min-w-0">
          <span className="font-mono font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {release.version}
          </span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ENV_STYLES[release.environment]}`}>
            {release.environment}
          </span>
          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ring-1 ring-inset ${statusCfg.cls}`}>
            {statusCfg.icon}{statusCfg.label}
          </span>
        </div>
        <p className="flex-1 text-sm text-slate-600 dark:text-slate-400 truncate hidden md:block">{release.title}</p>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">{format(deployedAt, "dd MMM yyyy")}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center justify-end gap-1">
              {release.deployed_by && <><User className="h-2.5 w-2.5" />{release.deployed_by} · </>}
              {formatDistanceToNow(deployedAt, { addSuffix: true })}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
        </div>
      </Link>

      {/* Collapsible changelog — no JS, uses native <details> */}
      {hasPRs && (
        <details className="group/details border-t border-slate-100 dark:border-slate-800">
          <summary className="flex items-center gap-2 px-5 py-2 cursor-pointer select-none text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors list-none">
            <GitPullRequest className="h-3.5 w-3.5" />
            <span>{prs.length} change{prs.length !== 1 ? "s" : ""}</span>
            <ChevronRight className="h-3 w-3 ml-auto transition-transform group-open/details:rotate-90" />
          </summary>
          <div className="border-t border-slate-50 dark:border-slate-800/50 divide-y divide-slate-50 dark:divide-slate-800/50 py-1">
            {prs.map((pr, i) => (
              <a
                key={i}
                href={pr.pr_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 px-5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group/pr"
              >
                <span className={`shrink-0 text-[9px] font-bold px-1 py-px rounded mt-0.5 ${
                  pr.service === "fe"
                    ? "bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 ring-1 ring-sky-200 dark:ring-sky-800"
                    : "bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400 ring-1 ring-orange-200 dark:ring-orange-800"
                }`}>
                  {pr.service.toUpperCase()}
                </span>
                <p className="flex-1 text-xs text-slate-500 dark:text-slate-400 group-hover/pr:text-slate-700 dark:group-hover/pr:text-slate-200 transition-colors leading-snug">
                  #{pr.pr_number} {pr.pr_title}
                </p>
                <ExternalLink className="h-3 w-3 text-slate-300 dark:text-slate-600 group-hover/pr:text-blue-500 shrink-0 mt-0.5 transition-colors" />
              </a>
            ))}
          </div>
          <div className="px-5 py-2 border-t border-slate-50 dark:border-slate-800/50">
            <Link
              href={`/releases/${release.id}?tab=changelog`}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              View full changelog →
            </Link>
          </div>
        </details>
      )}
    </div>
  );
}
