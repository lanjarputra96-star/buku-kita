import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Bell } from "lucide-react";
import { PageHeader, Panel, DataTable, Td, Badge, StatCard } from "@/components/sibudi/ui-kit";
import { useSibudi, fmtTanggal, hariTelat, type TransaksiItem } from "@/lib/sibudi-store";

export const Route = createFileRoute("/guru/belum-kembali")({
  component: BelumKembali,
});

function BelumKembali() {
  const { state, guruAktif, kirimNotif, kirimWa } = useSibudi();
  const [viaWeb, setViaWeb] = useState(true);
  const [viaWa, setViaWa] = useState(true);
  const [info, setInfo] = useState("");

  const kelas = guruAktif?.kelas ?? "";
  const rows = useMemo(
    () =>
      state.distribusi.filter(
        (d) => d.status === "Dipinjam" && d.tipe === "Siswa" && (!kelas || d.kelas === kelas),
      ),
    [state.distribusi, kelas],
  );
  const telat = rows.filter((d) => hariTelat(d.jatuhTempo) > 0).length;

  function ingatkan(items: TransaksiItem[]) {
    if (!viaWeb && !viaWa) return setInfo("Pilih minimal satu kanal pengingat.");
    if (items.length === 0) return setInfo("Tidak ada data untuk diingatkan.");
    const kanal = [viaWeb ? "Web" : null, viaWa ? "Chatbot WA" : null].filter(Boolean).join(" + ");
    items.forEach((d) => {
      const siswa = state.siswa.find((s) => s.nisn === d.nisn || s.nama === d.penerima);
      const lt = hariTelat(d.jatuhTempo);
      const pesan = `Pengingat: buku "${d.buku}" atas nama ${d.penerima} (Kelas ${d.kelas}) jatuh tempo ${d.jatuhTempo ? fmtTanggal(d.jatuhTempo) : "-"}${lt > 0 ? ` dan telat ${lt} hari` : ""}. Mohon segera dikembalikan. — ${guruAktif?.nama ?? "Wali Kelas"}`;
      if (viaWeb) {
        kirimNotif({
          nisn: siswa?.nisn ?? d.penerima,
          judul: "Buku belum dikembalikan",
          isi: pesan,
          tipe: lt > 0 ? "warning" : "info",
          kanal,
        });
      }
      if (viaWa && siswa?.wa) kirimWa(siswa.wa, siswa.nama, pesan);
    });
    setInfo(`Pengingat terkirim untuk ${items.length} pinjaman via ${kanal}.`);
  }

  return (
    <>
      <PageHeader
        title="Daftar Buku Belum Kembali"
        desc="Pantau buku yang masih dipinjam siswa dan kirim pengingat."
        actions={
          <button
            onClick={() => ingatkan(rows)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            <MessageCircle className="size-4" /> Ingatkan Semua
          </button>
        }
      />

      {info ? <p className="rounded-xl bg-success/10 px-4 py-3 text-xs font-semibold text-success">{info}</p> : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Belum Kembali" value={rows.length} tone="warning" />
        <StatCard label="Melewati Tempo" value={telat} tone="danger" />
        <StatCard label="Masih Dalam Tempo" value={rows.length - telat} tone="success" />
      </div>

      <Panel>
        <div className="mb-4 flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-xs font-semibold">
            <input type="checkbox" checked={viaWeb} onChange={(e) => setViaWeb(e.target.checked)} className="size-4" />
            <Bell className="size-4" /> Kirim ke dashboard orang tua
          </label>
          <label className="flex items-center gap-2 text-xs font-semibold">
            <input type="checkbox" checked={viaWa} onChange={(e) => setViaWa(e.target.checked)} className="size-4" />
            <MessageCircle className="size-4" /> Kirim lewat Chatbot WhatsApp sekolah
          </label>
        </div>

        {rows.length === 0 ? (
          <p className="text-xs text-muted-foreground">Belum ada buku yang berstatus dipinjam.</p>
        ) : (
          <DataTable head={["Siswa", "Kelas", "Buku", "Jatuh Tempo", "Status", "Aksi"]}>
            {rows.map((d) => {
              const lt = hariTelat(d.jatuhTempo);
              return (
                <tr key={d.id}>
                  <Td>{d.penerima}</Td>
                  <Td>{d.kelas}</Td>
                  <Td>{d.buku}</Td>
                  <Td className="text-muted-foreground">{d.jatuhTempo ? fmtTanggal(d.jatuhTempo) : "-"}</Td>
                  <Td>
                    <Badge tone={lt > 0 ? "danger" : "success"}>{lt > 0 ? `Telat ${lt} hari` : "Tepat waktu"}</Badge>
                  </Td>
                  <Td>
                    <button
                      onClick={() => ingatkan([d])}
                      className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-[11px] font-semibold text-primary hover:bg-primary/20"
                    >
                      <MessageCircle className="size-3.5" /> Ingatkan
                    </button>
                  </Td>
                </tr>
              );
            })}
          </DataTable>
        )}
      </Panel>
    </>
  );
}
