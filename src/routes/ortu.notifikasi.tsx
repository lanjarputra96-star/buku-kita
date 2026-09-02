import { createFileRoute } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { PageHeader, Panel, Badge } from "@/components/sibudi/ui-kit";
import { useSibudi } from "@/lib/sibudi-store";

export const Route = createFileRoute("/ortu/notifikasi")({
  component: NotifikasiOrtu,
});

function NotifikasiOrtu() {
  const { state, siswaAktif } = useSibudi();
  const items = state.notifikasi.filter((n) => !siswaAktif || n.nisn === siswaAktif.nisn || n.nisn === siswaAktif.nama);

  return (
    <>
      <PageHeader title="Notifikasi" desc="Informasi dan pengingat dari sekolah." />

      <Panel>
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground">Belum ada notifikasi.</p>
        ) : (
          <ul className="space-y-3">
            {items.map((n) => (
              <li key={n.id} className="flex gap-4 rounded-2xl border border-border p-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Bell className="size-5" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">{n.judul}</p>
                    <Badge tone={n.tipe === "warning" ? "warning" : n.tipe === "success" ? "success" : "info"}>
                      {n.waktu} • {n.kanal}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{n.isi}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
