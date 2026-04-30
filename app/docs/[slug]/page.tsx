import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Clock, Tag } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Nav } from "@/components/nav";
import { ReadingProgress } from "@/components/reading-progress";
import { DOC_MANIFEST, getDocContent } from "@/lib/docs";

export function generateStaticParams() {
  return DOC_MANIFEST.map((doc) => ({ slug: doc.slug }));
}

const readTimeEstimates: Record<string, string> = {
  "cicd-architecture": "12 min",
  "engineering-automation-proposal": "20 min",
  "deployment-operations": "15 min",
  "be-section-permissions": "5 min",
  "chatpdf-fiscal-year": "4 min",
};

const categoryColor: Record<string, string> = {
  Platform:    "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 ring-blue-200 dark:ring-blue-800",
  Operations:  "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 ring-emerald-200 dark:ring-emerald-800",
  Engineering: "bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300 ring-violet-200 dark:ring-violet-800",
};

const repoBadge: Record<string, string> = {
  FE:   "bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 ring-sky-200 dark:ring-sky-800",
  BE:   "bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300 ring-orange-200 dark:ring-orange-800",
  Both: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 ring-slate-200 dark:ring-slate-700",
};

// Extract headings from markdown for TOC
function extractHeadings(content: string) {
  const lines = content.split("\n");
  const headings: { level: number; text: string; id: string }[] = [];
  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)/);
    if (match) {
      const text = match[2].replace(/\*\*/g, "").trim();
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      headings.push({ level: match[1].length, text, id });
    }
  }
  return headings;
}

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const meta = DOC_MANIFEST.find((d) => d.slug === slug);
  if (!meta) notFound();

  const content = getDocContent(slug);
  if (!content) notFound();

  const headings = extractHeadings(content);
  const readTime = readTimeEstimates[slug] || "5 min";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <ReadingProgress />
      <Nav activeSection="docs" />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        {/* Back + meta */}
        <div className="flex items-start justify-between gap-4 mb-6 timeline-category stagger-1">
          <Link
            href="/docs"
            className="inline-flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Docs
          </Link>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${categoryColor[meta.category]}`}>
              {meta.category}
            </span>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${repoBadge[meta.repo]}`}>
              <Tag className="h-3 w-3 mr-1" />
              {meta.repo === "Both" ? "Full Stack" : meta.repo === "FE" ? "Frontend" : "Backend"}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
              <Clock className="h-3 w-3" />
              {readTime} read
            </span>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Main content */}
          <article className="flex-1 min-w-0 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm px-7 py-8 timeline-card stagger-2
            prose prose-slate dark:prose-invert max-w-none
            prose-headings:font-semibold
            prose-h1:text-xl prose-h1:mb-4
            prose-h2:text-base prose-h2:mt-8 prose-h2:mb-3
            prose-h3:text-sm prose-h3:mt-6 prose-h3:mb-2
            prose-p:text-sm prose-p:leading-relaxed
            prose-li:text-sm prose-li:my-0.5
            prose-code:text-xs prose-code:bg-slate-100 dark:prose-code:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
            prose-pre:bg-slate-900 dark:prose-pre:bg-slate-950 prose-pre:text-slate-100 prose-pre:rounded-lg prose-pre:text-xs prose-pre:leading-relaxed prose-pre:border prose-pre:border-slate-800
            [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:rounded-none [&_pre_code]:text-slate-100 [&_pre_code]:text-xs
            prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
            prose-table:text-xs
            prose-th:bg-slate-50 dark:prose-th:bg-slate-800 prose-th:font-semibold
            prose-td:border-slate-200 dark:prose-td:border-slate-700
            prose-hr:border-slate-200 dark:prose-hr:border-slate-800
            prose-blockquote:border-blue-300 dark:prose-blockquote:border-blue-700 prose-blockquote:text-slate-500 dark:prose-blockquote:text-slate-400
            prose-strong:text-slate-900 dark:prose-strong:text-slate-100">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h2: ({ children }) => {
                  const text = String(children).replace(/`/g, "").trim();
                  const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
                  return <h2 id={id} className="scroll-mt-24">{children}</h2>;
                },
                h3: ({ children }) => {
                  const text = String(children).replace(/`/g, "").trim();
                  const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
                  return <h3 id={id} className="scroll-mt-24">{children}</h3>;
                },
              }}
            >
              {content}
            </ReactMarkdown>
          </article>

          {/* TOC sidebar */}
          {headings.length > 0 && (
            <aside className="hidden lg:block w-52 shrink-0 timeline-card stagger-3">
              <div className="sticky top-20">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                  On this page
                </p>
                <nav className="space-y-1">
                  {headings.map((h, i) => (
                    <a
                      key={i}
                      href={`#${h.id}`}
                      className={`block text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors leading-snug py-0.5 ${
                        h.level === 3 ? "pl-3 border-l border-slate-200 dark:border-slate-800" : ""
                      }`}
                    >
                      {h.text}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
