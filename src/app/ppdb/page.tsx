"use client";

import { motion } from "framer-motion";
import { FileText, UploadCloud, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function PPDBPage() {
  return (
    <div className="min-h-screen pt-24 pb-12 bg-white dark:bg-background">
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

        <div className="grid md:grid-cols-3 gap-8 relative">
          {[
            {
              icon: <FileText className="w-8 h-8 text-primary" />,
              title: "1. Isi Formulir",
              desc: "Mengisi data diri calon santri dan orang tua/wali dengan lengkap dan benar pada formulir online."
            },
            {
              icon: <UploadCloud className="w-8 h-8 text-secondary" />,
              title: "2. Upload Berkas",
              desc: "Mengunggah dokumen persyaratan seperti KK, Akte Kelahiran, Ijazah, dan Pas Foto."
            },
            {
              icon: <CheckCircle className="w-8 h-8 text-green-500" />,
              title: "3. Verifikasi & Pengumuman",
              desc: "Tunggu proses verifikasi oleh panitia. Hasil seleksi akan diumumkan melalui WhatsApp dan website."
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

        <div className="mt-20 text-center">
          <Link 
            href="/ppdb/daftar"
            className="inline-flex items-center gap-2 px-10 py-5 rounded-full bg-primary text-white font-bold text-lg hover:bg-primary/90 transition-all shadow-xl shadow-primary/30 transform hover:-translate-y-1"
          >
            Mulai Pendaftaran Online
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div className="mt-6 flex justify-center gap-4">
            <Link href="/ppdb/status" className="text-primary hover:underline font-medium">Cek Status Pendaftaran</Link>
            <span className="text-gray-300">|</span>
            <a href="/panduan-ppdb.pdf" className="text-gray-600 hover:underline dark:text-gray-400 font-medium">Unduh Brosur & Persyaratan</a>
          </div>
        </div>
      </section>
    </div>
  );
}
