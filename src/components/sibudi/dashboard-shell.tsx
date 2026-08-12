import { useMemo, useState, type ReactNode } from "react";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { BookOpen, LogOut, Menu, X, Bell } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { SCHOOL } from "@/lib/sibudi-data";
import { useSibudi } from "@/lib/sibudi-store";

export type NavItem = { to: string; label: string; icon: LucideIcon; exact?: boolean };

export function DashboardShell({
  portal,
  items,
  user,
  children,
  onLogout,
  notifNisn,
}: {
  portal: string;
  items: NavItem[];
  user: { name: string; meta: string; initials: string };
  children?: ReactNode;
  onLogout?: () => void;
  notifNisn?: string | undefined;
}) {
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { state } = useSibudi();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const active = items.find((i) =>
    i.exact ? pathname === i.to : pathname === i.to || pathname.startsWith(i.to + "/"),
  );
  const notifs = useMemo(
    () => state.notifikasi.filter((n) => !notifNisn || n.nisn === notifNisn).slice(0, 8),
    [state.notifikasi, notifNisn],
  );


  return (
    <div className="flex min-h-screen w-full bg-background">
      {open ? (
        <button
          aria-label="Tutup menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-foreground/40 lg:hidden"
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300 lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-sidebar-border p-5">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-soft">
              <BookOpen className="size-5" />
            </span>
            <span>
              <span className="block text-base font-bold leading-tight">{SCHOOL.app}</span>
              <span className="block text-[11px] text-muted-foreground">{portal}</span>
            </span>
          </Link>
          <button onClick={() => setOpen(false)} className="text-muted-foreground lg:hidden">
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto p-4">
          {items.map((item) => {
            const isActive = active?.to === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-soft"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <item.icon className="size-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3 rounded-xl bg-muted px-3 py-2.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {user.initials}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-xs font-semibold">{user.name}</span>
              <span className="block truncate text-[10px] text-muted-foreground">{user.meta}</span>
            </span>
          </div>
          <Link
            to="/"
            onClick={() => onLogout?.()}
            className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="size-4" /> Keluar
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-18 items-center justify-between gap-3 border-b border-border bg-card/90 px-4 py-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="rounded-xl p-2 text-muted-foreground hover:bg-muted lg:hidden"
              aria-label="Buka menu"
            >
              <Menu className="size-5" />
            </button>
            <div>
              <p className="text-base font-bold leading-tight">{active?.label ?? portal}</p>
              <p className="text-[11px] text-muted-foreground">
                {SCHOOL.name}, {SCHOOL.city}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setNotifOpen((v) => !v)}
                className="relative rounded-xl p-2 text-muted-foreground hover:bg-muted"
                aria-label="Notifikasi"
              >
                <Bell className="size-5" />
                {notifs.length > 0 ? (
                  <span className="absolute -right-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-warning px-1 text-[9px] font-bold text-foreground">
                    {notifs.length}
                  </span>
                ) : null}
              </button>
              {notifOpen ? (
                <>
                  <button
                    aria-label="Tutup notifikasi"
                    onClick={() => setNotifOpen(false)}
                    className="fixed inset-0 z-30 cursor-default"
                  />
                  <div className="absolute right-0 z-40 mt-2 w-80 max-w-[85vw] rounded-2xl border border-border bg-card p-3 shadow-soft">
                    <p className="px-1 pb-2 text-xs font-bold">Notifikasi</p>
                    {notifs.length === 0 ? (
                      <p className="px-1 pb-1 text-xs text-muted-foreground">Belum ada notifikasi baru.</p>
                    ) : (
                      <ul className="max-h-80 space-y-2 overflow-y-auto">
                        {notifs.map((n) => (
                          <li key={n.id} className="rounded-xl border border-border p-2.5">
                            <p className="text-xs font-semibold">{n.judul}</p>
                            <p className="mt-0.5 line-clamp-3 text-[11px] text-muted-foreground">{n.isi}</p>
                            <p className="mt-1 text-[10px] text-muted-foreground">
                              {n.waktu} • {n.kanal}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </>
              ) : null}
            </div>
            <span className="grid size-9 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {user.initials}
            </span>
          </div>

        </header>

        <main className="flex-1 space-y-6 p-4 md:p-8">{children ?? <Outlet />}</main>

        <footer className="border-t border-border px-4 py-4 text-center text-[11px] text-muted-foreground md:px-8">
          © 2026 {SCHOOL.app} — {SCHOOL.name}. {SCHOOL.tagline}.
        </footer>
      </div>
    </div>
  );
}
