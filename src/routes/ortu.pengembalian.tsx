import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Send } from "lucide-react";
import { PageHeader, Panel, Field, DataTable, Td, Badge, statusTone } from "@/components/sibudi/ui-kit";
import { useSibudi, fmtTanggal, newId } from "@/lib/sibudi-store";

export const Route = createFileRoute("/ortu/pengembalian")({
  component: PengembalianOrtu,
});

const inputClass =
  "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";

function PengembalianOrtu() {
  const { state, update, siswaAktif } = useSibudi();
  const [pilih, setPilih] = useState<string[]>([]);
  const [kondisi, setKondisi] = useState<"Baik" | "Rusak Ringan" | "Rusak Berat" | "Hilang">("Baik");
  const [catatan, setCatatan] = useState("");
  const [info, setInfo] = useState("");

  const nama = siswaAktif?.nama ?? "";
  const dipinjam = useMemo(
    () =>
      state.distribusi.filter(
        (d) => d.tipe === "Siswa" && d.penerima === nama && d.diterima && d.status === "Dipinjam",
      ),
    [state.distribusi, nama],
  );
  const pengajuan = state.pengembalian.filter((p) => p.penerima === nama);

  const toggle = (id: string) => setPilih((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  function ajukan() {
    if (pilih.length === 0) return;
    const tanggal = new Date().toISOString().slice(0, 10);
    const items = dipinjam
      .filter((d) => pilih.includes(d.id))
      .map((d) => ({
        ...d,
        id: newId("PB"),
        tanggal,
        kondisi,
        status: "Diajukan" as const,
        catatan,
        nisn: siswaAktif?.nisn ?? "",
      }));
    update((s) => ({ ...s, pengembalian: [...items, ...s.pengembalian] }));
    setInfo(`${items.length} pengajuan pengembalian dikirim ke wali kelas untuk dikonfirmasi.`);
    setPilih([]);
    setCatatan("");
  }

  return (
    <>
      <PageHeader title="Pengembalian Buku" desc="Ceklis buku yang akan dikembalikan lalu ajukan ke wali kelas." />

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Ajukan Pengembalian" className="lg:col-span-2">
          {info ? (
            <p className="mb-4 rounded-xl bg-success/10 px-4 py-3 text-xs font-semibold text-success">{info}</p>
          ) : null}
          {dipinjam.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Belum ada buku aktif. Terima buku terlebih dahulu di menu Peminjaman Buku.
            </p>
          ) : (
            <>
              <DataTable head={["", "ID", "Tanggal Pinjam", "Buku", "Jumlah"]}>
                {dipinjam.map((d) => (
                  <tr key={d.id}>
                    <Td>
                      <input
                        type="checkbox"
                        checked={pilih.includes(d.id)}
                        onChange={() => toggle(d.id)}
                        className="size-4 accent-[hsl(var(--primary))]"
                      />
                    </Td>
                    <Td className="font-semibold">{d.id}</Td>
                    <Td className="text-muted-foreground">{fmtTanggal(d.tanggal)}</Td>
                    <Td>{d.buku}</Td>
                    <Td>{d.jumlah}</Td>
                  </tr>
                ))}
              </DataTable>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Field label="Kondisi Buku">
                  <select
                    className={inputClass}
                    value={kondisi}
                    onChange={(e) => setKondisi(e.target.value as typeof kondisi)}
                  >
                    <option>Baik</option>
                    <option>Rusak Ringan</option>
                    <option>Rusak Berat</option>
                    <option>Hilang</option>
                  </select>
                </Field>
                <Field label="Catatan">
                  <input
                    className={inputClass}
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    placeholder="Opsional"
                  />
                </Field>
              </div>
              <button
                onClick={ajukan}
                disabled={pilih.length === 0}
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-40"
              >
                <Send className="size-4" /> Ajukan Pengembalian ({pilih.length})
              </button>
            </>
          )}
        </Panel>

        <Panel title="Status Pengajuan">
          {pengajuan.length === 0 ? (
            <p className="text-xs text-muted-foreground">Belum ada pengajuan.</p>
          ) : (
            <DataTable head={["ID", "Buku", "Kondisi", "Status"]}>
              {pengajuan.map((p) => (
                <tr key={p.id}>
                  <Td className="font-semibold">{p.id}</Td>
                  <Td>{p.buku}</Td>
                  <Td>
                    <Badge tone={statusTone(p.kondisi ?? "Baik")}>{p.kondisi}</Badge>
                  </Td>
                  <Td>
                    <Badge tone={statusTone(p.status)}>{p.status}</Badge>
                  </Td>
                </tr>
              ))}
            </DataTable>
          )}
        </Panel>
      </div>
    </>
  );
}
