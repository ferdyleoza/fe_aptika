"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Search,
  Download,
  Eye,
  Pencil,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  RotateCcw,
  ShieldCheck,
  FileCode,
  Building2,
  AlertTriangle,
  FolderOpen,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/useAuthStore";
import {
  HeaderTemplateSmki,
  PengajuanAksesFisik,
} from "@/types/hakAksesFisik";
import {
  MASTER_RUANGAN_DEFAULT,
  addPengajuan,
  getHeaderTemplate,
  getListPengajuan,
  restorePengajuan,
  saveHeaderTemplate,
  softDeletePengajuan,
  updatePengajuan,
} from "@/services/hakAksesFisikService";
import {
  getHakAksesFisikList,
  getHakAksesFisikLookup,
  createHakAksesFisik,
  updateHakAksesFisik,
  verifikasiHakAksesFisik,
  deleteHakAksesFisik,
  restoreHakAksesFisik,
  updateTemplateHeaderHakAksesFisik,
  downloadHakAksesFisikDocx,
} from "@/services/api";

import ModalFormHakAksesFisik from "@/components/smki/hak-akses-fisik/ModalFormHakAksesFisik";
import ModalPreviewHakAksesFisik from "@/components/smki/hak-akses-fisik/ModalPreviewHakAksesFisik";
import ModalVerifikasiHakAksesFisik from "@/components/smki/hak-akses-fisik/ModalVerifikasiHakAksesFisik";
import ModalTemplateHeader from "@/components/smki/hak-akses-fisik/ModalTemplateHeader";

