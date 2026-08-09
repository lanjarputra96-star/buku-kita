import { createFileRoute } from "@tanstack/react-router";
import { Save } from "lucide-react";
import { PageHeader, Panel, Field } from "@/components/sibudi/ui-kit";

export const Route = createFileRoute("/ortu/profil")({
  component: ProfilOrtu,
});

const inputClass =
  "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";

function ProfilOrtu() {
  return (
    <>
      <PageHeader title="Profil" desc="Data ananda dan kontak wali murid." />

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <span className="grid size-20 place-items-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
              SN
            </span>
            <p className="mt-3 text-base font-bold">Siti Nurhaliza</p>
            <p className="text-xs text-muted-foreground">Kelas 3A • NISN 0081234567</p>
            <p className="mt-1 text-xs text-muted-foreground">Wali Kelas: Bambang Wijaya, S.Pd</p>
          </div>
        </Panel>

        <Panel title="Data Wali Murid" className="lg:col-span-2">
          <form className="grid gap-4 md:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
            <Field label="Nama Wali">
              <input defaultValue="Bpk. Ahmad Fauzi" className={inputClass} />
            </Field>
            <Field label="Hubungan">
              <select className={inputClass}>
                <option>Ayah</option>
                <option>Ibu</option>
                <option>Wali</option>
              </select>
            </Field>
            <Field label="No. WhatsApp">
              <input defaultValue="0812-3456-7890" className={inputClass} />
            </Field>
            <Field label="Email">
              <input defaultValue="ahmad.fauzi@email.com" className={inputClass} />
            </Field>
            <Field label="Alamat">
              <textarea rows={3} defaultValue="Jl. Palapa No. 12, Bandar Lampung" className={inputClass} />
            </Field>
            <Field label="Kata Sandi Baru">
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
