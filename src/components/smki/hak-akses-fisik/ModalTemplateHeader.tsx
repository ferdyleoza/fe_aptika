"use client";

import React, { useState, useEffect } from "react";
import { X, Check, FileCode, Info } from "lucide-react";
import { HeaderTemplateSmki } from "@/types/hakAksesFisik";
import toast from "react-hot-toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  template: HeaderTemplateSmki;
  onSave: (newTemplate: HeaderTemplateSmki) => void;
}

export default function ModalTemplateHeader({
  isOpen,
  onClose,
  template,
  onSave,
}: Props) {
  const [noDokumen, setNoDokumen] = useState("");
  const [noRevisi, setNoRevisi] = useState("");
  const [tanggalBerlaku, setTanggalBerlaku] = useState("");
  const [namaFormulir, setNamaFormulir] = useState("");

  useEffect(() => {
    if (template) {
      setNoDokumen(template.no_format_dokumen || "");
      setNoRevisi(template.no_revisi || "");
      setTanggalBerlaku(template.tanggal_berlaku || "");
      setNamaFormulir(template.nama_formulir || "FORMULIR HAK AKSES FISIK");
    }
  }, [template, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noDokumen.trim()) {
      toast.error("No. format dokumen tidak boleh kosong.");
      return;
    }
    const updated: HeaderTemplateSmki = {
      ...template,
      no_format_dokumen: noDokumen.trim(),
      no_revisi: noRevisi.trim(),
      tanggal_berlaku: tanggalBerlaku,
      nama_formulir: namaFormulir.trim(),
    };
    onSave(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <FileCode size={18} className="text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              Pengaturan Header Template SMKI FR-019
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Info Banner */}
          <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 flex items-start gap-2.5 text-blue-700 dark:text-blue-300">
            <Info size={16} className="shrink-0 mt-0.5 text-blue-500" />
            <p className="leading-relaxed">
              Informasi ini akan terisi pada header tabel dokumen Word FR-019 SMKI secara standar dan resmi.
            </p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              No. Dokumen <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={noDokumen}
              onChange={(e) => setNoDokumen(e.target.value)}
              placeholder="Contoh: FR-019//KOM.03.05/ SANDIKAMI"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-xs font-mono"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                No. Revisi
              </label>
              <input
                type="text"
                value={noRevisi}
                onChange={(e) => setNoRevisi(e.target.value)}
                placeholder="1.1"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Berlaku
              </label>
              <input
                type="date"
                value={tanggalBerlaku}
                onChange={(e) => setTanggalBerlaku(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama Formulir Standar
            </label>
            <input
              type="text"
              value={namaFormulir}
              onChange={(e) => setNamaFormulir(e.target.value)}
              placeholder="FORMULIR HAK AKSES FISIK"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-xs"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
            >
              <Check size={14} />
              <span>Simpan Template</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
