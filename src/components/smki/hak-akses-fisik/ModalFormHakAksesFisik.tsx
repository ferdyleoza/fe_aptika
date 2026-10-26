"use client";

import React, { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import {
  JenisPermintaan,
  PengajuanAksesFisik,
  SifatAkses,
} from "@/types/hakAksesFisik";
import { MASTER_RUANGAN_DEFAULT } from "@/services/hakAksesFisikService";
import toast from "react-hot-toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: any) => void;
  editingItem?: PengajuanAksesFisik | null;
  currentUser?: {
    name?: string;
    email?: string;
    jabatan?: string;
    unit_kerja?: string;
    phone?: string;
  } | null;
  masterUnitKerja?: Array<{ id_unit_kerja: number; nama_unit: string }>;
  masterRuangan?: Array<{ id_ruangan: number; nama_ruangan: string }>;
  suggestedNomor?: string;
}

export default function ModalFormHakAksesFisik({
  isOpen,
  onClose,
  onSave,
  editingItem,
  currentUser,
  masterUnitKerja = [],
  masterRuangan = MASTER_RUANGAN_DEFAULT,
  suggestedNomor = "",
}: Props) {
  const isEdit = !!editingItem;

  const [noSurat, setNoSurat] = useState("");
  const [tanggalPengajuan, setTanggalPengajuan] = useState("");

  const [namaPemohon, setNamaPemohon] = useState("");
  const [jabatanPemohon, setJabatanPemohon] = useState("");
  const [unitKerjaPemohon, setUnitKerjaPemohon] = useState("");
  const [noHp, setNoHp] = useState("");
  const [email, setEmail] = useState("");

  const [namaAtasan, setNamaAtasan] = useState("");
  const [nipAtasan, setNipAtasan] = useState("");
  const [jabatanAtasan, setJabatanAtasan] = useState("");

  const [jenisPermintaan, setJenisPermintaan] = useState<JenisPermintaan>("Pendaftaran");
  const [sifatAkses, setSifatAkses] = useState<SifatAkses>("Permanen");
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalSelesai, setTanggalSelesai] = useState("");
  const [waktuAkses, setWaktuAkses] = useState("7 x 24 jam");

  const [ruanganTerpilih, setRuanganTerpilih] = useState<string[]>([]);
  const [keperluanAkses, setKeperluanAkses] = useState<string[]>([]);
  const [keperluanLainnya, setKeperluanLainnya] = useState("");

  useEffect(() => {
    if (editingItem) {
      setNoSurat(editingItem.no_surat || editingItem.no_registrasi || "");
      setTanggalPengajuan(
        editingItem.tanggal_pengajuan ||
        editingItem.tanggal_buat ||
        editingItem.created_at?.slice(0, 10) ||
        new Date().toISOString().slice(0, 10)
      );

      setNamaPemohon(editingItem.nama_pemohon || "");
      setJabatanPemohon(editingItem.jabatan_pemohon || "");
      setUnitKerjaPemohon(editingItem.unit_kerja_pemohon || "");
      setNoHp(editingItem.no_hp || "");
      setEmail(editingItem.email || "");

      setNamaAtasan(editingItem.nama_atasan || "");
      setNipAtasan(editingItem.nip_atasan || "");
      setJabatanAtasan(editingItem.jabatan_atasan || "");

      setJenisPermintaan(editingItem.jenis_permintaan || "Pendaftaran");
      setSifatAkses(editingItem.sifat_akses || "Permanen");
      setTanggalMulai(editingItem.tanggal_mulai || "");
      setTanggalSelesai(editingItem.tanggal_selesai || "");
      setWaktuAkses(editingItem.waktu_akses || "7 x 24 jam");

      setRuanganTerpilih(editingItem.ruangan_terpilih || []);
      setKeperluanAkses(editingItem.keperluan_akses || []);
      setKeperluanLainnya(editingItem.keperluan_lainnya || "");
    } else {
      const todayStr = new Date().toISOString().slice(0, 10);
      setNoSurat(suggestedNomor || `FR-019/KOM/${new Date().getFullYear()}/001`);
      setTanggalPengajuan(todayStr);

      // Auto-fill dari data user login / state
      setNamaPemohon(currentUser?.name || "Muhammad Ferdy Leoza");
      setJabatanPemohon(currentUser?.jabatan || "IT / Developer");
      setUnitKerjaPemohon(currentUser?.unit_kerja || "Bidang Aplikasi Informatika");
      setNoHp(currentUser?.phone || "081234567890");
      setEmail(currentUser?.email || "ferdy@diskominfo.jabarprov.go.id");

      setNamaAtasan("Agus Sulaeman, S.Kom., M.T.");
      setNipAtasan("198003152005011004");
      setJabatanAtasan("Ketua Tim Rekayasa Perangkat Lunak");

      setJenisPermintaan("Pendaftaran");
      setSifatAkses("Permanen");
      setTanggalMulai("");
      setTanggalSelesai("");
      setWaktuAkses("7 x 24 jam");
      setRuanganTerpilih(["Data Center"]);
      setKeperluanAkses(["Monitoring"]);
      setKeperluanLainnya("");
    }
  }, [editingItem, currentUser, isOpen, suggestedNomor]);

  if (!isOpen) return null;

  const toggleRuangan = (nama: string) => {
    if (ruanganTerpilih.includes(nama)) {
      setRuanganTerpilih(ruanganTerpilih.filter((r) => r !== nama));
    } else {
      setRuanganTerpilih([...ruanganTerpilih, nama]);
    }
  };

  const toggleKeperluan = (alasan: string) => {
    if (keperluanAkses.includes(alasan)) {
      setKeperluanAkses(keperluanAkses.filter((k) => k !== alasan));
    } else {
      setKeperluanAkses([...keperluanAkses, alasan]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!noSurat.trim()) {
      toast.error("Nomor surat / registrasi tidak boleh kosong.");
      return;
    }
    if (!tanggalPengajuan) {
      toast.error("Tanggal buat dokumen wajib diisi.");
      return;
    }
    if (!namaPemohon.trim()) {
      toast.error("Nama pemohon tidak boleh kosong.");
      return;
    }
    if (!noHp.trim()) {
      toast.error("Nomor handphone pemohon wajib diisi.");
      return;
    }
    if (ruanganTerpilih.length === 0) {
      toast.error("Pilih minimal satu ruangan / area akses.");
      return;
    }
    if (keperluanAkses.length === 0) {
      toast.error("Pilih minimal satu keperluan/alasan akses.");
      return;
    }
    if (sifatAkses === "Sementara" && (!tanggalMulai || !tanggalSelesai)) {
      toast.error("Tentukan tanggal mulai dan selesai untuk akses sementara.");
      return;
    }

    const payload = {
      no_surat: noSurat.trim(),
      no_registrasi: noSurat.trim(),
      tanggal_pengajuan: tanggalPengajuan,
      tanggal_buat: tanggalPengajuan,

      nama_pemohon: namaPemohon,
      jabatan_pemohon: jabatanPemohon,
      unit_kerja_pemohon: unitKerjaPemohon,
      no_hp: noHp,
      email: email,

      nama_atasan: namaAtasan,
      nip_atasan: nipAtasan,
      jabatan_atasan: jabatanAtasan,

      jenis_permintaan: jenisPermintaan,
      sifat_akses: sifatAkses,
      tanggal_mulai: sifatAkses === "Sementara" ? tanggalMulai : null,
      tanggal_selesai: sifatAkses === "Sementara" ? tanggalSelesai : null,
      waktu_akses: waktuAkses,

      ruangan_terpilih: ruanganTerpilih,
      keperluan_akses: keperluanAkses,
      keperluan_lainnya: keperluanAkses.includes("Lainnya") ? keperluanLainnya : "",
    };

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">
              {isEdit ? "Edit Data Pengajuan Hak Akses" : "Tambah Data Pengajuan Hak Akses FR-019"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Isi kelengkapan data pemohon dan rincian izin masuk area fisik terbatas.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* SECTION: NOMOR SURAT & TANGGAL BUAT */}
          <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/90 dark:border-slate-700/80 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-teal-500"></span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                Informasi Surat & Tanggal Buat
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nomor Surat / Dokumen <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={noSurat}
                  onChange={(e) => setNoSurat(e.target.value)}
                  placeholder="Contoh: FR-019/KOM/2026/001"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Nomor surat resmi atau kode registrasi formulir pengajuan.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tanggal Buat Dokumen <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={tanggalPengajuan}
                  onChange={(e) => setTanggalPengajuan(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Tanggal pembuatan surat/dokumen formulir pengajuan.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION: DATA UTAMA PEMOHON */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Data Utama Pemohon
              </h4>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Pemohon <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={namaPemohon}
                  onChange={(e) => setNamaPemohon(e.target.value)}
                  placeholder="Masukkan nama pemohon"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-xs transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Jabatan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={jabatanPemohon}
                    onChange={(e) => setJabatanPemohon(e.target.value)}
                    placeholder="Jabatan"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-xs transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Unit Kerja / Penyedia <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    list="fr019-unit-kerja-options"
                    value={unitKerjaPemohon}
                    onChange={(e) => setUnitKerjaPemohon(e.target.value)}
                    placeholder="Pilih dari Data Master Unit Kerja / ketik instansi/vendor"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-xs transition-all"
                    required
                  />
                  <datalist id="fr019-unit-kerja-options">
                    {masterUnitKerja.map((uk) => (
                      <option key={uk.id_unit_kerja} value={uk.nama_unit} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    No. Handphone / WhatsApp <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={noHp}
                    onChange={(e) => setNoHp(e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-xs transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Alamat Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@instansi.go.id"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-xs transition-all"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: DATA ATASAN LANGSUNG (TTD DOKUMEN) */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                Data Atasan Langsung (Untuk Kolom Tanda Tangan)
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Atasan
                </label>
                <input
                  type="text"
                  value={namaAtasan}
                  onChange={(e) => setNamaAtasan(e.target.value)}
                  placeholder="Nama Lengkap & Gelar"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  NIP Atasan
                </label>
                <input
                  type="text"
                  value={nipAtasan}
                  onChange={(e) => setNipAtasan(e.target.value)}
                  placeholder="19xxxxxxxxxxxxxx"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Jabatan Atasan
                </label>
                <input
                  type="text"
                  value={jabatanAtasan}
                  onChange={(e) => setJabatanAtasan(e.target.value)}
                  placeholder="Ketua Tim / Kabid"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-xs"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: DETAIL HAK AKSES SESUAI FR-019 */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Detail Hak Akses Sesuai Formulir FR-019
              </h4>
            </div>

            {/* Jenis Permintaan */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Jenis Permintaan
              </label>
              <div className="flex items-center gap-6">
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
                  <input
                    type="radio"
                    name="jenis_permintaan"
                    value="Pendaftaran"
                    checked={jenisPermintaan === "Pendaftaran"}
                    onChange={() => setJenisPermintaan("Pendaftaran")}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Pendaftaran</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
                  <input
                    type="radio"
                    name="jenis_permintaan"
                    value="Penutupan"
                    checked={jenisPermintaan === "Penutupan"}
                    onChange={() => setJenisPermintaan("Penutupan")}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Penutupan</span>
                </label>
              </div>
            </div>

            {/* Sifat Akses & Waktu Akses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Sifat Akses
                </label>
                <select
                  value={sifatAkses}
                  onChange={(e) => setSifatAkses(e.target.value as SifatAkses)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-xs"
                >
                  <option value="Permanen">Permanen</option>
                  <option value="Sementara">Sementara</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Waktu Akses
                </label>
                <select
                  value={waktuAkses}
                  onChange={(e) => setWaktuAkses(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-xs"
                >
                  <option value="7 x 24 jam">7 x 24 jam</option>
                  <option value="Jam Kerja (07:30 - 16:30)">Jam Kerja (07:30 - 16:30)</option>
                  <option value="Waktu Khusus (Sesuai Izin)">Waktu Khusus (Sesuai Izin)</option>
                </select>
              </div>
            </div>

            {/* Periode Tanggal Jika Sifat Akses Sementara */}
            {sifatAkses === "Sementara" && (
              <div className="p-3 mb-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-amber-900 dark:text-amber-300 mb-1">
                    Tanggal Mulai Akses <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={tanggalMulai}
                    onChange={(e) => setTanggalMulai(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-amber-900 dark:text-amber-300 mb-1">
                    Tanggal Selesai Akses <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={tanggalSelesai}
                    onChange={(e) => setTanggalSelesai(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-white"
                  />
                </div>
              </div>
            )}

            {/* Checkbox Ruangan / Area */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Jenis Akses / Ruangan (Pilihan Checkbox) <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {masterRuangan.map((r) => {
                  const checked = ruanganTerpilih.includes(r.nama_ruangan);
                  return (
                    <label
                      key={r.id_ruangan}
                      onClick={() => toggleRuangan(r.nama_ruangan)}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition-all select-none ${
                        checked
                          ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 font-medium"
                          : "bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {}}
                        className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>{r.nama_ruangan}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Keperluan dan Alasan */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Keperluan dan Alasan (Pilihan Checkbox) <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-2.5">
                {["Instansi", "Monitoring", "Perawatan", "Lainnya"].map((item) => {
                  const checked = keperluanAkses.includes(item);
                  return (
                    <label
                      key={item}
                      onClick={() => toggleKeperluan(item)}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition-all select-none ${
                        checked
                          ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 font-medium"
                          : "bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {}}
                        className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>{item === "Lainnya" ? "Lainnya : Pindah Tugas / Mutasi" : item}</span>
                    </label>
                  );
                })}
              </div>

              {keperluanAkses.includes("Lainnya") && (
                <input
                  type="text"
                  value={keperluanLainnya}
                  onChange={(e) => setKeperluanLainnya(e.target.value)}
                  placeholder="Sebutkan detail keperluan lainnya..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-xs transition-all mt-1"
                />
              )}
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
            >
              <Check size={15} />
              <span>{isEdit ? "Simpan Perubahan" : "Simpan Data"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
