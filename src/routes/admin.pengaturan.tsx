import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Save, ShieldCheck, UserCog } from "lucide-react";
import { PageHeader, Panel, Field } from "@/components/sibudi/ui-kit";
import { useSibudi } from "@/lib/sibudi-store";

export const Route = createFileRoute("/admin/pengaturan")({
  component: PengaturanPage,
});

const btnPrimary =
  "inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover";
const input =
  "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";

function PengaturanPage() {
  const { state, update, log } = useSibudi();
  const p = state.pengaturan;

  const [username, setUsername] = useState(p.adminUser);
  const [passLama, setPassLama] = useState("");
  const [passBaru, setPassBaru] = useState("");
  const [passUlang, setPassUlang] = useState("");
  const [akunMsg, setAkunMsg] = useState("");

  const [profil, setProfil] = useState({
    namaSekolah: p.namaSekolah,
    kepalaSekolah: p.kepalaSekolah,
    nipKepala: p.nipKepala,
    penanggungJawab: p.penanggungJawab,
    nipPenanggung: p.nipPenanggung,
    botNama: p.botNama ?? "Chatbot SIBUDI",
    botWa: p.botWa ?? "",
  });
  const [profilMsg, setProfilMsg] = useState("");

  function simpanAkun() {
    if (passLama !== p.adminPass) {
      setAkunMsg("Password lama tidak sesuai.");
      return;
    }
    if (passBaru && passBaru !== passUlang) {
      setAkunMsg("Konfirmasi password baru tidak cocok.");
      return;
    }
    update((s) => ({
      ...s,
      pengaturan: {
        ...s.pengaturan,
        adminUser: username.trim() || s.pengaturan.adminUser,
        adminPass: passBaru || s.pengaturan.adminPass,
      },
    }));
    log("Memperbarui akun admin", "Pengaturan");
    setAkunMsg("Akun admin berhasil diperbarui. Gunakan data baru saat login berikutnya.");
    setPassLama("");
    setPassBaru("");
    setPassUlang("");
  }

  return (
    <>
      <PageHeader title="Pengaturan" desc="Kelola akun admin, identitas sekolah, dan penanggung jawab perpustakaan." />

      <Panel title="Akun Admin" desc="Ganti username dan password login portal admin.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Username">
            <input className={input} value={username} onChange={(e) => setUsername(e.target.value)} />
          </Field>
          <Field label="Password Lama">
            <input type="password" className={input} value={passLama} onChange={(e) => setPassLama(e.target.value)} />
          </Field>
          <Field label="Password Baru">
            <input type="password" className={input} value={passBaru} onChange={(e) => setPassBaru(e.target.value)} />
          </Field>
          <Field label="Ulangi Password Baru">
            <input type="password" className={input} value={passUlang} onChange={(e) => setPassUlang(e.target.value)} />
          </Field>
        </div>
        {akunMsg ? <p className="mt-3 text-xs font-semibold text-primary">{akunMsg}</p> : null}
        <button className={btnPrimary + " mt-4"} onClick={simpanAkun}>
          <ShieldCheck className="size-4" /> Simpan Akun
        </button>
      </Panel>

      <Panel title="Identitas & Penanggung Jawab" desc="Nama ini muncul pada tanda tangan laporan PDF/Word.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nama Sekolah">
            <input className={input} value={profil.namaSekolah} onChange={(e) => setProfil({ ...profil, namaSekolah: e.target.value })} />
          </Field>
          <Field label="Kepala Sekolah">
            <input className={input} value={profil.kepalaSekolah} onChange={(e) => setProfil({ ...profil, kepalaSekolah: e.target.value })} />
          </Field>
          <Field label="NIP Kepala Sekolah">
            <input className={input} value={profil.nipKepala} onChange={(e) => setProfil({ ...profil, nipKepala: e.target.value })} />
          </Field>
          <Field label="Penanggung Jawab / Petugas Perpustakaan">
            <input
              className={input}
              value={profil.penanggungJawab}
              onChange={(e) => setProfil({ ...profil, penanggungJawab: e.target.value })}
            />
          </Field>
          <Field label="NIP Penanggung Jawab">
            <input className={input} value={profil.nipPenanggung} onChange={(e) => setProfil({ ...profil, nipPenanggung: e.target.value })} />
          </Field>
          <Field label="Nama Chatbot WhatsApp Sekolah">
            <input className={input} value={profil.botNama} onChange={(e) => setProfil({ ...profil, botNama: e.target.value })} />
          </Field>
          <Field label="Nomor WhatsApp Chatbot Sekolah">
            <input
              className={input}
              placeholder="Contoh: 0812xxxxxxx"
              value={profil.botWa}
              onChange={(e) => setProfil({ ...profil, botWa: e.target.value })}
            />
          </Field>
        </div>
        {profilMsg ? <p className="mt-3 text-xs font-semibold text-primary">{profilMsg}</p> : null}
        <button
          className={btnPrimary + " mt-4"}
          onClick={() => {
            update((s) => ({ ...s, pengaturan: { ...s.pengaturan, ...profil } }));
            log("Memperbarui identitas sekolah & penanggung jawab", "Pengaturan");
            setProfilMsg("Data berhasil disimpan.");
          }}
        >
          <Save className="size-4" /> Simpan Perubahan
        </button>
      </Panel>

      <KartuPanel />


      <Panel title="Akun Guru" desc="Password guru diatur pada menu Data Guru → Edit → Reset Password.">
        <ul className="space-y-2 text-sm">
          {state.guru.map((g) => (
            <li key={g.nip} className="flex items-center gap-3 rounded-xl bg-muted px-4 py-3">
              <UserCog className="size-4 text-primary" />
              <span className="font-medium">{g.nama}</span>
              <span className="text-xs text-muted-foreground">username: {g.username}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}

function KartuPanel() {
  const { state, update, log } = useSibudi();
  const [k, setK] = useState({ ...defaultKartu, ...(state.pengaturan.kartu ?? {}) });
  const [msg, setMsg] = useState("");

  function pilihLogo(file: File) {
    const reader = new FileReader();
    reader.onload = () => setK((prev) => ({ ...prev, logo: String(reader.result ?? "") }));
    reader.readAsDataURL(file);
  }

  return (
    <Panel title="Kartu Perpustakaan" desc="Atur isi, tata letak, dan logo kartu anggota. Kartu selalu berukuran KTP (85,6 × 54 mm) dengan kotak foto 3×4 kosong.">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Judul Kartu">
          <input className={input} value={k.judul} onChange={(e) => setK({ ...k, judul: e.target.value })} />
        </Field>
        <Field label="Subjudul (opsional)">
          <input className={input} value={k.subjudul} onChange={(e) => setK({ ...k, subjudul: e.target.value })} />
        </Field>
        <Field label="Warna Header">
          <input
            type="color"
            className="h-11 w-full cursor-pointer rounded-xl border border-input bg-background px-2"
            value={k.warnaHeader}
            onChange={(e) => setK({ ...k, warnaHeader: e.target.value })}
          />
        </Field>
        <Field label="Logo Sekolah">
          <input
            type="file"
            accept="image/png,image/jpeg"
            className={input}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) pilihLogo(f);
            }}
          />
        </Field>
        <Field label="Catatan di kartu">
          <input className={input} value={k.catatan} onChange={(e) => setK({ ...k, catatan: e.target.value })} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Kartu per baris">
            <input
              type="number"
              min={1}
              max={2}
              className={input}
              value={k.kolom}
              onChange={(e) => setK({ ...k, kolom: Number(e.target.value) })}
            />
          </Field>
          <Field label="Baris per halaman">
            <input
              type="number"
              min={1}
              max={5}
              className={input}
              value={k.baris}
              onChange={(e) => setK({ ...k, baris: Number(e.target.value) })}
            />
          </Field>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {([
          ["tampilkanFoto", "Tampilkan kotak foto 3×4"],
          ["tampilkanBarcode", "Tampilkan barcode NISN"],
          ["tampilkanKelas", "Tampilkan kelas"],
          ["tampilkanPenanggung", "Tampilkan penanggung jawab"],
        ] as const).map(([key, label]) => (
          <label key={key} className="flex items-center gap-3 rounded-xl bg-muted px-4 py-3 text-sm">
            <input type="checkbox" className="size-4" checked={k[key]} onChange={(e) => setK({ ...k, [key]: e.target.checked })} />
            {label}
          </label>
        ))}
      </div>

      <div className="mt-5">
        <p className="mb-2 text-xs font-semibold text-muted-foreground">Pratinjau kartu</p>
        <div className="w-[342px] max-w-full overflow-hidden rounded-xl border border-border">
          <div className="flex items-center gap-2 px-3 py-2 text-primary-foreground" style={{ background: k.warnaHeader }}>
            {k.logo ? <img src={k.logo} alt="Logo sekolah" className="size-8 rounded bg-card object-contain" /> : null}
            <div className="min-w-0">
              <p className="truncate text-xs font-bold">{state.pengaturan.namaSekolah.toUpperCase()}</p>
              <p className="truncate text-[10px]">{k.judul}</p>
              {k.subjudul ? <p className="truncate text-[10px]">{k.subjudul}</p> : null}
            </div>
          </div>
          <div className="flex gap-3 p-3">
            <div className="flex-1 space-y-1 text-[11px]">
              <p>Nama : Nama Siswa</p>
              <p>NISN : 0123456789</p>
              {k.tampilkanKelas ? <p>Kelas : 5A</p> : null}
              {k.tampilkanBarcode ? <div className="mt-2 h-6 w-full bg-[repeating-linear-gradient(90deg,currentColor_0_2px,transparent_2px_5px)] text-foreground" /> : null}
              {k.catatan ? <p className="pt-1 text-[9px] italic text-muted-foreground">{k.catatan}</p> : null}
            </div>
            {k.tampilkanFoto ? (
              <div className="grid h-[112px] w-[84px] shrink-0 place-items-center rounded border border-dashed border-border text-[10px] text-muted-foreground">
                FOTO 3x4
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {msg ? <p className="mt-3 text-xs font-semibold text-primary">{msg}</p> : null}
      <button
        className={btnPrimary + " mt-4"}
        onClick={() => {
          update((s) => ({ ...s, pengaturan: { ...s.pengaturan, kartu: k } }));
          log("Memperbarui desain kartu perpustakaan", "Pengaturan");
          setMsg("Desain kartu perpustakaan tersimpan.");
        }}
      >
        <Save className="size-4" /> Simpan Kartu
      </button>
    </Panel>
  );
}
