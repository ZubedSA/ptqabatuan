"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getDirectImageUrl } from "@/lib/utils";
import { Plus, Edit, Trash2, Loader2, X, Upload } from "lucide-react";

export default function AdminStaffPage() {
  const [staffs, setStaffs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any | null>(null);
  
  // Form states
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  
  const supabase = createClient();

  const fetchStaffs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("staffs")
      .select("*")
      .order("name", { ascending: true });
    
    if (data) setStaffs(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchStaffs();
  }, []);

  const openAddModal = () => {
    setEditingStaff(null);
    setName("");
    setPosition("");
    setPhotoUrl("");
    setModalOpen(true);
  };

  const openEditModal = (staff: any) => {
    setEditingStaff(staff);
    setName(staff.name);
    setPosition(staff.position);
    setPhotoUrl(staff.photo || "");
    setModalOpen(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // 1. Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `staffs/${fileName}`;

      // 2. Upload file to supabase storage bucket (named "public" or "gallery" or create if needed)
      // We will try uploading to 'gallery' bucket which is commonly open, or 'public'
      const { error: uploadError, data } = await supabase.storage
        .from("galeri")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // 3. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("galeri")
        .getPublicUrl(filePath);

      setPhotoUrl(publicUrl);
    } catch (error: any) {
      alert("Gagal mengunggah foto: " + error.message + "\nSaran: Anda dapat mengisi kolom URL Foto secara manual.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !position) {
      alert("Nama dan Jabatan wajib diisi!");
      return;
    }

    const payload = {
      name,
      position,
      photo: photoUrl || null,
    };

    if (editingStaff) {
      // Update
      const { error } = await supabase
        .from("staffs")
        .update(payload)
        .eq("id", editingStaff.id);

      if (error) {
        alert("Gagal memperbarui data: " + error.message);
      } else {
        setModalOpen(false);
        fetchStaffs();
      }
    } else {
      // Create
      const { error } = await supabase
        .from("staffs")
        .insert([payload]);

      if (error) {
        alert("Gagal menambahkan data: " + error.message);
      } else {
        setModalOpen(false);
        fetchStaffs();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus pengurus ini?")) return;

    const { error } = await supabase.from("staffs").delete().eq("id", id);
    if (!error) {
      fetchStaffs();
    } else {
      alert("Gagal menghapus data: " + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Pengurus</h1>
          <p className="mt-1 text-sm text-gray-500">Kelola struktur kepengurusan dan Dewan Asatidz pondok pesantren.</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 bg-[#0a3822] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#0a3822]/90 transition-colors cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Tambah Pengurus
        </button>
      </div>

      {/* Table List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Foto</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Nama Lengkap</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Jabatan / Posisi</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Memuat data pengurus...
                  </td>
                </tr>
              ) : staffs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    Belum ada data pengurus. Klik "Tambah Pengurus" untuk menambahkan.
                  </td>
                </tr>
              ) : (
                staffs.map((staff) => (
                  <tr key={staff.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      {staff.photo ? (
                        <img
                          src={getDirectImageUrl(staff.photo)}
                          alt={staff.name}
                          className="h-10 w-10 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm border border-primary/20">
                          {staff.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{staff.name}</td>
                    <td className="px-6 py-4 text-gray-600">{staff.position}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(staff)}
                        className="inline-flex p-2 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(staff.id)}
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
                {editingStaff ? "Edit Data Pengurus" : "Tambah Pengurus Baru"}
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
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: KH. Ahmad Fauzi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Jabatan / Posisi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pengasuh, Sekretaris, Bendahara, Asatidz"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Foto Pengurus (Opsional)
                </label>
                <div className="space-y-3">
                  {/* File Upload Selector */}
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
                  {photoUrl && (
                    <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg border border-gray-100">
                      <img
                        src={getDirectImageUrl(photoUrl)}
                        alt="Preview"
                        className="h-12 w-12 rounded-full object-cover border border-gray-200"
                      />
                      <span className="text-xs text-gray-500 truncate flex-1">{photoUrl}</span>
                      <button
                        type="button"
                        onClick={() => setPhotoUrl("")}
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
                  className="px-5 py-2 bg-[#0a3822] text-white rounded-lg text-sm font-semibold hover:bg-[#0a3822]/90 cursor-pointer transition-colors"
                >
                  {editingStaff ? "Simpan Perubahan" : "Tambah Pengurus"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
