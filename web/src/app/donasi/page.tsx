"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { getDirectImageUrl } from "@/lib/utils";
import { Heart, Target, ChevronRight, Loader2, Images, Sparkles, CheckCircle2, Share2 } from "lucide-react";

export default function DonasiPage() {
  const supabase = createClient();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      const { data } = await supabase
        .from("donation_campaigns")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      
      if (data) setCampaigns(data);
      setLoading(false);
    };

    fetchCampaigns();
  }, []);

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", { 
      style: "currency", 
      currency: "IDR", 
      maximumFractionDigits: 0 
    }).format(angka);
  };

  const handleShareWhatsApp = (e: React.MouseEvent, camp: any) => {
    e.preventDefault();
    e.stopPropagation();

    const target = Number(camp.target_amount) || 0;
    const current = Number(camp.current_amount) || 0;
    const percentage = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
    const remainingPercent = target > 0 ? Math.max(0, 100 - percentage) : 0;
    const remainingAmount = target > 0 ? Math.max(0, target - current) : 0;

    let progressInfo = "";
    if (target > 0) {
      progressInfo = `🎯 *Target:* ${formatRupiah(target)}\n📈 *Terkumpul:* ${formatRupiah(current)} (${percentage}%)\n⏳ *Sisa Kebutuhan:* ${formatRupiah(remainingAmount)} (${remainingPercent}% lagi)\n\n`;
    } else {
      progressInfo = `📈 *Total Terkumpul:* ${formatRupiah(current)}\n(Program Donasi Berkelanjutan)\n\n`;
    }

    const currentOrigin = typeof window !== "undefined" ? window.location.origin : "";
    const detailUrl = `${currentOrigin}/donasi/${camp.id}`;

    const text = 
`*BISMILLAHIRRAHMANIRRAHIM* 🌿

*Peluang Amal Jariyah & Wakaf:*
*${camp.title}*

Pondok Pesantren Tahfizh Qur'an Al-Usymuni Batuan mengajak kaum muslimin untuk berpartisipasi dalam program kebaikan ini:

${progressInfo}💳 *Rekening Resmi Pondok:*
Bank BRI: *0095 0103 1129 537*
a.n. *PONPES TAHFIZH QURAN*

Salurkan donasi terbaik Anda atau bagikan info kebaikan ini. Selengkapnya & konfirmasi transfer:
${detailUrl}

_Jazakumullah Khairan Katsiran_`;

    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank");
  };

  return (
    <div className="flex flex-col min-h-screen pb-16 bg-gradient-to-b from-gray-50/50 to-white dark:from-background dark:to-background">
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden bg-[#0a3822] text-white">
        {/* Subtle geometric pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#125e3a]/30 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#D4AF37] font-semibold text-xs tracking-wider uppercase mb-6 shadow-sm">
            <Heart className="w-3.5 h-3.5 fill-red-400 text-red-400" />
            Amal Jariyah & Wakaf Pondok
          </div>
          <motion.h1 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-5 font-serif leading-tight"
          >
            Investasi Akhirat <span className="text-[#D4AF37]">Penuh Berkah</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
            className="text-base sm:text-lg text-emerald-100/90 max-w-2xl mx-auto leading-relaxed"
          >
            Salurkan infaq, donasi, dan wakaf terbaik Anda untuk mendukung sarana pendidikan para santri penghafal Al-Qur'an. Setiap rupiah menjadi aliran pahala tak terputus.
          </motion.p>
        </div>
      </section>

      {/* Campaigns Grid */}
      <section className="py-16 flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-10 h-10 animate-spin text-[#0a3822] mb-4" />
            <p className="text-gray-500 font-medium animate-pulse">Memuat program donasi & wakaf...</p>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-gray-800/30 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Belum Ada Program Aktif</h3>
            <p className="text-gray-500">Saat ini belum ada program donasi yang dibuka. Silakan kunjungi beberapa saat lagi.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {campaigns.map((camp, idx) => {
              const target = Number(camp.target_amount) || 0;
              const current = Number(camp.current_amount) || 0;
              
              const percentage = target > 0 
                ? Math.min(100, Math.round((current / target) * 100)) 
                : 0;
              const remainingPercent = target > 0 
                ? Math.max(0, 100 - percentage) 
                : 0;
              const remainingAmount = target > 0 
                ? Math.max(0, target - current) 
                : 0;
              const isFinished = target > 0 && current >= target;

              // Ambil foto dari images array atau image_url
              const photoList: string[] = Array.isArray(camp.images) && camp.images.length > 0
                ? camp.images
                : camp.image_url
                ? [camp.image_url]
                : [];
              const coverPhoto = photoList[0];

              return (
                <motion.div
                  key={camp.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 flex flex-col h-full group"
                >
                  {/* Image Cover Container */}
                  <div className="relative aspect-[16/10] w-full bg-gradient-to-br from-[#0a3822]/10 to-[#D4AF37]/10 overflow-hidden">
                    {coverPhoto ? (
                      <img
                        src={getDirectImageUrl(coverPhoto)}
                        alt={camp.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#0a3822] to-[#125e3a] text-white">
                        <Heart className="w-12 h-12 text-[#D4AF37] mb-2 opacity-80" />
                        <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">Pondok Pesantren</span>
                        <span className="text-sm font-bold mt-1 text-emerald-100 line-clamp-1">{camp.title}</span>
                      </div>
                    )}

                    {/* Gradient Overlay at Bottom */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                    {/* Photo Count Badge */}
                    {photoList.length > 1 && (
                      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow">
                        <Images className="w-3.5 h-3.5" />
                        <span>{photoList.length} Foto</span>
                      </div>
                    )}

                    {/* Finished / Active Status Badge */}
                    {isFinished ? (
                      <div className="absolute top-3 left-3 bg-emerald-600/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Target Terpenuhi
                      </div>
                    ) : (
                      <div className="absolute top-3 left-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md text-[#0a3822] dark:text-[#D4AF37] px-3 py-1 rounded-full text-xs font-bold shadow flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                        Program Terbuka
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-[#0a3822] transition-colors">
                      {camp.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-5 flex-grow leading-relaxed">
                      {camp.description || "Program wakaf dan donasi pondok pesantren untuk mendukung kemaslahatan para santri."}
                    </p>

                    {/* Progress Section */}
                    <div className="space-y-3 mb-6 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                      {target > 0 ? (
                        <>
                          {/* 2-Column Info: Terkumpul vs Sisa */}
                          <div className="flex justify-between items-baseline text-sm">
                            <div>
                              <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold mb-0.5">Terkumpul ({percentage}%)</p>
                              <p className="font-bold text-[#0a3822] dark:text-[#D4AF37] text-base">
                                {formatRupiah(current)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold mb-0.5">Sisa Kebutuhan</p>
                              <p className="font-bold text-amber-700 dark:text-amber-400 text-sm">
                                {formatRupiah(remainingAmount)}
                              </p>
                            </div>
                          </div>

                          {/* Dual-Tone Animated Progress Bar */}
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 overflow-hidden flex shadow-inner">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 1.2, ease: "easeOut" }}
                              className="bg-gradient-to-r from-[#0a3822] to-[#125e3a] dark:from-[#D4AF37] dark:to-[#f5ce55] h-full rounded-l-full"
                            />
                            <div 
                              className="bg-amber-400/40 h-full" 
                              style={{ width: `${remainingPercent}%` }}
                            />
                          </div>

                          {/* Footer Progress Details */}
                          <div className="flex justify-between items-center text-[11px] text-gray-500 pt-0.5">
                            <span>Target: {formatRupiah(target)}</span>
                            <span className="font-semibold text-gray-700 dark:text-gray-300">
                              {isFinished ? "Alhamdulillah Terpenuhi" : `Kurang ${remainingPercent}% lagi`}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Dana Masuk Terkumpul</p>
                            <p className="text-lg font-bold text-[#0a3822] dark:text-[#D4AF37]">{formatRupiah(current)}</p>
                            <span className="text-[10px] text-gray-400">Donasi Berkelanjutan</span>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-[#0a3822]/10 flex items-center justify-center">
                            <Target className="w-5 h-5 text-[#0a3822]" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* CTA Action Buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      <Link
                        href={`/donasi/${camp.id}`}
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-[#0a3822] text-white px-4 py-3 rounded-xl font-bold text-sm hover:bg-[#0a3822]/90 active:scale-[0.99] transition-all shadow-md shadow-[#0a3822]/15 group/btn"
                      >
                        <span>Tunaikan Donasi</span>
                        <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                      <button
                        type="button"
                        onClick={(e) => handleShareWhatsApp(e, camp)}
                        className="inline-flex items-center justify-center p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-colors shadow-sm cursor-pointer"
                        title="Bagikan Program ke WhatsApp"
                        aria-label="Bagikan Program ke WhatsApp"
                      >
                        <Share2 className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
}
