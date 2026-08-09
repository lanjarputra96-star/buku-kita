import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Send } from "lucide-react";
import { PageHeader, Panel, Field, DataTable, Td, Badge, statusTone } from "@/components/sibudi/ui-kit";
import { bukuList, siswaList, distribusiList } from "@/lib/sibudi-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/guru/distribusi")({
  component: DistribusiGuru,
});

const inputClass =
  "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";

const modes = [
  { id: "perorangan", label: "Perorangan" },
  { id: "ceklis", label: "Pilih Beberapa" },
  { id: "semua", label: "Satu Kelas" },
] as const;

function DistribusiGuru() {
  const [mode, setMode] = useState<(typeof modes)[number]["id"]>("perorangan");

  return (
    <>
      <PageHeader title="Formulir Distribusi Buku" desc="Serahkan buku kepada siswa Kelas 1A." />

      <Panel>
        <div className="mb-5 flex flex-wrap gap-2 rounded-2xl bg-muted p-1.5">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={cn(
                "flex-1 rounded-xl px-4 py-2.5 text-xs font-semibold transition-colors",
                mode === m.id ? "bg-card text-primary shadow-card" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>

        <form className="grid gap-4 md:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
          <Field label="Buku">
            <select className={inputClass}>
              {bukuList.map((b) => (
                <option key={b.kode}>
                  {b.kode} — {b.judul}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Tanggal Distribusi">
            <input type="date" className={inputClass} />
          </Field>

          {mode === "perorangan" ? (
            <Field label="Siswa Penerima">
              <select className={inputClass}>
                {siswaList.map((s) => (
                  <option key={s.nisn}>
                    {s.nama} — {s.nisn}
                  </option>
                ))}
              </select>
            </Field>
          ) : null}

          {mode === "ceklis" ? (
            <div className="md:col-span-2">
              <p className="mb-2 text-xs font-semibold text-muted-foreground">Pilih Siswa</p>
              <div className="grid max-h-56 gap-2 overflow-y-auto rounded-2xl border border-border p-3 sm:grid-cols-2">
                {siswaList.map((s) => (
                  <label key={s.nisn} className="flex items-center gap-2.5 text-sm">
                    <input type="checkbox" className="size-4 accent-[var(--primary)]" />
                    {s.nama} <span className="text-xs text-muted-foreground">({s.kelas})</span>
                  </label>
                ))}
              </div>
            </div>
          ) : null}

          {mode === "semua" ? (
            <div className="rounded-2xl border border-primary/30 bg-accent p-4 text-sm text-accent-foreground md:col-span-2">
              Buku akan didistribusikan ke <strong>seluruh 32 siswa</strong> Kelas 1A sekaligus.
            </div>
          ) : null}

          <Field label="Jatuh Tempo Pengembalian">
            <input type="date" className={inputClass} />
          </Field>
          <Field label="Catatan">
            <input placeholder="Opsional" className={inputClass} />
          </Field>

          <div className="md:col-span-2">
            <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">
              <Send className="size-4" /> Simpan Distribusi
            </button>
          </div>
        </form>
      </Panel>

      <Panel title="Riwayat Distribusi Kelas">
        <DataTable head={["Tanggal", "Siswa", "Buku", "Jumlah", "Status"]}>
          {distribusiList.map((d) => (
            <tr key={d.id}>
              <Td className="text-muted-foreground">{d.tanggal}</Td>
              <Td>{d.siswa}</Td>
              <Td>{d.buku}</Td>
              <Td>{d.jumlah}</Td>
              <Td>
                <Badge tone={statusTone(d.status)}>{d.status}</Badge>
              </Td>
            </tr>
          ))}
        </DataTable>
      </Panel>
    </>
  );
}
