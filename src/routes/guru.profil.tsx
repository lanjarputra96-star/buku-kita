import { createFileRoute } from "@tanstack/react-router";
import { Save, CheckCircle2 } from "lucide-react";
import { PageHeader, Panel, Field } from "@/components/sibudi/ui-kit";

export const Route = createFileRoute("/guru/profil")({
  component: ProfilGuru,
});

const inputClass =
  "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";

function ProfilGuru() {
  return (
    <>
      <PageHeader title="Profil Guru" desc="Perbarui data diri dan pengaturan akun Anda." />

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <span className="grid size-20 place-items-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
              SA
            </span>
            <p className="mt-3 text-base font-bold">Siti Aminah, S.Pd</p>
            <p className="text-xs text-muted-foreground">Wali Kelas 1A</p>
            <p className="mt-1 text-xs text-muted-foreground">NIP. 19780512 200604 2 001</p>
            <div className="mt-4 flex w-full items-center gap-2 rounded-2xl border border-success/30 bg-success/10 px-3 py-2.5 text-xs font-semibold text-success">
              <CheckCircle2 className="size-4" /> WhatsApp terhubung
            </div>
          </div>
        </Panel>

        <Panel title="Data Diri" className="lg:col-span-2">
          <form className="grid gap-4 md:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
            <Field label="Nama Lengkap">
              <input defaultValue="Siti Aminah, S.Pd" className={inputClass} />
            </Field>
            <Field label="NIP">
              <input defaultValue="19780512 200604 2 001" className={inputClass} />
            </Field>
            <Field label="Email">
              <input defaultValue="siti@sdn1palapa.sch.id" className={inputClass} />
            </Field>
            <Field label="No. WhatsApp">
              <input defaultValue="0812-9999-1234" className={inputClass} />
            </Field>
            <Field label="Kata Sandi Baru">
              <input type="password" placeholder="••••••••" className={inputClass} />
            </Field>
            <Field label="Konfirmasi Kata Sandi">
              <input type="password" placeholder="••••••••" className={inputClass} />
            </Field>
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
