export const SCHOOL = {
  name: "SD Negeri 1 Palapa",
  city: "Bandar Lampung",
  app: "SIBUDI",
  tagline: "Sistem Informasi Buku Digital Sekolah",
};

export type Buku = {
  kode: string;
  judul: string;
  mapel: string;
  kelas: string;
  penerbit: string;
  stok: number;
  dipinjam: number;
  kondisi: "Baik" | "Rusak Ringan" | "Rusak Berat";
};

export const bukuList: Buku[] = [
  { kode: "BK-001", judul: "Matematika Kelas 1", mapel: "Matematika", kelas: "1A", penerbit: "Erlangga", stok: 40, dipinjam: 32, kondisi: "Baik" },
  { kode: "BK-002", judul: "Bahasa Indonesia Kelas 1", mapel: "B. Indonesia", kelas: "1A", penerbit: "Yudhistira", stok: 40, dipinjam: 35, kondisi: "Baik" },
  { kode: "BK-003", judul: "IPAS Kelas 3", mapel: "IPAS", kelas: "3A", penerbit: "Kemendikbud", stok: 36, dipinjam: 30, kondisi: "Baik" },
  { kode: "BK-004", judul: "Pendidikan Pancasila Kelas 3", mapel: "PPKn", kelas: "3A", penerbit: "Erlangga", stok: 36, dipinjam: 24, kondisi: "Rusak Ringan" },
  { kode: "BK-005", judul: "Bahasa Inggris Kelas 5", mapel: "B. Inggris", kelas: "5B", penerbit: "Grafindo", stok: 32, dipinjam: 28, kondisi: "Baik" },
  { kode: "BK-006", judul: "Seni Budaya Kelas 6", mapel: "SBdP", kelas: "6A", penerbit: "Yudhistira", stok: 30, dipinjam: 12, kondisi: "Rusak Berat" },
];

export type Siswa = {
  nisn: string;
  nama: string;
  kelas: string;
  wali: string;
  wa: string;
  dipinjam: number;
};

export const siswaList: Siswa[] = [
  { nisn: "0081234567", nama: "Siti Nurhaliza", kelas: "3A", wali: "Bpk. Ahmad Fauzi", wa: "0812-3456-7890", dipinjam: 3 },
  { nisn: "0081234568", nama: "Ahmad Rizky Pratama", kelas: "1A", wali: "Ibu Rina", wa: "0813-2222-1111", dipinjam: 4 },
  { nisn: "0081234569", nama: "Dewi Lestari", kelas: "1A", wali: "Bpk. Sutrisno", wa: "0857-8888-4321", dipinjam: 2 },
  { nisn: "0081234570", nama: "Budi Santoso", kelas: "5B", wali: "Ibu Marlina", wa: "0821-3333-7654", dipinjam: 5 },
  { nisn: "0081234571", nama: "Nabila Az-Zahra", kelas: "6A", wali: "Bpk. Hendra", wa: "0819-4444-9090", dipinjam: 1 },
];

export type Guru = {
  nip: string;
  nama: string;
  kelas: string;
  email: string;
  status: "Aktif" | "Cuti";
};

export const guruList: Guru[] = [
  { nip: "19780512 200604 2 001", nama: "Siti Aminah, S.Pd", kelas: "1A", email: "siti@sdn1palapa.sch.id", status: "Aktif" },
  { nip: "19820914 200901 1 003", nama: "Bambang Wijaya, S.Pd", kelas: "3A", email: "bambang@sdn1palapa.sch.id", status: "Aktif" },
  { nip: "19900201 201503 2 005", nama: "Rina Kartika, S.Pd", kelas: "5B", email: "rina@sdn1palapa.sch.id", status: "Cuti" },
  { nip: "19871122 201201 1 002", nama: "Hendra Gunawan, M.Pd", kelas: "6A", email: "hendra@sdn1palapa.sch.id", status: "Aktif" },
];

export type Distribusi = {
  id: string;
  tanggal: string;
  siswa: string;
  kelas: string;
  buku: string;
  jumlah: number;
  status: "Dipinjam" | "Dikembalikan" | "Terlambat";
};

