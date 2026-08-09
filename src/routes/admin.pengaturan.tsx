import { createFileRoute } from "@tanstack/react-router";
import { Save } from "lucide-react";
import { PageHeader, Panel, Field } from "@/components/sibudi/ui-kit";
import { SCHOOL } from "@/lib/sibudi-data";

export const Route = createFileRoute("/admin/pengaturan")({
  component: Pengaturan,
});

const inputClass =
  "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";

function Toggle({ label, desc, defaultChecked }: { label: string; desc: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-2xl border border-border p-4">
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{desc}</span>
      </span>
      <input type="checkbox" defaultChecked={defaultChecked} className="mt-1 size-5 accent-[var(--primary)]" />
    </label>
  );
}

function Pengaturan() {
  return (
    <>
      <PageHeader title="Pengaturan" desc="Konfigurasi identitas sekolah, aturan peminjaman, dan notifikasi." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Identitas Sekolah">
          <div className="space-y-4">
            <Field label="Nama Sekolah">
              <input defaultValue={SCHOOL.name} className={inputClass} />
            </Field>
            <Field label="Kota">
              <input defaultValue={SCHOOL.city} className={inputClass} />
            </Field>
            <Field label="Tahun Ajaran">
              <input defaultValue="2026/2027" className={inputClass} />
            </Field>
            <Field label="Kepala Sekolah">
              <input defaultValue="Dra. Sri Wahyuni, M.Pd" className={inputClass} />
            </Field>
          </div>
        </Panel>

        <Panel title="Aturan Peminjaman">
          <div className="space-y-4">
            <Field label="Durasi Peminjaman (hari)">
              <input type="number" defaultValue={180} className={inputClass} />
            </Field>
            <Field label="Maksimal Buku per Siswa">
              <input type="number" defaultValue={8} className={inputClass} />
            </Field>
            <Field label="Denda Keterlambatan per Hari (Rp)">
              <input type="number" defaultValue={0} className={inputClass} />
            </Field>
          </div>
        </Panel>

        <Panel title="Notifikasi" className="lg:col-span-2">
          <div className="grid gap-3 md:grid-cols-2">
            <Toggle label="Pengingat WhatsApp" desc="Kirim pengingat jatuh tempo ke wali murid." defaultChecked />
            <Toggle label="Notifikasi Distribusi" desc="Beritahu orang tua saat buku baru diserahkan." defaultChecked />
            <Toggle label="Ringkasan Mingguan Guru" desc="Kirim rekap buku belum kembali tiap Senin." />
            <Toggle label="Mode Verifikasi Ganda" desc="Pengembalian butuh persetujuan admin." defaultChecked />
          </div>
          <button className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">
            <Save className="size-4" /> Simpan Pengaturan
          </button>
        </Panel>
      </div>
    </>
  );
}
