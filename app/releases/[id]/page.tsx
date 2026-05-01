import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Calendar, Clock, User, GitPullRequest } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { Nav } from "@/components/nav";
import { ENV_STYLES, STATUS_CONFIG } from "@/components/release-card";
import { getReleaseDetail } from "@/lib/releases";
import { ReleaseDetailTabs } from "./tabs";

export default async function ReleaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const release = await getReleaseDetail(id);
  if (!release) notFound();

  const deployedAt = new Date(release.deployed_at);
  const statusCfg = STATUS_CONFIG[release.status];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Nav activeSection="releases" />

      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors mb-6"
        >
          <ChevronLeft className="h-4 w-4" />
          All releases
        </Link>

        {/* Release header */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-5 mb-6 shadow-sm">
          <div className="flex items-start gap-3 flex-wrap mb-2">
            <span className="font-mono text-xl font-bold text-slate-900 dark:text-slate-100">{release.version}</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full self-center ${ENV_STYLES[release.environment]}`}>
              {release.environment}
            </span>
            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ring-1 ring-inset self-center ${statusCfg.cls}`}>
              {statusCfg.icon}{statusCfg.label}
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">{release.title}</p>
          {release.description && (
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{release.description}</p>
          )}
          <div className="flex items-center gap-5 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex-wrap">
            <span className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
              <Calendar className="h-3.5 w-3.5" />{format(deployedAt, "dd MMM yyyy, HH:mm")}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
              <Clock className="h-3.5 w-3.5" />{formatDistanceToNow(deployedAt, { addSuffix: true })}
            </span>
            {release.deployed_by && (
              <span className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                <User className="h-3.5 w-3.5" />{release.deployed_by}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
              <GitPullRequest className="h-3.5 w-3.5" />{release.prs.length} PR{release.prs.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Tabs — client component for interactivity, data passed as props */}
        <ReleaseDetailTabs release={release} />
      </main>
    </div>
  );
}
