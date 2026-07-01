"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { use } from "react";

export default function EditDonasiPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    target_amount: "",
    current_amount: "0",
    is_active: true
  });

  useEffect(() => {
    const fetchCampaign = async () => {
      const { data } = await supabase
        .from("donation_campaigns")
        .select("*")
        .eq("id", resolvedParams.id)
        .single();
      
      if (data) {
        setFormData({
          title: data.title,
          description: data.description || "",
          target_amount: data.target_amount ? data.target_amount.toString() : "",
          current_amount: data.current_amount ? data.current_amount.toString() : "0",
          is_active: data.is_active
        });
      }
      setFetching(false);
    };

    fetchCampaign();
  }, [resolvedParams.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      title: formData.title,
      description: formData.description,
      target_amount: formData.target_amount ? parseInt(formData.target_amount.replace(/\D/g, '')) : 0,
      current_amount: formData.current_amount ? parseInt(formData.current_amount.replace(/\D/g, '')) : 0,
      is_active: formData.is_active
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4 border-b border-gray-200 pb-5">
        <Link
          href="/admin/donasi"
          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Program Donasi</h1>
          <p className="text-sm text-gray-500">Perbarui informasi kampanye donasi.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Nama Program Donasi <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0a3822] focus:border-[#0a3822] outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Deskripsi Singkat</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0a3822] focus:border-[#0a3822] outline-none transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Target Dana (Rp)</label>
              <input
                type="number"
                min="0"
                value={formData.target_amount}
                onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0a3822] focus:border-[#0a3822] outline-none transition-all"
                placeholder="Kosongkan jika tanpa batas target"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Dana Terkumpul (Rp)</label>
              <input
                type="number"
                min="0"
                value={formData.current_amount}
                onChange={(e) => setFormData({ ...formData, current_amount: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0a3822] focus:border-[#0a3822] outline-none transition-all"
                placeholder="0"
              />
              <p className="text-[10px] text-gray-500">Angka ini juga otomatis bertambah saat Anda memverifikasi struk donasi masuk.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-5 h-5 text-[#0a3822] rounded focus:ring-[#0a3822]"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-800 cursor-pointer">
              Program Aktif (Terlihat oleh publik dan bisa menerima donasi)
            </label>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-4 border-t border-gray-100">
          <Link
            href="/admin/donasi"
            className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={loading || !formData.title}
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
