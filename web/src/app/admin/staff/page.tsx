"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getDirectImageUrl } from "@/lib/utils";
import { uploadToGDrive, deleteFromGDrive } from "@/lib/upload";
import { Plus, Edit, Trash2, Loader2, X, Upload, Layers, ArrowUp, ArrowDown } from "lucide-react";

export default function AdminStaffPage() {
  const [staffs, setStaffs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any | null>(null);

  // Roles states
  const [roles, setRoles] = useState<any[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");

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

  const fetchRoles = async () => {
    setLoadingRoles(true);
    const { data } = await supabase
      .from("staff_roles")
      .select("*")
      .order("priority", { ascending: true });
    if (data) setRoles(data);
    setLoadingRoles(false);
  };

  const handleAddRole = async () => {
    if (!newRoleName.trim()) return;
    const maxPriority = roles.length > 0 ? Math.max(...roles.map(r => r.priority || 0)) : 0;
    const { error } = await supabase.from("staff_roles").insert([{
      name: newRoleName.trim(),
      priority: maxPriority + 1
    }]);
    if (!error) {
      setNewRoleName("");
      fetchRoles();
    } else {
      alert("Gagal menambahkan peran: " + error.message);
    }
  };

  const handleUpdateRoleName = (id: string, newName: string) => {
    setRoles(roles.map(r => r.id === id ? { ...r, name: newName } : r));
  };

  const handleSaveRoleName = async (id: string, name: string) => {
    if (!name.trim()) return;
    await supabase.from("staff_roles").update({ name: name.trim() }).eq("id", id);
    fetchRoles();
  };

  const handleMoveRole = async (index: number, direction: 'up' | 'down') => {
    const newRoles = [...roles];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newRoles.length) return;
    
    const currentRole = newRoles[index];
    const targetRole = newRoles[targetIndex];
    
    const tempPriority = currentRole.priority;
    currentRole.priority = targetRole.priority;
    targetRole.priority = tempPriority;
    
    await supabase.from("staff_roles").update({ priority: currentRole.priority }).eq("id", currentRole.id);
    await supabase.from("staff_roles").update({ priority: targetRole.priority }).eq("id", targetRole.id);
    
    fetchRoles();
  };

  const handleDeleteRole = async (id: string, roleName: string) => {
    if (!confirm(`Yakin ingin menghapus peran "${roleName}"?\n(Staf dengan posisi ini akan kehilangan posisi jabatannya)`)) return;
    const { error } = await supabase.from("staff_roles").delete().eq("id", id);
    if (!error) {
      fetchRoles();
    } else {
      alert("Gagal menghapus peran: " + error.message);
    }
  };

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string>("");
  const [originalPhoto, setOriginalPhoto] = useState<string>("");

  useEffect(() => {
    fetchStaffs();
    fetchRoles();
  }, []);

  const openAddModal = () => {
    setEditingStaff(null);
    setName("");
    setPosition("");
    setPhotoUrl("");
    setSelectedFile(null);
    setLocalPreview("");
    setOriginalPhoto("");
    setModalOpen(true);
  };

  const openEditModal = (staff: any) => {
    setEditingStaff(staff);
    setName(staff.name);
    setPosition(staff.position);
    setPhotoUrl(staff.photo || "");
    setSelectedFile(null);
    setLocalPreview("");
    setOriginalPhoto(staff.photo || "");
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
    if (!name || !position) {
      alert("Nama dan Jabatan wajib diisi!");
      return;
    }

    setUploading(true); // Ganti status ke uploading/loading untuk indikasi proses simpan

    let finalPhoto = photoUrl;

    // 1. Upload new photo if selected
    if (selectedFile) {
      try {
        const { url } = await uploadToGDrive(selectedFile, "staff");
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
      position,
      photo: finalPhoto || null,
    };

    if (editingStaff) {
      // Update
      const { error } = await supabase
        .from("staffs")
        .update(payload)
        .eq("id", editingStaff.id);

      setUploading(false);

      if (error) {
        alert("Gagal memperbarui data: " + error.message);
      } else {
        if (localPreview) {
          URL.revokeObjectURL(localPreview);
        }
        setModalOpen(false);
        fetchStaffs();
      }
    } else {
      // Create
      const { error } = await supabase
        .from("staffs")
        .insert([payload]);

      setUploading(false);

      if (error) {
        alert("Gagal menambahkan data: " + error.message);
      } else {
        if (localPreview) {
          URL.revokeObjectURL(localPreview);
        }
        setModalOpen(false);
        fetchStaffs();
      }
    }
  };

  const handleDelete = async (id: string, photoUrl: string) => {
    if (!confirm("Yakin ingin menghapus pengurus ini?")) return;

    // Delete from Google Drive if it is a Drive URL
    if (photoUrl && photoUrl.includes("drive.google.com")) {
      await deleteFromGDrive(photoUrl);
    }

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
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setRoleModalOpen(true)}
            className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors cursor-pointer bg-white"
          >
            <Layers className="w-4 h-4 text-gray-500" />
            Kelola Peran & Urutan
          </button>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 bg-[#0a3822] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#0a3822]/90 transition-colors cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            Tambah Pengurus
          </button>
        </div>
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
                        onClick={() => handleDelete(staff.id, staff.photo)}
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
                <select
                  required
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a3822]/20 focus:border-[#0a3822] bg-white text-gray-900"
                >
                  <option value="">-- Pilih Posisi / Jabatan --</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Posisi tidak ada? Klik tombol "Kelola Peran & Urutan" di halaman utama untuk menambahkannya.
                </p>
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
                  {editingStaff ? "Simpan Perubahan" : "Tambah Pengurus"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Management Modal */}
      {roleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Kelola Struktur Peran & Urutan</h3>
              <button
                onClick={() => setRoleModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Add New Role */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Tambah peran baru... (contoh: Humas)"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="flex-1 px-3.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a3822]/20 focus:border-[#0a3822] outline-none"
                />
                <button
                  onClick={handleAddRole}
                  className="px-4 py-2 bg-[#0a3822] text-white rounded-lg text-sm font-semibold hover:bg-[#0a3822]/90 cursor-pointer transition-colors"
                >
                  Tambah
                </button>
              </div>
              
              {/* Roles List */}
              <div className="space-y-2">
                {loadingRoles ? (
                  <div className="text-center py-4"><Loader2 className="w-5 h-5 animate-spin mx-auto text-[#0a3822]" /></div>
                ) : roles.length === 0 ? (
                  <p className="text-sm text-gray-400 italic text-center py-4">Belum ada peran. Buat terlebih dahulu.</p>
                ) : (
                  roles.map((role, idx) => (
                    <div key={role.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 gap-4">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={role.name}
                          onChange={(e) => handleUpdateRoleName(role.id, e.target.value)}
                          onBlur={(e) => handleSaveRoleName(role.id, e.target.value)}
                          className="w-full bg-transparent font-medium text-gray-900 text-sm focus:bg-white focus:px-2 focus:py-1 rounded border border-transparent focus:border-gray-200 outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveRole(idx, 'up')}
                          className="p-1.5 bg-white text-gray-600 hover:text-[#0a3822] border border-gray-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                          title="Naikkan Urutan"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === roles.length - 1}
                          onClick={() => handleMoveRole(idx, 'down')}
                          className="p-1.5 bg-white text-gray-600 hover:text-[#0a3822] border border-gray-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                          title="Turunkan Urutan"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRole(role.id, role.name)}
                          className="p-1.5 bg-white text-red-500 hover:bg-red-50 border border-gray-200 rounded-lg cursor-pointer"
                          title="Hapus Peran"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
              <button
                onClick={() => setRoleModalOpen(false)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
