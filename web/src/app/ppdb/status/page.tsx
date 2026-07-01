"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { ArrowLeft, Search, Loader2, CheckCircle, Clock, XCircle, FileText } from "lucide-react";
import Link from "next/link";

export default function PPDBStatusPage() {
  const supabase = createClient();
  
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data, error: searchError } = await supabase
        .from("ppdb")
        .select("*")
        .eq("phone", phone)
        .order("created_at", { ascending: false });

      if (searchError) throw searchError;

      if (!data || data.length === 0) {
        setError("Data pendaftaran tidak ditemukan. Pastikan nomor WhatsApp yang dimasukkan benar.");
      } else {
        setResult(data);
      }
    } catch (err: any) {
      console.error("Error fetching PPDB status:", err);
      setError(err.message || "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4" /> Diterima / Terverifikasi
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-red-100 text-red-800">
            <XCircle className="w-4 h-4" /> Ditolak / Tidak Lengkap
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">
            <Clock className="w-4 h-4" /> Menunggu Verifikasi
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        
        <Link href="/ppdb" className="inline-flex items-center gap-2 text-gray-600 hover:text-[#0B3B24] mb-8 font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden mb-8">
          <div className="bg-[#0B3B24] p-8 md:p-10 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]" />
            <div className="relative z-10 text-center">
              <h1 className="text-3xl font-bold text-white mb-2">Cek Status Pendaftaran</h1>
              <p className="text-gray-300">Masukkan nomor WhatsApp yang Anda gunakan saat mendaftar.</p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="p-8 md:p-10">
            <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="flex-1 px-5 py-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                placeholder="Contoh: 081234567890"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-4 bg-[#0B3B24] hover:bg-[#0B3B24]/90 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#0B3B24]/20 disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Cek Status
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-medium text-center max-w-xl mx-auto">
                {error}
              </div>
            )}
          </form>
        </div>

        {result && result.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 mb-6"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-gray-100 dark:border-gray-700 pb-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">
                  Tanggal Daftar: {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{item.full_name}</h3>
              </div>
              <div>
                {getStatusBadge(item.status)}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Nama Orang Tua / Wali</p>
                  <p className="font-medium text-gray-900 dark:text-white">{item.parent_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Nomor WhatsApp</p>
                  <p className="font-medium text-gray-900 dark:text-white">{item.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Alamat</p>
                  <p className="font-medium text-gray-900 dark:text-white">{item.address}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-3">Berkas yang Diunggah</p>
                {item.documents && Object.keys(item.documents).length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {Object.entries(item.documents).map(([key, url]) => (
                      <a
                        key={key}
                        href={url as string}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-[#0B3B24] dark:hover:border-[#0B3B24] transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-[#0B3B24]/10 group-hover:text-[#0B3B24] transition-colors">
                          <FileText className="w-4 h-4 text-gray-500 group-hover:text-[#0B3B24]" />
                        </div>
                        <span className="font-medium text-sm text-gray-700 dark:text-gray-300 capitalize">{key.replace('_', ' ')}</span>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm font-medium text-gray-500 italic">Tidak ada berkas yang diunggah.</p>
                )}
              </div>
            </div>

            {item.status === 'rejected' && (
              <div className="mt-8 p-4 bg-red-50 border border-red-100 rounded-xl">
                <h4 className="text-sm font-bold text-red-800 mb-1">Pendaftaran Ditolak</h4>
                <p className="text-sm text-red-700">Mohon maaf, pendaftaran Anda tidak dapat kami proses lebih lanjut. Jika ini adalah kesalahan, silakan hubungi panitia PPDB kami.</p>
              </div>
            )}

            {item.status === 'verified' && (
              <div className="mt-8 p-4 bg-green-50 border border-green-100 rounded-xl">
                <h4 className="text-sm font-bold text-green-800 mb-1">Selamat!</h4>
                <p className="text-sm text-green-700">Pendaftaran Anda telah diverifikasi dan diterima. Silakan menunggu informasi lebih lanjut mengenai jadwal tes atau masuk pondok melalui WhatsApp yang terdaftar.</p>
              </div>
            )}

          </motion.div>
        ))}

      </div>
    </div>
  );
}
