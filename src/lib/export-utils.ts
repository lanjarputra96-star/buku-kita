// Utilitas export/import (Excel, PDF, Word) — semua dijalankan di browser.

export type Row = Record<string, string | number>;

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportExcel(rows: Row[], filename: string, sheetName = "Data") {
  const XLSX = await import("xlsx");
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" }) as ArrayBuffer;
  download(new Blob([out], { type: "application/octet-stream" }), filename);
}

export async function importExcel(file: File): Promise<Row[]> {
  const XLSX = await import("xlsx");
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const first = wb.SheetNames[0];
  if (!first) return [];
  const sheet = wb.Sheets[first];
  if (!sheet) return [];
  return XLSX.utils.sheet_to_json<Row>(sheet, { defval: "" });
}

export async function exportPdfTable(opts: {
  title: string;
  subtitle?: string;
  head: string[];
  body: (string | number)[][];
  filename: string;
  signatures?: { kepalaSekolah: string; nipKepala: string; penanggungJawab: string; nipPenanggung: string; kota: string };
}) {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(opts.title, 40, 46);
  if (opts.subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(opts.subtitle, 40, 63);
  }

  autoTable(doc, {
    startY: 80,
    head: [opts.head],
    body: opts.body,
    styles: { fontSize: 9, cellPadding: 5 },
    headStyles: { fillColor: [72, 110, 88], textColor: 255 },
    theme: "grid",
  });

  if (opts.signatures) {
    const s = opts.signatures;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const y = ((doc as any).lastAutoTable?.finalY ?? 120) + 50;
    const tanggal = new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`${s.kota}, ${tanggal}`, 330, y);
    doc.text("Mengetahui,", 40, y);
    doc.text("Kepala Sekolah", 40, y + 16);
    doc.text("Penanggung Jawab Perpustakaan", 330, y + 16);
    doc.setFont("helvetica", "bold");
    doc.text(s.kepalaSekolah, 40, y + 86);
    doc.text(s.penanggungJawab, 330, y + 86);
    doc.setFont("helvetica", "normal");
    doc.text(`NIP. ${s.nipKepala}`, 40, y + 100);
    doc.text(`NIP. ${s.nipPenanggung}`, 330, y + 100);
  }

  doc.save(opts.filename);
}

export function exportWordReport(opts: {
  title: string;
  subtitle?: string;
  sections: { heading: string; head: string[]; body: (string | number)[][] }[];
  filename: string;
  signatures: { kepalaSekolah: string; nipKepala: string; penanggungJawab: string; nipPenanggung: string; kota: string };
}) {
  const s = opts.signatures;
  const tanggal = new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
  const tables = opts.sections
    .map(
      (sec) => `
      <h3>${sec.heading}</h3>
      <table border="1" cellspacing="0" cellpadding="5" style="border-collapse:collapse;width:100%;font-size:11pt">
        <thead><tr>${sec.head.map((h) => `<th style="background:#486E58;color:#fff">${h}</th>`).join("")}</tr></thead>
        <tbody>${sec.body
          .map((r) => `<tr>${r.map((c) => `<td>${String(c)}</td>`).join("")}</tr>`)
          .join("")}</tbody>
      </table>`,
    )
    .join("");

  const html = `<html xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>${opts.title}</title></head>
  <body style="font-family:Arial,sans-serif">
    <h2 style="text-align:center;margin-bottom:0">${opts.title}</h2>
    <p style="text-align:center;margin-top:4px">${opts.subtitle ?? ""}</p>
    ${tables}
    <br/><br/>
    <table style="width:100%;font-size:11pt">
      <tr><td style="width:50%">Mengetahui,<br/>Kepala Sekolah</td><td>${s.kota}, ${tanggal}<br/>Penanggung Jawab Perpustakaan</td></tr>
      <tr><td style="height:80px"></td><td></td></tr>
      <tr><td><b>${s.kepalaSekolah}</b><br/>NIP. ${s.nipKepala}</td><td><b>${s.penanggungJawab}</b><br/>NIP. ${s.nipPenanggung}</td></tr>
    </table>
  </body></html>`;

  download(new Blob([html], { type: "application/msword" }), opts.filename);
}

