"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Lock, Zap, Globe, ChevronDown, ChevronRight, Search, X, Command } from "lucide-react";
import { Nav } from "@/components/nav";
import { CopyButton } from "@/components/copy-button";
import { API_CATEGORIES, BASE_URL } from "@/lib/api-spec";
import type { Endpoint, HttpMethod, TokenType } from "@/lib/api-spec";

// ── Method badge ──────────────────────────────────────────────────────────────
const METHOD_STYLES: Record<HttpMethod, string> = {
  GET:    "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 ring-emerald-200 dark:ring-emerald-800",
  POST:   "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 ring-blue-200 dark:ring-blue-800",
  PATCH:  "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 ring-amber-200 dark:ring-amber-800",
  PUT:    "bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400 ring-orange-200 dark:ring-orange-800",
  DELETE: "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 ring-red-200 dark:ring-red-800",
};
function MethodBadge({ method, small }: { method: HttpMethod; small?: boolean }) {
  return (
    <span className={`shrink-0 font-mono font-bold ring-1 ring-inset rounded ${small ? "text-[9px] px-1 py-px leading-tight" : "text-xs px-2 py-0.5"} ${METHOD_STYLES[method]}`}>
      {method}
    </span>
  );
}

// ── Token badge ───────────────────────────────────────────────────────────────
const TOKEN_CONFIG: Record<TokenType, { label: string; cls: string } | null> = {
  admin_jwt:  { label: "Admin JWT",  cls: "bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300 ring-violet-200 dark:ring-violet-800" },
  my_od_jwt:  { label: "MyOD JWT",   cls: "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 ring-blue-200 dark:ring-blue-800" },
  any_jwt:    { label: "Any JWT",    cls: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 ring-slate-200 dark:ring-slate-700" },
  none:       null,
};
function TokenBadge({ token }: { token: TokenType }) {
  const cfg = TOKEN_CONFIG[token];
  if (!cfg) return null;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-px rounded ring-1 ring-inset ${cfg.cls}`}>
      <Lock className="h-2.5 w-2.5" />
      {cfg.label}
    </span>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: number }) {
  const cls = status < 300 ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
    : status < 500 ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400"
    : "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400";
  return <span className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${cls}`}>{status}</span>;
}

// ── Code block ────────────────────────────────────────────────────────────────
function CodeBlock({ code, label }: { code: string; label?: string }) {
  if (!code) return null;
  return (
    <div className="rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
        <span className="text-xs text-slate-500 font-mono">{label ?? "json"}</span>
        <CopyButton text={code} />
      </div>
      <pre className="p-4 overflow-x-auto text-xs leading-relaxed text-slate-200 font-mono whitespace-pre">{code}</pre>
    </div>
  );
}

function curlFor(ep: Endpoint): string {
  const url = `${BASE_URL}${ep.path.replace(/:(\w+)/g, "{$1}")}`;
  const lines = [`curl -X ${ep.method} "${url}" \\`];
  if (ep.auth) lines.push(`  -H "Authorization: Bearer YOUR_TOKEN" \\`);
  lines.push(`  -H "Content-Type: application/json"`);
  if (ep.requestBody) {
    lines[lines.length - 1] += " \\";
    lines.push(`  -d '${ep.requestBody.example.replace(/\s+/g, " ")}'`);
  }
  return lines.join("\n");
}

