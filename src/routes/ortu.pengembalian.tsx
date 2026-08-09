import { createFileRoute } from "@tanstack/react-router";
import { Send } from "lucide-react";
import { PageHeader, Panel, Field, DataTable, Td, Badge, statusTone } from "@/components/sibudi/ui-kit";
import { bukuList, pengembalianList } from "@/lib/sibudi-data";

export const Route = createFileRoute("/ortu/pengembalian")({
  component: PengembalianOrtu,
});

const inputClass =
  "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";

function PengembalianOrtu() {
  return (
    <>
      <PageHeader title="Pengembalian Buku" desc="Ajukan pengembalian buku ananda kepada wali kelas." />

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Ajukan Pengembalian">
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <Field label="Buku">
              <select className={inputClass}>
                {bukuList.slice(0, 3).map((b) => (
                  <option key={b.kode}>{b.judul}</option>
                ))}
              </select>
            </Field>
            <Field label="Kondisi Buku">
              <select className={inputClass}>
                <option>Baik</option>
                <option>Rusak Ringan</option>
                <option>Rusak Berat</option>
                <option>Hilang</option>
              </select>
            </Field>
            <Field label="Catatan">
              <textarea rows={3} className={inputClass} placeholder="Opsional" />
            </Field>
            <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">
              <Send className="size-4" /> Kirim Pengajuan
            </button>
          </form>
        </Panel>

        <Panel title="Status Pengajuan" className="lg:col-span-2">
          <DataTable head={["ID", "Tanggal", "Buku", "Kondisi", "Status"]}>
            {pengembalianList.map((p) => (
              <tr key={p.id}>
                <Td className="font-semibold">{p.id}</Td>
                <Td className="text-muted-foreground">{p.tanggal}</Td>
                <Td>{p.buku}</Td>
                <Td>
                  <Badge tone={statusTone(p.kondisi)}>{p.kondisi}</Badge>
                </Td>
                <Td>
                  <Badge tone={statusTone(p.status)}>{p.status}</Badge>
                </Td>
              </tr>
            ))}
          </DataTable>
        </Panel>
      </div>
    </>
  );
}
