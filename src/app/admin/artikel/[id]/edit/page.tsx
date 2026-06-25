"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getDirectImageUrl } from "@/lib/utils";
import { ArrowLeft, Save, Loader2, Upload } from "lucide-react";

export default function EditArtikelPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const supabase = createClient();
  const unwrappedParams = use(params);
  const articleId = unwrappedParams.id;
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [existingCategories, setExistingCategories] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    thumbnail: "",
    category: "Berita",
    is_published: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      // Fetch Article
      const { data: article } = await supabase
        .from("articles")
        .select("*")
        .eq("id", articleId)
        .single();
        
      if (article) {
        setFormData({
          title: article.title || "",
          slug: article.slug || "",
          excerpt: article.excerpt || "",
          content: article.content || "",
          thumbnail: article.thumbnail || "",
          category: article.category || "Berita",
          is_published: article.is_published,
        });
      }

      // Fetch Categories
      const { data: cats } = await supabase.from("articles").select("category");
      if (cats) {
        const uniqueCats = Array.from(new Set(cats.map(d => d.category).filter(Boolean)));
        setExistingCategories(uniqueCats);
      }
      
      setFetching(false);
    };
    
    if (articleId) {
      fetchData();
    }
  }, [articleId]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    setFormData({ ...formData, title, slug });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `articles/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("galeri")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("galeri")
        .getPublicUrl(filePath);

      setFormData({ ...formData, thumbnail: publicUrl });
    } catch (error: any) {
      alert("Gagal mengunggah gambar: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from("articles")
      .update(formData)
      .eq("id", articleId);

    if (error) {
      alert("Gagal memperbarui artikel: " + error.message);
      setLoading(false);
    } else {
      router.push("/admin/artikel");
      router.refresh();
    }
  };

  const defaultCategories = ["Berita", "Prestasi", "Pengumuman", "Kajian", "Tajwid", "Hadits"];
  const allCategories = Array.from(new Set([...defaultCategories, ...existingCategories]));
  const isCustomCategory = formData.category && !allCategories.includes(formData.category);

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin text-[#0a3822] mb-4" />
        <p>Memuat data artikel...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/artikel"
          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Artikel</h1>
          <p className="text-sm text-gray-500">Perbarui informasi dan konten artikel.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Judul Artikel</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={handleTitleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0a3822] focus:border-[#0a3822] outline-none transition-all"
              placeholder="Masukkan judul artikel..."
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Slug (URL)</label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#0a3822] focus:border-[#0a3822] outline-none transition-all text-gray-600"
              placeholder="judul-artikel-otomatis"
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

          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Gambar Cover (Thumbnail)</label>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="URL Gambar atau unggah file..."
                    value={formData.thumbnail}
                    onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0a3822] focus:border-[#0a3822] outline-none transition-all"
                  />
                  <label className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 cursor-pointer transition-colors text-gray-700 gap-2 shrink-0">
                    <Upload className="w-4 h-4" />
                    <span>{uploading ? "Mengunggah..." : "Unggah"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              {formData.thumbnail && (
                <div className="h-24 w-32 shrink-0 rounded-lg overflow-hidden border border-gray-200 shadow-sm relative group">
                  <img src={getDirectImageUrl(formData.thumbnail)} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button type="button" onClick={() => setFormData({ ...formData, thumbnail: "" })} className="text-white text-xs font-medium hover:underline">Hapus</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Ringkasan Pendek (Excerpt)</label>
            <textarea
              rows={2}
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0a3822] focus:border-[#0a3822] outline-none transition-all resize-y"
              placeholder="Tulis ringkasan singkat untuk ditampilkan di kartu artikel..."
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Konten Artikel (Mendukung format paragraf biasa)</label>
            <textarea
              required
              rows={12}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0a3822] focus:border-[#0a3822] outline-none transition-all resize-y font-serif leading-relaxed"
              placeholder="Tulis isi artikel selengkapnya di sini..."
            />
          </div>

          <div className="md:col-span-2 flex items-center gap-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
            <input
              type="checkbox"
              id="is_published"
              checked={formData.is_published}
              onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
              className="w-5 h-5 text-[#0a3822] border-gray-300 rounded focus:ring-[#0a3822]"
            />
            <label htmlFor="is_published" className="text-sm font-medium text-gray-700 cursor-pointer">
              Publikasikan (Akan tampil di website publik)
            </label>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-4 border-t border-gray-100">
          <Link
            href="/admin/artikel"
            className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-[#0a3822] rounded-lg hover:bg-[#0a3822]/90 focus:ring-2 focus:ring-offset-2 focus:ring-[#0a3822] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  );
}
