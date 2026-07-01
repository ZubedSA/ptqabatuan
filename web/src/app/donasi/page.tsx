"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Heart, Target, ChevronRight, Loader2 } from "lucide-react";

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
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(angka);
  };

  return (
    <div className="flex flex-col min-h-screen pb-12 bg-white dark:bg-background">
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#0a3822]/5 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-6">
            <Heart className="w-4 h-4 text-red-500" />
            Amal Jariyah
          </div>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 font-serif leading-tight"
          >
            Peluang Kebaikan <span className="text-[#D4AF37]">Bersama</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed"
          >
            Mari wujudkan sarana pendidikan dan ibadah yang lebih baik untuk para santri penghafal Al-Qur'an melalui program wakaf dan donasi.
          </motion.p>
        </div>
      </section>

      {/* Campaigns Grid */}
      <section className="py-16 flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <p className="text-gray-500 font-medium animate-pulse">Memuat program kebaikan...</p>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-24 bg-gray-50 dark:bg-gray-800/30 rounded-3xl border border-gray-100 dark:border-gray-800">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Belum Ada Program</h3>
            <p className="text-gray-500">Saat ini belum ada program donasi yang aktif.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {campaigns.map((camp, idx) => {
              const percentage = camp.target_amount > 0 
                ? Math.min(100, Math.round((camp.current_amount / camp.target_amount) * 100)) 
                : 0;

              return (
                <motion.div
                  key={camp.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 flex flex-col h-full"
                >
                  <div className="p-6 md:p-8 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2 mb-3">
                      {camp.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-6 flex-grow">
                      {camp.description}
                    </p>

                    {/* Progress Section */}
                    <div className="space-y-4 mb-8">
                      {camp.target_amount > 0 ? (
                        <>
                          <div className="flex justify-between items-end text-sm">
                            <div>
                              <p className="text-gray-500 mb-1">Terkumpul</p>
                              <p className="font-bold text-[#0a3822] dark:text-[#D4AF37] text-lg">
                                {formatRupiah(camp.current_amount)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-gray-500 mb-1">Target</p>
                              <p className="font-semibold text-gray-700 dark:text-gray-300">
                                {formatRupiah(camp.target_amount)}
                              </p>
                            </div>
                          </div>
                          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                              className="bg-gradient-to-r from-[#0a3822] to-[#125e3a] dark:from-[#D4AF37] dark:to-[#f5ce55] h-full rounded-full"
                            />
                          </div>
                          <p className="text-xs font-semibold text-right text-[#0a3822] dark:text-[#D4AF37]">
                            {percentage}% Tercapai
                          </p>
                        </>
                      ) : (
                        <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Dana Terkumpul</p>
                            <p className="text-xl font-bold text-primary">{formatRupiah(camp.current_amount)}</p>
                          </div>
                          <Target className="w-8 h-8 text-primary/30" />
                        </div>
                      )}
                    </div>

                    <Link
                      href={`/donasi/${camp.id}`}
                      className="w-full inline-flex items-center justify-center gap-2 bg-[#0a3822] text-white px-6 py-3.5 rounded-xl font-bold hover:bg-[#0a3822]/90 transition-colors group"
                    >
                      Tunaikan Donasi
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
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
