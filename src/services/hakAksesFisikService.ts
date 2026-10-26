import {
  HeaderTemplateSmki,
  PengajuanAksesFisik,
  RuanganAreaItem,
} from "@/types/hakAksesFisik";

export const MASTER_RUANGAN_DEFAULT: RuanganAreaItem[] = [
  { id_ruangan: 1, kode_ruangan: "DC", nama_ruangan: "Data Center" },
  { id_ruangan: 2, kode_ruangan: "NOC", nama_ruangan: "Ruang NOC" },
  { id_ruangan: 3, kode_ruangan: "UPS", nama_ruangan: "UPS" },
  { id_ruangan: 4, kode_ruangan: "GNS-GDG", nama_ruangan: "Akses Genset Gedung" },
  { id_ruangan: 5, kode_ruangan: "DOOR-MAIN", nama_ruangan: "Pintu Utama" },
  { id_ruangan: 6, kode_ruangan: "SOC", nama_ruangan: "Ruang SOC" },
  { id_ruangan: 7, kode_ruangan: "GNS-DC", nama_ruangan: "Akses Genset DC" },
];

export const DEFAULT_HEADER_TEMPLATE: HeaderTemplateSmki = {
  id_template: 1,
  no_format_dokumen: "FR-019//KOM.03.05/SANDIKAMI",
  no_revisi: "1.1",
  tanggal_berlaku: "2022-07-07",
  nama_formulir: "FORMULIR HAK AKSES FISIK",
};

const STORAGE_KEY_DATA = "aptika_fr019_pengajuan_v1";
const STORAGE_KEY_TEMPLATE = "aptika_fr019_template_v1";

const INITIAL_DATA: PengajuanAksesFisik[] = [
  {
    id_pengajuan: 1,
    id_pemohon: 1,
    id_template: 1,
    id_verifikator: 2,
    no_registrasi: "FR-019/KOM/2026/001",
    no_surat: "FR-019/KOM/2026/001",
    tanggal_pengajuan: "2026-10-14",
    nama_pemohon: "Muhammad Ferdy Leoza",
    nip_pemohon: "199805122022031002",
    jabatan_pemohon: "IT / Developer",
    unit_kerja_pemohon: "Bidang Aplikasi Informatika",
    no_hp: "081234567890",
    email: "ferdy@diskominfo.jabarprov.go.id",
    nama_atasan: "Agus Sulaeman, S.Kom., M.T.",
    nip_atasan: "198003152005011004",
    jabatan_atasan: "Ketua Tim Rekayasa Perangkat Lunak",
    jenis_permintaan: "Pendaftaran",
    sifat_akses: "Permanen",
    waktu_akses: "7 x 24 jam",
    ruangan_terpilih: ["Data Center", "Ruang NOC"],
    keperluan_akses: ["Monitoring", "Perawatan"],
    status_pengajuan: "Approved",
    catatan_approval: "Telah diverifikasi sesuai kebutuhan tugas pengembangan dan pemeliharaan server.",
    tanggal_disetujui: "2026-10-14 09:30:00",
    nama_verifikator: "Administrator SMKI",
    is_deleted: false,
    created_at: "2026-10-14 10:15:00",
    updated_at: "2026-10-14 09:30:00",
  },
];

export const getHeaderTemplate = (): HeaderTemplateSmki => {
  if (typeof window === "undefined") return DEFAULT_HEADER_TEMPLATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TEMPLATE);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_TEMPLATE, JSON.stringify(DEFAULT_HEADER_TEMPLATE));
      return DEFAULT_HEADER_TEMPLATE;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_HEADER_TEMPLATE;
  }
};

export const saveHeaderTemplate = (tmpl: HeaderTemplateSmki): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_TEMPLATE, JSON.stringify(tmpl));
};

export const getListPengajuan = (): PengajuanAksesFisik[] => {
  if (typeof window === "undefined") return INITIAL_DATA;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DATA);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(INITIAL_DATA));
      return INITIAL_DATA;
    }
    const parsed = JSON.parse(raw);
    // Pastikan fallback no_surat dan tanggal_pengajuan terisi jika lama tersimpan
    return parsed.map((item: any) => ({
      ...item,
      no_surat: item.no_surat || item.no_registrasi || "FR-019/KOM/2026",
      tanggal_pengajuan: item.tanggal_pengajuan || item.created_at?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    }));
  } catch {
    return INITIAL_DATA;
  }
};

export const saveListPengajuan = (items: PengajuanAksesFisik[]): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(items));
};

export const addPengajuan = (
  payload: Omit<PengajuanAksesFisik, "id_pengajuan" | "created_at" | "updated_at" | "is_deleted" | "status_pengajuan">
): PengajuanAksesFisik => {
  const current = getListPengajuan();
  const nextId = current.length > 0 ? Math.max(...current.map((c) => c.id_pengajuan)) + 1 : 1;
  const now = new Date().toISOString().replace("T", " ").slice(0, 19);

  const noSurat = payload.no_surat || payload.no_registrasi || `FR-019/KOM/${new Date().getFullYear()}/${String(nextId).padStart(3, "0")}`;
  const tglBuat = payload.tanggal_pengajuan || now.slice(0, 10);

  const newItem: PengajuanAksesFisik = {
    ...payload,
    no_registrasi: noSurat,
    no_surat: noSurat,
    tanggal_pengajuan: tglBuat,
    id_pengajuan: nextId,
    status_pengajuan: "Pending",
    is_deleted: false,
    created_at: now,
    updated_at: now,
  };

  const updated = [newItem, ...current];
  saveListPengajuan(updated);
  return newItem;
};

export const updatePengajuan = (
  id: number,
  payload: Partial<PengajuanAksesFisik>
): PengajuanAksesFisik | null => {
  const current = getListPengajuan();
  const idx = current.findIndex((c) => c.id_pengajuan === id);
  if (idx === -1) return null;

  const now = new Date().toISOString().replace("T", " ").slice(0, 19);
  const updatedItem: PengajuanAksesFisik = {
    ...current[idx],
    ...payload,
    updated_at: now,
  };

  current[idx] = updatedItem;
  saveListPengajuan(current);
  return updatedItem;
};

export const softDeletePengajuan = (id: number): boolean => {
  const current = getListPengajuan();
  const idx = current.findIndex((c) => c.id_pengajuan === id);
  if (idx === -1) return false;

  current[idx].is_deleted = true;
  current[idx].updated_at = new Date().toISOString().replace("T", " ").slice(0, 19);
  saveListPengajuan(current);
  return true;
};

export const restorePengajuan = (id: number): boolean => {
  const current = getListPengajuan();
  const idx = current.findIndex((c) => c.id_pengajuan === id);
  if (idx === -1) return false;

  current[idx].is_deleted = false;
  current[idx].updated_at = new Date().toISOString().replace("T", " ").slice(0, 19);
  saveListPengajuan(current);
  return true;
};

export const hardDeletePengajuan = (id: number): boolean => {
  const current = getListPengajuan();
  const filtered = current.filter((c) => c.id_pengajuan !== id);
  saveListPengajuan(filtered);
  return true;
};
