"use client";

import { useState, useEffect, use, useId } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { uploadToGDrive } from "@/lib/upload";
import { getDirectImageUrl } from "@/lib/utils";
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Upload, 
  Trash2, 
  Star, 
  Calculator, 
  Plus, 
  Image as ImageIcon 
} from "lucide-react";

export default function EditDonasiPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const supabase = createClient();
  const fileInputId = useId();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    target_amount: "",
    current_amount: "0",
    is_active: true,
  });

  // State untuk multiple foto (array of URLs)
  const [images, setImages] = useState<string[]>([]);
  const [manualUrl, setManualUrl] = useState("");

  useEffect(() => {
    const fetchCampaign = async () => {
      const { data, error } = await supabase
        .from("donation_campaigns")
        .select("*")
        .eq("id", resolvedParams.id)
        .single();

      if (data) {
        setFormData({
          title: data.title || "",
          description: data.description || "",
          target_amount: data.target_amount ? data.target_amount.toString() : "",
          current_amount: data.current_amount ? data.current_amount.toString() : "0",
          is_active: data.is_active ?? true,
        });

        // Fallback images array
        let initialImages: string[] = [];
        if (Array.isArray(data.images) && data.images.length > 0) {
          initialImages = data.images;
        } else if (data.image_url) {
          initialImages = [data.image_url];
        }
        setImages(initialImages);
      }
      setFetching(false);
    };

    fetchCampaign();
  }, [resolvedParams.id]);

  // Perhitungan realtime progress & sisa kebutuhan
  const targetVal = formData.target_amount ? parseInt(formData.target_amount.replace(/\D/g, ""), 10) || 0 : 0;
  const currentVal = formData.current_amount ? parseInt(formData.current_amount.replace(/\D/g, ""), 10) || 0 : 0;

  const percentCollected = targetVal > 0 
    ? Math.min(100, Math.round((currentVal / targetVal) * 100)) 
    : 0;
  const percentRemaining = targetVal > 0 
    ? Math.max(0, 100 - percentCollected) 
    : 0;
  const remainingAmount = targetVal > 0 
    ? Math.max(0, targetVal - currentVal) 
    : 0;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Upload banyak file foto sekaligus ke Google Drive
  const handleMultipleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newUploadedUrls: string[] = [];
    const totalFiles = files.length;

    try {
      for (let i = 0; i < totalFiles; i++) {
        const file = files[i];
        setUploadProgress(`Mengunggah foto ${i + 1} dari ${totalFiles}: ${file.name}...`);
        const { url } = await uploadToGDrive(file, "donasi");
        if (url) {
          newUploadedUrls.push(url);
        }
      }

      setImages((prev) => [...prev, ...newUploadedUrls]);
    } catch (err: any) {
      alert("Gagal mengunggah foto ke Google Drive: " + err.message);
    } finally {
      setUploading(false);
      setUploadProgress("");
      e.target.value = "";
    }
  };

  // Tambah manual link URL Google Drive
  const handleAddManualUrl = () => {
    if (!manualUrl.trim()) return;
    setImages((prev) => [...prev, manualUrl.trim()]);
    setManualUrl("");
  };

  // Hapus foto dari daftar
  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Jadikan foto tertentu sebagai Cover (foto utama di index 0)
  const handleSetCover = (indexToCover: number) => {
    if (indexToCover === 0) return;
    setImages((prev) => {
      const copy = [...prev];
      const selected = copy.splice(indexToCover, 1)[0];
      copy.unshift(selected);
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      title: formData.title,
      description: formData.description,
      target_amount: targetVal,
      current_amount: currentVal,
      image_url: images.length > 0 ? images[0] : null,
      images: images,
      is_active: formData.is_active,
    };

    const { error } = await supabase
      .from("donation_campaigns")
      .update(payload)
      .eq("id", resolvedParams.id);

    if (error) {
      alert("Gagal menyimpan perubahan: " + error.message);
      setLoading(false);
    } else {
      router.push("/admin/donasi");
      router.refresh();
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#0a3822]" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4 border-b border-gray-200 pb-5">
        <Link
          href="/admin/donasi"
          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Program Donasi & Wakaf</h1>
          <p className="text-sm text-gray-500">Perbarui informasi kampanye, foto Google Drive, dan target donasi.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-8">
        
        {/* Informasi Utama */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">Informasi Program</h2>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Nama Program Donasi & Wakaf <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0a3822] focus:border-[#0a3822] outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Deskripsi Singkat</label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0a3822] focus:border-[#0a3822] outline-none transition-all resize-none"
            />
          </div>
        </div>

        {/* Target Dana & Live Calculator */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#0a3822]" /> Target Dana & Saldo Terkumpul
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Target Dana (Rp)</label>
              <input
                type="number"
                min="0"
                value={formData.target_amount}
                onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0a3822] focus:border-[#0a3822] outline-none transition-all font-semibold"
                placeholder="Kosongkan jika tanpa batas target"
              />
              <p className="text-xs text-gray-500">Kosongkan jika program berkelanjutan tanpa target nominal.</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Dana Terkumpul Saat Ini (Rp)</label>
              <input
                type="number"
                min="0"
                value={formData.current_amount}
                onChange={(e) => setFormData({ ...formData, current_amount: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0a3822] focus:border-[#0a3822] outline-none transition-all font-semibold"
                placeholder="0"
              />
              <p className="text-xs text-gray-500">Angka ini otomatis bertambah ketika bukti transfer diverifikasi.</p>
            </div>
          </div>

          {/* Live Progress Preview Box */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/40 dark:from-emerald-950/20 dark:to-emerald-900/10 rounded-xl p-5 border border-emerald-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Preview Perhitungan Progress</span>
              <span className="text-xs text-emerald-700 font-medium">Real-time Otomatis</span>
            </div>

            {targetVal > 0 ? (
              <div className="space-y-3">
                {/* 3 Metric Cards */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-100">
                    <p className="text-[11px] text-gray-500 font-medium">Terkumpul</p>
                    <p className="text-sm font-bold text-[#0a3822]">{formatRupiah(currentVal)}</p>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {percentCollected}% Tercapai
                    </span>
                  </div>

                  <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-100">
                    <p className="text-[11px] text-gray-500 font-medium">Sisa Kebutuhan</p>
                    <p className="text-sm font-bold text-amber-700">{formatRupiah(remainingAmount)}</p>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      {percentRemaining}% Lagi
                    </span>
                  </div>

                  <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-100">
                    <p className="text-[11px] text-gray-500 font-medium">Target Dana</p>
                    <p className="text-sm font-bold text-gray-800">{formatRupiah(targetVal)}</p>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">
                      100% Total
                    </span>
                  </div>
                </div>

                {/* Progress Bar Dual Tone */}
                <div className="space-y-1">
                  <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden flex">
                    <div
                      className="bg-[#0a3822] h-full transition-all duration-500 rounded-l-full"
                      style={{ width: `${percentCollected}%` }}
                      title={`Terkumpul: ${percentCollected}%`}
                    />
                    <div
                      className="bg-amber-400/70 h-full transition-all duration-500"
                      style={{ width: `${percentRemaining}%` }}
                      title={`Masih butuh: ${percentRemaining}%`}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-gray-600 font-medium pt-0.5">
                    <span>🟢 Terkumpul: {percentCollected}%</span>
                    <span>🟡 Sisa Kebutuhan: {percentRemaining}%</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/70 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-600">
                  Target belum disetel. Program akan ditampilkan dengan label <strong>"Donasi Berkelanjutan"</strong> tanpa batas nominal.
                </p>
                <p className="text-sm font-bold text-[#0a3822] mt-1">Saldo Terkumpul: {formatRupiah(currentVal)}</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200 mt-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-5 h-5 text-[#0a3822] rounded focus:ring-[#0a3822] cursor-pointer"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-800 cursor-pointer">
              Program Aktif (Terlihat oleh publik dan donatur di website)
            </label>
          </div>
        </div>

        {/* Multiple Foto Program (Google Drive) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#0a3822]" /> Foto Program Donasi & Wakaf
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Bisa unggah lebih dari 1 foto. Foto akan tersimpan otomatis ke Google Drive.</p>
            </div>
            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
              {images.length} Foto Terpilih
            </span>
          </div>

          {/* Upload Button Area */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <label 
                htmlFor={fileInputId}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                  uploading 
                    ? "bg-gray-100 border-gray-300 cursor-not-allowed" 
                    : "border-[#0a3822]/40 bg-[#0a3822]/5 hover:bg-[#0a3822]/10 hover:border-[#0a3822]"
                }`}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-[#0a3822]" />
                    <span className="text-sm font-medium text-gray-700">{uploadProgress || "Mengunggah ke Google Drive..."}</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-[#0a3822]" />
                    <span className="text-sm font-bold text-[#0a3822]">Unggah Foto Baru ke Google Drive</span>
                  </>
                )}
                <input
                  id={fileInputId}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleMultipleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>

            {/* Manual Google Drive Link Option */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Atau masukkan URL Foto Google Drive secara manual..."
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddManualUrl();
                  }
                }}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0a3822] outline-none"
              />
              <button
                type="button"
                onClick={handleAddManualUrl}
                disabled={!manualUrl.trim()}
                className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 inline-flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Tambah
              </button>
            </div>
          </div>

          {/* Grid Preview Foto */}
          {images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
              {images.map((imgUrl, idx) => (
                <div 
                  key={idx} 
                  className={`relative group rounded-xl overflow-hidden border-2 shadow-sm transition-all bg-gray-50 flex flex-col ${
                    idx === 0 ? "border-[#0a3822] ring-2 ring-[#0a3822]/20" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="aspect-[4/3] w-full bg-gray-100 overflow-hidden relative">
                    <img
                      src={getDirectImageUrl(imgUrl)}
                      alt={`Foto ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Badge Cover Utama */}
                    {idx === 0 && (
                      <span className="absolute top-1.5 left-1.5 bg-[#0a3822] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> Cover Utama
                      </span>
                    )}

                    {/* Action Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
                      {idx !== 0 && (
                        <button
                          type="button"
                          onClick={() => handleSetCover(idx)}
                          title="Jadikan Cover Utama"
                          className="p-1.5 bg-white text-gray-800 rounded-lg hover:bg-yellow-50 hover:text-yellow-700 transition-colors text-xs font-medium shadow"
                        >
                          <Star className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        title="Hapus Foto"
                        className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs font-medium shadow"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-1.5 text-center bg-white border-t border-gray-100">
                    <p className="text-[11px] text-gray-500 font-medium">Foto #{idx + 1}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 border-2 border-dashed border-gray-200 rounded-xl text-center bg-gray-50/50">
              <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-500">Belum ada foto yang diunggah. Unggah satu atau beberapa foto untuk program ini.</p>
            </div>
          )}
        </div>

        {/* Tombol Aksi */}
        <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
          <Link
            href="/admin/donasi"
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={loading || uploading || !formData.title}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-[#0a3822] rounded-lg hover:bg-[#0a3822]/90 focus:ring-2 focus:ring-offset-2 focus:ring-[#0a3822] transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  );
}
