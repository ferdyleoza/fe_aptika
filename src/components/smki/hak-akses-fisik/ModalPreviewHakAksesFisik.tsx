"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { X, Printer, Download, FileText } from "lucide-react";
import { HeaderTemplateSmki, PengajuanAksesFisik } from "@/types/hakAksesFisik";
import { downloadHakAksesFisikDocx } from "@/services/api";
import toast from "react-hot-toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item: PengajuanAksesFisik | null;
  template: HeaderTemplateSmki;
}

export default function ModalPreviewHakAksesFisik({
  isOpen,
  onClose,
  item,
  template,
}: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !item) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadWord = async () => {
    const toastId = toast.loading(`Mengunduh dokumen Word resmi FR-019 untuk ${item.nama_pemohon}...`);
    try {
      const safeName = (item.nama_pemohon || "Pemohon").replace(/[^a-zA-Z0-9_\-]/g, "_");
      const fileName = `FR-019_${safeName}.docx`;
      await downloadHakAksesFisikDocx(item.id_pengajuan, fileName);
      toast.success("Dokumen Word resmi FR-019 berhasil diunduh!", { id: toastId });
    } catch (err: any) {
      console.error("Gagal mengunduh dokumen Word resmi:", err);
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

  const ruanganList = [
    "Data Center",
    "Ruang NOC",
    "UPS",
    "Akses Genset Gedung",
    "Pintu Utama",
    "Ruang SOC",
    "Akses Genset DC",
  ];

  const renderSquareCheck = (condition: boolean) => (
    <span className="inline-flex items-center justify-center w-3.5 h-3.5 border border-black mr-1 text-[10px] font-bold leading-none align-middle">
      {condition ? "✓" : ""}
    </span>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      {/* Styles for print media */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-document-fr019, #print-document-fr019 * {
            visibility: visible;
          }
          #print-document-fr019 {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Top Header Bar */}
        <div className="px-6 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 no-print">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <FileText size={17} className="text-emerald-600" />
              <span>Preview Dokumen Resmi: FR-019 Formulir Hak Akses Fisik</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Format resmi SMKI Dinas Komunikasi dan Informatika Provinsi Jawa Barat
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors"
            >
              <Printer size={14} />
              <span>Cetak / PDF</span>
            </button>
            <button
              onClick={handleDownloadWord}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white shadow-sm transition-colors"
            >
              <Download size={14} />
              <span>Unduh Word (.docx)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ml-1"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Document Content Canvas */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-slate-100/70 dark:bg-slate-950/60 flex justify-center">
          <div
            id="print-document-fr019"
            ref={printRef}
            className="relative bg-white text-black w-full max-w-[210mm] min-h-[297mm] p-8 sm:p-10 shadow-lg border border-slate-300 font-sans text-xs leading-normal select-text"
          >
            {/* Watermark Logo Jawa Barat samar di latar belakang */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
              <Image
                src="/logo-jabar.png"
                alt="Watermark Jabar"
                width={380}
                height={380}
                className="object-contain"
              />
            </div>

            {/* TABEL HEADER KOP RESMI */}
            <table className="w-full border-collapse border border-black mb-3">
              <tbody>
                <tr>
                  <td className="w-[20%] border border-black p-2.5 text-center align-middle">
                    <div className="flex flex-col items-center justify-center">
                      <Image
                        src="/logo-jabar.png"
                        alt="Logo Jabar"
                        width={46}
                        height={55}
                        className="object-contain"
                      />
                      <span className="text-[9px] font-bold tracking-tight mt-1 leading-tight text-center block">
                        DISKOMINFO
                        <br />
                        PROVINSI JAWA BARAT
                      </span>
                    </div>
                  </td>
                  <td className="w-[50%] border border-black p-2 text-center align-middle">
                    <h1 className="text-sm font-bold tracking-wide uppercase">
                      {template.nama_formulir || "FORMULIR HAK AKSES FISIK"}
                    </h1>
                  </td>
                  <td className="w-[30%] border border-black p-2 align-middle text-[10px]">
                    <div className="space-y-1">
                      <div className="grid grid-cols-[72px_6px_1fr]">
                        <span className="font-bold">No. Dokumen</span>
                        <span>:</span>
                        <span className="font-medium break-all">{template.no_format_dokumen}</span>
                      </div>
                      <div className="grid grid-cols-[72px_6px_1fr]">
                        <span className="font-bold">No. Revisi</span>
                        <span>:</span>
                        <span className="font-medium">{template.no_revisi}</span>
                      </div>
                      <div className="grid grid-cols-[72px_6px_1fr]">
                        <span className="font-bold">Tanggal Berlaku</span>
                        <span>:</span>
                        <span className="font-medium">{template.tanggal_berlaku}</span>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* IDENTITAS PEMOHON */}
            <table className="w-full border-collapse border border-black mb-3 text-[11px]">
              <tbody>
                <tr>
                  <td className="w-[18%] border border-black p-2 font-bold bg-slate-50/50">Nama</td>
                  <td className="w-[32%] border border-black p-2">{item.nama_pemohon}</td>
                  <td className="w-[20%] border border-black p-2 font-bold bg-slate-50/50">Jabatan</td>
                  <td className="w-[30%] border border-black p-2">{item.jabatan_pemohon}</td>
                </tr>
                <tr>
                  <td className="border border-black p-2 font-bold bg-slate-50/50">Tanggal</td>
                  <td className="border border-black p-2">{item.tanggal_pengajuan || item.tanggal_buat || item.created_at?.slice(0, 10)}</td>
                  <td className="border border-black p-2 font-bold bg-slate-50/50">Unit Kerja/Penyedia</td>
                  <td className="border border-black p-2">{item.unit_kerja_pemohon}</td>
                </tr>
                <tr>
                  <td className="border border-black p-2 font-bold bg-slate-50/50">No. HP</td>
                  <td className="border border-black p-2">{item.no_hp}</td>
                  <td className="border border-black p-2 font-bold bg-slate-50/50">Email</td>
                  <td className="border border-black p-2">{item.email}</td>
                </tr>
                <tr>
                  <td className="border border-black p-2 font-bold bg-slate-50/50">No. Surat / Registrasi</td>
                  <td colSpan={3} className="border border-black p-2 font-mono font-bold text-emerald-800">
                    {item.no_surat || item.no_registrasi}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* JENIS PERMINTAAN */}
            <table className="w-full border-collapse border border-black mb-3 text-[11px]">
              <tbody>
                <tr>
                  <td className="w-[25%] border border-black p-2 font-bold bg-slate-50/50">
                    Jenis Permintaan :
                  </td>
                  <td className="border border-black p-2">
                    <span className="mr-6">
                      {renderSquareCheck(item.jenis_permintaan === "Pendaftaran")} Pendaftaran
                    </span>
                    <span>
                      {renderSquareCheck(item.jenis_permintaan === "Penutupan")} Penutupan
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-2 font-bold bg-slate-50/50">
                    Sifat Akses :
                  </td>
                  <td className="border border-black p-2">
                    <span className="mr-6">
                      {renderSquareCheck(item.sifat_akses === "Permanen")} Permanen
                    </span>
                    <span>
                      {renderSquareCheck(item.sifat_akses === "Sementara")} Sementara
                      {item.sifat_akses === "Sementara" && item.tanggal_mulai && (
                        <span className="ml-2 font-semibold text-slate-700">
                          ({item.tanggal_mulai} s.d {item.tanggal_selesai || "-"})
                        </span>
                      )}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-2 font-bold bg-slate-50/50">
                    Waktu Akses :
                  </td>
                  <td className="border border-black p-2">{item.waktu_akses}</td>
                </tr>
              </tbody>
            </table>

            {/* CHECKLIST RUANGAN */}
            <table className="w-full border-collapse border border-black mb-3 text-[11px]">
              <thead>
                <tr className="bg-slate-100">
                  <th colSpan={2} className="border border-black p-2 text-left font-bold text-[11px]">
                    Jenis akses ( beri tanda centang untuk pilihan yang sesuai ) :
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="w-1/2 border border-black p-2.5 align-top space-y-1.5">
                    {ruanganList.slice(0, 4).map((r) => (
                      <div key={r} className="flex items-center">
                        {renderSquareCheck(item.ruangan_terpilih?.includes(r))}
                        <span>{r}</span>
                      </div>
                    ))}
                  </td>
                  <td className="w-1/2 border border-black p-2.5 align-top space-y-1.5">
                    {ruanganList.slice(4).map((r) => (
                      <div key={r} className="flex items-center">
                        {renderSquareCheck(item.ruangan_terpilih?.includes(r))}
                        <span>{r}</span>
                      </div>
                    ))}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* KEPERLUAN DAN ALASAN */}
            <table className="w-full border-collapse border border-black mb-3 text-[11px]">
              <thead>
                <tr className="bg-slate-100">
                  <th colSpan={2} className="border border-black p-2 text-left font-bold text-[11px]">
                    Keperluan dan alasan pendaftaran/penutupan akses :
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="w-1/2 border border-black p-2.5 align-top space-y-1.5">
                    <div className="flex items-center">
                      {renderSquareCheck(item.keperluan_akses?.includes("Instansi"))}
                      <span>Instansi</span>
                    </div>
                    <div className="flex items-center">
                      {renderSquareCheck(item.keperluan_akses?.includes("Monitoring"))}
                      <span>Monitoring</span>
                    </div>
                  </td>
                  <td className="w-1/2 border border-black p-2.5 align-top space-y-1.5">
                    <div className="flex items-center">
                      {renderSquareCheck(item.keperluan_akses?.includes("Perawatan"))}
                      <span>Perawatan</span>
                    </div>
                    <div className="flex items-start">
                      {renderSquareCheck(item.keperluan_akses?.includes("Lainnya"))}
                      <span>
                        Lainnya : {item.keperluan_lainnya || "Pindah Tugas / Mutasi OPD lain"}
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* STATUS & CATATAN VERIFIKASI */}
            <table className="w-full border-collapse border border-black mb-4 text-[11px]">
              <tbody>
                <tr>
                  <td className="w-[20%] border border-black p-2 font-bold bg-slate-50/50">
                    Status Verifikasi
                  </td>
                  <td className="border border-black p-2">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        item.status_pengajuan === "Approved"
                          ? "bg-emerald-100 text-emerald-800"
                          : item.status_pengajuan === "Rejected"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {item.status_pengajuan}
                    </span>
                    {item.catatan_approval && (
                      <p className="mt-1 text-slate-600 italic text-[10px]">
                        Catatan Verifikator: {item.catatan_approval}
                      </p>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* 4 KOLOM TANDA TANGAN */}
            <table className="w-full border-collapse border border-black text-[10px] text-center mt-6">
              <thead>
                <tr className="bg-slate-100 font-bold">
                  <th className="border border-black p-2 w-1/4">Pemohon</th>
                  <th className="border border-black p-2 w-1/4">Atasan Langsung</th>
                  <th className="border border-black p-2 w-1/4">Pengelola Fasilitas / Keamanan</th>
                  <th className="border border-black p-2 w-1/4">Disetujui Oleh</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black p-2 h-24 align-bottom">
                    <p className="font-bold underline">{item.nama_pemohon}</p>
                    <p className="text-[9px] text-slate-600">NIP. {item.nip_pemohon || "-"}</p>
                  </td>
                  <td className="border border-black p-2 h-24 align-bottom">
                    <p className="font-bold underline">{item.nama_atasan || "................................"}</p>
                    <p className="text-[9px] text-slate-600">NIP. {item.nip_atasan || "................................"}</p>
                  </td>
                  <td className="border border-black p-2 h-24 align-bottom">
                    <p className="font-bold underline">{item.nama_verifikator || "Tim Keamanan SMKI"}</p>
                    <p className="text-[9px] text-slate-600">Verifikator Fasilitas</p>
                  </td>
                  <td className="border border-black p-2 h-24 align-bottom">
                    <p className="font-bold underline">Kepala Bidang APTIKA</p>
                    <p className="text-[9px] text-slate-600">Diskominfo Jawa Barat</p>
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="mt-4 text-[9px] text-slate-400 text-right">
              Dicetak melalui Sistem Portal Terpadu APTIKA Tools - Standard ISO 27001 SMKI
            </div>
          </div>
        </div>

        {/* Bottom Bar Actions */}
        <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 no-print">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Pastikan data dokumen telah terverifikasi sebelum dicetak atau ditandatangani.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold transition-colors"
            >
              Tutup Preview
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors shadow-sm"
            >
              <Printer size={15} />
              <span>Print / Cetak PDF</span>
            </button>
            <button
              onClick={handleDownloadWord}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all"
            >
              <Download size={15} />
              <span>Unduh File Asli Word (.docx)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
