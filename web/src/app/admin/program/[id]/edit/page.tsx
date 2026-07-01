"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getDirectImageUrl } from "@/lib/utils";
import { uploadToGDrive, deleteFromGDrive } from "@/lib/upload";
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

export default function EditProgramPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [iconName, setIconName] = useState("BookOpen");
  const [features, setFeatures] = useState<string[]>([""]);
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string>("");
  const [originalImage, setOriginalImage] = useState<string>("");

  useEffect(() => {
    const fetchProgram = async () => {
      const { data } = await supabase
        .from("educational_programs")
        .select("*")
        .eq("id", resolvedParams.id)
        .single();
      
      if (data) {
        setTitle(data.title);
        setDescription(data.description);
        setIconName(data.icon_name || "BookOpen");
        setFeatures(data.features?.length > 0 ? data.features : [""]);
        if (data.image_url) {
          setImagePreview(data.image_url);
          setOriginalImage(data.image_url);
        }
      }
      setFetching(false);
    };

    fetchProgram();
  }, [resolvedParams.id]);

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
      const filteredFeatures = features.filter(f => f.trim() !== "");

      let finalImageUrl = imagePreview;

      // 1. Upload new image if selected
      if (selectedFile) {
        setUploading(true);
        try {
          const { url } = await uploadToGDrive(selectedFile, "program");
          finalImageUrl = url;

          // Hapus gambar lama jika merupakan URL Google Drive
          if (originalImage && originalImage.includes("drive.google.com")) {
            await deleteFromGDrive(originalImage);
          }
        } catch (err: any) {
          alert("Gagal mengunggah gambar ke Google Drive: " + err.message);
          setLoading(false);
          setUploading(false);
          return;
        } finally {
          setUploading(false);
        }
      }

      const { error } = await supabase
        .from("educational_programs")
        .update({
          title,
          description,
          icon_name: iconName,
          image_url: finalImageUrl,
          features: filteredFeatures
        })
        .eq("id", resolvedParams.id);

      if (error) throw error;

      if (localPreview) {
        URL.revokeObjectURL(localPreview);
      }

      router.push("/admin/program");
      router.refresh();
    } catch (err: any) {
      alert("Gagal menyimpan perubahan: " + err.message);
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="flex justify-center py-32"><Loader2 className="w-8 h-8 animate-spin text-[#0a3822]" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 border-b border-gray-200 pb-5">
        <Link href="/admin/program" className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Program Pendidikan</h1>
          <p className="text-sm text-gray-500">Perbarui informasi kurikulum atau program pondok.</p>
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
                ) : (localPreview || imagePreview) ? (
                  <>
                    <img src={localPreview || getDirectImageUrl(imagePreview!)} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white text-sm font-medium">Ganti Foto</p>
                    </div>
                  </>
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
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  );
}
