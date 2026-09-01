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

export const bukuList: Buku[] = [];

export type Siswa = {
  nisn: string;
  nama: string;
  kelas: string;
  wali: string;
  wa: string;
  dipinjam: number;
};

export const siswaList: Siswa[] = [];

export type Guru = {
  nip: string;
  nama: string;
  kelas: string;
  email: string;
  status: "Aktif" | "Cuti";
};

export const guruList: Guru[] = [];
