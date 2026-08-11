import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search, Download, FileText, Pencil, KeyRound, MessageCircle, Bell, Trash2 } from "lucide-react";
import { PageHeader, Panel, DataTable, Td, Badge, Field } from "@/components/sibudi/ui-kit";
import { useSibudi, waLink, type SiswaAkun } from "@/lib/sibudi-store";
import { exportExcel, exportPdfTable } from "@/lib/export-utils";

export const Route = createFileRoute("/guru/siswa")({
  component: SiswaGuru,
});

const btnGhost =
  "inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold hover:bg-muted";
const btnPrimary =
  "inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover";
const input =
  "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";

const emptyForm = (kelas: string): SiswaAkun => ({
  nisn: "",
  nama: "",
  kelas,
  wali: "",
  wa: "",
  dipinjam: 0,
  password: "ortu123",
});

function SiswaGuru() {
  const { state, update, guruAktif, kirimNotif } = useSibudi();
  const kelas = guruAktif?.kelas ?? "-";

  const [q, setQ] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editNisn, setEditNisn] = useState<string | null>(null);
  const [form, setForm] = useState<SiswaAkun>(emptyForm(kelas));
  const [info, setInfo] = useState("");
  const [pilih, setPilih] = useState<string[]>([]);
  const [viaWeb, setViaWeb] = useState(true);
  const [viaWa, setViaWa] = useState(true);

  const rows = useMemo(
    () =>
      state.siswa.filter(
        (s) => s.kelas === kelas && (!q || `${s.nama} ${s.nisn}`.toLowerCase().includes(q.toLowerCase())),
      ),
    [state.siswa, kelas, q],
  );

  const toggle = (nisn: string) =>
    setPilih((p) => (p.includes(nisn) ? p.filter((x) => x !== nisn) : [...p, nisn]));

  function simpan() {
    if (!form.nama.trim()) return;
    update((s) => ({
      ...s,
      siswa: editNisn
        ? s.siswa.map((x) => (x.nisn === editNisn ? { ...x, ...form } : x))
        : [{ ...form, nisn: form.nisn || `S-${Date.now().toString().slice(-6)}` }, ...s.siswa],
    }));
    setInfo(editNisn ? `Data ${form.nama} diperbarui.` : `Siswa ${form.nama} ditambahkan.`);
    setForm(emptyForm(kelas));
    setEditNisn(null);
    setOpenForm(false);
  }

  function resetPassword(s: SiswaAkun) {
    update((st) => ({
      ...st,
      siswa: st.siswa.map((x) => (x.nisn === s.nisn ? { ...x, password: "ortu123" } : x)),
    }));
    setInfo(`Password login orang tua ${s.nama} direset ke "ortu123".`);
  }

  function ingatkan(targets: SiswaAkun[]) {
    if (!viaWeb && !viaWa) {
      setInfo("Pilih minimal satu kanal pengingat (Web atau WhatsApp).");
      return;
    }
    const kanal = [viaWeb ? "Web" : null, viaWa ? "WhatsApp" : null].filter(Boolean).join(" + ");
    targets.forEach((s) => {
      const pesan = `Yth. ${s.wali || "Wali murid"}, ananda ${s.nama} (Kelas ${s.kelas}) masih memiliki ${s.dipinjam} buku pinjaman. Mohon segera dikembalikan ke sekolah. Terima kasih — ${guruAktif?.nama ?? "Wali Kelas"}.`;
      if (viaWeb) {
        kirimNotif({
          nisn: s.nisn,
          judul: "Pengingat pengembalian buku",
          isi: pesan,
          tipe: "warning",
          kanal,
        });
      }
      if (viaWa) {
        if (!guruAktif?.waSynced) {
          setInfo("Sinkronkan nomor WhatsApp Anda di menu Profil untuk mengirim pengingat WhatsApp.");
          return;
        }
        window.open(waLink(s.wa, pesan), "_blank", "noopener");
      }
    });
    if (viaWa && !guruAktif?.waSynced) return;
    setInfo(`Pengingat terkirim ke ${targets.length} wali murid via ${kanal}.`);
    setPilih([]);
  }

  return (
    <>
      <PageHeader
        title={`Manajemen Data Siswa Kelas ${kelas}`}
        desc="Kelola data siswa, akun login orang tua, dan kirim pengingat."
        actions={
          <>
            <button
              className={btnGhost}
              onClick={() =>
                void exportExcel(
                  rows.map((s) => ({ NISN: s.nisn, Nama: s.nama, Kelas: s.kelas, Wali: s.wali, WhatsApp: s.wa, Dipinjam: s.dipinjam })),
                  `data-siswa-${kelas}.xlsx`,
                  "Siswa",
                )
              }
            >
              <Download className="size-4" /> Download Excel
            </button>
            <button
              className={btnGhost}
              onClick={() =>
                void exportPdfTable({
                  title: `Data Siswa Kelas ${kelas}`,
                  subtitle: state.pengaturan.namaSekolah,
                  head: ["NISN", "Nama", "Wali Murid", "No. WA", "Dipinjam"],
                  body: rows.map((s) => [s.nisn, s.nama, s.wali, s.wa, s.dipinjam]),
                  filename: `data-siswa-${kelas}.pdf`,
                })
              }
            >
              <FileText className="size-4" /> Print PDF
            </button>
            <button
              className={btnPrimary}
              onClick={() => {
                setEditNisn(null);
                setForm(emptyForm(kelas));
                setOpenForm((v) => !v);
              }}
            >
              <Plus className="size-4" /> Tambah Siswa
            </button>
          </>
        }
      />

      {info ? <p className="rounded-xl bg-success/10 px-4 py-3 text-xs font-semibold text-success">{info}</p> : null}

      {openForm ? (
        <Panel title={editNisn ? "Edit Siswa" : "Tambah Siswa"}>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="NISN">
              <input className={input} value={form.nisn} onChange={(e) => setForm({ ...form, nisn: e.target.value })} />
            </Field>
            <Field label="Nama Siswa">
              <input className={input} value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
            </Field>
            <Field label="Kelas">
              <input className={input} value={form.kelas} readOnly />
            </Field>
            <Field label="Wali Murid">
              <input className={input} value={form.wali} onChange={(e) => setForm({ ...form, wali: e.target.value })} />
            </Field>
            <Field label="No. WhatsApp Orang Tua">
              <input className={input} value={form.wa} onChange={(e) => setForm({ ...form, wa: e.target.value })} />
            </Field>
            <Field label="Password Login Orang Tua">
              <input
                className={input}
                value={form.password ?? ""}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </Field>
          </div>
          <div className="mt-4 flex gap-2">
            <button className={btnPrimary} onClick={simpan}>
              Simpan
            </button>
            <button className={btnGhost} onClick={() => setOpenForm(false)}>
              Batal
            </button>
          </div>
        </Panel>
      ) : null}

      <Panel>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative min-w-56 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari siswa..."
              className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <label className="flex items-center gap-2 text-xs font-semibold">
            <input type="checkbox" checked={viaWeb} onChange={(e) => setViaWeb(e.target.checked)} className="size-4 accent-[hsl(var(--primary))]" />
            <Bell className="size-4" /> Ingatkan di Web
          </label>
          <label className="flex items-center gap-2 text-xs font-semibold">
            <input type="checkbox" checked={viaWa} onChange={(e) => setViaWa(e.target.checked)} className="size-4 accent-[hsl(var(--primary))]" />
            <MessageCircle className="size-4" /> Ingatkan ke WhatsApp
          </label>
          <button
            className={btnPrimary}
            disabled={pilih.length === 0}
            onClick={() => ingatkan(rows.filter((s) => pilih.includes(s.nisn)))}
          >
            <MessageCircle className="size-4" /> Ingatkan Terpilih ({pilih.length})
          </button>
        </div>

        <DataTable head={["", "NISN", "Nama Siswa", "Wali Murid", "No. WhatsApp", "Dipinjam", "Aksi"]}>
          {rows.map((s) => (
            <tr key={s.nisn}>
              <Td>
                <input
                  type="checkbox"
                  checked={pilih.includes(s.nisn)}
                  onChange={() => toggle(s.nisn)}
                  className="size-4 accent-[hsl(var(--primary))]"
                />
              </Td>
              <Td className="font-semibold">{s.nisn}</Td>
              <Td>{s.nama}</Td>
              <Td className="text-muted-foreground">{s.wali}</Td>
              <Td className="text-muted-foreground">{s.wa}</Td>
              <Td>
                <Badge tone={s.dipinjam > 3 ? "warning" : "primary"}>{s.dipinjam} buku</Badge>
              </Td>
              <Td>
                <div className="flex flex-wrap gap-2">
                  <button
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    onClick={() => {
                      setEditNisn(s.nisn);
                      setForm({ ...s, password: s.password ?? "ortu123" });
                      setOpenForm(true);
                    }}
                  >
                    <Pencil className="size-3.5" /> Edit
                  </button>
                  <button
                    className="inline-flex items-center gap-1 text-xs font-semibold text-warning hover:underline"
                    onClick={() => resetPassword(s)}
                  >
                    <KeyRound className="size-3.5" /> Reset Password
                  </button>
                  <button
                    className="inline-flex items-center gap-1 text-xs font-semibold text-success hover:underline"
                    onClick={() => ingatkan([s])}
                  >
                    <MessageCircle className="size-3.5" /> Ingatkan
                  </button>
                  <button
                    className="inline-flex items-center gap-1 text-xs font-semibold text-destructive hover:underline"
                    onClick={() => update((st) => ({ ...st, siswa: st.siswa.filter((x) => x.nisn !== s.nisn) }))}
                  >
                    <Trash2 className="size-3.5" /> Hapus
                  </button>
                </div>
              </Td>
            </tr>
          ))}
        </DataTable>
      </Panel>
    </>
  );
}
