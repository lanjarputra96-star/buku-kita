import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, Badge } from "@/components/sibudi/ui-kit";
import { useSibudi } from "@/lib/sibudi-store";

export const Route = createFileRoute("/admin/riwayat")({
  component: Riwayat,
});

function Riwayat() {
  const { state } = useSibudi();
  const riwayatList = state.riwayat;
  return (
    <>
      <PageHeader title="Riwayat" desc="Jejak aktivitas seluruh pengguna pada sistem SIBUDI." />

      <Panel>
        <ol className="relative space-y-6 border-l border-border pl-6">
          {riwayatList.map((r, i) => (
            <li key={`${r.waktu}-${i}`} className="relative">
              <span className="absolute -left-[31px] top-1.5 size-3 rounded-full border-2 border-card bg-primary" />
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold">{r.aksi}</p>
                <Badge>{r.tipe}</Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {r.aktor} • {r.waktu}
              </p>
            </li>
          ))}
        </ol>
      </Panel>
    </>
  );
}
