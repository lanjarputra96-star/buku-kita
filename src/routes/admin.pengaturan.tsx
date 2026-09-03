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