export const distribusiList: Distribusi[] = [
  { id: "DS-2401", tanggal: "12 Jul 2026", siswa: "Siti Nurhaliza", kelas: "3A", buku: "IPAS Kelas 3", jumlah: 1, status: "Dipinjam" },
  { id: "DS-2402", tanggal: "12 Jul 2026", siswa: "Ahmad Rizky Pratama", kelas: "1A", buku: "Matematika Kelas 1", jumlah: 1, status: "Dipinjam" },
  { id: "DS-2403", tanggal: "10 Jul 2026", siswa: "Budi Santoso", kelas: "5B", buku: "Bahasa Inggris Kelas 5", jumlah: 2, status: "Terlambat" },
  { id: "DS-2404", tanggal: "05 Jul 2026", siswa: "Dewi Lestari", kelas: "1A", buku: "Bahasa Indonesia Kelas 1", jumlah: 1, status: "Dikembalikan" },
  { id: "DS-2405", tanggal: "02 Jul 2026", siswa: "Nabila Az-Zahra", kelas: "6A", buku: "Seni Budaya Kelas 6", jumlah: 1, status: "Dikembalikan" },
];

export const pengembalianList = [
  { id: "PB-1201", tanggal: "14 Jul 2026", siswa: "Dewi Lestari", kelas: "1A", buku: "Bahasa Indonesia Kelas 1", kondisi: "Baik", status: "Disetujui" },
  { id: "PB-1202", tanggal: "14 Jul 2026", siswa: "Nabila Az-Zahra", kelas: "6A", buku: "Seni Budaya Kelas 6", kondisi: "Rusak Ringan", status: "Menunggu" },
  { id: "PB-1203", tanggal: "13 Jul 2026", siswa: "Budi Santoso", kelas: "5B", buku: "Bahasa Inggris Kelas 5", kondisi: "Baik", status: "Menunggu" },
];

export const belumKembaliList = [
  { siswa: "Budi Santoso", kelas: "5B", buku: "Bahasa Inggris Kelas 5", jatuhTempo: "05 Jul 2026", telat: 9 },
  { siswa: "Siti Nurhaliza", kelas: "3A", buku: "IPAS Kelas 3", jatuhTempo: "18 Jul 2026", telat: 0 },
  { siswa: "Ahmad Rizky Pratama", kelas: "1A", buku: "Matematika Kelas 1", jatuhTempo: "20 Jul 2026", telat: 0 },
];

export const riwayatList = [
  { waktu: "14 Jul 2026 09:12", aktor: "Siti Aminah, S.Pd", aksi: "Menyetujui pengembalian PB-1201", tipe: "Pengembalian" },
  { waktu: "12 Jul 2026 07:45", aktor: "Administrator", aksi: "Menambah stok buku BK-003 (+10)", tipe: "Master Buku" },
  { waktu: "12 Jul 2026 07:20", aktor: "Bambang Wijaya, S.Pd", aksi: "Distribusi buku ke kelas 3A (36 eksemplar)", tipe: "Distribusi" },
  { waktu: "10 Jul 2026 13:05", aktor: "Administrator", aksi: "Import data siswa kelas 1A (32 baris)", tipe: "Data Siswa" },
];

export const notifikasiList = [
  { judul: "Pengingat pengembalian", isi: "Buku IPAS Kelas 3 jatuh tempo 18 Jul 2026.", waktu: "2 jam lalu", tipe: "warning" as const },
  { judul: "Buku diterima", isi: "Pengembalian Bahasa Indonesia Kelas 1 telah disetujui wali kelas.", waktu: "1 hari lalu", tipe: "success" as const },
  { judul: "Distribusi baru", isi: "Ananda menerima 1 buku baru dari wali kelas.", waktu: "3 hari lalu", tipe: "info" as const },
];

export const grafikBulanan = [
  { bulan: "Feb", distribusi: 120, pengembalian: 96 },
  { bulan: "Mar", distribusi: 168, pengembalian: 140 },
  { bulan: "Apr", distribusi: 96, pengembalian: 88 },
  { bulan: "Mei", distribusi: 210, pengembalian: 175 },
  { bulan: "Jun", distribusi: 145, pengembalian: 132 },
  { bulan: "Jul", distribusi: 232, pengembalian: 180 },
];
