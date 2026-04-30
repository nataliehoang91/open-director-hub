import type { DeployStatus } from "@/lib/types";

const config: Record<DeployStatus, { label: string; className: string; dotClass: string }> = {
  success:     { label: "success",  className: "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 ring-emerald-200 dark:ring-emerald-800", dotClass: "bg-emerald-500" },
  failed:      { label: "failed",   className: "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 ring-red-200 dark:ring-red-800",                         dotClass: "bg-red-500" },
  in_progress: { label: "deploying",className: "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 ring-amber-200 dark:ring-amber-800",             dotClass: "bg-amber-500 animate-pulse" },
  pending:     { label: "pending",  className: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 ring-slate-200 dark:ring-slate-700",             dotClass: "bg-slate-400 dark:bg-slate-500" },
};

export function StatusBadge({ status }: { status: DeployStatus }) {
  const { label, className, dotClass } = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
      {label}
    </span>
  );
}