export type KartuOpsi = {
  judul: string;
  subjudul: string;
  warnaHeader: string;
  logo: string;
  tampilkanFoto: boolean;
  tampilkanBarcode: boolean;
  tampilkanKelas: boolean;
  tampilkanPenanggung: boolean;
  catatan: string;
  kolom: number;
  baris: number;
};

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m || !m[1]) return [72, 110, 88];
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Kartu perpustakaan ukuran KTP (85.6 x 54 mm), beberapa kartu per halaman A4. */
export async function exportKartuPdf(opts: {
  sekolah: string;
  penanggungJawab?: string;
  siswa: { nisn: string; nama: string; kelas: string }[];
  filename: string;
  kartu?: Partial<KartuOpsi>;
}) {
  const { jsPDF } = await import("jspdf");
  const JsBarcode = (await import("jsbarcode")).default;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const k: KartuOpsi = {
    judul: "KARTU ANGGOTA PERPUSTAKAAN",
    subjudul: "",
    warnaHeader: "#486E58",
    logo: "",
    tampilkanFoto: true,
    tampilkanBarcode: true,
    tampilkanKelas: true,
    tampilkanPenanggung: true,
    catatan: "",
    kolom: 2,
    baris: 5,
    ...(opts.kartu ?? {}),
  };

  const CW = 85.6;
  const CH = 54;
  const cols = Math.max(1, Math.min(2, Math.round(k.kolom || 2)));
  const rows = Math.max(1, Math.min(5, Math.round(k.baris || 5)));
  const gap = 4;
  const totalW = cols * CW + (cols - 1) * gap;
  const totalH = rows * CH + (rows - 1) * gap;
  const offX = (210 - totalW) / 2;
  const offY = (297 - totalH) / 2;
  const [hr, hg, hb] = hexToRgb(k.warnaHeader);

  const barcode = (value: string) => {
    const canvas = document.createElement("canvas");
    try {
      JsBarcode(canvas, value || "0000", { format: "CODE128", displayValue: false, margin: 0, width: 2, height: 60 });
      return canvas.toDataURL("image/png");
    } catch {
      return null;
    }
  };

  opts.siswa.forEach((s, i) => {
    const idx = i % (cols * rows);
    if (i > 0 && idx === 0) doc.addPage();
    const x = offX + (idx % cols) * (CW + gap);
    const y = offY + Math.floor(idx / cols) * (CH + gap);

    // bingkai + header
    doc.setDrawColor(200);
    doc.roundedRect(x, y, CW, CH, 2, 2);
    doc.setFillColor(hr, hg, hb);
    doc.rect(x, y, CW, 12, "F");
    let textX = x + 4;
    if (k.logo) {
      try {
        doc.addImage(k.logo, x + 3, y + 2, 8, 8);
        textX = x + 13;
      } catch {
        /* logo tidak terbaca */
      }
    }
    doc.setTextColor(255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(opts.sekolah.toUpperCase().slice(0, 40), textX, y + 5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.2);
    doc.text(k.judul.toUpperCase().slice(0, 46), textX, y + 8.6);
    if (k.subjudul) doc.text(k.subjudul.slice(0, 46), textX, y + 11.2);

    // kotak foto 3x4 (kosong, untuk ditempel)
    const photoW = 21;
    const photoH = 28;
    const photoX = x + CW - photoW - 4;
    const photoY = y + 15;
    if (k.tampilkanFoto) {
      doc.setDrawColor(170);
      doc.rect(photoX, photoY, photoW, photoH);
      doc.setTextColor(150);
      doc.setFontSize(5.5);
      doc.text("FOTO 3x4", photoX + photoW / 2, photoY + photoH / 2, { align: "center" });
    }

    const infoRight = k.tampilkanFoto ? photoX - 2 : x + CW - 4;
    const maxChars = k.tampilkanFoto ? 24 : 40;

    doc.setTextColor(30);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.text("Nama", x + 4, y + 19);
    doc.text("NISN", x + 4, y + 25);
    if (k.tampilkanKelas) doc.text("Kelas", x + 4, y + 31);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text(`: ${s.nama}`.slice(0, maxChars), x + 15, y + 19);
    doc.text(`: ${s.nisn}`, x + 15, y + 25);
    if (k.tampilkanKelas) doc.text(`: ${s.kelas}`, x + 15, y + 31);

    if (k.tampilkanBarcode) {
      const img = barcode(s.nisn);
      if (img) doc.addImage(img, "PNG", x + 4, y + 34, Math.max(20, infoRight - (x + 4)), 9);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(5.5);
      doc.setTextColor(90);
      doc.text(s.nisn, x + 4, y + 46);
    }

    if (k.catatan) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(5);
      doc.setTextColor(120);
      doc.text(k.catatan.slice(0, 52), x + 4, y + 50.5);
    }
    if (k.tampilkanPenanggung && opts.penanggungJawab) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(5.5);
      doc.setTextColor(90);
      doc.text(opts.penanggungJawab.slice(0, 26), x + CW - 4, y + 50.5, { align: "right" });
    }
  });

  doc.save(opts.filename);
}

