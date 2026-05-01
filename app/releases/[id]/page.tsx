"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronLeft, CheckCircle2, XCircle, RotateCcw,
  Globe, Box, GitCommit, GitPullRequest, ExternalLink,
  User, Calendar, Layers, ScrollText, Clock,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { Nav } from "@/components/nav";
import { ENV_STYLES, STATUS_CONFIG } from "@/components/release-card";
import type { ReleaseDetail, ReleasePR, ReleaseStatus } from "@/lib/types";

// ── Small reusable bits ───────────────────────────────────────────────────────

function ServiceStatusIcon({ status }: { status: ReleaseStatus | null }) {
  if (!status) return null;
  if (status === "deployed") return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
  if (status === "failed")   return <XCircle className="h-4 w-4 text-red-500" />;
  return <RotateCcw className="h-4 w-4 text-amber-500" />;
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
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
          #{pr.pr_number} · {pr.pr_author}
        </p>
      </div>
      <ExternalLink className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 shrink-0 mt-0.5 transition-colors" />
    </a>
  );
}

function CommitBadge({ sha, url }: { sha: string; url: string | null }) {
  const short = sha.slice(0, 7);
  if (!url) {
    return (
      <span className="inline-flex items-center gap-1 font-mono text-xs text-slate-500 dark:text-slate-400">
        <GitCommit className="h-3.5 w-3.5" />{short}
      </span>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 font-mono text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
    >
      <GitCommit className="h-3.5 w-3.5" />{short}
    </a>
  );
}

// ── Service section (FE or BE) ────────────────────────────────────────────────
function ServiceSection({
  label, icon, status, commit, commitUrl, deployUrl, deployLabel, prs,
}: {
  label: string;
  icon: React.ReactNode;
  status: ReleaseStatus | null;
  commit: string | null;
  commitUrl: string | null;
  deployUrl: string | null;
  deployLabel: string;
  prs: ReleasePR[];
}) {
  const statusCfg = status ? STATUS_CONFIG[status] : null;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
        <div className="flex items-center gap-2.5">
          <ServiceStatusIcon status={status} />
          <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
            {icon}
            {label}
          </span>
          {statusCfg && (
            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-px rounded-full ring-1 ring-inset ${statusCfg.cls}`}>
              {statusCfg.label}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {commit && <CommitBadge sha={commit} url={commitUrl} />}
          {deployUrl && (
            <a
              href={deployUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {deployLabel}
            </a>
          )}
        </div>
      </div>

      {/* PRs */}
      {prs.length > 0 ? (
        <div className="divide-y divide-slate-50 dark:divide-slate-800/50 py-1">
          {prs.map(pr => <PRRow key={pr.id} pr={pr} />)}
        </div>
      ) : (
        <p className="text-xs text-slate-400 dark:text-slate-600 italic px-5 py-4">
          No pull requests — will be populated automatically via webhook.
        </p>
      )}
    </div>
  );
}

// ── Changelog tab ─────────────────────────────────────────────────────────────
function ChangelogTab({ release }: { release: ReleaseDetail }) {
  const fePRs = release.prs.filter(p => p.service === "fe");
  const bePRs = release.prs.filter(p => p.service === "be");

  return (
    <div className="space-y-6">
      {release.description && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Release notes</p>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{release.description}</p>
        </div>
      )}

      {fePRs.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 flex items-center gap-2">
            <Globe className="h-3.5 w-3.5" /> Frontend changes
          </p>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-50 dark:divide-slate-800/50 py-1">
            {fePRs.map(pr => <PRRow key={pr.id} pr={pr} />)}
          </div>
        </div>
      )}

      {bePRs.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 flex items-center gap-2">
            <Box className="h-3.5 w-3.5" /> Backend changes
          </p>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-50 dark:divide-slate-800/50 py-1">
            {bePRs.map(pr => <PRRow key={pr.id} pr={pr} />)}
          </div>
        </div>
      )}

      {fePRs.length === 0 && bePRs.length === 0 && !release.description && (
        <p className="text-sm text-slate-400 dark:text-slate-600 italic text-center py-8">
          No changelog entries — will be populated from GitHub PRs automatically.
        </p>
      )}
    </div>
  );
}

// ── Main page — client because of tabs ────────────────────────────────────────
export default function ReleaseDetailPage({ params }: { params: { id: string } }) {
  const [release, setRelease] = useState<ReleaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"deployment" | "changelog">("deployment");

  useEffect(() => {
    fetch(`/api/releases/${params.id}`)
      .then(r => r.json())
      .then(data => { setRelease(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Nav activeSection="releases" />
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-24 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!release) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Nav activeSection="releases" />
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <p className="text-slate-500 dark:text-slate-400">Release not found.</p>
          <Link href="/" className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline">← Back to releases</Link>
        </div>
      </div>
    );
  }

  const deployedAt = new Date(release.deployed_at);
  const fePRs = release.prs.filter(p => p.service === "fe");
  const bePRs = release.prs.filter(p => p.service === "be");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Nav activeSection="releases" />

      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors mb-6"
        >
          <ChevronLeft className="h-4 w-4" />
          All releases
        </Link>

        {/* Release header */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-5 mb-6 shadow-sm">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap mb-2">
                <span className="font-mono text-xl font-bold text-slate-900 dark:text-slate-100">{release.version}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ENV_STYLES[release.environment]}`}>
                  {release.environment}
                </span>
                {(() => { const cfg = STATUS_CONFIG[release.status]; return (
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ring-1 ring-inset ${cfg.cls}`}>
                    {cfg.icon}{cfg.label}
                  </span>
                ); })()}
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">{release.title}</p>
              {release.description && (
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{release.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-5 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex-wrap">
            <span className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
              <Calendar className="h-3.5 w-3.5" />
              {format(deployedAt, "dd MMM yyyy, HH:mm")}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
              <Clock className="h-3.5 w-3.5" />
              {formatDistanceToNow(deployedAt, { addSuffix: true })}
            </span>
            {release.deployed_by && (
              <span className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                <User className="h-3.5 w-3.5" />
                {release.deployed_by}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
              <GitPullRequest className="h-3.5 w-3.5" />
              {release.prs.length} PR{release.prs.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-5">
          <button
            onClick={() => setTab("deployment")}
            className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors ${
              tab === "deployment"
                ? "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-medium shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            Deployment
          </button>
          <button
            onClick={() => setTab("changelog")}
            className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors ${
              tab === "changelog"
                ? "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-medium shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <ScrollText className="h-3.5 w-3.5" />
            Changelog
            {release.prs.length > 0 && (
              <span className="ml-1 text-[10px] font-bold px-1.5 py-px rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                {release.prs.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab content */}
        {tab === "deployment" ? (
          <div className="space-y-4">
            <ServiceSection
              label="Frontend"
              icon={<Globe className="h-4 w-4" />}
              status={release.fe_status}
              commit={release.fe_commit}
              commitUrl={release.fe_commit_url}
              deployUrl={release.fe_vercel_url}
              deployLabel="View deployment"
              prs={fePRs}
            />
            <ServiceSection
              label="Backend"
              icon={<Box className="h-4 w-4" />}
              status={release.be_status}
              commit={release.be_commit}
              commitUrl={release.be_commit_url}
              deployUrl={release.be_actions_url}
              deployLabel="View deploy log"
              prs={bePRs}
            />
          </div>
        ) : (
          <ChangelogTab release={release} />
        )}
      </main>
    </div>
  );
}
