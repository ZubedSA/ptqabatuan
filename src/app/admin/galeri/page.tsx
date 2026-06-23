"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2, Loader2, Image as ImageIcon } from "lucide-react";

export default function AdminGaleriPage() {
  const [gallery, setGallery] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchGallery = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("gallery")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) setGallery(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleDelete = async (id: string, imageUrl: string) => {
    if (!confirm("Yakin ingin menghapus foto ini?")) return;
    
    // 1. Delete from storage if it's hosted on our Supabase bucket
    if (imageUrl.includes("supabase.co") && imageUrl.includes("/galeri/")) {
      const filePath = imageUrl.split("/galeri/")[1];
      if (filePath) {
        await supabase.storage.from("galeri").remove([filePath]);
      }
    }

    // 2. Delete from database
    const { error } = await supabase.from("gallery").delete().eq("id", id);
    if (!error) {
      fetchGallery();
    } else {
      alert("Gagal menghapus foto: " + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Galeri</h1>
          <p className="mt-1 text-sm text-gray-500">Kelola foto kegiatan dan fasilitas pondok.</p>
        </div>
        <Link
          href="/admin/galeri/tambah"
          className="inline-flex items-center gap-2 bg-[#0a3822] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#0a3822]/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Tambah Foto
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#0a3822] mb-4" />
            <p className="text-gray-500">Memuat data galeri...</p>
          </div>
        ) : gallery.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Belum Ada Foto</h3>
            <p className="text-gray-500 text-sm mb-4">Galeri masih kosong. Mulai tambahkan foto kegiatan atau fasilitas.</p>
            <Link
              href="/admin/galeri/tambah"
              className="inline-flex items-center gap-2 bg-white text-[#0a3822] border border-[#0a3822] px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Upload Foto Pertama
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {gallery.map((item) => (
              <div key={item.id} className="group relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
                <div className="aspect-square w-full relative overflow-hidden bg-gray-100">
                  <img 
                    src={item.image_url} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <button
                    onClick={() => handleDelete(item.id, item.image_url)}
                    className="absolute top-2 right-2 p-2 bg-white/90 text-red-600 hover:bg-red-600 hover:text-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-3 flex flex-col flex-1">
                  <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase tracking-wider w-fit mb-1">
                    {item.category}
                  </span>
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight">
                    {item.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
