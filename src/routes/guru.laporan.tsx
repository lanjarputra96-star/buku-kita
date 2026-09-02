import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Printer } from "lucide-react";
import { PageHeader, Panel, DataTable, Td, Field } from "@/components/sibudi/ui-kit";
import { SCHOOL } from "@/lib/sibudi-data";
import { useSibudi, fmtTanggal } from "@/lib/sibudi-store";

export const Route = createFileRoute("/guru/laporan")({
  component: LaporanGuru,
});

const inputClass =
  "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";

function LaporanGuru() {
  const { state, guruAktif } = useSibudi();
  const kelas = guruAktif?.kelas ?? "";
  const [dari, setDari] = useState("");
  const [sampai, setSampai] = useState("");

  const rows = useMemo(
    () =>
      state.distribusi
        .filter((d) => d.tipe === "Siswa" && (!kelas || d.kelas === kelas))
        .filter((d) => (!dari || d.tanggal >= dari) && (!sampai || d.tanggal <= sampai)),
    [state.distribusi, kelas, dari, sampai],
  );

  const hariIni = new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <>
      <PageHeader
        title="Laporan Rekapitulasi Peminjaman & Pengembalian"
        desc={`Rekap Kelas ${kelas || "-"} — siap dicetak dan ditandatangani.`}
        actions={
          <button
            onClick={() => window.print()}
            className="no-print inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            <Printer className="size-4" /> Cetak
          </button>
        }
      />

      <Panel className="no-print">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Dari Tanggal">
            <input type="date" className={inputClass} value={dari} onChange={(e) => setDari(e.target.value)} />
          </Field>
          <Field label="Sampai Tanggal">
            <input type="date" className={inputClass} value={sampai} onChange={(e) => setSampai(e.target.value)} />
          </Field>
        </div>
      </Panel>

      <Panel id="print-area">
        <div className="border-b border-border pb-4 text-center">
          <p className="text-xs font-semibold uppercase">Pemerintah Kota {SCHOOL.city}</p>
          <p className="text-sm font-bold uppercase">Dinas Pendidikan dan Kebudayaan</p>
          <p className="text-base font-extrabold uppercase">{state.pengaturan.namaSekolah || SCHOOL.name}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Laporan Peminjaman Buku Kelas {kelas || "-"}
            {dari || sampai ? ` — ${dari ? fmtTanggal(dari) : "awal"} s/d ${sampai ? fmtTanggal(sampai) : "sekarang"}` : ""}
          </p>
        </div>

        <div className="mt-4">
          {rows.length === 0 ? (
            <p className="text-xs text-muted-foreground">Belum ada data pada rentang ini.</p>
          ) : (
            <DataTable head={["No", "Tanggal", "Siswa", "Buku", "Jumlah", "Status"]}>
              {rows.map((d, i) => (
                <tr key={d.id}>
                  <Td>{i + 1}</Td>
                  <Td>{fmtTanggal(d.tanggal)}</Td>
                  <Td>{d.penerima}</Td>
                  <Td>{d.buku}</Td>
                  <Td>{d.jumlah}</Td>
                  <Td>{d.status}</Td>
                </tr>
              ))}
            </DataTable>
          )}
        </div>

        <div className="mt-10 flex justify-end">
          <div className="text-center text-xs">
            <p>
              {SCHOOL.city}, {hariIni}
            </p>
            <p className="mt-1">Wali Kelas {kelas || "-"}</p>
            <p className="mt-16 font-semibold">{guruAktif?.nama ?? "-"}</p>
            <p>NIP. {guruAktif?.nip ?? "-"}</p>
          </div>
        </div>
      </Panel>
    </>
  );
}
