"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getDirectImageUrl } from "@/lib/utils";
import { 
  ArrowLeft, 
  Upload, 
  Loader2, 
  CheckCircle2, 
  Heart, 
  Building2, 
  QrCode, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  X, 
  Target,
  Sparkles,
  TrendingUp,
  Clock,
  Copy,
  Check,
  Share2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DetailDonasiPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const supabase = createClient();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Gallery states
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Form State
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    donor_name: "",
    amount: "",
    payment_method: "BRI",
  });
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);

  const handleCopyRekening = () => {
    navigator.clipboard.writeText("009501031129537");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    if (!campaign) return;
    const target = Number(campaign.target_amount) || 0;
    const current = Number(campaign.current_amount) || 0;
    const percentage = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
    const remainingPercent = target > 0 ? Math.max(0, 100 - percentage) : 0;
    const remainingAmount = target > 0 ? Math.max(0, target - current) : 0;

    let progressInfo = "";
    if (target > 0) {
      progressInfo = `🎯 *Target:* ${formatRupiah(target)}\n📈 *Terkumpul:* ${formatRupiah(current)} (${percentage}%)\n⏳ *Sisa Kebutuhan:* ${formatRupiah(remainingAmount)} (${remainingPercent}% lagi)\n\n`;
    } else {
      progressInfo = `📈 *Total Terkumpul:* ${formatRupiah(current)}\n(Program Donasi Berkelanjutan)\n\n`;
    }

    const shareUrl = typeof window !== "undefined" ? window.location.href : "";

    const text = 
`*BISMILLAHIRRAHMANIRRAHIM* 🌿

*Peluang Amal Jariyah & Wakaf:*
*${campaign.title}*

Pondok Pesantren Tahfizh Qur'an Al-Usymuni Batuan mengajak kaum muslimin & para dermawan untuk berpartisipasi dalam program kebaikan:

${progressInfo}💳 *Rekening Resmi Pondok:*
Bank BRI: *0095 0103 1129 537*
a.n. *PONPES TAHFIZH QURAN*

Salurkan infaq, donasi & wakaf terbaik Anda atau bagikan pesan kebaikan ini kepada keluarga & sahabat.
Konfirmasi donasi online:
${shareUrl}

_Jazakumullah Khairan Katsiran_`;

    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank");
  };

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
      const amountValue = parseInt(formData.amount.replace(/\D/g, ''), 10) || 0;
      
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

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", { 
      style: "currency", 
      currency: "IDR", 
      maximumFractionDigits: 0 
    }).format(angka);
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

  // Foto list extraction
  const photoList: string[] = Array.isArray(campaign.images) && campaign.images.length > 0
    ? campaign.images
    : campaign.image_url
    ? [campaign.image_url]
    : [];

  // Perhitungan target & persentase
  const target = Number(campaign.target_amount) || 0;
  const current = Number(campaign.current_amount) || 0;
  const percentage = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  const remainingPercent = target > 0 ? Math.max(0, 100 - percentage) : 0;
  const remainingAmount = target > 0 ? Math.max(0, target - current) : 0;
  const isFinished = target > 0 && current >= target;

  const nextPhoto = () => {
    setActivePhotoIndex((prev) => (prev + 1) % photoList.length);
  };

  const prevPhoto = () => {
    setActivePhotoIndex((prev) => (prev - 1 + photoList.length) % photoList.length);
  };

  return (
    <div className="flex flex-col min-h-screen pt-24 pb-16 bg-gray-50 dark:bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        <div className="flex items-center justify-between gap-3 mb-6">
          <Link 
            href="/donasi" 
            className="inline-flex items-center gap-2 text-gray-500 hover:text-[#0a3822] transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Semua Program
          </Link>

          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Bagikan Program ini ke WhatsApp"
          >
            <Share2 className="w-4 h-4" />
            <span>Bagikan ke WhatsApp</span>
          </button>
        </div>

        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 sm:p-12 text-center border border-gray-100 dark:border-gray-700"
            >
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-[#0a3822]">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 font-serif">
                Jazakumullah Khairan Katsiran
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-200 mb-2">
                Terima kasih <strong>{formData.donor_name}</strong> atas donasi & wakaf yang disalurkan.
              </p>
              <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto mb-8 text-sm leading-relaxed">
                Bukti transfer Anda telah kami terima dengan aman. Tim pengurus pondok pesantren akan memverifikasinya. Semoga menjadi amal jariyah yang terus mengalirkan pahala bagi Anda dan keluarga. Aamiin ya Rabbal Alamin.
              </p>
              <Link
                href="/donasi"
                className="inline-flex items-center justify-center px-8 py-3.5 bg-[#0a3822] text-white font-bold rounded-xl hover:bg-[#0a3822]/90 transition-all shadow-lg shadow-[#0a3822]/20"
              >
                Kembali ke Daftar Program
              </Link>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Campaign Header & Visual Showcase */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                
                {/* Photo Gallery / Slider */}
                {photoList.length > 0 ? (
                  <div className="relative bg-black/90">
                    <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full flex items-center justify-center overflow-hidden">
                      <AnimatePresence mode="wait">
                        <motion.img
                          key={activePhotoIndex}
                          src={getDirectImageUrl(photoList[activePhotoIndex])}
                          alt={`${campaign.title} - Foto ${activePhotoIndex + 1}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="w-full h-full object-contain cursor-pointer"
                          onClick={() => setIsLightboxOpen(true)}
                        />
                      </AnimatePresence>

                      {/* Navigation Arrows (if multiple photos) */}
                      {photoList.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={prevPhoto}
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all backdrop-blur-sm"
                            aria-label="Foto sebelumnya"
                          >
                            <ChevronLeft className="w-6 h-6" />
                          </button>
                          <button
                            type="button"
                            onClick={nextPhoto}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all backdrop-blur-sm"
                            aria-label="Foto selanjutnya"
                          >
                            <ChevronRight className="w-6 h-6" />
                          </button>
                        </>
                      )}

                      {/* Badge info overlay */}
                      <div className="absolute top-4 right-4 flex items-center gap-2">
                        {photoList.length > 1 && (
                          <span className="bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-semibold shadow">
                            {activePhotoIndex + 1} / {photoList.length}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => setIsLightboxOpen(true)}
                          className="p-1.5 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition-colors shadow"
                          title="Perbesar Foto"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Thumbnail Strip (if multiple photos) */}
                    {photoList.length > 1 && (
                      <div className="p-3 bg-gray-950 flex items-center gap-2.5 overflow-x-auto">
                        {photoList.map((thumbUrl, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setActivePhotoIndex(idx)}
                            className={`relative h-16 w-24 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                              idx === activePhotoIndex 
                                ? "border-[#D4AF37] ring-2 ring-[#D4AF37]/30 scale-105" 
                                : "border-transparent opacity-60 hover:opacity-100"
                            }`}
                          >
                            <img
                              src={getDirectImageUrl(thumbUrl)}
                              alt={`Thumbnail ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-[#0a3822] to-[#125e3a] text-white p-8 sm:p-12 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:16px_16px]" />
                    <div className="relative z-10 max-w-2xl">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[#D4AF37] text-xs font-semibold uppercase tracking-wider mb-4">
                        <Heart className="w-3.5 h-3.5 fill-red-400 text-red-400" />
                        Program Donasi & Wakaf
                      </div>
                      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif leading-tight text-white mb-2">
                        {campaign.title}
                      </h1>
                    </div>
                  </div>
                )}

                {/* Campaign Title & Description */}
                <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[#0a3822] dark:text-[#D4AF37] font-semibold text-xs uppercase tracking-wider">
                      <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" /> Program Wakaf & Donasi
                    </span>
                    {isFinished ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Target Terpenuhi
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                        <Clock className="w-3.5 h-3.5" /> Program Terbuka
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 font-serif">
                    {campaign.title}
                  </h1>

                  <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line text-base">
                    {campaign.description || "Mari berpartisipasi dalam program wakaf dan donasi ini untuk kemajuan sarana prasarana santri Pondok Pesantren."}
                  </div>
                </div>

                {/* Prominent Progress Bar Card */}
                <div className="p-6 sm:p-8 bg-gradient-to-br from-emerald-50/70 to-white dark:from-emerald-950/20 dark:to-gray-800/40">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-[#0a3822] dark:text-[#D4AF37]" />
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                      Perkembangan Perolehan Dana
                    </h3>
                  </div>

                  {target > 0 ? (
                    <div className="space-y-4">
                      {/* 3 Metrics Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-emerald-100 dark:border-gray-700 shadow-sm">
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                            Dana Terkumpul
                          </p>
                          <p className="text-2xl font-bold text-[#0a3822] dark:text-[#D4AF37]">
                            {formatRupiah(current)}
                          </p>
                          <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200">
                            {percentage}% Berjalan
                          </span>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-amber-100 dark:border-gray-700 shadow-sm">
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                            Sisa Kebutuhan
                          </p>
                          <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                            {formatRupiah(remainingAmount)}
                          </p>
                          <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200">
                            {remainingPercent}% Lagi
                          </span>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                            Target Dana
                          </p>
                          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                            {formatRupiah(target)}
                          </p>
                          <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            100% Target
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar with Dual-Tone */}
                      <div className="space-y-2 pt-2">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 h-4 rounded-full overflow-hidden flex shadow-inner">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="bg-gradient-to-r from-[#0a3822] to-[#125e3a] dark:from-[#D4AF37] dark:to-[#f5ce55] h-full rounded-l-full"
                          />
                          <div
                            className="bg-amber-400/40 dark:bg-amber-500/30 h-full"
                            style={{ width: `${remainingPercent}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 font-medium">
                          <span>🟢 Terkumpul: {percentage}%</span>
                          <span>🟡 Kekurangan Target: {remainingPercent}%</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-emerald-100 dark:border-gray-700 flex items-center justify-between shadow-sm">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Dana Masuk</p>
                        <p className="text-2xl font-bold text-[#0a3822] dark:text-[#D4AF37]">{formatRupiah(current)}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Program Donasi Berkelanjutan (Tanpa Batas Target Nominal)</p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center text-[#0a3822] dark:text-[#D4AF37]">
                        <Target className="w-6 h-6" />
                      </div>
                    </div>
                  )}

                  {/* Banner Ajak Kebaikan via WhatsApp */}
                  <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-emerald-700 via-emerald-800 to-[#0a3822] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-emerald-900/10">
                    <div className="text-center sm:text-left">
                      <p className="font-bold text-base font-serif flex items-center justify-center sm:justify-start gap-2">
                        <Share2 className="w-4 h-4 text-[#D4AF37]" />
                        <span>Ajak Keluarga & Kerabat Beramal Jariyah</span>
                      </p>
                      <p className="text-xs text-emerald-100/90 mt-1 max-w-lg leading-relaxed">
                        "Barangsiapa yang menunjuki kepada kebaikan maka dia akan mendapatkan pahala seperti pahala orang yang mengerjakannya." (HR. Muslim)
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleShareWhatsApp}
                      className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Bagikan ke WhatsApp</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid: Payment Info (Left) & Form Konfirmasi (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                
                {/* Left Col: Payment Info */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-[#0a3822] text-white rounded-3xl p-6 sm:p-7 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Building2 className="w-28 h-28" />
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2 relative z-10 font-serif">
                      Rekening Resmi Pondok
                    </h3>
                    <p className="text-xs text-emerald-200/90 mb-6 relative z-10">
                      Silakan transfer donasi & wakaf Anda ke rekening resmi Pondok Pesantren berikut:
                    </p>
                    
                    <div className="space-y-4 relative z-10">
                      {/* Kartu Rekening BRI Tunggal */}
                      <div className="bg-white/10 rounded-2xl p-5 backdrop-blur-md border border-white/20 shadow-inner">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider bg-black/20 px-2.5 py-1 rounded-md">
                            BANK BRI
                          </span>
                          <span className="text-[11px] text-emerald-200 font-mono">Kode Bank: 002</span>
                        </div>

                        <p className="text-xs text-emerald-100 font-medium mb-1">Nomor Rekening</p>
                        <div className="flex items-center justify-between gap-2 bg-black/25 px-3.5 py-2.5 rounded-xl border border-white/10 mb-3">
                          <p className="text-xl sm:text-2xl font-mono font-bold tracking-wider text-white select-all">
                            0095 0103 1129 537
                          </p>
                          <button
                            type="button"
                            onClick={handleCopyRekening}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#D4AF37] hover:bg-[#c49f2e] text-gray-900 font-bold text-xs rounded-lg transition-all shadow active:scale-95"
                            title="Salin Nomor Rekening"
                          >
                            {copied ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-900" />
                                <span>Tersalin!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Salin</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div>
                          <p className="text-[11px] text-emerald-200 mb-0.5">Atas Nama Rekening</p>
                          <p className="text-base font-bold text-white tracking-wide">
                            PONPES TAHFIZH QURAN
                          </p>
                        </div>
                      </div>

                      <div className="bg-emerald-950/40 rounded-xl p-3.5 border border-emerald-800/40 text-xs text-emerald-200/90 leading-relaxed">
                        💡 <strong>Catatan:</strong> Jika transfer dari bank lain (BCA, Mandiri, BSI, BNI, dll.), pilih tujuan transfer ke <strong>Bank BRI (002)</strong> dan masukkan nomor rekening di atas.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Col: Confirmation Form */}
                <div className="lg:col-span-3">
                  <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 font-serif">
                      Konfirmasi Transfer Donasi
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                      Setelah melakukan transfer, silakan kirim bukti pembayaran melalui formulir di bawah ini agar donasi Anda tercatat di sistem pondok.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Nama Donatur / Hamba Allah <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.donor_name}
                          onChange={(e) => setFormData({ ...formData, donor_name: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#0a3822] focus:bg-white transition-all outline-none text-sm"
                          placeholder="Boleh menggunakan nama samaran (contoh: Hamba Allah)"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Nominal Transfer (Rp) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          min="1000"
                          value={formData.amount}
                          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#0a3822] focus:bg-white transition-all outline-none font-bold text-lg text-[#0a3822] dark:text-[#D4AF37]"
                          placeholder="100000"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Tujuan Rekening / Metode Pembayaran <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.payment_method}
                          onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#0a3822] focus:bg-white transition-all outline-none text-sm font-medium"
                        >
                          <option value="BRI">Transfer Rekening BRI (009501031129537)</option>
                          <option value="ANTAR_BANK">Transfer Antar Bank ke Rekening BRI</option>
                          <option value="TUNAI">Langsung / Tunai ke Pondok</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Foto Struk / Bukti Transfer <span className="text-red-500">*</span>
                        </label>
                        
                        <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-6 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 transition-colors group cursor-pointer overflow-hidden min-h-[160px]">
                          {proofPreview ? (
                            <>
                              <img src={proofPreview} alt="Bukti Transfer Preview" className="absolute inset-0 w-full h-full object-cover opacity-25" />
                              <div className="relative z-10 flex flex-col items-center text-center p-2">
                                <CheckCircle2 className="w-10 h-10 text-emerald-600 mb-2" />
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">Foto Bukti Terpilih</span>
                                <span className="text-xs text-gray-500 mt-0.5">{proofFile?.name}</span>
                                <span className="text-xs text-blue-600 font-semibold mt-2 bg-blue-50 px-2.5 py-1 rounded-full">Klik untuk mengganti</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <Upload className="w-10 h-10 text-gray-400 mb-2 group-hover:text-[#0a3822] transition-colors" />
                              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Klik untuk mengunggah bukti transfer
                              </p>
                              <p className="text-xs text-gray-400 mt-1">Format JPG, PNG atau JPEG (Maks. 5MB)</p>
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

                      <div className="pt-4">
                        <button
                          type="submit"
                          disabled={submitting || !formData.donor_name || !formData.amount}
                          className="w-full inline-flex items-center justify-center gap-2 bg-[#0a3822] text-white px-6 py-4 rounded-xl font-bold text-base hover:bg-[#0a3822]/90 active:scale-[0.99] transition-all shadow-lg shadow-[#0a3822]/20 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span>Mengirim Konfirmasi...</span>
                            </>
                          ) : (
                            <>
                              <Heart className="w-5 h-5 fill-red-400 text-red-400" />
                              <span>Kirim Konfirmasi Donasi Sekarang</span>
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

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && photoList.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-md"
            onClick={() => setIsLightboxOpen(false)}
          >
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/10 text-white hover:bg-white/25 flex items-center justify-center transition-colors z-50"
              aria-label="Tutup"
            >
              <X className="w-6 h-6" />
            </button>

            {photoList.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevPhoto();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white hover:bg-white/25 flex items-center justify-center transition-colors z-50"
                  aria-label="Foto Sebelumnya"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextPhoto();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white hover:bg-white/25 flex items-center justify-center transition-colors z-50"
                  aria-label="Foto Selanjutnya"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}

            <div className="relative max-w-5xl max-h-[85vh] w-full flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <img
                src={getDirectImageUrl(photoList[activePhotoIndex])}
                alt={`${campaign.title} - Zoom`}
                className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
              />
              <p className="text-white/80 text-sm mt-3 font-medium">
                {campaign.title} ({activePhotoIndex + 1} dari {photoList.length})
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
