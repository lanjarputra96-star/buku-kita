import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PackagePlus, CheckSquare, Square } from "lucide-react";
import { PageHeader, Panel, DataTable, Td, Badge, statusTone, Field } from "@/components/sibudi/ui-kit";
import { useSibudi, KELAS_LIST, newId, fmtTanggal, type TransaksiItem } from "@/lib/sibudi-store";

export const Route = createFileRoute("/admin/distribusi")({
  component: DistribusiPage,
});

const btnGhost =
  "inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold hover:bg-muted";
const btnPrimary =
  "inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover";
const input =
  "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";

function DistribusiPage() {
  const { state, update, log } = useSibudi();
  const [tipe, setTipe] = useState<"Siswa" | "Guru">("Siswa");
  const [kelas, setKelas] = useState("");
  const [bukuKode, setBukuKode] = useState(state.buku[0]?.kode ?? "");
  const [jumlah, setJumlah] = useState(1);
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [picked, setPicked] = useState<string[]>([]);
  const [info, setInfo] = useState("");

  const kandidat = useMemo(() => {
    if (tipe === "Guru") {
      return state.guru.filter((g) => !kelas || g.kelas === kelas).map((g) => ({ id: g.nip, nama: g.nama, kelas: g.kelas }));
    }
    return state.siswa.filter((s) => !kelas || s.kelas === kelas).map((s) => ({ id: s.nisn, nama: s.nama, kelas: s.kelas }));
  }, [tipe, kelas, state.guru, state.siswa]);

  const allPicked = kandidat.length > 0 && kandidat.every((k) => picked.includes(k.id));

  function toggle(id: string) {
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  }

  function bagikan() {
    const buku = state.buku.find((b) => b.kode === bukuKode);
    const target = kandidat.filter((k) => picked.includes(k.id));
    if (!buku || target.length === 0) {
      setInfo("Pilih buku dan minimal satu penerima terlebih dahulu.");
      return;
    }
    const items: TransaksiItem[] = target.map((t) => ({
      id: newId("DS"),
      tanggal,
      tipe,
      penerima: t.nama,
      kelas: t.kelas,
      bukuKode: buku.kode,
      buku: buku.judul,
      jumlah,
      status: "Dipinjam",
    }));
    update((s) => ({
      ...s,
      distribusi: [...items, ...s.distribusi],
      buku: s.buku.map((b) =>
        b.kode === buku.kode ? { ...b, dipinjam: b.dipinjam + items.length * jumlah } : b,
      ),
    }));
    log(`Distribusi ${buku.judul} ke ${items.length} ${tipe.toLowerCase()}${kelas ? ` kelas ${kelas}` : ""}`, "Distribusi");
    setInfo(`${items.length} paket buku berhasil dibagikan ke ${tipe.toLowerCase()}.`);
    setPicked([]);
  }

  return (
    <>
      <PageHeader title="Distribusi Buku" desc="Bagikan buku ke guru atau siswa, sekaligus per kelas atau pilih manual." />

      {info ? <p className="rounded-xl bg-success/10 px-4 py-3 text-xs font-semibold text-success">{info}</p> : null}

      <Panel title="Form Distribusi">
        <div className="grid gap-4 md:grid-cols-4">
          <Field label="Penerima">
            <select
              className={input}
              value={tipe}
              onChange={(e) => {
                setTipe(e.target.value as "Siswa" | "Guru");
                setPicked([]);
              }}
            >
              <option value="Siswa">Siswa</option>
              <option value="Guru">Guru</option>
            </select>
          </Field>
          <Field label="Kelas">
            <select
              className={input}
              value={kelas}
              onChange={(e) => {
                setKelas(e.target.value);
                setPicked([]);
              }}
            >
              <option value="">Semua Kelas</option>
              {KELAS_LIST.map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
          </Field>
          <Field label="Buku">
            <select className={input} value={bukuKode} onChange={(e) => setBukuKode(e.target.value)}>
              {state.buku.map((b) => (
                <option key={b.kode} value={b.kode}>
                  {b.judul} ({b.kode})
                </option>
              ))}
            </select>
          </Field>
          <Field label="Jumlah / penerima">
            <input type="number" min={1} className={input} value={jumlah} onChange={(e) => setJumlah(Number(e.target.value))} />
          </Field>
          <Field label="Tanggal">
            <input type="date" className={input} value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
          </Field>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button
            className={btnGhost}
            onClick={() => setPicked(allPicked ? [] : kandidat.map((k) => k.id))}
          >
            {allPicked ? <CheckSquare className="size-4" /> : <Square className="size-4" />}
            {kelas ? `Pilih semua ${tipe.toLowerCase()} kelas ${kelas}` : `Pilih semua ${tipe.toLowerCase()}`}
          </button>
          <span className="text-xs text-muted-foreground">{picked.length} penerima dipilih</span>
        </div>

        <div className="mt-3 grid max-h-72 gap-2 overflow-y-auto rounded-xl border border-border p-3 sm:grid-cols-2 lg:grid-cols-3">
          {kandidat.map((k) => (
            <label key={k.id} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-muted">
              <input type="checkbox" checked={picked.includes(k.id)} onChange={() => toggle(k.id)} className="size-4" />
              <span className="min-w-0">
                <span className="block truncate font-medium">{k.nama}</span>
                <span className="block text-[11px] text-muted-foreground">{k.kelas}</span>
              </span>
            </label>
          ))}
          {kandidat.length === 0 ? <p className="p-2 text-xs text-muted-foreground">Tidak ada data.</p> : null}
        </div>

        <button className={btnPrimary + " mt-4"} onClick={bagikan}>
          <PackagePlus className="size-4" /> Bagikan Buku
        </button>
      </Panel>

      <Panel title="Riwayat Distribusi">
        <DataTable head={["ID", "Tanggal", "Tipe", "Penerima", "Kelas", "Buku", "Jumlah", "Status"]}>
          {state.distribusi.map((d) => (
            <tr key={d.id}>
              <Td className="font-semibold">{d.id}</Td>
              <Td>{fmtTanggal(d.tanggal)}</Td>
              <Td>{d.tipe}</Td>
              <Td>{d.penerima}</Td>
              <Td>{d.kelas}</Td>
              <Td className="text-muted-foreground">{d.buku}</Td>
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
