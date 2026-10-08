import { useState } from "react";
import { Upload, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel, Field } from "@/components/sibudi/ui-kit";
import { BrandLogo } from "@/components/sibudi/brand-logo";
import { useSibudi } from "@/lib/sibudi-store";
import { supabase } from "@/integrations/supabase/client";

export function LogoSettings() {
  const { state, update } = useSibudi();
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [key, setKey] = useState(0);

  async function save() {
    if (!file) return setMsg("Pilih gambar logo terlebih dahulu.");
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) return setMsg("Gunakan gambar PNG, JPG, atau WEBP.");
    if (file.size > 5 * 1024 * 1024) return setMsg("Ukuran logo maksimal 5 MB.");
    setBusy(true);
    setMsg("");
    try {
      const bitmap = await createImageBitmap(file);
      bitmap.close();
      const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      const path = `branding/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("ebooks").upload(path, file, { contentType: file.type });
      if (error) throw new Error("Logo gagal diunggah. Silakan coba lagi.");
      update((s) => ({ ...s, pengaturan: { ...s.pengaturan, logoPath: path } }));
      setFile(null);
      setKey((k) => k + 1);
      setMsg("Logo SIBUDI berhasil disimpan.");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Gambar tidak dapat diunggah.");
    } finally { setBusy(false); }
  }

  return (
    <Panel title="Logo SIBUDI">
      <div className="flex flex-wrap items-center gap-4">
        <span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-primary text-primary-foreground"><BrandLogo className="size-8" /></span>
        <div className="min-w-0 flex-1">
          <Field label="Gambar Logo (PNG, JPG, WEBP; maksimal 5 MB)">
            <input aria-label="Gambar Logo SIBUDI" key={key} type="file" accept="image/png,image/jpeg,image/webp" disabled={busy} onChange={(e) => { setFile(e.target.files?.[0] ?? null); setMsg(""); }} className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm" />
          </Field>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button disabled={busy} onClick={() => void save()}><Upload />{busy ? "Mengunggah…" : "Simpan Logo"}</Button>
        {state.pengaturan.logoPath ? <Button variant="outline" disabled={busy} onClick={() => {
          update((s) => ({ ...s, pengaturan: { ...s.pengaturan, logoPath: "" } }));
          setMsg("Logo bawaan SIBUDI digunakan kembali.");
        }}><RotateCcw />Logo Bawaan</Button> : null}
      </div>
      {msg ? <p role="status" className="mt-3 text-xs text-muted-foreground">{msg}</p> : null}
    </Panel>
  );
}