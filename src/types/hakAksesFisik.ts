export type RoleType = "user" | "admin";

export type JenisPermintaan = "Pendaftaran" | "Penutupan";

export type SifatAkses = "Permanen" | "Sementara";

export type StatusPengajuan = "Pending" | "Approved" | "Rejected";

export interface RuanganAreaItem {
  id_ruangan: number;
  kode_ruangan: string;
  nama_ruangan: string;
}

export interface HeaderTemplateSmki {
  id_template: number;
  no_format_dokumen: string;
  no_revisi: string;
  tanggal_berlaku: string;
  nama_formulir: string;
}

export interface PengajuanAksesFisik {
  id_pengajuan: number;
  id_pemohon: number;
  id_template: number;
  id_verifikator?: number | null;
  no_registrasi: string;
  no_surat?: string;
  tanggal_pengajuan?: string; // Tanggal Buat formulir/surat (YYYY-MM-DD)
  tanggal_buat?: string; // Alias tanggal buat
  
  // Data Pemohon
  nama_pemohon: string;
  nip_pemohon?: string;
  jabatan_pemohon: string;
  unit_kerja_pemohon: string;
  no_hp: string;
  email: string;

  // Data Atasan Pemohon (untuk kolom TTD atasan langsung)
  nama_atasan?: string;
  nip_atasan?: string;
  jabatan_atasan?: string;

  // Detail Akses
  jenis_permintaan: JenisPermintaan;
  sifat_akses: SifatAkses;
  tanggal_mulai?: string | null;
  tanggal_selesai?: string | null;
  waktu_akses: string; // Misal "7 x 24 jam", "Jam Kerja (08:00 - 16:00)", dll.

  // Checklist Ruangan / Area
  ruangan_terpilih: string[]; // nama-nama ruangan, e.g. ["Data Center", "Ruang NOC"]

  // Keperluan & Alasan
  keperluan_akses: string[]; // e.g. ["Instansi", "Monitoring", "Perawatan", "Lainnya"]
  keperluan_lainnya?: string;

  // Status & Approval
  status_pengajuan: StatusPengajuan;
  catatan_approval?: string | null;
  tanggal_disetujui?: string | null;
  nama_verifikator?: string | null;

  // Metadata
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}
