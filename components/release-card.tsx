import { ExternalLink, GitCommit, GitPullRequest, Box, Globe } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import type { Release } from "@/lib/types";
import { StatusBadge } from "./status-badge";

function CommitLink({ sha, url }: { sha: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 font-mono text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
    >
      <GitCommit className="h-3 w-3" />
      {sha}
    </a>
  );
}

function PRList({ prs }: { prs: Release["fe"]["prs"] }) {
  if (prs.length === 0) return <span className="text-xs text-slate-400 dark:text-slate-600">no PRs</span>;
  return (
    <div className="flex flex-wrap gap-1.5 mt-1">
      {prs.map((pr) => (
        <a
          key={pr.number}
          href={pr.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          title={pr.title}
        >
          <GitPullRequest className="h-3 w-3" />
          #{pr.number} <span className="max-w-[180px] truncate hidden sm:inline">{pr.title}</span>
        </a>
      ))}
    </div>
  );
}

export function ReleaseCard({ release }: { release: Release }) {
  const deployedAt = new Date(release.deployed_at);
  const isProduction = release.environment === "production";

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-slate-900 dark:text-slate-100 font-mono">
            {release.version}
          </span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            isProduction
              ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-800"
              : "bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 ring-1 ring-purple-200 dark:ring-purple-800"
          }`}>
            {release.environment}
          </span>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {format(deployedAt, "dd MMM yyyy")}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {formatDistanceToNow(deployedAt, { addSuffix: true })} · {release.deployed_by}
          </p>
        </div>
      </div>

      {/* Notes */}
      {release.notes && (
        <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400">
          {release.notes}
        </div>
      )}

      {/* FE + BE rows */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {/* FE */}
        <div className="px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2 min-w-[80px]">
              <Globe className="h-4 w-4 text-slate-400 dark:text-slate-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Frontend</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={release.fe.status} />
                <CommitLink sha={release.fe.commit} url={release.fe.commit_url} />
                {release.fe.vercel_url && (
                  <a
                    href={release.fe.vercel_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View deployment
                  </a>
                )}
              </div>
              <PRList prs={release.fe.prs} />
            </div>
          </div>
        </div>

        {/* BE */}
        <div className="px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2 min-w-[80px]">
              <Box className="h-4 w-4 text-slate-400 dark:text-slate-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Backend</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={release.be.status} />
                <CommitLink sha={release.be.commit} url={release.be.commit_url} />
                {release.be.actions_url ? (
                  <a
                    href={release.be.actions_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View deploy log
                  </a>
                ) : (
                  <span className="text-xs text-slate-400 dark:text-slate-500 italic">deploy log coming soon</span>
                )}
              </div>
              <PRList prs={release.be.prs} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
