"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getDirectImageUrl } from "@/lib/utils";
import { 
  Plus, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Edit, 
  Trash2, 
  FileText, 
  CheckSquare, 
  Image as ImageIcon 
} from "lucide-react";

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
    return new Intl.NumberFormat("id-ID", { 
      style: "currency", 
      currency: "IDR", 
      maximumFractionDigits: 0 
    }).format(angka);
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
          <p className="mt-1 text-sm text-gray-500">Kelola target kampanye donasi, foto Google Drive, dan progres dana pondok pesantren.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/donasi/verifikasi"
            className="inline-flex items-center gap-2 bg-white text-[#0a3822] border border-[#0a3822] px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm text-sm"
          >
            <CheckSquare className="w-4 h-4" />
            Verifikasi Donasi Masuk
          </Link>
          <Link
            href="/admin/donasi/tambah"
            className="inline-flex items-center gap-2 bg-[#0a3822] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#0a3822]/90 transition-colors shadow-sm text-sm"
          >
            <Plus className="w-4 h-4" />
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
            <p className="text-gray-500 text-sm mb-4">Buat program donasi pertama Anda (misal: Pembebasan Lahan atau Wakaf Masjid).</p>
            <Link
              href="/admin/donasi/tambah"
              className="inline-flex items-center gap-2 bg-[#0a3822] text-white px-4 py-2 rounded-lg font-medium text-sm"
            >
              <Plus className="w-4 h-4" /> Buat Program Sekarang
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                  <th className="py-4 px-5 font-semibold">Program</th>
                  <th className="py-4 px-4 font-semibold">Target Total</th>
                  <th className="py-4 px-4 font-semibold">Terkumpul (% Berjalan)</th>
                  <th className="py-4 px-4 font-semibold">Sisa Kebutuhan</th>
                  <th className="py-4 px-4 font-semibold text-center">Status</th>
                  <th className="py-4 px-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {campaigns.map((camp) => {
                  const target = camp.target_amount > 0 ? camp.target_amount : 0;
                  const current = camp.current_amount || 0;
                  const percentage = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
                  const remainingPercent = target > 0 ? Math.max(0, 100 - percentage) : 0;
                  const remainingAmount = target > 0 ? Math.max(0, target - current) : 0;
                  
                  // Periksa foto
                  const photoList = Array.isArray(camp.images) && camp.images.length > 0 
                    ? camp.images 
                    : camp.image_url 
                    ? [camp.image_url] 
                    : [];
                  const coverPhoto = photoList[0];

                  return (
                    <tr key={camp.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0 relative">
                            {coverPhoto ? (
                              <img
                                src={getDirectImageUrl(coverPhoto)}
                                alt={camp.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <ImageIcon className="w-6 h-6" />
                              </div>
                            )}
                            {photoList.length > 1 && (
                              <span className="absolute bottom-0 right-0 bg-black/70 text-white text-[9px] font-bold px-1 rounded-tl">
                                +{photoList.length - 1}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <p className="font-semibold text-gray-900 truncate" title={camp.title}>
                              {camp.title}
                            </p>
                            <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                              {camp.description || "Tidak ada deskripsi"}
                            </p>
                            <span className="text-[11px] text-gray-400">
                              {photoList.length} foto terlampir
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 font-medium text-gray-700">
                        {target > 0 ? (
                          formatRupiah(target)
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-normal">
                            Donasi Berkelanjutan
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1.5 min-w-[140px]">
                          <div className="flex items-baseline justify-between">
                            <span className="font-bold text-[#0a3822]">
                              {formatRupiah(current)}
                            </span>
                            {target > 0 && (
                              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                {percentage}%
                              </span>
                            )}
                          </div>
                          {target > 0 && (
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div 
                                className="bg-[#0a3822] h-full rounded-full transition-all duration-500" 
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        {target > 0 ? (
                          <div className="flex flex-col">
                            <span className="font-semibold text-amber-700">
                              {formatRupiah(remainingAmount)}
                            </span>
                            <span className="text-[11px] text-gray-500">
                              Kurang {remainingPercent}% lagi
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-center">
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

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/donasi/${camp.id}/edit`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Program & Foto"
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
