"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Loader2, CheckCircle, XCircle, Clock, Eye, Download } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function VerifikasiDonasiPage() {
  const supabase = createClient();
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProof, setSelectedProof] = useState<string | null>(null);

  const fetchDonations = async () => {
    setLoading(true);
    // Fetch donations and join with campaign title
    const { data, error } = await supabase
      .from("donations")
      .select(`
        *,
        campaign:campaign_id (title)
      `)
      .order("created_at", { ascending: false });
    
    if (data) setDonations(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(angka);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
  };

  const updateStatus = async (id: string, newStatus: string) => {
    if (newStatus === "verified") {
      if (!confirm("Terima donasi ini? Dana terkumpul pada program terkait akan otomatis bertambah.")) return;
    } else if (newStatus === "rejected") {
      if (!confirm("Tolak donasi ini?")) return;
    }

    const { error } = await supabase
      .from("donations")
      .update({ status: newStatus })
      .eq("id", id);
    
    if (error) {
      alert("Gagal memperbarui status: " + error.message);
    } else {
      fetchDonations();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase"><CheckCircle className="w-3 h-3"/> Diterima</span>;
      case "rejected":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase"><XCircle className="w-3 h-3"/> Ditolak</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold uppercase"><Clock className="w-3 h-3"/> Menunggu</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b border-gray-200 pb-5">
        <Link
          href="/admin/donasi"
          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Verifikasi Donasi</h1>
          <p className="text-sm text-gray-500">Periksa bukti transfer donatur yang masuk dan perbarui statusnya.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#0a3822]" />
          </div>
        ) : donations.length === 0 ? (
          <div className="text-center py-16 bg-gray-50">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Belum Ada Donasi Masuk</h3>
            <p className="text-gray-500 text-sm mb-4">Daftar konfirmasi transfer dari donatur akan muncul di sini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="py-4 px-6 text-sm font-semibold text-gray-600">Tanggal</th>
                  <th className="py-4 px-6 text-sm font-semibold text-gray-600">Donatur</th>
                  <th className="py-4 px-6 text-sm font-semibold text-gray-600">Program / Metode</th>
                  <th className="py-4 px-6 text-sm font-semibold text-gray-600">Nominal</th>
                  <th className="py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
                  <th className="py-4 px-6 text-sm font-semibold text-gray-600">Bukti</th>
                  <th className="py-4 px-6 text-sm font-semibold text-gray-600 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {donations.map((don) => (
                  <tr key={don.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {formatDate(don.created_at)}
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-bold text-gray-900">{don.donor_name}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-semibold text-gray-800 text-sm line-clamp-1">{don.campaign?.title || "Program Dihapus"}</p>
                      <p className="text-xs text-gray-500 uppercase mt-0.5">{don.payment_method}</p>
                    </td>
                    <td className="py-4 px-6 font-bold text-[#0a3822]">
                      {formatRupiah(don.amount)}
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(don.status)}
                    </td>
                    <td className="py-4 px-6">
                      {don.proof_url ? (
                        <button 
                          onClick={() => setSelectedProof(don.proof_url)}
                          className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          <Eye className="w-4 h-4" /> Lihat
                        </button>
                      ) : (
                        <span className="text-gray-400 text-sm italic">Tidak ada</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        {don.status === "pending" && (
                          <>
                            <button
                              onClick={() => updateStatus(don.id, "verified")}
                              className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-colors"
                            >
                              Terima
                            </button>
                            <button
                              onClick={() => updateStatus(don.id, "rejected")}
                              className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-bold rounded-lg hover:bg-red-200 transition-colors"
                            >
                              Tolak
                            </button>
                          </>
                        )}
                        {don.status !== "pending" && (
                          <button
                            onClick={() => updateStatus(don.id, "pending")}
                            className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            Batal
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Lightbox for Proof Image */}
      <AnimatePresence>
        {selectedProof && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setSelectedProof(null)}
          >
            <div className="relative max-w-2xl w-full flex flex-col items-center gap-4" onClick={e => e.stopPropagation()}>
              <img src={selectedProof} alt="Bukti Transfer" className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl bg-white" />
              <div className="flex gap-4">
                <a href={selectedProof} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                  <Download className="w-4 h-4" /> Buka Asli
                </a>
                <button onClick={() => setSelectedProof(null)} className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors">
                  Tutup
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
