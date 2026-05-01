"use client";

import { useState } from "react";
import { Globe, Box, Layers, ScrollText, FileText, GitPullRequest, ExternalLink, CheckCircle2, XCircle, RotateCcw, GitCommit } from "lucide-react";
import { STATUS_CONFIG } from "@/components/release-card";
import type { ReleaseDetail, ReleasePR, ReleaseStatus } from "@/lib/types";

function ServiceStatusIcon({ status }: { status: ReleaseStatus | null }) {
  if (status === "deployed") return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
  if (status === "failed")   return <XCircle className="h-4 w-4 text-red-500" />;
  if (status === "rollback") return <RotateCcw className="h-4 w-4 text-amber-500" />;
  return null;
}

function CommitBadge({ sha, url }: { sha: string; url: string | null }) {
  const short = sha.slice(0, 7);
  const cls = "inline-flex items-center gap-1 font-mono text-xs text-slate-500 dark:text-slate-400 transition-colors";
  if (!url) return <span className={cls}><GitCommit className="h-3.5 w-3.5" />{short}</span>;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={`${cls} hover:text-blue-600 dark:hover:text-blue-400`}>
      <GitCommit className="h-3.5 w-3.5" />{short}
    </a>
  );
}

function PRRow({ pr }: { pr: ReleasePR }) {
  return (
    <a
      href={pr.pr_url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
    >
      <GitPullRequest className="h-4 w-4 text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
          {pr.pr_title}
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">#{pr.pr_number} · {pr.pr_author}</p>
      </div>
      <ExternalLink className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 shrink-0 mt-0.5 transition-colors" />
    </a>
  );
}

function ServiceSection({ label, icon, status, commit, commitUrl, deployUrl, deployLabel, prs }: {
  label: string; icon: React.ReactNode; status: ReleaseStatus | null;
  commit: string | null; commitUrl: string | null;
  deployUrl: string | null; deployLabel: string;
  prs: ReleasePR[];
}) {
  const statusCfg = status ? STATUS_CONFIG[status] : null;
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
        <div className="flex items-center gap-2.5">
          <ServiceStatusIcon status={status} />
          <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">{icon}{label}</span>
          {statusCfg && (
            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-px rounded-full ring-1 ring-inset ${statusCfg.cls}`}>
              {statusCfg.label}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {commit && <CommitBadge sha={commit} url={commitUrl} />}
          {deployUrl && (
            <a href={deployUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
              <ExternalLink className="h-3.5 w-3.5" />{deployLabel}
            </a>
          )}
        </div>
      </div>
      {prs.length > 0 ? (
        <div className="divide-y divide-slate-50 dark:divide-slate-800/50 py-1">
          {prs.map(pr => <PRRow key={pr.id} pr={pr} />)}
        </div>
      ) : (
        <p className="text-xs text-slate-400 dark:text-slate-600 italic px-5 py-4">
          No pull requests — will be populated via webhook.
        </p>
      )}
    </div>
  );
}

export function ReleaseDetailTabs({ release }: { release: ReleaseDetail }) {
  const [tab, setTab] = useState<"deployment" | "changelog" | "notes">("deployment");
  const fePRs = release.prs.filter(p => p.service === "fe");
  const bePRs = release.prs.filter(p => p.service === "be");

  const TABS = [
    { key: "deployment" as const, label: "Deployment",    icon: <Layers className="h-3.5 w-3.5" /> },
    { key: "changelog"  as const, label: "Changelog",     icon: <ScrollText className="h-3.5 w-3.5" />, count: release.prs.length },
    { key: "notes"      as const, label: "Release Notes", icon: <FileText className="h-3.5 w-3.5" /> },
  ];

  return (
    <>
      {/* Tabs */}
      <div className="flex items-center gap-1 mb-5">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors ${
              tab === t.key
                ? "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-medium shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            {t.icon}{t.label}
            {"count" in t && (t.count ?? 0) > 0 && (
              <span className="ml-1 text-[10px] font-bold px-1.5 py-px rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Deployment tab */}
      {tab === "deployment" && (
        <div className="space-y-4">
          <ServiceSection label="Frontend" icon={<Globe className="h-4 w-4" />}
            status={release.fe_status} commit={release.fe_commit} commitUrl={release.fe_commit_url}
            deployUrl={release.fe_vercel_url} deployLabel="View deployment" prs={fePRs} />
          <ServiceSection label="Backend" icon={<Box className="h-4 w-4" />}
            status={release.be_status} commit={release.be_commit} commitUrl={release.be_commit_url}
            deployUrl={release.be_actions_url} deployLabel="View deploy log" prs={bePRs} />
        </div>
      )}

      {/* Changelog tab — PRs only */}
      {tab === "changelog" && (
        <div className="space-y-6">
          {fePRs.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 flex items-center gap-2">
                <Globe className="h-3.5 w-3.5" />Frontend changes
              </p>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-50 dark:divide-slate-800/50 py-1">
                {fePRs.map(pr => <PRRow key={pr.id} pr={pr} />)}
              </div>
            </div>
          )}
          {bePRs.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 flex items-center gap-2">
                <Box className="h-3.5 w-3.5" />Backend changes
              </p>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-50 dark:divide-slate-800/50 py-1">
                {bePRs.map(pr => <PRRow key={pr.id} pr={pr} />)}
              </div>
            </div>
          )}
          {fePRs.length === 0 && bePRs.length === 0 && (
            <p className="text-sm text-slate-400 dark:text-slate-600 italic text-center py-8">
              No pull requests recorded for this release.
            </p>
          )}
        </div>
      )}

      {/* Release Notes tab */}
      {tab === "notes" && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-5">
          {release.description ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
                Feature notes — {release.version}
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {release.description}
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-400 dark:text-slate-600 italic text-center py-6">
              No release notes for this version yet.
            </p>
          )}
        </div>
      )}
    </>
  );
}
