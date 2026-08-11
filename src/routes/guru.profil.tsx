import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Save, CheckCircle2, MessageCircle, AlertTriangle } from "lucide-react";
import { PageHeader, Panel, Field } from "@/components/sibudi/ui-kit";
import { useSibudi, waNumber } from "@/lib/sibudi-store";

export const Route = createFileRoute("/guru/profil")({
  component: ProfilGuru,
});

const inputClass =
  "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";

function ProfilGuru() {
  const { guruAktif, update } = useSibudi();
  const [nama, setNama] = useState("");
  const [nip, setNip] = useState("");
  const [email, setEmail] = useState("");
  const [wa, setWa] = useState("");
  const [pass1, setPass1] = useState("");
  const [pass2, setPass2] = useState("");
  const [info, setInfo] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!guruAktif) return;
    setNama(guruAktif.nama);
    setNip(guruAktif.nip);
    setEmail(guruAktif.email);
    setWa(guruAktif.wa ?? "");
  }, [guruAktif]);

  if (!guruAktif) return null;

  const initials = guruAktif.nama.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  function patch(fields: Partial<typeof guruAktif>) {
    update((s) => ({
      ...s,
      guru: s.guru.map((g) => (g.username === guruAktif!.username ? { ...g, ...fields } : g)),
    }));
  }

  function simpan() {
    setErr("");
    if (pass1 || pass2) {
      if (pass1.length < 6) return setErr("Password baru minimal 6 karakter.");
      if (pass1 !== pass2) return setErr("Konfirmasi password tidak cocok.");
    }
    patch({ nama, nip, email, wa, ...(pass1 ? { password: pass1 } : {}) });
    setPass1("");
    setPass2("");
    setInfo(pass1 ? "Profil & password berhasil diperbarui." : "Profil berhasil diperbarui.");
  }

  function sinkronWa() {
    if (!waNumber(wa)) {
      setErr("Isi nomor WhatsApp yang valid terlebih dahulu.");
      return;
    }
    setErr("");
    patch({ wa, waSynced: true });
    setInfo(`WhatsApp ${waNumber(wa)} tersinkron. Anda dapat mengirim pengingat ke wali murid.`);
  }

  return (
    <>
      <PageHeader title="Profil Guru" desc="Perbarui data diri, password, dan sinkronisasi WhatsApp." />

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <span className="grid size-20 place-items-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
              {initials}
            </span>
            <p className="mt-3 text-base font-bold">{guruAktif.nama}</p>
            <p className="text-xs text-muted-foreground">Wali Kelas {guruAktif.kelas}</p>
            <p className="mt-1 text-xs text-muted-foreground">NIP. {guruAktif.nip}</p>
            <p className="mt-1 text-xs text-muted-foreground">Username: {guruAktif.username}</p>

            {guruAktif.waSynced ? (
              <div className="mt-4 flex w-full items-center gap-2 rounded-2xl border border-success/30 bg-success/10 px-3 py-2.5 text-xs font-semibold text-success">
                <CheckCircle2 className="size-4" /> WhatsApp terhubung ({waNumber(guruAktif.wa ?? "")})
              </div>
            ) : (
              <div className="mt-4 flex w-full items-center gap-2 rounded-2xl border border-warning/30 bg-warning/10 px-3 py-2.5 text-xs font-semibold text-warning">
                <AlertTriangle className="size-4" /> WhatsApp belum disinkronkan
              </div>
            )}

            <button
              onClick={sinkronWa}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold hover:bg-muted"
            >
              <MessageCircle className="size-4" /> {guruAktif.waSynced ? "Sinkronkan Ulang" : "Sinkronkan WhatsApp"}
            </button>
            {guruAktif.waSynced ? (
              <button
                onClick={() => {
                  patch({ waSynced: false });
                  setInfo("WhatsApp diputuskan.");
                }}
                className="mt-2 text-[11px] font-semibold text-destructive hover:underline"
              >
                Putuskan koneksi WhatsApp
              </button>
            ) : null}
          </div>
        </Panel>

        <Panel title="Data Diri" className="lg:col-span-2">
          <form
            className="grid gap-4 md:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              simpan();
            }}
          >
            <Field label="Nama Lengkap">
              <input value={nama} onChange={(e) => setNama(e.target.value)} className={inputClass} />
            </Field>
            <Field label="NIP">
              <input value={nip} onChange={(e) => setNip(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Email">
              <input value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
            </Field>
            <Field label="No. WhatsApp">
              <input value={wa} onChange={(e) => setWa(e.target.value)} placeholder="0812-xxxx-xxxx" className={inputClass} />
            </Field>
            <Field label="Kata Sandi Baru">
              <input type="password" value={pass1} onChange={(e) => setPass1(e.target.value)} placeholder="••••••••" className={inputClass} />
            </Field>
            <Field label="Konfirmasi Kata Sandi">
              <input type="password" value={pass2} onChange={(e) => setPass2(e.target.value)} placeholder="••••••••" className={inputClass} />
            </Field>

            {err ? <p className="md:col-span-2 text-xs font-semibold text-destructive">{err}</p> : null}
            {info ? (
              <p className="md:col-span-2 rounded-xl bg-success/10 px-4 py-3 text-xs font-semibold text-success">{info}</p>
            ) : null}

            <div className="md:col-span-2">
              <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">
                <Save className="size-4" /> Simpan Perubahan
              </button>
            </div>
          </form>
        </Panel>
      </div>
    </>
  );
}
