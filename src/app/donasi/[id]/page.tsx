"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Upload, Loader2, CheckCircle2, Heart, CreditCard, Building2, QrCode } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DetailDonasiPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const supabase = createClient();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    donor_name: "",
    amount: "",
    payment_method: "BSI",
  });
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaign = async () => {
      const { data } = await supabase
        .from("donation_campaigns")
        .select("*")
        .eq("id", resolvedParams.id)
        .single();
      
      if (data) setCampaign(data);
      setLoading(false);
    };

    fetchCampaign();
  }, [resolvedParams.id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran file maksimal 5MB");
        return;
      }
      setProofFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!proofFile) {
      alert("Mohon unggah foto bukti transfer Anda.");
      return;
    }

    setSubmitting(true);

    try {
      // 1. Upload proof image to Supabase Storage
      const fileExt = proofFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `transfers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("donations")
        .upload(filePath, proofFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("donations")
        .getPublicUrl(filePath);

      // 2. Insert record to database
      const amountValue = parseInt(formData.amount.replace(/\D/g, '')) || 0;
      
      const { error: dbError } = await supabase
        .from("donations")
        .insert([{
          campaign_id: campaign.id,
          donor_name: formData.donor_name,
          amount: amountValue,
          payment_method: formData.payment_method,
          proof_url: publicUrl,
          status: "pending"
        }]);

      if (dbError) throw dbError;

      // 3. Show Success Message
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      alert("Terjadi kesalahan: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-12 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#0a3822]" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen pt-32 pb-12 flex items-center justify-center text-center">
        <div>
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Program Tidak Ditemukan</h1>
          <p className="text-gray-500 mb-6">Program donasi yang Anda cari tidak ada atau sudah ditutup.</p>
          <Link href="/donasi" className="text-[#0a3822] font-semibold hover:underline">
            &larr; Kembali ke Daftar Program
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pt-24 pb-12 bg-gray-50 dark:bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        <Link href="/donasi" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#0a3822] transition-colors mb-6 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Link>

        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 sm:p-12 text-center"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Jazakallah Khairan Katsiran
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
                Terima kasih <strong>{formData.donor_name}</strong> atas donasi Anda.
              </p>
              <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto mb-8">
                Konfirmasi pembayaran Anda telah kami terima dan sedang dalam proses verifikasi oleh pengurus. Semoga kebaikan ini menjadi amal jariyah yang tak terputus pahalanya. Aamiin.
              </p>
              <Link
                href="/donasi"
                className="inline-flex items-center justify-center px-8 py-3.5 bg-[#0a3822] text-white font-bold rounded-xl hover:bg-[#0a3822]/90 transition-all shadow-lg shadow-[#0a3822]/20"
              >
                Selesai
              </Link>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Campaign Header */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold text-xs mb-4">
                  <Heart className="w-3 h-3 text-red-500" />
                  Program Donasi
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                  {campaign.title}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {campaign.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                
                {/* Left Col: Payment Info */}
                <div className="md:col-span-2 space-y-6">
                  <div className="bg-[#0a3822] text-white rounded-2xl p-6 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Building2 className="w-24 h-24" />
                    </div>
                    <h3 className="text-lg font-bold mb-6 relative z-10">Instruksi Pembayaran</h3>
                    
                    <div className="space-y-5 relative z-10">
                      <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
                        <p className="text-xs text-green-200 uppercase tracking-wider font-semibold mb-1">Bank Syariah Indonesia (BSI)</p>
                        <p className="text-2xl font-mono font-bold tracking-wider mb-1">7123 4567 89</p>
                        <p className="text-sm">a.n. Yayasan PP Al-Usymuni</p>
                      </div>

                      <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
                        <p className="text-xs text-green-200 uppercase tracking-wider font-semibold mb-1">Bank Rakyat Indonesia (BRI)</p>
                        <p className="text-2xl font-mono font-bold tracking-wider mb-1">0011 2233 4455</p>
                        <p className="text-sm">a.n. Yayasan PP Al-Usymuni</p>
                      </div>

                      <div className="bg-white rounded-xl p-4 text-center mt-6">
                        <p className="text-[#0a3822] font-bold text-sm mb-2 flex items-center justify-center gap-2"><QrCode className="w-4 h-4"/> Scan QRIS</p>
                        <div className="w-32 h-32 bg-gray-100 mx-auto rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                          <span className="text-xs text-gray-400">QRIS Dummy</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Col: Confirmation Form */}
                <div className="md:col-span-3">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Konfirmasi Donasi</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                      Jika Anda telah melakukan transfer, mohon isi formulir di bawah ini agar donasi Anda tercatat di sistem.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama Hamba Allah / Donatur <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          required
                          value={formData.donor_name}
                          onChange={(e) => setFormData({ ...formData, donor_name: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#0a3822] focus:bg-white transition-all outline-none"
                          placeholder="Boleh menggunakan nama samaran (Hamba Allah)"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nominal Transfer (Rp) <span className="text-red-500">*</span></label>
                        <input
                          type="number"
                          required
                          min="1000"
                          value={formData.amount}
                          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#0a3822] focus:bg-white transition-all outline-none font-bold text-lg"
                          placeholder="100000"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Metode Transfer ke Tujuan <span className="text-red-500">*</span></label>
                        <select
                          value={formData.payment_method}
                          onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#0a3822] focus:bg-white transition-all outline-none"
                        >
                          <option value="BSI">Transfer BSI</option>
                          <option value="BRI">Transfer BRI</option>
                          <option value="QRIS">Scan QRIS</option>
                          <option value="LAINNYA">Bank Lainnya / Tunai</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Foto Bukti Transfer <span className="text-red-500">*</span></label>
                        
                        <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 transition-colors group cursor-pointer overflow-hidden">
                          {proofPreview ? (
                            <>
                              <img src={proofPreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-30" />
                              <div className="relative z-10 flex flex-col items-center">
                                <CheckCircle2 className="w-10 h-10 text-green-500 mb-2" />
                                <span className="text-sm font-medium text-gray-900 dark:text-white">File terpilih: {proofFile?.name}</span>
                                <span className="text-xs text-blue-600 font-medium mt-1">Klik untuk mengganti</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <Upload className="w-10 h-10 text-gray-400 mb-3 group-hover:text-[#0a3822] transition-colors" />
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Klik untuk mengunggah gambar
                              </p>
                              <p className="text-xs text-gray-500">JPG, PNG maksimal 5MB</p>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            required={!proofPreview}
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        </div>
                      </div>

                      <div className="pt-6">
                        <button
                          type="submit"
                          disabled={submitting || !formData.donor_name || !formData.amount}
                          className="w-full inline-flex items-center justify-center gap-2 bg-[#0a3822] text-white px-6 py-4 rounded-xl font-bold text-lg hover:bg-[#0a3822]/90 transition-all shadow-lg shadow-[#0a3822]/20 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="w-6 h-6 animate-spin" />
                              Memproses...
                            </>
                          ) : (
                            <>
                              <Heart className="w-6 h-6" />
                              Kirim Konfirmasi Donasi
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
