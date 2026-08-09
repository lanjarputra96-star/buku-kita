import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, XCircle, Save } from "lucide-react";
import { PageHeader, Panel, Field, DataTable, Td, Badge, statusTone } from "@/components/sibudi/ui-kit";
import { bukuList, siswaList, pengembalianList } from "@/lib/sibudi-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/guru/pengembalian")({
  component: PengembalianGuru,
});

const inputClass =
  "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";

function PengembalianGuru() {
  const [sub, setSub] = useState<"input" | "pengajuan">("input");

  return (
    <>
      <PageHeader title="Manajemen Pengembalian Buku" desc="Catat pengembalian langsung atau verifikasi pengajuan orang tua." />

      <Panel>
        <div className="mb-5 flex gap-2 rounded-2xl bg-muted p-1.5">
          {(
            [
              ["input", "Input Pengembalian"],
              ["pengajuan", "Pengajuan Orang Tua"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setSub(id)}
              className={cn(
                "flex-1 rounded-xl px-4 py-2.5 text-xs font-semibold transition-colors",
                sub === id ? "bg-card text-primary shadow-card" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {sub === "input" ? (
          <form className="grid gap-4 md:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
            <Field label="Siswa">
              <select className={inputClass}>
                {siswaList.map((s) => (
                  <option key={s.nisn}>{s.nama}</option>
                ))}
              </select>
            </Field>
            <Field label="Buku Dikembalikan">
              <select className={inputClass}>
                {bukuList.map((b) => (
                  <option key={b.kode}>{b.judul}</option>
                ))}
              </select>
            </Field>
            <Field label="Tanggal Pengembalian">
              <input type="date" className={inputClass} />
            </Field>
            <Field label="Kondisi Buku">
              <select className={inputClass}>
                <option>Baik</option>
                <option>Rusak Ringan</option>
                <option>Rusak Berat</option>
                <option>Hilang</option>
              </select>
            </Field>
            <Field label="Catatan Kondisi">
              <textarea rows={3} className={inputClass} placeholder="Contoh: sampul sobek di bagian belakang" />
            </Field>
            <div className="flex items-end">
              <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">
                <Save className="size-4" /> Simpan Pengembalian
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            {pengembalianList.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border p-4">
                <div>
                  <p className="text-sm font-semibold">
                    {p.siswa} <span className="text-xs text-muted-foreground">• {p.kelas}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {p.buku} • diajukan {p.tanggal} • kondisi {p.kondisi}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={statusTone(p.status)}>{p.status}</Badge>
                  <button className="inline-flex items-center gap-1 rounded-lg bg-success/15 px-3 py-1.5 text-[11px] font-semibold text-success">
                    <CheckCircle2 className="size-3.5" /> Terima
                  </button>
                  <button className="inline-flex items-center gap-1 rounded-lg bg-destructive/10 px-3 py-1.5 text-[11px] font-semibold text-destructive">
                    <XCircle className="size-3.5" /> Tolak
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel title="Riwayat Pengembalian">
        <DataTable head={["ID", "Tanggal", "Siswa", "Buku", "Kondisi", "Status"]}>
          {pengembalianList.map((p) => (
            <tr key={p.id}>
              <Td className="font-semibold">{p.id}</Td>
              <Td className="text-muted-foreground">{p.tanggal}</Td>
              <Td>{p.siswa}</Td>
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
    </>
  );
}