// ── Endpoint card ─────────────────────────────────────────────────────────────
function EndpointCard({ endpoint }: { endpoint: Endpoint }) {
  const [open, setOpen] = useState(false);
  const [activeStatus, setActiveStatus] = useState(endpoint.responses[0]?.status);
  const activeResp = endpoint.responses.find(r => r.status === activeStatus) ?? endpoint.responses[0];

  return (
    <div id={endpoint.id} className="scroll-mt-20 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2.5 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <MethodBadge method={endpoint.method} />
        <code className="flex-1 text-sm font-mono text-slate-700 dark:text-slate-300 truncate min-w-0">{endpoint.path}</code>
        <span className="text-xs text-slate-400 dark:text-slate-500 hidden md:block shrink-0 truncate max-w-[200px]">{endpoint.title}</span>
        <TokenBadge token={endpoint.token} />
        {open ? <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" /> : <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />}
      </button>

      {open && (
        <div className="border-t border-slate-100 dark:border-slate-800">
          <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-800">
            {/* Left */}
            <div className="px-5 py-5 space-y-5">
              <div>
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">{endpoint.title}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed whitespace-pre-line">{endpoint.description}</p>
              </div>

              {endpoint.auth && (
                <div className="flex items-center gap-2 text-xs bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 rounded-lg px-3 py-2 border border-amber-200 dark:border-amber-900">
                  <Lock className="h-3.5 w-3.5 shrink-0" />
                  <span>Requires <code className="font-mono font-semibold">{TOKEN_CONFIG[endpoint.token]?.label ?? "Bearer token"}</code></span>
                </div>
              )}

              {endpoint.parameters && endpoint.parameters.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Parameters</p>
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                    {endpoint.parameters.map(p => (
                      <div key={p.name} className="flex gap-3 px-3 py-2.5 bg-white dark:bg-slate-900">
                        <div className="w-32 shrink-0">
                          <code className="text-xs font-mono text-slate-800 dark:text-slate-200">{p.name}</code>
                          {p.required && <span className="ml-1 text-[10px] text-red-500 font-bold">*</span>}
                          <p className="text-[10px] text-slate-400 mt-0.5 capitalize">{p.in}</p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                            <span className="text-xs font-mono text-blue-600 dark:text-blue-400">{p.type}</span>
                            {p.enum && <span className="text-[10px] text-slate-400 truncate">({p.enum.join(" | ")})</span>}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{p.description}</p>
                          {p.example && <p className="text-[10px] text-slate-400 mt-0.5 font-mono">e.g. {p.example}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {endpoint.requestBody && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Request Body</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{endpoint.requestBody.description}</p>
                  <CodeBlock code={endpoint.requestBody.example} label="application/json" />
                </div>
              )}
            </div>

            {/* Right */}
            <div className="px-5 py-5 space-y-5 bg-slate-50 dark:bg-slate-950/30">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Request</p>
                <CodeBlock code={curlFor(endpoint)} label="cURL" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">Response</p>
                  <div className="flex gap-1 flex-wrap justify-end">
                    {endpoint.responses.map(r => (
                      <button key={r.status} onClick={() => setActiveStatus(r.status)} className={`transition-opacity ${activeStatus === r.status ? "opacity-100" : "opacity-35 hover:opacity-60"}`}>
                        <StatusBadge status={r.status} />
                      </button>
                    ))}
                  </div>
                </div>
                {activeResp && (
                  <>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{activeResp.description}</p>
                    <CodeBlock code={activeResp.body} label={`${activeResp.status} application/json`} />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Flattened search index ────────────────────────────────────────────────────
const SEARCH_INDEX = API_CATEGORIES.flatMap(cat =>
  cat.groups.flatMap(group =>
    group.endpoints.map(ep => ({ ep, catLabel: cat.label, catId: cat.id, catColor: cat.color, groupTitle: group.title }))
  )
);

function fuzzyMatch(text: string, query: string) {
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  // Simple: all query chars appear in order
  let ti = 0;
  for (const ch of q) {
    ti = t.indexOf(ch, ti);
    if (ti === -1) return false;
    ti++;
  }
  return true;
}

function highlight(text: string, query: string) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-200 dark:bg-yellow-800 text-inherit rounded-sm">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

// ── Cmd+K Search modal ────────────────────────────────────────────────────────
function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = query.trim()
    ? SEARCH_INDEX.filter(item =>
        fuzzyMatch(item.ep.path, query) ||
        fuzzyMatch(item.ep.title, query) ||
        fuzzyMatch(item.ep.method, query) ||
        fuzzyMatch(item.catLabel, query) ||
        fuzzyMatch(item.groupTitle, query)
      ).slice(0, 20)
    : SEARCH_INDEX.slice(0, 12);

  useEffect(() => { if (open) { setQuery(""); setSelectedIdx(0); setTimeout(() => inputRef.current?.focus(), 50); } }, [open]);
  useEffect(() => { setSelectedIdx(0); }, [query]);

  function navigate(id: string) {
    onClose();
    setTimeout(() => {
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 150);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown")  { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, results.length - 1)); }
    if (e.key === "ArrowUp")    { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && results[selectedIdx]) navigate(results[selectedIdx].ep.id);
    if (e.key === "Escape") onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
        onClick={e => e.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search endpoints… (path, method, title)"
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")}>
              <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono">esc</kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto py-2">
          {results.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No endpoints match "{query}"</p>
          ) : (
            results.map((item, idx) => (
              <button
                key={item.ep.id}
                onClick={() => navigate(item.ep.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${idx === selectedIdx ? "bg-blue-50 dark:bg-blue-950/50" : "hover:bg-slate-50 dark:hover:bg-slate-800"}`}
              >
                <MethodBadge method={item.ep.method} small />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-slate-700 dark:text-slate-300 truncate">
                    {highlight(item.ep.path, query)}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{item.ep.title}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`text-[10px] px-1.5 py-px rounded font-medium ring-1 ring-inset ${item.catColor.badge}`}>
                    {item.catLabel}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-4 text-[10px] text-slate-400">
          <span className="flex items-center gap-1"><kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">↑↓</kbd> navigate</span>
          <span className="flex items-center gap-1"><kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">↵</kbd> go to</span>
          <span className="flex items-center gap-1"><kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">esc</kbd> close</span>
          <span className="ml-auto">{results.length} result{results.length !== 1 ? "s" : ""}</span>
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ApiDocsPage() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(API_CATEGORIES[0].id);
  // Default all categories collapsed
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set(API_CATEGORIES.map(c => c.id)));
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Cmd+K listener
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setSearchOpen(true); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Scrollspy
  useEffect(() => {
    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const cat = API_CATEGORIES.find(c => e.target.id === c.id);
            if (cat) setActiveCategory(cat.id);
          }
        }
      },
      { rootMargin: "-10% 0px -80% 0px" }
    );
    for (const cat of API_CATEGORIES) {
      const el = document.getElementById(cat.id);
      if (el) observerRef.current.observe(el);
    }
    return () => observerRef.current?.disconnect();
  }, []);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function toggleCollapse(catId: string) {
    setCollapsed(prev => {
      const next = new Set(prev);
      next.has(catId) ? next.delete(catId) : next.add(catId);
      return next;
    });
  }

  function expandAndScroll(catId: string) {
    setCollapsed(prev => { const next = new Set(prev); next.delete(catId); return next; });
    setTimeout(() => scrollTo(catId), 50);
    setActiveCategory(catId);
  }

  const totalEndpoints = API_CATEGORIES.reduce((n, c) => n + c.groups.reduce((m, g) => m + g.endpoints.length, 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <Nav activeSection="api" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="py-8 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">API Reference</h1>
                <span className="text-xs bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 ring-1 ring-inset ring-blue-200 dark:ring-blue-800 px-2 py-0.5 rounded-full font-medium">v1</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Base URL: <code className="font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs">{BASE_URL}</code>
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Cmd+K button */}
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-400 hover:border-blue-300 dark:hover:border-blue-700 hover:text-slate-600 dark:hover:text-slate-300 transition-colors shadow-sm"
              >
                <Search className="h-3.5 w-3.5" />
                <span className="hidden sm:inline text-xs">Search endpoints…</span>
                <span className="flex items-center gap-0.5 text-[10px] text-slate-300 dark:text-slate-600 ml-1">
                  <Command className="h-3 w-3" />K
                </span>
              </button>
              <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 divide-x divide-slate-200 dark:divide-slate-800">
                <span className="flex items-center gap-1 pr-2"><Globe className="h-3.5 w-3.5" />{API_CATEGORIES.length} products</span>
                <span className="pl-2">{totalEndpoints} endpoints</span>
              </div>
            </div>
          </div>
          {/* Token legend */}
          <div className="flex items-center gap-3 flex-wrap mt-3">
            <div className="flex items-center gap-2 text-xs bg-slate-900 dark:bg-slate-800 text-slate-400 rounded-lg px-3 py-2 font-mono">
              <Lock className="h-3.5 w-3.5 text-slate-600" />
              Authorization: Bearer <span className="text-amber-400 ml-1">YOUR_TOKEN</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {(["admin_jwt", "my_od_jwt", "any_jwt"] as TokenType[]).map(t => <TokenBadge key={t} token={t} />)}
            </div>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-slate-200 dark:border-slate-800">
            <nav className="sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto py-5 pr-3 space-y-1">
              {API_CATEGORIES.map(cat => {
                const isCollapsed = collapsed.has(cat.id);
                const isActive = activeCategory === cat.id;
                return (
                  <div key={cat.id}>
                    {/* Category row */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => expandAndScroll(cat.id)}
                        className={`flex-1 flex items-center gap-2 py-1.5 px-2 rounded-lg text-left transition-colors ${isActive ? "bg-slate-100 dark:bg-slate-800" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}
                      >
                        <span className={`h-2 w-2 rounded-full shrink-0 ${cat.color.dot}`} />
                        <span className={`text-xs font-semibold truncate transition-colors ${isActive ? cat.color.active : "text-slate-600 dark:text-slate-400"}`}>
                          {cat.label}
                        </span>
                        <span className={`ml-auto text-[9px] px-1.5 py-px rounded font-medium ring-1 ring-inset shrink-0 ${cat.color.badge}`}>
                          {cat.badge}
                        </span>
                      </button>
                      <button
                        onClick={() => toggleCollapse(cat.id)}
                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        {isCollapsed
                          ? <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                          : <ChevronDown className="h-3.5 w-3.5 text-slate-400" />}
                      </button>
                    </div>

                    {/* Endpoints — hidden when collapsed */}
                    {!isCollapsed && (
                      <div className="mt-1 mb-3">
                        {cat.groups.map((group, gi) => (
                          <div key={group.id}>
                            {/* Divider between groups */}
                            {gi > 0 && (
                              <div className="mx-2 my-2 h-px bg-slate-100 dark:bg-slate-800" />
                            )}
                            {/* Group label */}
                            <div className="px-3 pt-1.5 pb-1">
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                {group.title}
                              </p>
                              <p className="text-[9px] font-mono text-slate-300 dark:text-slate-600 mt-0.5 truncate">
                                {group.basePrefix}
                              </p>
                            </div>
                            {/* Endpoint rows */}
                            <div className="space-y-0.5">
                              {group.endpoints.map(ep => (
                                <button
                                  key={ep.id}
                                  onClick={() => scrollTo(ep.id)}
                                  className="w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                                >
                                  <MethodBadge method={ep.method} small />
                                  <span className="text-xs text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 truncate transition-colors font-mono leading-tight">
                                    {ep.path.split("/").pop() || ep.path.split("/").slice(-2).join("/")}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0 py-8 lg:pl-8 space-y-16">
            {API_CATEGORIES.map(cat => (
              <section key={cat.id} id={cat.id} className="scroll-mt-20">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <span className={`h-3 w-3 rounded-full shrink-0 ${cat.color.dot}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{cat.label}</h2>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ring-1 ring-inset ${cat.color.badge}`}>{cat.badge}</span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{cat.description}</p>
                  </div>
                </div>

                <div className="space-y-10">
                  {cat.groups.map(group => (
                    <div key={group.id}>
                      <div className="mb-3 flex items-center gap-3">
                        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">{group.title}</span>
                          <code className="text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-px rounded border border-slate-200 dark:border-slate-700">{group.basePrefix}</code>
                        </div>
                        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                      </div>
                      <div className="space-y-3">
                        {group.endpoints.map(ep => <EndpointCard key={ep.id} endpoint={ep} />)}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
