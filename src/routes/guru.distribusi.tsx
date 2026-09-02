import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Send } from "lucide-react";
import { PageHeader, Panel, Field, DataTable, Td, Badge, statusTone } from "@/components/sibudi/ui-kit";
import { useSibudi, fmtTanggal, newId, type TransaksiItem } from "@/lib/sibudi-store";
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
  const { state, update, guruAktif, log } = useSibudi();
  const kelas = guruAktif?.kelas ?? "";
  const siswaKelas = useMemo(
    () => state.siswa.filter((s) => !kelas || s.kelas === kelas),
    [state.siswa, kelas],
  );
  const riwayat = useMemo(
    () => state.distribusi.filter((d) => d.tipe === "Siswa" && (!kelas || d.kelas === kelas)),
    [state.distribusi, kelas],
  );

  const [mode, setMode] = useState<(typeof modes)[number]["id"]>("perorangan");
  const [bukuKode, setBukuKode] = useState("");
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [tempo, setTempo] = useState("");
  const [catatan, setCatatan] = useState("");
  const [siswaNisn, setSiswaNisn] = useState("");
  const [ceklis, setCeklis] = useState<string[]>([]);
  const [info, setInfo] = useState("");

  const toggle = (nisn: string) =>
    setCeklis((p) => (p.includes(nisn) ? p.filter((x) => x !== nisn) : [...p, nisn]));

  function simpan() {
    setInfo("");
    const buku = state.buku.find((b) => b.kode === bukuKode) ?? state.buku[0];
    if (!buku) return setInfo("Belum ada data buku. Minta admin menambahkan buku terlebih dahulu.");
    let target = siswaKelas;
    if (mode === "perorangan") target = siswaKelas.filter((s) => s.nisn === (siswaNisn || siswaKelas[0]?.nisn));
    if (mode === "ceklis") target = siswaKelas.filter((s) => ceklis.includes(s.nisn));
    if (target.length === 0) return setInfo("Pilih minimal satu siswa penerima.");

    const items: TransaksiItem[] = target.map((s) => ({
      id: newId("DS"),
      tanggal,
      tipe: "Siswa",
      penerima: s.nama,
      kelas: s.kelas,
      bukuKode: buku.kode,
      buku: buku.judul,
      jumlah: 1,
      status: "Dipinjam",
      catatan,
      nisn: s.nisn,
      jatuhTempo: tempo || undefined,
      diterima: false,
    }));

    update((st) => ({
      ...st,
      distribusi: [...items, ...st.distribusi],
      buku: st.buku.map((b) => (b.kode === buku.kode ? { ...b, dipinjam: b.dipinjam + items.length } : b)),
      siswa: st.siswa.map((s) =>
        target.some((t) => t.nisn === s.nisn) ? { ...s, dipinjam: (s.dipinjam ?? 0) + 1 } : s,
      ),
    }));
    log(`Distribusi ${buku.judul} ke ${items.length} siswa`, "Distribusi");
    setInfo(`Distribusi tersimpan untuk ${items.length} siswa.`);
    setCeklis([]);
  }

  return (
    <>
      <PageHeader title="Formulir Distribusi Buku" desc={`Serahkan buku kepada siswa Kelas ${kelas || "-"}.`} />

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

        {info ? <p className="mb-4 rounded-xl bg-success/10 px-4 py-3 text-xs font-semibold text-success">{info}</p> : null}

        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            simpan();
          }}
        >
          <Field label="Buku">
            <select className={inputClass} value={bukuKode} onChange={(e) => setBukuKode(e.target.value)}>
              <option value="">— Pilih buku —</option>
              {state.buku.map((b) => (
                <option key={b.kode} value={b.kode}>
                  {b.kode} — {b.judul}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Tanggal Distribusi">
            <input type="date" className={inputClass} value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
          </Field>

          {mode === "perorangan" ? (
            <Field label="Siswa Penerima">
              <select className={inputClass} value={siswaNisn} onChange={(e) => setSiswaNisn(e.target.value)}>
                <option value="">— Pilih siswa —</option>
                {siswaKelas.map((s) => (
                  <option key={s.nisn} value={s.nisn}>
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
                {siswaKelas.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Belum ada data siswa.</p>
                ) : (
                  siswaKelas.map((s) => (
                    <label key={s.nisn} className="flex items-center gap-2.5 text-sm">
                      <input
                        type="checkbox"
                        className="size-4"
                        checked={ceklis.includes(s.nisn)}
                        onChange={() => toggle(s.nisn)}
                      />
                      {s.nama} <span className="text-xs text-muted-foreground">({s.kelas})</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          ) : null}

          {mode === "semua" ? (
            <div className="rounded-2xl border border-primary/30 bg-accent p-4 text-sm text-accent-foreground md:col-span-2">
              Buku akan didistribusikan ke <strong>seluruh {siswaKelas.length} siswa</strong> Kelas {kelas || "-"} sekaligus.
            </div>
          ) : null}

          <Field label="Jatuh Tempo Pengembalian">
            <input type="date" className={inputClass} value={tempo} onChange={(e) => setTempo(e.target.value)} />
          </Field>
          <Field label="Catatan">
            <input placeholder="Opsional" className={inputClass} value={catatan} onChange={(e) => setCatatan(e.target.value)} />
          </Field>

          <div className="md:col-span-2">
            <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">
              <Send className="size-4" /> Simpan Distribusi
            </button>
          </div>
        </form>
      </Panel>

      <Panel title="Riwayat Distribusi Kelas">
        {riwayat.length === 0 ? (
          <p className="text-xs text-muted-foreground">Belum ada distribusi.</p>
        ) : (
          <DataTable head={["Tanggal", "Siswa", "Buku", "Jumlah", "Status"]}>
            {riwayat.map((d) => (
              <tr key={d.id}>
                <Td className="text-muted-foreground">{fmtTanggal(d.tanggal)}</Td>
                <Td>{d.penerima}</Td>
                <Td>{d.buku}</Td>
                <Td>{d.jumlah}</Td>
                <Td>
                  <Badge tone={statusTone(d.status)}>{d.status}</Badge>
                </Td>
              </tr>
            ))}
          </DataTable>
        )}
      </Panel>
    </>
  );
}
