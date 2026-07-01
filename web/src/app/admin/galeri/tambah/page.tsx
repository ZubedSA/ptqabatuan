"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getDirectImageUrl } from "@/lib/utils";
import { uploadToGDrive } from "@/lib/upload";
import { ArrowLeft, Save, Loader2, Upload, ImageIcon } from "lucide-react";

export default function TambahGaleriPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [existingCategories, setExistingCategories] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string>("");

  const [formData, setFormData] = useState({
    title: "",
    image_url: "",
    category: "Fasilitas",
  });

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from("gallery").select("category");
      if (data) {
        const uniqueCats = Array.from(new Set(data.map(d => d.category).filter(Boolean)));
        setExistingCategories(uniqueCats);
      }
    };
    fetchCategories();
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    if (localPreview) {
      URL.revokeObjectURL(localPreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setLocalPreview(previewUrl);
    setFormData({ ...formData, image_url: file.name });
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    if (localPreview) {
      URL.revokeObjectURL(localPreview);
      setLocalPreview("");
    }
    setFormData({ ...formData, image_url: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile && !formData.image_url) {
      alert("Mohon unggah gambar terlebih dahulu!");
      return;
    }

    setLoading(true);

    let finalImageUrl = formData.image_url;

    if (selectedFile) {
      setUploading(true);
      try {
        const { url } = await uploadToGDrive(selectedFile, "galeri");
        finalImageUrl = url;
      } catch (error: any) {
        alert("Gagal mengunggah gambar ke Google Drive: " + error.message);
        setLoading(false);
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    }

    const payload = {
      ...formData,
      image_url: finalImageUrl
    };

    const { error } = await supabase.from("gallery").insert([payload]);

    if (error) {
      alert("Gagal menyimpan foto: " + error.message);
      setLoading(false);
    } else {
      if (localPreview) {
        URL.revokeObjectURL(localPreview);
      }
      router.push("/admin/galeri");
      router.refresh();
    }
  };

  const defaultCategories = ["Fasilitas", "Kegiatan Santri", "Prestasi", "Haflah", "Kunjungan"];
  const allCategories = Array.from(new Set([...defaultCategories, ...existingCategories]));
  const isCustomCategory = formData.category && !allCategories.includes(formData.category);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/galeri"
          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Upload Foto Baru</h1>
          <p className="text-sm text-gray-500">Tambahkan foto ke galeri pondok pesantren.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
        
        {/* Upload Area */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Foto</label>
            
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Masukkan URL Foto (Google Drive) atau unggah file..."
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0a3822] focus:border-[#0a3822] outline-none transition-all"
              />
              <label className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 cursor-pointer transition-colors text-gray-700 gap-2 shrink-0">
                <Upload className="w-4 h-4" />
                <span>{uploading ? "Mengunggah..." : "Unggah File"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>

            {(localPreview || formData.image_url) && (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-2 flex flex-col items-center justify-center bg-gray-50 relative overflow-hidden group h-64 mt-4">
                <img src={localPreview || getDirectImageUrl(formData.image_url)} alt="Preview" className="w-full h-full object-contain" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <button type="button" onClick={handleRemovePhoto} className="text-white text-sm font-medium hover:underline cursor-pointer">Hapus Foto</button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Judul Foto / Keterangan Singkat</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0a3822] focus:border-[#0a3822] outline-none transition-all"
              placeholder="Contoh: Gedung Asrama Putra"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Kategori</label>
            <div className="space-y-2">
              <select
                value={isCustomCategory ? "custom" : formData.category}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "custom") {
                    setFormData({ ...formData, category: "" });
                  } else {
                    setFormData({ ...formData, category: val });
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0a3822] focus:border-[#0a3822] outline-none transition-all bg-white text-gray-900"
              >
                {allCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="custom">+ Kategori Kustom / Baru...</option>
              </select>

              {(isCustomCategory || formData.category === "" || !allCategories.includes(formData.category)) && (
                <input
                  type="text"
                  required
                  placeholder="Ketik kategori baru..."
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0a3822] focus:border-[#0a3822] outline-none transition-all"
                />
              )}
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-4 border-t border-gray-100">
          <Link
            href="/admin/galeri"
            className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={loading || uploading || (!selectedFile && !formData.image_url)}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-[#0a3822] rounded-lg hover:bg-[#0a3822]/90 focus:ring-2 focus:ring-offset-2 focus:ring-[#0a3822] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan Foto
          </button>
        </div>
      </form>
    </div>
  );
}