export default function FormHakAksesFisikPage() {
  const { user, isAdminAptika } = useAuthStore();
  const isAdmin = user?.role === "admin" || !!isAdminAptika;

  // Data State
  const [dataList, setDataList] = useState<PengajuanAksesFisik[]>([]);
  const [headerTemplate, setHeaderTemplate] = useState<HeaderTemplateSmki>(getHeaderTemplate());
  const [activeTab, setActiveTab] = useState<"aktif" | "terhapus">("aktif");
  const [isLoading, setIsLoading] = useState(false);

  // Master Data State (diambil langsung dari database via API lookup)
  const [masterUnitKerja, setMasterUnitKerja] = useState<Array<{ id_unit_kerja: number; nama_unit: string }>>([]);
  const [masterRuangan, setMasterRuangan] = useState<Array<{ id_ruangan: number; nama_ruangan: string }>>(MASTER_RUANGAN_DEFAULT);
  const [suggestedNomor, setSuggestedNomor] = useState<string>("");
  const [apiStats, setApiStats] = useState<{ total: number; pending: number; approved: number; deleted: number } | null>(null);

  // Filter & Search
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sifatFilter, setSifatFilter] = useState<string>("ALL");

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PengajuanAksesFisik | null>(null);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<PengajuanAksesFisik | null>(null);

  const [isVerifikasiOpen, setIsVerifikasiOpen] = useState(false);
  const [verifikasiItem, setVerifikasiItem] = useState<PengajuanAksesFisik | null>(null);

  const [isTemplateOpen, setIsTemplateOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<PengajuanAksesFisik | null>(null);

  // Helper untuk normalize data dari backend ke interface PengajuanAksesFisik
  const formatBackendItem = (item: any): PengajuanAksesFisik => {
    let ruanganNames: string[] = [];
    if (Array.isArray(item.ruangans)) {
      ruanganNames = item.ruangans.map((r: any) => r.nama_ruangan);
    } else if (Array.isArray(item.ruangan_terpilih)) {
      ruanganNames = item.ruangan_terpilih;
    }

    let keperluanArr: string[] = [];
    if (Array.isArray(item.keperluan_akses)) {
      keperluanArr = item.keperluan_akses;
    } else if (typeof item.keperluan_akses === "string") {
      try {
        keperluanArr = JSON.parse(item.keperluan_akses);
      } catch {
        keperluanArr = [item.keperluan_akses];
      }
    }

    return {
      id_pengajuan: item.id_pengajuan || item.id,
      id_pemohon: item.id_pemohon,
      id_template: item.id_template,
      no_registrasi: item.no_registrasi || item.no_surat,
      no_surat: item.no_surat || item.no_registrasi,
      tanggal_pengajuan: item.tanggal_pengajuan || item.tanggal_buat || item.created_at?.slice(0, 10),
      nama_pemohon: item.nama_pemohon,
      nip_pemohon: item.nip_pemohon || "",
      jabatan_pemohon: item.jabatan_pemohon,
      unit_kerja_pemohon: item.unit_kerja_pemohon,
      no_hp: item.no_hp,
      email: item.email,
      nama_atasan: item.nama_atasan || "",
      nip_atasan: item.nip_atasan || "",
      jabatan_atasan: item.jabatan_atasan || "",
      jenis_permintaan: item.jenis_permintaan,
      sifat_akses: item.sifat_akses,
      tanggal_mulai: item.tanggal_mulai || null,
      tanggal_selesai: item.tanggal_selesai || null,
      waktu_akses: item.waktu_akses,
      ruangan_terpilih: ruanganNames,
      keperluan_akses: keperluanArr,
      keperluan_lainnya: item.keperluan_lainnya || "",
      status_pengajuan: item.status_pengajuan,
      catatan_approval: item.catatan_approval || null,
      tanggal_disetujui: item.tanggal_disetujui || null,
      id_verifikator: item.id_verifikator || null,
      nama_verifikator: item.verifikator?.name || item.nama_verifikator || null,
      is_deleted: !!item.is_deleted,
      created_at: item.created_at || new Date().toISOString(),
      updated_at: item.updated_at || new Date().toISOString(),
    };
  };

  // Load data: Fetch dari backend dengan fallback ke local cache
  const refreshData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch lookup (Master Unit Kerja, Ruangan Area, Template Header SMKI)
      try {
        const lookupRes = await getHakAksesFisikLookup();
        const lData = lookupRes?.data?.data || lookupRes?.data;
        if (lData) {
          if (Array.isArray(lData.unit_kerjas)) setMasterUnitKerja(lData.unit_kerjas);
          if (Array.isArray(lData.ruangans)) setMasterRuangan(lData.ruangans);
          if (lData.template) setHeaderTemplate(lData.template);
          if (lData.suggested_nomor) setSuggestedNomor(lData.suggested_nomor);
        }
      } catch (lookupErr) {
        console.warn("Backend lookup unavailable, using defaults:", lookupErr);
      }

      // 2. Fetch list pengajuan dari backend API
      const res = await getHakAksesFisikList({
        tab: activeTab,
        per_page: -1, // Ambil semua untuk tab aktif, pencarian & filter dilakukan dinamis
      });

      const rawItems = Array.isArray(res?.data)
        ? res.data
        : (Array.isArray(res?.data?.data) ? res.data.data : null);

      if (rawItems && Array.isArray(rawItems)) {
        const formatted = rawItems.map(formatBackendItem);
        setDataList(formatted);
        const statsObj = res?.stats || res?.data?.stats;
        if (statsObj) {
          setApiStats(statsObj);
        }
      } else {
        // Fallback jika API respon kosong
        setDataList(getListPengajuan());
      }
    } catch (err) {
      console.warn("Backend offline or token issue, falling back to local storage:", err);
      setDataList(getListPengajuan());
      setHeaderTemplate(getHeaderTemplate());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [activeTab, user?.id]);

  // Filtered list
  const filteredData = useMemo(() => {
    return dataList.filter((item) => {
      // Tab aktif vs terhapus
      if (activeTab === "aktif" && item.is_deleted) return false;
      if (activeTab === "terhapus" && !item.is_deleted) return false;

      // Jika role pemohon (user biasa), hanya melihat pengajuan yang dibuatnya
      // (Backend query sudah memfilter, ini sebagai guard tambahan)
      if (!isAdmin && user?.id && item.id_pemohon && String(item.id_pemohon) !== String(user.id)) {
        return false;
      }

      // Search keyword
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchNama = item.nama_pemohon?.toLowerCase().includes(q);
        const matchDok = (item.no_surat || item.no_registrasi)?.toLowerCase().includes(q);
        const matchTgl = item.tanggal_pengajuan?.toLowerCase().includes(q);
        const matchArea = item.ruangan_terpilih?.some((r) => r.toLowerCase().includes(q));
        const matchUnit = item.unit_kerja_pemohon?.toLowerCase().includes(q);
        if (!matchNama && !matchDok && !matchTgl && !matchArea && !matchUnit) return false;
      }

      // Filter Status
      if (statusFilter !== "ALL" && item.status_pengajuan !== statusFilter) {
        return false;
      }

      // Filter Sifat Akses
      if (sifatFilter !== "ALL" && item.sifat_akses !== sifatFilter) {
        return false;
      }

      return true;
    });
  }, [dataList, activeTab, isAdmin, user?.id, search, statusFilter, sifatFilter]);

  // Metric counts (Gunakan stats dari backend jika tersedia, atau hitung lokal)
  const metrics = useMemo(() => {
    if (apiStats) {
      return apiStats;
    }
    const active = dataList.filter((d) => !d.is_deleted);
    return {
      total: active.length,
      pending: active.filter((d) => d.status_pengajuan === "Pending").length,
      approved: active.filter((d) => d.status_pengajuan === "Approved").length,
      deleted: dataList.filter((d) => d.is_deleted).length,
    };
  }, [dataList, apiStats]);

  // Action Handlers
  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleDownloadDocx = async (item: PengajuanAksesFisik) => {
    const toastId = toast.loading(`Mengunduh dokumen Word resmi FR-019 untuk ${item.nama_pemohon}...`);
    try {
      const safeName = (item.nama_pemohon || "Pemohon").replace(/[^a-zA-Z0-9_\-]/g, "_");
      const fileName = `FR-019_${safeName}.docx`;
      await downloadHakAksesFisikDocx(item.id_pengajuan, fileName);
      toast.success("Dokumen Word resmi FR-019 berhasil diunduh!", { id: toastId });
    } catch (err: any) {
      console.error("Download dokumen Word resmi gagal:", err);
      let errMsg = "Gagal mengunduh dokumen resmi dari server.";
      if (err?.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const parsed = JSON.parse(text);
          if (parsed.message) errMsg = parsed.message;
        } catch (_) {}
      } else if (err?.response?.data?.message) {
        errMsg = err.response.data.message;
      } else if (err?.message) {
        errMsg = err.message;
      }
      toast.error(errMsg, { id: toastId });
    }
  };

  const handleExportToolbar = () => {
    if (filteredData.length === 0) {
      toast.error("Tidak ada data pengajuan untuk diekspor.");
      return;
    }
    // Ekspor pengajuan terbaru atau pengajuan pertama dalam filter
    handleDownloadDocx(filteredData[0]);
  };

  const handleOpenEdit = (item: PengajuanAksesFisik) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleSaveForm = async (payload: any) => {
    setIsLoading(true);

    // Pemetaan nama ruangan terpilih ke ID ruangan di database
    const mappedRuanganIds = (payload.ruangan_terpilih || []).map((name: string) => {
      const found = masterRuangan.find((r) => r.nama_ruangan.toLowerCase() === name.toLowerCase());
      return found ? found.id_ruangan : null;
    }).filter(Boolean);

    const apiPayload = {
      no_surat: payload.no_surat,
      no_registrasi: payload.no_registrasi || payload.no_surat,
      tanggal_pengajuan: payload.tanggal_pengajuan,
      nama_pemohon: payload.nama_pemohon,
      nip_pemohon: payload.nip_pemohon || null,
      jabatan_pemohon: payload.jabatan_pemohon,
      unit_kerja_pemohon: payload.unit_kerja_pemohon,
      no_hp: payload.no_hp,
      email: payload.email,
      nama_atasan: payload.nama_atasan || null,
      nip_atasan: payload.nip_atasan || null,
      jabatan_atasan: payload.jabatan_atasan || null,
      jenis_permintaan: payload.jenis_permintaan,
      sifat_akses: payload.sifat_akses,
      tanggal_mulai: payload.tanggal_mulai || null,
      tanggal_selesai: payload.tanggal_selesai || null,
      waktu_akses: payload.waktu_akses,
      keperluan_akses: payload.keperluan_akses,
      keperluan_lainnya: payload.keperluan_lainnya || null,
      ruangan_ids: mappedRuanganIds.length > 0 ? mappedRuanganIds : [1],
    };

    try {
      if (editingItem) {
        await updateHakAksesFisik(editingItem.id_pengajuan, apiPayload);
        toast.success(
          editingItem.status_pengajuan === "Rejected"
            ? "Pengajuan berhasil direvisi dan diajukan ulang ke verifikator (status Pending)."
            : "Data pengajuan berhasil diperbarui di database."
        );
      } else {
        await createHakAksesFisik(apiPayload);
        toast.success("Pengajuan formulir hak akses fisik berhasil disimpan ke database.");
      }
    } catch (err: any) {
      console.warn("API call failed, falling back to local store:", err);
      // Fallback lokal
      if (editingItem) {
        const nextStatus = editingItem.status_pengajuan === "Rejected" ? "Pending" : editingItem.status_pengajuan;
        updatePengajuan(editingItem.id_pengajuan, {
          ...payload,
          status_pengajuan: nextStatus,
          catatan_approval: nextStatus === "Pending" ? null : editingItem.catatan_approval,
        });
        toast.success(
          editingItem.status_pengajuan === "Rejected"
            ? "Pengajuan berhasil direvisi (Cache Lokal)."
            : "Data pengajuan berhasil diperbarui (Cache Lokal)."
        );
      } else {
        const noReg = payload.no_surat || payload.no_registrasi || (suggestedNomor || `FR-019/KOM/${new Date().getFullYear()}/${String(dataList.length + 1).padStart(3, "0")}`);
        addPengajuan({
          ...payload,
          id_pemohon: user?.id || 1,
          id_template: headerTemplate.id_template,
          no_registrasi: noReg,
          no_surat: noReg,
          tanggal_pengajuan: payload.tanggal_pengajuan || new Date().toISOString().slice(0, 10),
        });
        toast.success("Pengajuan formulir berhasil dibuat (Cache Lokal).");
      }
    } finally {
      setIsLoading(false);
      setIsFormOpen(false);
      refreshData();
    }
  };

  const handleOpenPreview = (item: PengajuanAksesFisik) => {
    setPreviewItem(item);
    setIsPreviewOpen(true);
  };

  const handleOpenVerifikasi = (item: PengajuanAksesFisik) => {
    if (!isAdmin) {
      toast.error("Aksi verifikasi hanya dapat dilakukan oleh role Administrator.");
      return;
    }
    setVerifikasiItem(item);
    setIsVerifikasiOpen(true);
  };

  const handleApprove = async (id: number, catatan: string) => {
    setIsLoading(true);
    try {
      await verifikasiHakAksesFisik(id, {
        status: "Approved",
        catatan: catatan,
      });
      toast.success("Pengajuan berhasil disetujui (Approved) di sistem.");
    } catch (err) {
      const now = new Date().toISOString().replace("T", " ").slice(0, 19);
      updatePengajuan(id, {
        status_pengajuan: "Approved",
        catatan_approval: catatan,
        tanggal_disetujui: now,
        id_verifikator: user?.id || 1,
        nama_verifikator: user?.name || "Administrator SMKI",
      });
      toast.success("Pengajuan berhasil disetujui.");
    } finally {
      setIsLoading(false);
      setIsVerifikasiOpen(false);
      refreshData();
    }
  };

  const handleReject = async (id: number, alasan: string) => {
    setIsLoading(true);
    try {
      await verifikasiHakAksesFisik(id, {
        status: "Rejected",
        catatan: alasan,
      });
      toast.error("Pengajuan telah ditolak (Rejected) dengan catatan penolakan.");
    } catch (err) {
      const now = new Date().toISOString().replace("T", " ").slice(0, 19);
      updatePengajuan(id, {
        status_pengajuan: "Rejected",
        catatan_approval: alasan,
        tanggal_disetujui: now,
        id_verifikator: user?.id || 1,
        nama_verifikator: user?.name || "Administrator SMKI",
      });
      toast.error("Pengajuan telah ditolak (Rejected).");
    } finally {
      setIsLoading(false);
      setIsVerifikasiOpen(false);
      refreshData();
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsLoading(true);
    try {
      await deleteHakAksesFisik(deleteTarget.id_pengajuan);
      toast.success("Data pengajuan berhasil dipindahkan ke tempat sampah (soft delete).");
    } catch (err) {
      softDeletePengajuan(deleteTarget.id_pengajuan);
      toast.success("Data pengajuan berhasil dihapus.");
    } finally {
      setIsLoading(false);
      setDeleteTarget(null);
      refreshData();
    }
  };

  const handleRestore = async (id: number) => {
    setIsLoading(true);
    try {
      await restoreHakAksesFisik(id);
      toast.success("Data pengajuan berhasil dipulihkan dari tempat sampah.");
    } catch (err) {
      restorePengajuan(id);
      toast.success("Data pengajuan berhasil dipulihkan.");
    } finally {
      setIsLoading(false);
      refreshData();
    }
  };

  const handleSaveTemplate = async (newTmpl: HeaderTemplateSmki) => {
    setIsLoading(true);
    try {
      await updateTemplateHeaderHakAksesFisik(newTmpl);
      setHeaderTemplate(newTmpl);
      toast.success("Template header resmi dokumen berhasil disimpan ke database.");
    } catch (err) {
      saveHeaderTemplate(newTmpl);
      setHeaderTemplate(newTmpl);
      toast.success("Template header resmi dokumen berhasil diperbarui.");
    } finally {
      setIsLoading(false);
      setIsTemplateOpen(false);
      refreshData();
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. HERO BANNER PERSIS MOCKUP (EMERALD / TEAL LUXURY GRADIENT) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 p-6 sm:p-8 text-white shadow-lg">
        {/* Dekorasi hiasan bulat transparan */}
        <div className="absolute -right-12 -top-12 h-56 w-56 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
        <div className="absolute right-1/4 -bottom-12 h-44 w-44 rounded-full bg-teal-400/10 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-700/60 border border-emerald-500/40 text-[11px] font-semibold tracking-wide text-emerald-200 mb-3">
              <ShieldCheck size={14} className="text-emerald-300" />
              <span>Sistem Manajemen Keamanan Informasi (SMKI)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
              Formulir Hak Akses Fisik (FR-019)
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-xl">
              Kelola data pengajuan dan izin hak akses fisik ruangan terbatas sesuai formulir FR-019 SMKI dengan mudah dan terstruktur.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2.5 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-700/60 border border-emerald-500/40 text-xs font-semibold text-emerald-100">
              <Building2 size={13} className="text-emerald-300" />
              <span>Unit Kerja: Bidang Aplikasi Informatika</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-teal-900/60 border border-teal-500/40 text-xs font-semibold text-teal-200">
              <FileCode size={13} className="text-teal-300" />
              <span>Format Export: Microsoft Word (.docx) / PDF</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. METRIC CARDS (TOTAL, PENDING, APPROVED, DATA DIHAPUS) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Data */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
            Total Data
          </span>
          <div className="text-3xl font-extrabold text-slate-800 dark:text-white mb-1">
            {metrics.total}
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Pengajuan tersimpan
          </span>
          <div className="absolute right-4 bottom-4 w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-center text-slate-400">
            <FileText size={20} />
          </div>
        </div>

        {/* Card 2: Status Pending */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-1">
            Menunggu Verifikasi
          </span>
          <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mb-1">
            {metrics.pending}
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Status Pending
          </span>
          <div className="absolute right-4 bottom-4 w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-500">
            <Clock size={20} />
          </div>
        </div>

        {/* Card 3: Status Approved */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
            Telah Disetujui
          </span>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mb-1">
            {metrics.approved}
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Status Approved
          </span>
          <div className="absolute right-4 bottom-4 w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-500">
            <CheckCircle2 size={20} />
          </div>
        </div>

        {/* Card 4: Data Dihapus (Soft Delete) */}
        <div
          onClick={() => setActiveTab(activeTab === "aktif" ? "terhapus" : "aktif")}
          className={`p-5 rounded-2xl border shadow-sm relative overflow-hidden cursor-pointer transition-all ${
            activeTab === "terhapus"
              ? "bg-rose-50/70 dark:bg-rose-950/40 border-rose-400 ring-2 ring-rose-500/20"
              : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300"
          }`}
          title="Klik untuk melihat arsip data yang telah dihapus"
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block mb-1">
            Data Dihapus
          </span>
          <div className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 mb-1">
            {metrics.deleted}
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
            <span>Dalam periode ini</span>
            {activeTab === "terhapus" && <span className="font-bold text-rose-600">(Aktif)</span>}
          </span>
          <div className="absolute right-4 bottom-4 w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-500">
            <Trash2 size={20} />
          </div>
        </div>
      </div>

      {/* 4. TABLE PANEL SECTION */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-800 dark:text-white">
                {activeTab === "aktif"
                  ? "Daftar Pengajuan Hak Akses Fisik"
                  : "Arsip Pengajuan yang Dihapus (Soft Delete)"}
              </h2>
              {activeTab === "terhapus" && (
                <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-[10px] font-bold">
                  Arsip Sampah
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Riwayat dokumen formulir hak akses fisik standar FR019–SMKI
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Box */}
            <div className="relative min-w-[240px] sm:min-w-[280px]">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama pemohon, area, no dok..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
              />
            </div>

            {/* Filter Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              <option value="ALL">Semua Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>

            {/* Filter Sifat */}
            <select
              value={sifatFilter}
              onChange={(e) => setSifatFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              <option value="ALL">Semua Sifat</option>
              <option value="Permanen">Permanen</option>
              <option value="Sementara">Sementara</option>
            </select>

            {/* Tombol Ekspor Dokumen Word Resmi (.docx) */}
            <button
              onClick={handleExportToolbar}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
              title="Unduh dokumen Word resmi (.docx) pengajuan terbaru"
            >
              <Download size={14} className="text-slate-500" />
              <span>Ekspor (DOCX)</span>
            </button>

            {/* Tombol Header SMKI (Hanya untuk Admin) */}
            {isAdmin && (
              <button
                onClick={() => setIsTemplateOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-semibold transition-colors shadow-sm"
                title="Kelola nomor format dokumen, revisi, dan tanggal berlaku"
              >
                <FileCode size={14} className="text-emerald-600" />
                <span>Header SMKI</span>
              </button>
            )}

            {/* Tombol Tambah Data */}
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-xs font-semibold shadow-md shadow-emerald-700/20 transition-all"
            >
              <Plus size={16} />
              <span>Tambah Data</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 text-[10px]">
                <th className="py-3 px-4 w-12 text-center">NO</th>
                <th className="py-3 px-4 min-w-[150px]">NO. SURAT</th>
                <th className="py-3 px-4 min-w-[110px]">TGL BUAT</th>
                <th className="py-3 px-4 min-w-[180px]">NAMA PEMOHON</th>
                <th className="py-3 px-4 min-w-[200px]">UNIT KERJA / JABATAN</th>
                <th className="py-3 px-4 min-w-[150px]">JENIS & SIFAT AKSES</th>
                <th className="py-3 px-4 min-w-[160px]">AREA / RUANGAN</th>
                <th className="py-3 px-4 text-center">STATUS</th>
                <th className="py-3 px-4 text-center min-w-[140px]">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <FolderOpen size={40} className="mb-2 stroke-1 text-slate-300 dark:text-slate-600" />
                      <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                        Tidak ada pengajuan ditemukan
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {search
                          ? "Coba sesuaikan kata kunci pencarian atau filter Anda."
                          : "Klik tombol '+ Tambah Data' untuk membuat pengajuan baru."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((row, index) => (
                  <tr
                    key={row.id_pengajuan}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-3.5 px-4 text-center font-semibold text-slate-500">
                      {index + 1}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-800 dark:text-white">
                      {row.no_surat || row.no_registrasi}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {row.tanggal_pengajuan || row.created_at?.slice(0, 10)}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 dark:text-white">
                        {row.nama_pemohon}
                      </div>
                      <div className="text-[11px] text-slate-400">{row.email}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {row.unit_kerja_pemohon}
                      </div>
                      <div className="text-[11px] text-slate-400">{row.jabatan_pemohon}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {row.sifat_akses} / {row.jenis_permintaan}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {row.waktu_akses}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {row.ruangan_terpilih.map((rg) => (
                          <span
                            key={rg}
                            className="inline-block px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-[10px] font-medium text-slate-700 dark:text-slate-300"
                          >
                            {rg}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          row.status_pengajuan === "Approved"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                            : row.status_pengajuan === "Rejected"
                            ? "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60"
                            : "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60"
                        }`}
                      >
                        {row.status_pengajuan === "Approved" && <CheckCircle2 size={12} />}
                        {row.status_pengajuan === "Pending" && <Clock size={12} />}
                        {row.status_pengajuan === "Rejected" && <XCircle size={12} />}
                        <span>{row.status_pengajuan}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Tombol Unduh Word Langsung */}
                        <button
                          onClick={() => handleDownloadDocx(row)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
                          title="Unduh Word Resmi (.docx)"
                        >
                          <Download size={15} />
                        </button>

                        {/* Tombol Preview Dokumen */}
                        <button
                          onClick={() => handleOpenPreview(row)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                          title="Preview Dokumen Resmi"
                        >
                          <Eye size={15} />
                        </button>

                        {/* Tombol Verifikasi (Khusus Admin jika Pending) */}
                        {isAdmin && row.status_pengajuan === "Pending" && (
                          <button
                            onClick={() => handleOpenVerifikasi(row)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors"
                            title="Verifikasi & Approval"
                          >
                            <ShieldCheck size={15} />
                          </button>
                        )}

                        {/* Tombol Edit */}
                        {!row.is_deleted && (
                          <button
                            onClick={() => handleOpenEdit(row)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors"
                            title="Edit Pengajuan"
                          >
                            <Pencil size={15} />
                          </button>
                        )}

                        {/* Tombol Hapus / Soft Delete */}
                        {!row.is_deleted && (
                          <button
                            onClick={() => setDeleteTarget(row)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                            title="Hapus Data (Soft Delete)"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}

                        {/* Tombol Pulihkan jika di Tab Terhapus */}
                        {row.is_deleted && (
                          <button
                            onClick={() => handleRestore(row.id_pengajuan)}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
                            title="Pulihkan Data"
                          >
                            <RotateCcw size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Info */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            Menampilkan <b>{filteredData.length}</b> dari total <b>{dataList.length}</b> data pengajuan
          </span>
          <span className="font-mono text-[11px]">Standar SMKI ISO/IEC 27001:2022</span>
        </div>
      </div>

      {/* 5. MODAL KONFIRMASI HAPUS PERSIS MOCKUP (IMAGE 1) */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 text-center animate-scale-up">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2">
              Konfirmasi Hapus
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              Apakah Anda yakin ingin menghapus data pengajuan{" "}
              <b className="text-slate-800 dark:text-slate-200">{deleteTarget.nama_pemohon}</b> (
              <span className="font-mono">{deleteTarget.no_registrasi}</span>)? Tindakan ini dapat dibatalkan melalui tab data dihapus.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-semibold shadow-md shadow-rose-600/20 transition-all"
              >
                Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      <ModalFormHakAksesFisik
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveForm}
        editingItem={editingItem}
        currentUser={{
          name: user?.name || "Muhammad Ferdy Leoza",
          email: user?.email || "ferdy@diskominfo.jabarprov.go.id",
          jabatan: "IT / Developer",
          unit_kerja: "Bidang Aplikasi Informatika",
          phone: "081234567890",
        }}
        masterUnitKerja={masterUnitKerja}
        masterRuangan={masterRuangan}
        suggestedNomor={suggestedNomor}
      />

      <ModalPreviewHakAksesFisik
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        item={previewItem}
        template={headerTemplate}
      />

      <ModalVerifikasiHakAksesFisik
        isOpen={isVerifikasiOpen}
        onClose={() => setIsVerifikasiOpen(false)}
        item={verifikasiItem}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      <ModalTemplateHeader
        isOpen={isTemplateOpen}
        onClose={() => setIsTemplateOpen(false)}
        template={headerTemplate}
        onSave={handleSaveTemplate}
      />
    </div>
  );
}
