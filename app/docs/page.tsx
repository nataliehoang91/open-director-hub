import Link from "next/link";
import { Server, Wrench, FileText, ArrowRight, Clock } from "lucide-react";
import { Nav } from "@/components/nav";
import { getDocsByCategory } from "@/lib/docs";
import type { DocMeta } from "@/lib/docs";

const categoryConfig = {
  Platform: {
    icon: Server,
    color: "text-blue-600 dark:text-blue-400",
    dotBg: "bg-blue-600 dark:bg-blue-500",
    ringColor: "ring-blue-200 dark:ring-blue-800",
    labelBg: "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300",
    lineBg: "bg-blue-200 dark:bg-blue-800",
    desc: "Infrastructure, CI/CD, and deployment architecture",
  },
  Operations: {
    icon: Wrench,
    color: "text-emerald-600 dark:text-emerald-400",
    dotBg: "bg-emerald-600 dark:bg-emerald-500",
    ringColor: "ring-emerald-200 dark:ring-emerald-800",
    labelBg: "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300",
    lineBg: "bg-emerald-200 dark:bg-emerald-800",
    desc: "Runbooks, CLI tools, and day-to-day operations",
  },
  Engineering: {
    icon: FileText,
    color: "text-violet-600 dark:text-violet-400",
    dotBg: "bg-violet-600 dark:bg-violet-500",
    ringColor: "ring-violet-200 dark:ring-violet-800",
    labelBg: "bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300",
    lineBg: "bg-violet-200 dark:bg-violet-800",
    desc: "FE/BE contracts, feature specs, and technical reference",
  },
};

const repoBadge: Record<DocMeta["repo"], { label: string; className: string }> = {
  FE:   { label: "Frontend", className: "bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 ring-sky-200 dark:ring-sky-800" },
  BE:   { label: "Backend",  className: "bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300 ring-orange-200 dark:ring-orange-800" },
  Both: { label: "Full Stack", className: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 ring-slate-200 dark:ring-slate-700" },
};

const readTimeEstimates: Record<string, string> = {
  "cicd-architecture": "12 min",
  "engineering-automation-proposal": "20 min",
  "deployment-operations": "15 min",
  "be-section-permissions": "5 min",
  "chatpdf-fiscal-year": "4 min",
};

export default function DocsPage() {
  const grouped = getDocsByCategory();
  const categories = ["Platform", "Operations", "Engineering"] as const;

  // Global stagger counter across all items
  let staggerIndex = 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Nav activeSection="docs" />

      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-12 timeline-category stagger-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Engineering Docs
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm">
            Architecture references, runbooks, and technical guides for the Open Director platform.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical spine */}
          <div
            className="absolute left-[18px] top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-800 timeline-line"
          />

          <div className="space-y-10">
            {categories.map((category) => {
              const docs = grouped[category];
              if (!docs?.length) return null;
              const cfg = categoryConfig[category];
              const Icon = cfg.icon;

              return (
                <div key={category}>
                  {/* Category milestone */}
                  <div className={`relative flex items-center gap-4 mb-6 timeline-category stagger-${++staggerIndex}`}>
                    {/* Big dot */}
                    <div className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${cfg.dotBg} ring-4 ${cfg.ringColor} timeline-dot stagger-${staggerIndex}`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold uppercase tracking-widest ${cfg.color}`}>
                          {category}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ring-1 ring-inset ${cfg.labelBg}`}>
                          {docs.length} doc{docs.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{cfg.desc}</p>
                    </div>
                  </div>

                  {/* Doc cards */}
                  <div className="ml-[52px] space-y-3">
                    {docs.map((doc) => {
                      staggerIndex++;
                      const repo = repoBadge[doc.repo];
                      const readTime = readTimeEstimates[doc.slug] || "5 min";
                      return (
                        <Link
                          key={doc.slug}
                          href={`/docs/${doc.slug}`}
                          className={`timeline-card stagger-${Math.min(staggerIndex, 8)} group relative flex items-start gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-4 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-200`}
                        >
                          {/* Branch line connector */}
                          <div className="absolute -left-[34px] top-1/2 w-[30px] h-px bg-slate-200 dark:bg-slate-800 group-hover:bg-blue-300 dark:group-hover:bg-blue-700 transition-colors" />
                          <div className="absolute -left-[38px] top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-blue-400 dark:group-hover:bg-blue-600 transition-colors" />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                                {doc.title}
                              </p>
                              <ArrowRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
                            </div>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
                              {doc.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2.5">
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${repo.className}`}>
                                {repo.label}
                              </span>
                              <span className="inline-flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                                <Clock className="h-3 w-3" />
                                {readTime} read
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* End cap */}
            <div className="relative flex items-center gap-4 timeline-category stagger-8">
              <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800">
                <div className="h-2 w-2 rounded-full bg-slate-400 dark:bg-slate-600" />
              </div>
              <span className="text-xs text-slate-400 dark:text-slate-500 italic">
                More docs coming as the platform grows
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
