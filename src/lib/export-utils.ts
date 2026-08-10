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
