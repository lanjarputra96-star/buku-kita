import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  desc,
  actions,
}: {
  title: string;
  desc?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold tracking-tight md:text-2xl">{title}</h1>
        {desc ? <p className="mt-1 text-sm text-muted-foreground">{desc}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function Panel({
  title,
  desc,
  actions,
  children,
  className,
  id,
}: {
  title?: string;
  desc?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("card-surface p-5 md:p-6", className)}>
      {title || actions ? (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title ? <h2 className="text-base font-bold">{title}</h2> : null}
            {desc ? <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

const toneMap = {
  primary: "bg-primary/10 text-primary",
  warning: "bg-warning/20 text-warning-foreground",
  info: "bg-info/10 text-info",
  success: "bg-success/15 text-success",
  danger: "bg-destructive/10 text-destructive",
} as const;

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "primary",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  tone?: keyof typeof toneMap;
}) {
  return (
    <div className="card-surface flex items-start justify-between gap-3 p-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-2 text-2xl font-bold">{value}</p>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </div>
      {icon ? (
        <span className={cn("grid size-11 shrink-0 place-items-center rounded-2xl", toneMap[tone])}>
          {icon}
        </span>
      ) : null}
    </div>
  );
}

export function Badge({
  children,
  tone = "primary",
}: {
  children: ReactNode;
  tone?: keyof typeof toneMap;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold",
        toneMap[tone],
      )}
    >
      {children}
    </span>
  );
}

export function statusTone(status: string): keyof typeof toneMap {
  const s = status.toLowerCase();
  if (["dikembalikan", "disetujui", "aktif", "baik", "lunas"].includes(s)) return "success";
  if (["menunggu", "rusak ringan", "cuti", "proses"].includes(s)) return "warning";
  if (["terlambat", "rusak berat", "hilang", "ditolak"].includes(s)) return "danger";
  return "info";
}

export function DataTable({
  head,
  children,
}: {
  head: string[];
  children: ReactNode;
}) {
  return (
    <div className="-mx-5 overflow-x-auto md:-mx-6">
      <div className="inline-block min-w-full px-5 align-middle md:px-6">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              {head.map((h) => (
                <th key={h} className="whitespace-nowrap px-3 py-3 font-semibold first:pl-0 last:pr-0">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">{children}</tbody>
        </table>
      </div>
    </div>
  );
}

export function Td({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <td className={cn("whitespace-nowrap px-3 py-3 first:pl-0 last:pr-0", className)}>{children}</td>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
