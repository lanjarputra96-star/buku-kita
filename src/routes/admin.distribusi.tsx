import { createFileRoute } from "@tanstack/react-router";
import { ScanLine, Send } from "lucide-react";
import { PageHeader, Panel, DataTable, Td, Badge, statusTone, Field } from "@/components/sibudi/ui-kit";
import { bukuList, siswaList, distribusiList } from "@/lib/sibudi-data";

export const Route = createFileRoute("/admin/distribusi")({
  component: DistribusiAdmin,
});

const inputClass =
  "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";

function DistribusiAdmin() {
  return (
    <>
      <PageHeader title="Distribusi Buku" desc="Catat penyerahan buku kepada siswa atau satu rombongan belajar." />

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel title="Formulir Distribusi" className="xl:col-span-1">
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <Field label="Kelas">
              <select className={inputClass}>
                {["1A", "3A", "5B", "6A"].map((k) => (
                  <option key={k}>{k}</option>
                ))}
              </select>
            </Field>
            <Field label="Penerima">
              <select className={inputClass}>
                <option>Semua siswa di kelas</option>
                {siswaList.map((s) => (
                  <option key={s.nisn}>{s.nama}</option>
                ))}
              </select>
            </Field>
            <Field label="Buku">
              <div className="flex gap-2">
                <select className={inputClass}>
                  {bukuList.map((b) => (
                    <option key={b.kode}>
                      {b.kode} — {b.judul}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  title="Scan barcode"
                  className="rounded-xl bg-accent px-3 text-primary hover:bg-primary/10"
                >
                  <ScanLine className="size-4" />
                </button>
              </div>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Jumlah">
                <input type="number" defaultValue={1} min={1} className={inputClass} />
              </Field>
              <Field label="Jatuh Tempo">
                <input type="date" className={inputClass} />
              </Field>
            </div>
            <Field label="Catatan">
              <textarea rows={3} placeholder="Opsional" className={inputClass} />
            </Field>
            <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">
              <Send className="size-4" /> Simpan Distribusi
            </button>
          </form>
        </Panel>

        <Panel title="Daftar Distribusi" desc="Transaksi penyerahan buku terbaru" className="xl:col-span-2">
          <DataTable head={["ID", "Tanggal", "Siswa", "Kelas", "Buku", "Jumlah", "Status"]}>
            {distribusiList.map((d) => (
              <tr key={d.id}>
                <Td className="font-semibold">{d.id}</Td>
                <Td className="text-muted-foreground">{d.tanggal}</Td>
                <Td>{d.siswa}</Td>
                <Td>{d.kelas}</Td>
                <Td>{d.buku}</Td>
                <Td>{d.jumlah}</Td>
                <Td>
                  <Badge tone={statusTone(d.status)}>{d.status}</Badge>
                </Td>
              </tr>
            ))}
          </DataTable>
        </Panel>
      </div>
    </>
  );
}
