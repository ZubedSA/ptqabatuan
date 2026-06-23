"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Plus, CheckCircle, XCircle, Loader2, Edit, Trash2, FileText, CheckSquare } from "lucide-react";

export default function AdminDonasiPage() {
  const supabase = createClient();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("donation_campaigns")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) setCampaigns(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(angka);
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    await supabase.from("donation_campaigns").update({ is_active: !currentStatus }).eq("id", id);
    fetchCampaigns();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus program donasi ini? Semua riwayat donasinya juga akan terhapus!")) return;
    await supabase.from("donation_campaigns").delete().eq("id", id);
    fetchCampaigns();
  };

  return (
    <div className="space-y-6">
      {/* Header & Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Program Donasi & Wakaf</h1>
          <p className="mt-1 text-sm text-gray-500">Kelola target kampanye donasi pondok pesantren.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/donasi/verifikasi"
            className="inline-flex items-center gap-2 bg-white text-[#0a3822] border border-[#0a3822] px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            <CheckSquare className="w-5 h-5" />
            Verifikasi Bukti Transfer
          </Link>
          <Link
            href="/admin/donasi/tambah"
            className="inline-flex items-center gap-2 bg-[#0a3822] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#0a3822]/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Buat Program Baru
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#0a3822]" />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-16 bg-gray-50">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Belum Ada Program</h3>
            <p className="text-gray-500 text-sm mb-4">Buat program donasi pertama Anda (misal: Pembangunan Masjid).</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="py-4 px-6 text-sm font-semibold text-gray-600">Nama Program</th>
                  <th className="py-4 px-6 text-sm font-semibold text-gray-600">Target Dana</th>
                  <th className="py-4 px-6 text-sm font-semibold text-gray-600">Terkumpul</th>
                  <th className="py-4 px-6 text-sm font-semibold text-gray-600 text-center">Status</th>
                  <th className="py-4 px-6 text-sm font-semibold text-gray-600 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {campaigns.map((camp) => {
                  const percentage = camp.target_amount > 0 ? Math.min(100, Math.round((camp.current_amount / camp.target_amount) * 100)) : 0;
                  return (
                    <tr key={camp.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <p className="font-semibold text-gray-900 line-clamp-1">{camp.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{camp.description}</p>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 font-medium">
                        {camp.target_amount > 0 ? formatRupiah(camp.target_amount) : "Tanpa Target"}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-bold text-[#0a3822]">
                            {formatRupiah(camp.current_amount)}
                          </span>
                          {camp.target_amount > 0 && (
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                              <div className="bg-[#D4AF37] h-1.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button 
                          onClick={() => toggleStatus(camp.id, camp.is_active)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide transition-colors ${
                            camp.is_active ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {camp.is_active ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          {camp.is_active ? "Aktif" : "Ditutup"}
                        </button>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/donasi/${camp.id}/edit`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Program"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(camp.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus Program"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
