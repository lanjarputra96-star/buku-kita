import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Bell } from "lucide-react";
import { PageHeader, Panel, DataTable, Td, Badge, StatCard } from "@/components/sibudi/ui-kit";
import { belumKembaliList } from "@/lib/sibudi-data";
import { useSibudi, waLink } from "@/lib/sibudi-store";

export const Route = createFileRoute("/guru/belum-kembali")({
  component: BelumKembali,
});

type Item = (typeof belumKembaliList)[number];

function BelumKembali() {
  const { state, guruAktif, kirimNotif } = useSibudi();
  const [viaWeb, setViaWeb] = useState(true);
  const [viaWa, setViaWa] = useState(true);
  const [info, setInfo] = useState("");

  const telat = belumKembaliList.filter((b) => b.telat > 0).length;

  function ingatkan(items: Item[]) {
    if (!viaWeb && !viaWa) {
      setInfo("Pilih minimal satu kanal pengingat.");
      return;
    }
    if (viaWa && !guruAktif?.waSynced) {
      setInfo("Sinkronkan nomor WhatsApp Anda di menu Profil terlebih dahulu.");
      return;
    }
    const kanal = [viaWeb ? "Web" : null, viaWa ? "WhatsApp" : null].filter(Boolean).join(" + ");
    items.forEach((b) => {
      const siswa = state.siswa.find((s) => s.nama === b.siswa);
      const pesan = `Pengingat: buku "${b.buku}" atas nama ${b.siswa} (Kelas ${b.kelas}) jatuh tempo ${b.jatuhTempo}${b.telat > 0 ? ` dan telat ${b.telat} hari` : ""}. Mohon segera dikembalikan. — ${guruAktif?.nama ?? "Wali Kelas"}`;
      if (viaWeb) {
        kirimNotif({
          nisn: siswa?.nisn ?? b.siswa,
          judul: "Buku belum dikembalikan",
          isi: pesan,
          tipe: b.telat > 0 ? "warning" : "info",
          kanal,
        });
      }
      if (viaWa && siswa?.wa) window.open(waLink(siswa.wa, pesan), "_blank", "noopener");
    });
    setInfo(`Pengingat terkirim untuk ${items.length} siswa via ${kanal}.`);
  }

  return (
    <>
      <PageHeader
        title="Daftar Buku Belum Kembali"
        desc="Pantau buku yang masih dipinjam siswa dan kirim pengingat."
        actions={
          <button
            onClick={() => ingatkan(belumKembaliList)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            <MessageCircle className="size-4" /> Ingatkan Semua
          </button>
        }
      />

      {info ? <p className="rounded-xl bg-success/10 px-4 py-3 text-xs font-semibold text-success">{info}</p> : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Belum Kembali" value={belumKembaliList.length} tone="warning" />
        <StatCard label="Melewati Tempo" value={telat} tone="danger" />
        <StatCard label="Masih Dalam Tempo" value={belumKembaliList.length - telat} tone="success" />
      </div>

      <Panel>
        <div className="mb-4 flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-xs font-semibold">
            <input type="checkbox" checked={viaWeb} onChange={(e) => setViaWeb(e.target.checked)} className="size-4 accent-[hsl(var(--primary))]" />
            <Bell className="size-4" /> Kirim ke dashboard orang tua
          </label>
          <label className="flex items-center gap-2 text-xs font-semibold">
            <input type="checkbox" checked={viaWa} onChange={(e) => setViaWa(e.target.checked)} className="size-4 accent-[hsl(var(--primary))]" />
            <MessageCircle className="size-4" /> Kirim ke WhatsApp
          </label>
        </div>

        <DataTable head={["Siswa", "Kelas", "Buku", "Jatuh Tempo", "Status", "Aksi"]}>
          {belumKembaliList.map((b) => (
            <tr key={b.siswa + b.buku}>
              <Td>{b.siswa}</Td>
              <Td>{b.kelas}</Td>
              <Td>{b.buku}</Td>
              <Td className="text-muted-foreground">{b.jatuhTempo}</Td>
              <Td>
                <Badge tone={b.telat > 0 ? "danger" : "success"}>
                  {b.telat > 0 ? `Telat ${b.telat} hari` : "Tepat waktu"}
                </Badge>
              </Td>
              <Td>
                <button
                  onClick={() => ingatkan([b])}
                  className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-[11px] font-semibold text-primary hover:bg-primary/20"
                >
                  <MessageCircle className="size-3.5" /> Ingatkan
                </button>
              </Td>
            </tr>
          ))}
        </DataTable>
      </Panel>
    </>
  );
}
