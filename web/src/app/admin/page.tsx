"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    ppdbCount: 0,
    articlesCount: 0,
    totalDonations: 0,
    messagesCount: 0,
  });
  const [recentApplicants, setRecentApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        let ppdbCount = 0;
        try {
          const { count, error } = await supabase.from("ppdb").select("*", { count: "exact", head: true });
          if (!error && count !== null) ppdbCount = count;
        } catch (e) {
          console.error("PPDB count error:", e);
        }

        let articlesCount = 0;
        try {
          const { count, error } = await supabase.from("articles").select("*", { count: "exact", head: true });
          if (!error && count !== null) articlesCount = count;
        } catch (e) {
          console.error("Articles count error:", e);
        }

        let totalDonations = 0;
        try {
          const { data, error } = await supabase.from("donations").select("amount").eq("status", "verified");
          if (!error && data) {
            totalDonations = data.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
          }
        } catch (e) {
          console.error("Donations sum error:", e);
        }

        let messagesCount = 0;
        try {
          const { count, error } = await supabase.from("contact_messages").select("*", { count: "exact", head: true });
          if (!error && count !== null) messagesCount = count;
        } catch (e) {
          console.error("Messages count error:", e);
        }

        setStats({ ppdbCount, articlesCount, totalDonations, messagesCount });

        try {
          const { data, error } = await supabase
            .from("ppdb")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(5);
          if (!error && data) {
            setRecentApplicants(data);
          }
        } catch (e) {
          console.error("Recent PPDB error:", e);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID").format(num);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const statItems = [
    { name: "Pendaftar PPDB", stat: stats.ppdbCount.toString(), bg: "from-[#0B3B24] to-[#072718]", text: "text-white" },
    { name: "Artikel Aktif", stat: stats.articlesCount.toString(), bg: "from-white to-gray-50/50", text: "text-gray-900" },
    { name: "Total Donasi (Rp)", stat: formatRupiah(stats.totalDonations), bg: "from-white to-gray-50/50", text: "text-gray-900" },
    { name: "Pesan Masuk", stat: stats.messagesCount.toString(), bg: "from-white to-gray-50/50", text: "text-gray-900" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0B3B24] font-sans">Selamat Datang di Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Ringkasan data dan aktivitas Pondok Pesantren Tahfizh Qur'an Al-Usymuni.</p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statItems.map((item, idx) => (
          <div 
            key={item.name} 
            className={`overflow-hidden rounded-2xl bg-gradient-to-br ${item.bg} p-6 border ${idx === 0 ? "border-[#D4AF37]/30" : "border-gray-150"} shadow-[0_4px_15px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(11,59,36,0.08)] transition-all duration-300 group`}
          >
            <span className={`text-xs font-semibold uppercase tracking-wider ${idx === 0 ? "text-[#D4AF37]" : "text-gray-400"}`}>
              {item.name}
            </span>
            <div className={`mt-3 text-3.5xl font-bold tracking-tight ${item.text} leading-none`}>
              {loading ? <Loader2 className="w-7 h-7 animate-spin my-1 opacity-70" /> : item.stat}
            </div>
            {idx === 0 && (
              <div className="mt-4 text-[11px] text-white/60 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-ping" />
                <span>PPDB Sedang Berlangsung</span>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Recent PPDB Applicants */}
      <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-gray-150 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#0B3B24]">Pendaftaran PPDB Terbaru</h2>
          <span className="text-xs text-gray-500 font-medium">Santri Baru 2026/2027</span>
        </div>
        
        {loading ? (
          <div className="text-center py-16 text-gray-500 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#0B3B24]" />
            <span className="text-sm">Memuat data pendaftar...</span>
          </div>
        ) : recentApplicants.length === 0 ? (
          <div className="text-center py-16 text-gray-400 font-medium">
            <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3 border border-gray-100">
              <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <span>Belum ada data pendaftar baru masuk hari ini</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Nama Santri</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Nama Wali</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">No. Telp</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentApplicants.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                      {item.full_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.parent_name || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                      {item.phone || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                        {item.status || "Baru"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
