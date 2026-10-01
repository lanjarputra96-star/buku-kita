import { useState } from "react";
import { Users, LogIn, ShieldCheck } from "lucide-react";
import { useSibudi } from "@/lib/sibudi-store";
import { SCHOOL } from "@/lib/sibudi-data";
import { PasswordField } from "@/components/sibudi/password-input";

const input =
  "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";
const btn =
  "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover";

export function OrtuLoginGate({ children }: { children: React.ReactNode }) {
  const { state, ready, loginOrtu, siswaAktif, setupOrtu } = useSibudi();
  const [nisn, setNisn] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [wa, setWa] = useState("");
  const [errSetup, setErrSetup] = useState("");

  if (!ready) return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Memuat…</div>;

  if (state.ortuLoggedIn && siswaAktif) {
    if (siswaAktif.setupDone) return <>{children}</>;
    return (
      <div className="grid min-h-screen place-items-center bg-muted/40 px-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (p1.length < 6) return setErrSetup("Password baru minimal 6 karakter.");
            if (p1 !== p2) return setErrSetup("Konfirmasi password tidak sama.");
            if (wa.replace(/\D/g, "").length < 9) return setErrSetup("Nomor WhatsApp tidak valid.");
            setErrSetup("");
            setupOrtu(p1, wa);
          }}
          className="card-surface w-full max-w-sm space-y-4 p-6"
        >
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-primary text-primary-foreground">
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <h1 className="text-lg font-bold leading-tight">Lengkapi Akun</h1>
              <p className="text-xs text-muted-foreground">
                {siswaAktif.nama} • Kelas {siswaAktif.kelas}
              </p>
            </div>
          </div>
          <p className="rounded-xl bg-accent px-3 py-2.5 text-[11px] text-accent-foreground">
            Login pertama: buat password baru dan masukkan nomor WhatsApp aktif untuk menerima pengingat sekolah.
          </p>

          <PasswordField label="Password Baru" value={p1} onChange={setP1} autoComplete="new-password" />
          <PasswordField label="Ulangi Password Baru" value={p2} onChange={setP2} autoComplete="new-password" />

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-muted-foreground">No. WhatsApp Orang Tua</span>
            <input value={wa} onChange={(e) => setWa(e.target.value)} placeholder="08xxxxxxxxxx" className={input} />
          </label>

          {errSetup ? <p className="text-xs font-semibold text-destructive">{errSetup}</p> : null}
          <button className={btn}>Simpan & Masuk</button>
        </form>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen place-items-center bg-muted/40 px-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!loginOrtu(nisn, pass)) setErr("NISN atau password salah.");
          else setErr("");
        }}
        className="card-surface w-full max-w-sm space-y-4 p-6"
      >
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <Users className="size-5" />
          </span>
          <div>
            <h1 className="text-lg font-bold leading-tight">Login Orangtua/Siswa {SCHOOL.app}</h1>
            <p className="text-xs text-muted-foreground">{SCHOOL.name}</p>
          </div>
        </div>

        <label className="block space-y-1.5">
          <span className="text-xs font-semibold text-muted-foreground">Username (NISN Ananda)</span>
          <input
            value={nisn}
            onChange={(e) => setNisn(e.target.value)}
            autoComplete="username"
            placeholder="misal: 0081234567"
            className={input}
          />
        </label>
        <PasswordField value={pass} onChange={setPass} />

        {err ? <p className="text-xs font-semibold text-destructive">{err}</p> : null}

        <button className={btn}>
          <LogIn className="size-4" /> Masuk
        </button>
        <p className="text-center text-[11px] text-muted-foreground">
          Password awal: <b>ortu123</b> (dari wali kelas) — wajib diganti saat login pertama.
        </p>
      </form>
    </div>
  );
}
