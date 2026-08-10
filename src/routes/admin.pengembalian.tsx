import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { RefreshCw, CheckSquare, Square } from "lucide-react";
import { PageHeader, Panel, DataTable, Td, Badge, statusTone, Field } from "@/components/sibudi/ui-kit";
import { useSibudi, KELAS_LIST, newId, fmtTanggal, type TransaksiItem } from "@/lib/sibudi-store";

export const Route = createFileRoute("/admin/pengembalian")({
  component: PengembalianPage,
});

const btnGhost =
  "inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold hover:bg-muted";
const btnPrimary =
  "inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover";
const input =
  "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";

function PengembalianPage() {
  const { state, update, log } = useSibudi();
  const [tipe, setTipe] = useState<"Siswa" | "Guru">("Siswa");
  const [kelas, setKelas] = useState("");
  const [kondisi, setKondisi] = useState<NonNullable<TransaksiItem["kondisi"]>>("Baik");
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [picked, setPicked] = useState<string[]>([]);
  const [info, setInfo] = useState("");

  const outstanding = useMemo(
    () => state.distribusi.filter((d) => d.status === "Dipinjam" && d.tipe === tipe && (!kelas || d.kelas === kelas)),
    [state.distribusi, tipe, kelas],
  );

  const allPicked = outstanding.length > 0 && outstanding.every((d) => picked.includes(d.id));

  function proses() {
    const target = outstanding.filter((d) => picked.includes(d.id));
    if (target.length === 0) {
      setInfo("Pilih minimal satu peminjaman untuk dikembalikan.");
      return;
    }
    const items: TransaksiItem[] = target.map((d) => ({
      ...d,
      id: newId("PB"),
      tanggal,
      kondisi,
      status: "Dikembalikan",
    }));
    update((s) => ({
      ...s,
      pengembalian: [...items, ...s.pengembalian],
      distribusi: s.distribusi.map((d) => (picked.includes(d.id) ? { ...d, status: "Dikembalikan" } : d)),
      buku: s.buku.map((b) => {
        const kembali = target.filter((t) => t.bukuKode === b.kode).reduce((a, t) => a + t.jumlah, 0);
        return kembali ? { ...b, dipinjam: Math.max(0, b.dipinjam - kembali) } : b;
      }),
    }));
    log(`Pengembalian ${target.length} paket buku dari ${tipe.toLowerCase()} (kondisi ${kondisi})`, "Pengembalian");
    setInfo(`${target.length} pengembalian berhasil dicatat.`);
    setPicked([]);
  }

  return (
    <>
      <PageHeader title="Pengembalian Buku" desc="Catat pengembalian buku dari guru maupun siswa, per kelas atau pilih manual." />

      {info ? <p className="rounded-xl bg-success/10 px-4 py-3 text-xs font-semibold text-success">{info}</p> : null}

      <Panel title="Form Pengembalian">
        <div className="grid gap-4 md:grid-cols-4">
          <Field label="Dari">
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
          <Field label="Kondisi Buku">
            <select
              className={input}
              value={kondisi}
              onChange={(e) => setKondisi(e.target.value as NonNullable<TransaksiItem["kondisi"]>)}
            >
              <option>Baik</option>
              <option>Rusak Ringan</option>
              <option>Rusak Berat</option>
              <option>Hilang</option>
            </select>
          </Field>
          <Field label="Tanggal">
            <input type="date" className={input} value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
          </Field>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button className={btnGhost} onClick={() => setPicked(allPicked ? [] : outstanding.map((d) => d.id))}>
            {allPicked ? <CheckSquare className="size-4" /> : <Square className="size-4" />}
            {kelas ? `Pilih semua kelas ${kelas}` : `Pilih semua ${tipe.toLowerCase()}`}
          </button>
          <span className="text-xs text-muted-foreground">{picked.length} item dipilih</span>
        </div>

        <div className="mt-3 grid max-h-72 gap-2 overflow-y-auto rounded-xl border border-border p-3 sm:grid-cols-2">
          {outstanding.map((d) => (
            <label key={d.id} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-muted">
              <input
                type="checkbox"
                className="size-4"
                checked={picked.includes(d.id)}
                onChange={() => setPicked((p) => (p.includes(d.id) ? p.filter((x) => x !== d.id) : [...p, d.id]))}
              />
              <span className="min-w-0">
                <span className="block truncate font-medium">
                  {d.penerima} — {d.kelas}
                </span>
                <span className="block truncate text-[11px] text-muted-foreground">
                  {d.buku} · {d.jumlah} eks · {fmtTanggal(d.tanggal)}
                </span>
              </span>
            </label>
          ))}
          {outstanding.length === 0 ? (
            <p className="p-2 text-xs text-muted-foreground">Tidak ada buku yang sedang dipinjam.</p>
          ) : null}
        </div>

        <button className={btnPrimary + " mt-4"} onClick={proses}>
          <RefreshCw className="size-4" /> Proses Pengembalian
        </button>
      </Panel>

      <Panel title="Riwayat Pengembalian">
        <DataTable head={["ID", "Tanggal", "Tipe", "Nama", "Kelas", "Buku", "Jumlah", "Kondisi"]}>
          {state.pengembalian.map((p) => (
            <tr key={p.id}>
              <Td className="font-semibold">{p.id}</Td>
              <Td>{fmtTanggal(p.tanggal)}</Td>
              <Td>{p.tipe}</Td>
              <Td>{p.penerima}</Td>
              <Td>{p.kelas}</Td>
              <Td className="text-muted-foreground">{p.buku}</Td>
              <Td>{p.jumlah}</Td>
              <Td>
                <Badge tone={statusTone(p.kondisi ?? "Baik")}>{p.kondisi ?? "Baik"}</Badge>
              </Td>
            </tr>
          ))}
        </DataTable>
      </Panel>
    </>
  );
}
