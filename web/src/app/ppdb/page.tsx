"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { FileText, PenTool, CheckCircle, UserCheck, ArrowRight, AlertCircle, Lock } from "lucide-react";
import Link from "next/link";

export default function PPDBPage() {
  const [isOpen, setIsOpen] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const { data, error } = await supabase.from("settings").select("is_ppdb_open").eq("id", 1).single();
        if (!error && data && typeof data.is_ppdb_open === "boolean") {
          setIsOpen(data.is_ppdb_open);
        }
      } catch (e) {
        console.error("Error check PPDB:", e);
      }
    };
    checkStatus();
  }, []);
  return (
    <div className="min-h-screen pb-12 bg-white dark:bg-background">
      {/* Header */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#0a3822] via-primary to-[#051c11]">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 font-serif leading-tight"
          >
            Penerimaan Peserta Didik Baru (PPDB)
          </motion.h1>
          <div className="w-16 sm:w-24 h-0.5 bg-[#D4AF37] mx-auto mb-4 sm:mb-6" />
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto font-light leading-relaxed px-4"
          >
            Pendaftaran santri baru Pondok Pesantren Tahfizh Qur'an Al-Usymuni Batuan Tahun Ajaran 2026/2027 dapat dilakukan secara online melalui portal ini.
          </motion.p>
        </div>
      </section>

      {/* Alur Pendaftaran */}
      <section className="py-20 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Alur Pendaftaran</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-4">Langkah-langkah pendaftaran santri baru secara online.</p>
        </div>

        <div className={`grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative transition-all duration-300 ${!isOpen ? "opacity-45 filter grayscale pointer-events-none select-none" : ""}`}>
          {[
            {
              icon: <FileText className="w-8 h-8 text-primary" />,
              title: "1. Pendaftaran Awal",
              desc: "Mengisi formulir pendaftaran secara online dan melengkapi unggahan berkas persyaratan."
            },
            {
              icon: <PenTool className="w-8 h-8 text-secondary" />,
              title: "2. Tes Masuk & Ujian",
              desc: "Calon santri wajib mengikuti tes masuk dan melakukan karantina di pondok selama dua hari."
            },
            {
              icon: <CheckCircle className="w-8 h-8 text-green-500" />,
              title: "3. Pengumuman Hasil",
              desc: "Hasil seleksi tes masuk akan diinformasikan melalui WhatsApp dan dapat dicek pada website kami."
            },
            {
              icon: <UserCheck className="w-8 h-8 text-blue-500" />,
              title: "4. Pendaftaran Ulang",
              desc: "Bagi calon santri yang dinyatakan lulus, wajib melakukan daftar ulang dan melengkapi pembiayaan awal."
            }
          ].map((step, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-gray-50 dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 text-center relative z-10"
            >
              <div className="w-16 h-16 mx-auto bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-md mb-6">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{step.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{step.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 text-center space-y-6">
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto p-4 bg-red-50 dark:bg-red-950/40 border-2 border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-3.5 text-left text-red-800 dark:text-red-300 shadow-sm"
            >
              <AlertCircle className="w-6 h-6 shrink-0 text-red-600 dark:text-red-400" />
              <div>
                <h4 className="font-bold text-sm">Pendaftaran Ditutup</h4>
                <p className="text-xs mt-0.5 leading-relaxed">
                  Mohon maaf, Pendaftaran Santri Baru (PPDB) PTQA Batuan saat ini masih ditutup atau belum dibuka. Silakan pantau informasi selanjutnya.
                </p>
              </div>
            </motion.div>
          )}

          {isOpen ? (
            <Link 
              href="/ppdb/daftar"
              className="inline-flex items-center gap-2 px-10 py-5 rounded-full bg-primary text-white font-bold text-lg hover:bg-primary/90 transition-all shadow-xl shadow-primary/30 transform hover:-translate-y-1"
            >
              Mulai Pendaftaran Online
              <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <button 
              disabled
              className="inline-flex items-center gap-2 px-10 py-5 rounded-full bg-gray-300 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-bold text-lg cursor-not-allowed border border-gray-400/30"
            >
              <Lock className="w-5 h-5" />
              PPDB Masih Ditutup
            </button>
          )}
          <div className="mt-6 flex flex-wrap justify-center items-center gap-4">
            {isOpen ? (
              <Link href="/ppdb/status" className="text-primary hover:underline font-medium">Cek Status Pendaftaran</Link>
            ) : (
              <span className="text-gray-400 dark:text-gray-600 font-medium cursor-not-allowed inline-flex items-center gap-1"><Lock className="w-3 h-3" /> Cek Status Pendaftaran</span>
            )}
            <span className="text-gray-300 hidden sm:inline">|</span>
            {isOpen ? (
              <Link href="/ppdb/panduan" className="text-gray-600 hover:underline dark:text-gray-400 font-medium">Buku Panduan & Persyaratan</Link>
            ) : (
              <span className="text-gray-400 dark:text-gray-600 font-medium cursor-not-allowed inline-flex items-center gap-1"><Lock className="w-3 h-3" /> Buku Panduan & Persyaratan</span>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
