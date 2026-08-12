import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Printer } from "lucide-react";
import { PageHeader, Panel, DataTable, Td, Badge, statusTone } from "@/components/sibudi/ui-kit";
import { useSibudi, fmtTanggal, type TransaksiItem } from "@/lib/sibudi-store";

export const Route = createFileRoute("/ortu/peminjaman")({
  component: PeminjamanOrtu,
});

const btnGhost =
  "inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold hover:bg-muted disabled:opacity-40";
const btnPrimary =
  "inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-40";

function cetakSurat(items: TransaksiItem[], nama: string, kelas: string, wali: string, sekolah: string, kota: string) {
  const baris = items
    .map(
      (d, i) =>
        `<tr><td>${i + 1}</td><td>${d.bukuKode}</td><td>${d.buku}</td><td style="text-align:center">${d.jumlah}</td><td>${fmtTanggal(d.tanggal)}</td></tr>`,
    )
    .join("");
  const tgl = new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Surat Peminjaman Buku</title>
  <style>
    body{font-family:Georgia,serif;color:#1c1c1c;padding:40px;line-height:1.6;font-size:13px}
    h1{text-align:center;font-size:17px;margin:0 0 4px;text-transform:uppercase}
    .sub{text-align:center;margin-bottom:22px;font-size:12px}
    table{width:100%;border-collapse:collapse;margin:14px 0}
    th,td{border:1px solid #444;padding:6px 8px;font-size:12px}
    ol{padding-left:18px}
    .ttd{display:flex;justify-content:space-between;margin-top:40px}
    .ttd div{width:45%;text-align:center}
    .garis{margin-top:70px;border-bottom:1px solid #333}
  </style></head><body>
  <h1>Surat Pernyataan Peminjaman Buku</h1>
  <div class="sub">${sekolah} — ${kota}</div>
  <p>Yang bertanda tangan di bawah ini:</p>
  <p><b>Nama Orang Tua/Wali</b> : ${wali || "-"}<br/>
  <b>Nama Siswa</b> : ${nama}<br/>
  <b>Kelas</b> : ${kelas}</p>
  <p>Menyatakan telah <b>menerima</b> buku pinjaman dari sekolah dengan rincian berikut:</p>
  <table><thead><tr><th>No</th><th>Kode</th><th>Judul Buku</th><th>Jumlah</th><th>Tanggal Terima</th></tr></thead>
  <tbody>${baris}</tbody></table>
  <p>Dengan ini saya menyatakan bersedia:</p>
  <ol>
    <li>Menjaga dan merawat buku pinjaman selama masa peminjaman.</li>
    <li>Tidak mencoret, merobek, atau merusak isi maupun sampul buku.</li>
    <li>Menyampul buku agar tetap dalam kondisi baik.</li>
    <li>Mengembalikan buku tepat waktu sesuai jadwal yang ditentukan sekolah.</li>
    <li>Mengganti buku dengan judul dan kondisi yang setara apabila buku hilang atau rusak berat.</li>
    <li>Bertanggung jawab penuh atas buku selama berada dalam penguasaan siswa.</li>
  </ol>
  <p>Demikian pernyataan ini dibuat dengan sebenarnya tanpa paksaan dari pihak mana pun.</p>
  <div class="ttd">
    <div><p>${kota}, ${tgl}</p><p>Orang Tua/Wali,</p><div class="garis"></div><p>${wali || "(..............................)"}</p></div>
    <div><p>&nbsp;</p><p>Siswa,</p><div class="garis"></div><p>${nama}</p></div>
  </div>
  <script>window.onload=()=>window.print()</script>
  </body></html>`;
  const w = window.open("", "_blank");
  if (w) {
    w.document.write(html);
    w.document.close();
  }
}

function PeminjamanOrtu() {
  const { state, update, siswaAktif } = useSibudi();
  const [pilih, setPilih] = useState<string[]>([]);
  const [info, setInfo] = useState("");

  const rows = useMemo(
    () => state.distribusi.filter((d) => d.tipe === "Siswa" && d.penerima === (siswaAktif?.nama ?? "")),
    [state.distribusi, siswaAktif],
  );
  const belumTerima = rows.filter((d) => !d.diterima);
  const sudahTerima = rows.filter((d) => d.diterima);

  const toggle = (id: string) => setPilih((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  function terima() {
    update((s) => ({
      ...s,
      distribusi: s.distribusi.map((d) => (pilih.includes(d.id) ? { ...d, diterima: true } : d)),
    }));
    setInfo(`${pilih.length} buku ditandai diterima. Silakan cetak surat peminjaman.`);
    setPilih([]);
  }

  return (
    <>
      <PageHeader
        title="Peminjaman Buku"
        desc="Buku yang didistribusikan wali kelas untuk ananda. Ceklis lalu tekan Terima."
        actions={
          <button
            className={btnGhost}
            disabled={sudahTerima.length === 0}
            onClick={() =>
              cetakSurat(
                sudahTerima,
                siswaAktif?.nama ?? "-",
                siswaAktif?.kelas ?? "-",
                siswaAktif?.wali ?? "",
                state.pengaturan.namaSekolah,
                "Bandar Lampung",
              )
            }
          >
            <Printer className="size-4" /> Cetak Surat Peminjaman
          </button>
        }
      />

      {info ? <p className="rounded-xl bg-success/10 px-4 py-3 text-xs font-semibold text-success">{info}</p> : null}

      <Panel title="Menunggu Konfirmasi Penerimaan">
        {belumTerima.length === 0 ? (
          <p className="text-xs text-muted-foreground">Tidak ada buku baru yang perlu dikonfirmasi.</p>
        ) : (
          <>
            <DataTable head={["", "ID", "Tanggal", "Buku", "Jumlah", "Status"]}>
              {belumTerima.map((d) => (
                <tr key={d.id}>
                  <Td>
                    <input
                      type="checkbox"
                      checked={pilih.includes(d.id)}
                      onChange={() => toggle(d.id)}
                      className="size-4 accent-[hsl(var(--primary))]"
                    />
                  </Td>
                  <Td className="font-semibold">{d.id}</Td>
                  <Td className="text-muted-foreground">{fmtTanggal(d.tanggal)}</Td>
                  <Td>{d.buku}</Td>
                  <Td>{d.jumlah}</Td>
                  <Td>
                    <Badge tone={statusTone(d.status)}>{d.status}</Badge>
                  </Td>
                </tr>
              ))}
            </DataTable>
            <div className="mt-4">
              <button className={btnPrimary} disabled={pilih.length === 0} onClick={terima}>
                <CheckCircle2 className="size-4" /> Terima Buku ({pilih.length})
              </button>
            </div>
          </>
        )}
      </Panel>

      <Panel title="Buku yang Sudah Diterima">
        <DataTable head={["ID", "Tanggal", "Buku", "Jumlah", "Status"]}>
          {sudahTerima.map((d) => (
            <tr key={d.id}>
              <Td className="font-semibold">{d.id}</Td>
              <Td className="text-muted-foreground">{fmtTanggal(d.tanggal)}</Td>
              <Td>{d.buku}</Td>
              <Td>{d.jumlah}</Td>
              <Td>
                <Badge tone={statusTone(d.status)}>{d.status}</Badge>
              </Td>
            </tr>
          ))}
        </DataTable>
      </Panel>
    </>
  );
}
