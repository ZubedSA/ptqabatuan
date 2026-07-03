"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getDirectImageUrl } from "@/lib/utils";
import { deleteFromGDrive } from "@/lib/upload";
import { Plus, Edit, Trash2, Loader2, ExternalLink } from "lucide-react";

export default function AdminBeritaPage() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchNews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("news")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) setNews(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleDelete = async (id: string, thumbnail: string) => {
    if (!confirm("Yakin ingin menghapus berita ini?")) return;
    
    // Delete from Google Drive if it is a Drive URL
    if (thumbnail && thumbnail.includes("drive.google.com")) {
      await deleteFromGDrive(thumbnail);
    }
    
    const { error } = await supabase.from("news").delete().eq("id", id);
    if (!error) {
      fetchNews();
    } else {
      alert("Gagal menghapus berita: " + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Berita</h1>
          <p className="mt-1 text-sm text-gray-500">Kelola berita dan pengumuman pondok pesantren.</p>
        </div>
        <Link
          href="/admin/berita/tambah"
          className="inline-flex items-center gap-2 bg-[#0a3822] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#0a3822]/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Tambah Berita
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Gambar</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Judul Berita</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Kategori</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Tanggal</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Memuat data...
                  </td>
                </tr>
              ) : news.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Belum ada berita. Klik "Tambah Berita" untuk membuat baru.
                  </td>
                </tr>
              ) : (
                news.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      {item.thumbnail ? (
                        <img 
                          src={getDirectImageUrl(item.thumbnail)} 
                          alt={item.title} 
                          className="w-16 h-12 object-cover rounded shadow-sm border border-gray-200"
                        />
                      ) : (
                        <div className="w-16 h-12 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-gray-400 text-xs">
                          No Img
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-500">/{item.slug}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {item.is_published ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Dipublikasikan
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(item.created_at).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        href={`/admin/berita/${item.id}/edit`}
                        className="inline-flex p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(item.id, item.thumbnail)}
                        className="inline-flex p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
