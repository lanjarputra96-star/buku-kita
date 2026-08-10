import { useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Upload, Download, FileText, KeyRound, Pencil, Trash2, Search } from "lucide-react";
import { PageHeader, Panel, DataTable, Td, Badge, statusTone, Field } from "@/components/sibudi/ui-kit";
import { useSibudi, KELAS_LIST, type GuruAkun } from "@/lib/sibudi-store";
import { exportExcel, exportPdfTable, importExcel } from "@/lib/export-utils";

export const Route = createFileRoute("/admin/data-guru")({
  component: DataGuru,
});

const btnGhost =
  "inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold hover:bg-muted";
const btnPrimary =
  "inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover";
const input =
  "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";

const emptyGuru: GuruAkun = {
  nip: "",
  nama: "",
  kelas: KELAS_LIST[0]!,
  email: "",
  status: "Aktif",
  username: "",
  password: "guru123",
};

function DataGuru() {
  const { state, update, log } = useSibudi();
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState<GuruAkun | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [newPass, setNewPass] = useState("");
  const [info, setInfo] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const rows = useMemo(
    () => state.guru.filter((g) => !q || `${g.nama} ${g.nip} ${g.kelas}`.toLowerCase().includes(q.toLowerCase())),
    [state.guru, q],
  );

  async function onImport(file: File) {
    const data = await importExcel(file);
    const imported: GuruAkun[] = data.map((r, i) => ({
      nip: String(r["nip"] ?? r["NIP"] ?? `IMP-${i + 1}`),
      nama: String(r["nama"] ?? r["Nama"] ?? "-"),
      kelas: String(r["kelas"] ?? r["Kelas"] ?? "-"),
      email: String(r["email"] ?? r["Email"] ?? "-"),
      status: "Aktif",
      username: String(r["username"] ?? r["Username"] ?? `guru${i + 1}`),
      password: "guru123",
    }));
    update((s) => ({ ...s, guru: [...imported, ...s.guru] }));
    log(`Import ${imported.length} data guru`, "Data Guru");
    setInfo(`${imported.length} guru berhasil diimport (password awal: guru123).`);
  }

  function simpan() {
    if (!edit) return;
    const target = edit;
    update((s) => ({
      ...s,
      guru: isNew ? [target, ...s.guru] : s.guru.map((g) => (g.nip === target.nip ? target : g)),
    }));
    log(`${isNew ? "Menambah" : "Memperbarui"} data guru ${target.nama}`, "Data Guru");
    setInfo(`Data guru ${target.nama} tersimpan.`);
    setEdit(null);
    setNewPass("");
  }

  return (
    <>
      <PageHeader
        title="Data Guru"
        desc="Data wali kelas beserta akun login portal guru."
        actions={
          <>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void onImport(f);
                e.target.value = "";
              }}
            />
            <button className={btnGhost} onClick={() => fileRef.current?.click()}>
              <Upload className="size-4" /> Import Excel
            </button>
            <button
              className={btnGhost}
              onClick={() =>
                void exportExcel(
                  rows.map(({ nip, nama, kelas, email, status, username }) => ({ nip, nama, kelas, email, status, username })),
                  "data-guru.xlsx",
                  "Guru",
                )
              }
            >
              <Download className="size-4" /> Export Excel
            </button>
            <button
              className={btnGhost}
              onClick={() =>
                void exportPdfTable({
                  title: "Data Guru",
                  subtitle: state.pengaturan.namaSekolah,
                  head: ["NIP", "Nama", "Kelas", "Email", "Username", "Status"],
                  body: rows.map((g) => [g.nip, g.nama, g.kelas, g.email, g.username, g.status]),
                  filename: "data-guru.pdf",
                })
              }
            >
              <FileText className="size-4" /> Export PDF
            </button>
            <button
              className={btnPrimary}
              onClick={() => {
                setIsNew(true);
                setEdit({ ...emptyGuru });
              }}
            >
              <Plus className="size-4" /> Tambah Guru
            </button>
          </>
        }
      />

      {info ? <p className="rounded-xl bg-success/10 px-4 py-3 text-xs font-semibold text-success">{info}</p> : null}

      {edit ? (
        <Panel title={isNew ? "Tambah Guru" : `Edit Guru — ${edit.nama}`} desc="Akun ini dipakai untuk login Portal Guru.">
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="NIP">
              <input className={input} value={edit.nip} onChange={(e) => setEdit({ ...edit, nip: e.target.value })} />
            </Field>
            <Field label="Nama Guru">
              <input className={input} value={edit.nama} onChange={(e) => setEdit({ ...edit, nama: e.target.value })} />
            </Field>
            <Field label="Wali Kelas">
              <select className={input} value={edit.kelas} onChange={(e) => setEdit({ ...edit, kelas: e.target.value })}>
                {KELAS_LIST.map((k) => (
                  <option key={k}>{k}</option>
                ))}
              </select>
            </Field>
            <Field label="Email">
              <input className={input} value={edit.email} onChange={(e) => setEdit({ ...edit, email: e.target.value })} />
            </Field>
            <Field label="Username Login Guru">
              <input className={input} value={edit.username} onChange={(e) => setEdit({ ...edit, username: e.target.value })} />
            </Field>
            <Field label="Status">
              <select
                className={input}
                value={edit.status}
                onChange={(e) => setEdit({ ...edit, status: e.target.value as GuruAkun["status"] })}
              >
                <option>Aktif</option>
                <option>Cuti</option>
              </select>
            </Field>
            <Field label="Reset Password Guru">
              <div className="flex gap-2">
                <input
                  className={input}
                  placeholder="Password baru"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                />
                <button
                  type="button"
                  className={btnGhost}
                  onClick={() => {
                    const pass = newPass.trim() || "guru123";
                    setEdit({ ...edit, password: pass });
                    setInfo(`Password ${edit.nama} akan direset menjadi "${pass}" setelah disimpan.`);
                  }}
                >
                  <KeyRound className="size-4" /> Reset
                </button>
              </div>
            </Field>
          </div>
          <div className="mt-4 flex gap-2">
            <button className={btnPrimary} onClick={simpan}>
              Simpan
            </button>
            <button className={btnGhost} onClick={() => setEdit(null)}>
              Batal
            </button>
          </div>
        </Panel>
      ) : null}

      <Panel>
        <div className="relative mb-4 min-w-56">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama, NIP, atau kelas..."
            className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <DataTable head={["NIP", "Nama Guru", "Wali Kelas", "Email", "Username", "Status", ""]}>
          {rows.map((g) => (
            <tr key={g.nip}>
              <Td className="font-semibold">{g.nip}</Td>
              <Td>{g.nama}</Td>
              <Td>{g.kelas}</Td>
              <Td className="text-muted-foreground">{g.email}</Td>
              <Td className="text-muted-foreground">{g.username}</Td>
              <Td>
                <Badge tone={statusTone(g.status)}>{g.status}</Badge>
              </Td>
              <Td>
                <div className="flex gap-3">
                  <button
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    onClick={() => {
                      setIsNew(false);
                      setEdit(g);
                      setNewPass("");
                    }}
                  >
                    <Pencil className="size-3.5" /> Edit
                  </button>
                  <button
                    className="inline-flex items-center gap-1 text-xs font-semibold text-destructive hover:underline"
                    onClick={() => update((s) => ({ ...s, guru: s.guru.filter((x) => x.nip !== g.nip) }))}
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
