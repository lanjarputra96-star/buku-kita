import { createFileRoute } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { PageHeader, Panel, Badge } from "@/components/sibudi/ui-kit";
import { notifikasiList } from "@/lib/sibudi-data";

export const Route = createFileRoute("/ortu/notifikasi")({
  component: NotifikasiOrtu,
});

function NotifikasiOrtu() {
  return (
    <>
      <PageHeader title="Notifikasi" desc="Informasi dan pengingat dari sekolah." />

      <Panel>
        <ul className="space-y-3">
          {notifikasiList.map((n) => (
            <li key={n.judul} className="flex gap-4 rounded-2xl border border-border p-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Bell className="size-5" />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold">{n.judul}</p>
                  <Badge tone={n.tipe === "warning" ? "warning" : n.tipe === "success" ? "success" : "info"}>
                    {n.waktu}
                  </Badge>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{n.isi}</p>
              </div>
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}
