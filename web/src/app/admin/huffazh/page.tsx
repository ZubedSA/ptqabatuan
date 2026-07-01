"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getDirectImageUrl } from "@/lib/utils";
import { uploadToGDrive, deleteFromGDrive } from "@/lib/upload";
import { Plus, Edit, Trash2, Loader2, X, Upload, Award } from "lucide-react";

export default function AdminHuffazhPage() {
  const [huffazh, setHuffazh] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSantri, setEditingSantri] = useState<any | null>(null);
  
  // Form states
  const [name, setName] = useState("");
  const [classOrStatus, setClassOrStatus] = useState("");
  const [category, setCategory] = useState("Kategori Pertama");
  const [memorizedJuz, setMemorizedJuz] = useState<number>(30);
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  
  const supabase = createClient();

  const getCategoryPriority = (catName: string): number => {
    const name = (catName || "").toLowerCase().trim();
    if (name.includes("pertama") || name.includes("kesatu") || name.endsWith(" i") || name === "i") return 1;
    if (name.includes("kedua") || name.endsWith(" ii") || name === "ii") return 2;
    if (name.includes("ketiga") || name.endsWith(" iii") || name === "iii") return 3;
    if (name.includes("keempat") || name.endsWith(" iv") || name === "iv") return 4;
    if (name.includes("kelima") || name.endsWith(" v") || name === "v") return 5;
    if (name.includes("keenam") || name.endsWith(" vi") || name === "vi") return 6;
    if (name.includes("ketujuh") || name.endsWith(" vii") || name === "vii") return 7;
    if (name.includes("kedelapan") || name.endsWith(" viii") || name === "viii") return 8;
    if (name.includes("kesembilan") || name.endsWith(" ix") || name === "ix") return 9;
    if (name.includes("kesepuluh") || name.endsWith(" x") || name === "x") return 10;
    
    const numMatch = name.match(/\d+/);
    if (numMatch) return parseInt(numMatch[0], 10);
    
    return 100;
  };

  const fetchHuffazh = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("huffazh")
      .select("*");
    
    if (data) {
      // Sort on client side to respect "Pertama", "Kedua", etc.
      const sortedData = [...data].sort((a, b) => {
        const catA = a.category || "Kategori Pertama";
        const catB = b.category || "Kategori Pertama";
        const prioA = getCategoryPriority(catA);
        const prioB = getCategoryPriority(catB);
        if (prioA !== prioB) return prioA - prioB;
        if (catA !== catB) return catA.localeCompare(catB);
        
        // Then by memorized_juz descending
        if (b.memorized_juz !== a.memorized_juz) return b.memorized_juz - a.memorized_juz;
        
        // Then by name ascending
        return a.name.localeCompare(b.name);
      });
      setHuffazh(sortedData);
    }
    setLoading(false);
  };

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string>("");
  const [originalPhoto, setOriginalPhoto] = useState<string>("");

  useEffect(() => {
    fetchHuffazh();
  }, []);

  const openAddModal = () => {
    setEditingSantri(null);
    setName("");
    setClassOrStatus("");
    setCategory("Kategori Pertama");
    setMemorizedJuz(30);
    setPhotoUrl("");
    setSelectedFile(null);
    setLocalPreview("");
    setOriginalPhoto("");
    setModalOpen(true);
  };

  const openEditModal = (santri: any) => {
    setEditingSantri(santri);
    setName(santri.name);
    setClassOrStatus(santri.class_or_status);
    setCategory(santri.category || "Kategori Pertama");
    setMemorizedJuz(santri.memorized_juz);
    setPhotoUrl(santri.photo || "");
    setSelectedFile(null);
    setLocalPreview("");
    setOriginalPhoto(santri.photo || "");
    setModalOpen(true);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    if (localPreview) {
      URL.revokeObjectURL(localPreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setLocalPreview(previewUrl);
    setPhotoUrl(file.name);
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    if (localPreview) {
      URL.revokeObjectURL(localPreview);
      setLocalPreview("");
    }
    setPhotoUrl("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !classOrStatus || !category) {
      alert("Nama, Kelas/Status, dan Kategori wajib diisi!");
      return;
    }

    if (memorizedJuz < 1 || memorizedJuz > 30) {
      alert("Jumlah juz harus di antara 1 dan 30!");
      return;
    }

    setUploading(true);

    let finalPhoto = photoUrl;

    // 1. Upload new photo if selected
    if (selectedFile) {
      try {
        const { url } = await uploadToGDrive(selectedFile, "huffazh");
        finalPhoto = url;

        // Hapus foto lama jika merupakan URL Google Drive
        if (originalPhoto && originalPhoto.includes("drive.google.com")) {
          await deleteFromGDrive(originalPhoto);
        }
      } catch (error: any) {
        alert("Gagal mengunggah foto ke Google Drive: " + error.message);
        setUploading(false);
        return;
      }
    } else if (photoUrl === "" && originalPhoto) {
      // Jika user menghapus foto yang sebelumnya ada
      if (originalPhoto.includes("drive.google.com")) {
        await deleteFromGDrive(originalPhoto);
      }
      finalPhoto = "";
    }

    const payload = {
      name,
      class_or_status: classOrStatus,
      category,
      memorized_juz: Number(memorizedJuz),
      photo: finalPhoto || null,
    };

    if (editingSantri) {
      // Update
      const { error } = await supabase
        .from("huffazh")
        .update(payload)
        .eq("id", editingSantri.id);

      setUploading(false);

      if (error) {
        alert("Gagal memperbarui data: " + error.message);
      } else {
        if (localPreview) {
          URL.revokeObjectURL(localPreview);
        }
        setModalOpen(false);
        fetchHuffazh();
      }
    } else {
      // Create
      const { error } = await supabase
        .from("huffazh")
        .insert([payload]);

      setUploading(false);

      if (error) {
        alert("Gagal menambahkan data: " + error.message);
      } else {
        if (localPreview) {
          URL.revokeObjectURL(localPreview);
        }
        setModalOpen(false);
        fetchHuffazh();
      }
    }
  };

  const handleDelete = async (id: string, photoUrl: string) => {
    if (!confirm("Yakin ingin menghapus data santri huffazh ini?")) return;

    // Delete from Google Drive if it is a Drive URL
    if (photoUrl && photoUrl.includes("drive.google.com")) {
      await deleteFromGDrive(photoUrl);
    }

    const { error } = await supabase.from("huffazh").delete().eq("id", id);
    if (!error) {
      fetchHuffazh();
    } else {
      alert("Gagal menghapus data: " + error.message);
    }
  };

  // Get all unique categories from the database + default options
  const defaultCategories = ["Kategori Pertama", "Kategori Kedua", "Kategori Ketiga", "Kategori Keempat", "Kategori Kelima"];
  const existingCategories = Array.from(new Set(huffazh.map((s) => s.category).filter(Boolean)));
  const allCategories = Array.from(new Set([...defaultCategories, ...existingCategories]));
  const isCustomCategory = category && !allCategories.includes(category);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Huffazh</h1>
          <p className="mt-1 text-sm text-gray-500">Kelola data hafalan Al-Qur'an santri PTQA Batuan.</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 bg-[#0a3822] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#0a3822]/90 transition-colors cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Tambah Santri Huffazh
        </button>
      </div>

      {/* Table List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Foto</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Nama Santri</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Kategori</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Kelas / Asal</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Jumlah Hafalan</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Memuat data santri...
                  </td>
                </tr>
              ) : huffazh.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Belum ada data huffazh santri. Klik "Tambah Santri Huffazh" untuk menambahkan.
                  </td>
                </tr>
              ) : (
                huffazh.map((santri) => (
                  <tr key={santri.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      {santri.photo ? (
                        <img
                          src={getDirectImageUrl(santri.photo)}
                          alt={santri.name}
                          className="h-10 w-10 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] font-bold flex items-center justify-center text-sm border border-[#D4AF37]/20">
                          {santri.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{santri.name}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#D4AF37]/10 text-[#0B3B24] border border-[#D4AF37]/25">
                        {santri.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{santri.class_or_status}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-semibold text-primary">
                        <Award className="w-4 h-4 text-[#D4AF37]" />
                        <span>{santri.memorized_juz} Juz</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(santri)}
                        className="inline-flex p-2 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(santri.id, santri.photo)}
                        className="inline-flex p-2 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
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

      {/* Modal Dialog Form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {editingSantri ? "Edit Data Santri Huffazh" : "Tambah Santri Huffazh Baru"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Nama Santri *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Muhammad Ali"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Kategori *
                </label>
                <div className="space-y-2">
                  <select
                    value={isCustomCategory ? "custom" : category}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "custom") {
                        setCategory("");
                      } else {
                        setCategory(val);
                      }
                    }}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-gray-900"
                  >
                    {allCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="custom">+ Kategori Kustom / Baru...</option>
                  </select>

                  {(isCustomCategory || category === "" || !allCategories.includes(category)) && (
                    <input
                      type="text"
                      required
                      placeholder="Masukkan kategori baru (misal: Kategori Keenam)"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary mt-2 text-gray-900"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Kelas / Asal Daerah *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kelas VII-A / Sumenep"
                  value={classOrStatus}
                  onChange={(e) => setClassOrStatus(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Jumlah Juz yang Dihafal * (1-30)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="30"
                  placeholder="Contoh: 30"
                  value={memorizedJuz}
                  onChange={(e) => setMemorizedJuz(Number(e.target.value))}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Foto Santri (Opsional)
                </label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Masukkan URL Foto atau unggah file"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      className="flex-1 px-3.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                    <label className="flex items-center justify-center px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 cursor-pointer transition-colors text-gray-600 gap-1 shrink-0">
                      <Upload className="w-4 h-4" />
                      <span>{uploading ? "..." : "Unggah"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {(localPreview || photoUrl) && (
                    <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg border border-gray-100">
                      <img
                        src={localPreview || getDirectImageUrl(photoUrl)}
                        alt="Preview"
                        className="h-12 w-12 rounded-full object-cover border border-gray-200"
                      />
                      <span className="text-xs text-gray-500 truncate flex-1">{photoUrl}</span>
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="text-red-500 hover:text-red-600 text-xs font-semibold px-2 py-1"
                      >
                        Hapus
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-[#0a3822] text-white rounded-lg text-sm font-semibold hover:bg-[#0a3822]/90 cursor-pointer transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingSantri ? "Simpan Perubahan" : "Tambah Santri"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
