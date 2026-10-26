"use client";

import React, { useState } from "react";
import { X, CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import { PengajuanAksesFisik } from "@/types/hakAksesFisik";
import toast from "react-hot-toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item: PengajuanAksesFisik | null;
  onApprove: (id: number, catatan: string) => void;
  onReject: (id: number, alasan: string) => void;
}

export default function ModalVerifikasiHakAksesFisik({
  isOpen,
  onClose,
  item,
  onApprove,
  onReject,
}: Props) {
  const [catatan, setCatatan] = useState("");
  const [keputusan, setKeputusan] = useState<"approve" | "reject" | null>(null);

  if (!isOpen || !item) return null;

  const handleConfirm = () => {
    if (keputusan === "reject") {
      if (!catatan.trim()) {
        toast.error("Alasan penolakan wajib diisi agar pemohon dapat merevisi pengajuan.");
        return;
      }
      onReject(item.id_pengajuan, catatan.trim());
    } else if (keputusan === "approve") {
      onApprove(item.id_pengajuan, catatan.trim() || "Pengajuan telah disetujui oleh verifikator.");
    } else {
      toast.error("Silakan tentukan keputusan (Setujui atau Tolak).");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                Verifikasi Pengajuan Hak Akses Fisik
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Pemeriksaan kepatuhan keamanan dan pemberian izin akses
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {/* Ringkasan Singkat Dokumen */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">No. Registrasi:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {item.no_registrasi}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Nama Pemohon:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {item.nama_pemohon}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Unit Kerja / Jabatan:</span>
              <span className="text-slate-700 dark:text-slate-300">
                {item.unit_kerja_pemohon} ({item.jabatan_pemohon})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Ruangan Diminta:</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                {item.ruangan_terpilih.join(", ")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Sifat / Waktu:</span>
              <span className="text-slate-700 dark:text-slate-300">
                {item.sifat_akses} ({item.waktu_akses})
              </span>
            </div>
          </div>

          {/* Opsi Keputusan */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Tentukan Keputusan Verifikasi:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setKeputusan("approve")}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                  keputusan === "approve"
                    ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/30 font-bold"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <CheckCircle2 size={22} className="text-emerald-600" />
                <span className="text-xs">Setujui (Approve)</span>
              </button>

              <button
                type="button"
                onClick={() => setKeputusan("reject")}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                  keputusan === "reject"
                    ? "bg-rose-50 dark:bg-rose-950/50 border-rose-500 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/30 font-bold"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <XCircle size={22} className="text-rose-600" />
                <span className="text-xs">Tolak (Reject)</span>
              </button>
            </div>
          </div>

          {/* Catatan / Alasan */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Catatan Verifikasi {keputusan === "reject" && <span className="text-rose-500">* (Wajib diisi)</span>}
            </label>
            <textarea
              rows={3}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder={
                keputusan === "reject"
                  ? "Tuliskan alasan penolakan secara spesifik agar pemohon dapat memperbaiki isian..."
                  : "Tambahkan catatan verifikasi bila ada (opsional)..."
              }
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-xs transition-all"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 bg-slate-50/50 dark:bg-slate-800/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 text-xs font-semibold"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!keputusan}
            className={`px-5 py-2 rounded-xl text-white text-xs font-semibold shadow-md transition-all ${
              keputusan === "approve"
                ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                : keputusan === "reject"
                ? "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20"
                : "bg-slate-300 dark:bg-slate-700 cursor-not-allowed text-slate-500"
            }`}
          >
            Simpan Keputusan
          </button>
        </div>
      </div>
    </div>
  );
}
