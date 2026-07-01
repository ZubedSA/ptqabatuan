"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { uploadToGDrive } from "@/lib/upload";
import { ArrowLeft, Save, Loader2, Upload, Plus, Trash2, BookOpen, Languages, Sparkles, GraduationCap, Users, Monitor, Shield, Trophy } from "lucide-react";

const AVAILABLE_ICONS = [
  { id: "BookOpen", label: "Buku Terbuka", icon: <BookOpen className="w-5 h-5" /> },
  { id: "Sparkles", label: "Kilauan / Mulia", icon: <Sparkles className="w-5 h-5" /> },
  { id: "Languages", label: "Bahasa", icon: <Languages className="w-5 h-5" /> },
  { id: "GraduationCap", label: "Pendidikan / Lulus", icon: <GraduationCap className="w-5 h-5" /> },
  { id: "Users", label: "Kelompok / Santri", icon: <Users className="w-5 h-5" /> },
  { id: "Monitor", label: "Teknologi / IT", icon: <Monitor className="w-5 h-5" /> },
  { id: "Shield", label: "Pertahanan / Disiplin", icon: <Shield className="w-5 h-5" /> },
  { id: "Trophy", label: "Prestasi", icon: <Trophy className="w-5 h-5" /> },
];

export default function TambahProgramPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [iconName, setIconName] = useState("BookOpen");
  const [features, setFeatures] = useState<string[]>([""]);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    if (localPreview) {
      URL.revokeObjectURL(localPreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setLocalPreview(previewUrl);
  };

  const handleAddFeature = () => setFeatures([...features, ""]);
  const handleRemoveFeature = (index: number) => {
    const newFeatures = [...features];
    newFeatures.splice(index, 1);
    setFeatures(newFeatures);
  };
  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Filter empty features
      const filteredFeatures = features.filter(f => f.trim() !== "");

      let finalImageUrl = null;

      if (selectedFile) {
        setUploading(true);
        try {
          const { url } = await uploadToGDrive(selectedFile, "program");
          finalImageUrl = url;
        } catch (err: any) {
          alert("Gagal mengunggah gambar ke Google Drive: " + err.message);
          setLoading(false);
          setUploading(false);
          return;
        } finally {
          setUploading(false);
        }
      }

      const { error } = await supabase.from("educational_programs").insert([{
        title,
        description,
        icon_name: iconName,
        image_url: finalImageUrl,
        features: filteredFeatures
      }]);

      if (error) throw error;

      if (localPreview) {
        URL.revokeObjectURL(localPreview);
      }

      router.push("/admin/program");
      router.refresh();
    } catch (err: any) {
      alert("Gagal menyimpan: " + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 border-b border-gray-200 pb-5">
        <Link href="/admin/program" className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tambah Program Pendidikan</h1>
          <p className="text-sm text-gray-500">Buat program/kurikulum baru pondok pesantren.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 sm:p-8 space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Col: Image Upload */}
            <div className="lg:col-span-1 space-y-4">
              <label className="block text-sm font-medium text-gray-700">Foto Sampul Program</label>
              <div className="relative aspect-[4/3] border-2 border-dashed border-gray-300 rounded-xl overflow-hidden group hover:bg-gray-50 transition-colors cursor-pointer flex flex-col items-center justify-center bg-gray-50">
                {uploading ? (
                  <div className="text-center p-4">
                    <Loader2 className="w-8 h-8 text-[#0a3822] mx-auto mb-2 animate-spin" />
                    <p className="text-sm text-gray-500">Mengunggah ke Drive...</p>
                  </div>
                ) : localPreview ? (
                  <img src={localPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-4">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Klik untuk upload foto</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Right Col: Details */}
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Nama Program <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0a3822] focus:border-[#0a3822] outline-none transition-all"
                  placeholder="Contoh: Tahfizh Al-Qur'an 30 Juz"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Deskripsi Singkat <span className="text-red-500">*</span></label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0a3822] focus:border-[#0a3822] outline-none transition-all resize-none"
                  placeholder="Jelaskan tentang program ini..."
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Ikon Program <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {AVAILABLE_ICONS.map((icon) => (
                    <div
                      key={icon.id}
                      onClick={() => setIconName(icon.id)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        iconName === icon.id ? "border-[#0a3822] bg-[#0a3822]/5 text-[#0a3822]" : "border-gray-100 hover:border-gray-200 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {icon.icon}
                      <span className="text-[10px] mt-2 font-medium text-center">{icon.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">Target Pembelajaran / Kurikulum</label>
              <button
                type="button"
                onClick={handleAddFeature}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0a3822] hover:text-[#0a3822]/80"
              >
                <Plus className="w-4 h-4" /> Tambah Baris
              </button>
            </div>
            
            <div className="space-y-3">
              {features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={feat}
                      onChange={(e) => handleFeatureChange(idx, e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0a3822] outline-none transition-all"
                      placeholder="Contoh: Setoran hafalan harian (Ziyadah)"
                    />
                  </div>
                  {features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(idx)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-4 border-t border-gray-100">
          <Link href="/admin/program" className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Batal
          </Link>
          <button
            type="submit"
            disabled={loading || uploading || !title || !description}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-[#0a3822] rounded-lg hover:bg-[#0a3822]/90 focus:ring-2 focus:ring-[#0a3822] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan Program
          </button>
        </div>
      </form>
    </div>
  );
}
