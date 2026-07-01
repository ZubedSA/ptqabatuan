"use client";

import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, CheckCircle, FileText, CalendarClock, Phone, Wallet, Info, FileSpreadsheet } from "lucide-react";
import Link from "next/link";

export default function PPDBPanduanPage() {
  const persyaratanUmum = [
    "Lulusan SD/sederajat",
    "Sehat jasmani dan rohani, bebas narkoba, tidak merokok dan bebas penyakit menular",
    "Berkelakuan baik",
    "Tidak terlibat pelanggaran hukum",
    "Mendapatkan restu dan izin kedua orang tua",
    "Bersedia mengikuti disiplin pondok dan siap menyelesaikan pendidikan",
    "Lancar membaca dan menulis Al-Qur'an",
    "Lulus tes masuk",
  ];

  const persyaratanAdministrasi = [
    "Mengisi formulir",
    "Membayar uang pendaftaran",
    "Surat Keterangan Kelas VI SD / Ijazah",
    "Fotocopy Akta Kelahiran (2 lembar)",
    "Fotokopi Kartu Keluarga (2 lembar)",
    "Surat Keterangan Sehat",
    "Surat Pernyataan Restu dan Izin dari orangtua/wali",
  ];

  const biayaAwal = [
    { name: "Pendaftaran", amount: "Rp. 150.000,-" },
    { name: "Uang Pangkal", amount: "Rp. 800.000,-" },
    { name: "Infaq Pembangunan", amount: "Rp. 500.000,-" },
    { name: "Sewa Lemari", amount: "Rp. 250.000,-" },
    { name: "Sewa Kasur", amount: "Rp. 300.000,-" },
    { name: "Jasket Pondok", amount: "Rp. 465.000,-" },
    { name: "Meja Mushaf", amount: "Rp. 35.000,-" },
  ];

  const biayaBulanan = [
    { name: "SPP", amount: "Rp. 150.000,-" },
    { name: "Uang Makan", amount: "Rp. 450.000,-" },
  ];

  const timeline = [
    {
      title: "Waktu Pendaftaran",
      date: "23 April - 01 Mei",
      desc: "Pendaftaran dibuka untuk calon santri baru."
    },
    {
      title: "Tes Masuk dan Ujian",
      date: "02 - 04 Mei",
      desc: "Wajib Karantina di Pondok selama 2 Hari."
    },
    {
      title: "Pengumuman Hasil Tes",
      date: "07 Mei",
      desc: "Pengumuman kelulusan calon santri baru."
    },
    {
      title: "Pendaftaran Ulang",
      date: "15 & 18 Juni",
      desc: "Daftar ulang bagi santri yang dinyatakan lulus."
    }
  ];

  return (
    <div className="min-h-screen pt-24 pb-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Link href="/ppdb" className="inline-flex items-center gap-2 text-gray-600 hover:text-[#0B3B24] mb-6 font-medium transition-colors text-sm md:text-base">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Portal PPDB
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden mb-10">
          <div className="bg-[#0B3B24] p-8 md:p-12 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]" />
            <div className="relative z-10 text-center">
              <div className="w-16 h-16 bg-[#D4AF37]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-8 h-8 text-[#D4AF37]" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">Panduan & Informasi PPDB</h1>
              <p className="text-gray-300 max-w-2xl mx-auto text-sm md:text-base">
                Informasi lengkap mengenai persyaratan, pembiayaan, jadwal, dan layanan pendaftaran santri baru Pondok Pesantren Tahfizh Qur'an Al-Usymuni.
              </p>
            </div>
          </div>

          <div className="p-6 md:p-12 space-y-12">
            
            {/* Persyaratan Grid */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Persyaratan Umum */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Persyaratan Umum</h2>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 h-full">
                  <ul className="space-y-3">
                    {persyaratanUmum.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="font-bold text-gray-400 dark:text-gray-500 mt-0.5">{idx + 1}.</span>
                        <span className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* Persyaratan Administrasi */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Persyaratan Administrasi</h2>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 h-full">
                  <ul className="space-y-3">
                    {persyaratanAdministrasi.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="font-bold text-gray-400 dark:text-gray-500 mt-0.5">{idx + 1}.</span>
                        <span className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            </div>

            <hr className="border-gray-100 dark:border-gray-700" />

            {/* Pembiayaan Section */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Informasi Pembiayaan</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Pembiayaan Awal */}
                <div className="border border-green-100 dark:border-green-900/30 rounded-2xl overflow-hidden shadow-sm">
                  <div className="bg-green-50 dark:bg-green-900/20 px-6 py-4 border-b border-green-100 dark:border-green-900/30">
                    <h3 className="font-bold text-[#0B3B24] dark:text-green-400">Pembiayaan Awal</h3>
                  </div>
                  <div className="p-6 bg-white dark:bg-gray-800">
                    <div className="space-y-3">
                      {biayaAwal.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                          <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
                          <span className="font-medium text-gray-900 dark:text-gray-200">{item.amount}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700 flex justify-between items-center">
                      <span className="font-bold text-gray-900 dark:text-white">Total</span>
                      <span className="font-bold text-[#D4AF37] text-lg">Rp. 2.500.000,-</span>
                    </div>
                  </div>
                </div>

                {/* Biaya Bulanan */}
                <div className="border border-blue-100 dark:border-blue-900/30 rounded-2xl overflow-hidden shadow-sm h-fit">
                  <div className="bg-blue-50 dark:bg-blue-900/20 px-6 py-4 border-b border-blue-100 dark:border-blue-900/30">
                    <h3 className="font-bold text-blue-800 dark:text-blue-400">Biaya Bulanan</h3>
                  </div>
                  <div className="p-6 bg-white dark:bg-gray-800">
                    <div className="space-y-3">
                      {biayaBulanan.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                          <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
                          <span className="font-medium text-gray-900 dark:text-gray-200">{item.amount}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700 flex justify-between items-center">
                      <span className="font-bold text-gray-900 dark:text-white">Total</span>
                      <span className="font-bold text-[#D4AF37] text-lg">Rp. 600.000,-</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <hr className="border-gray-100 dark:border-gray-700" />

            {/* Timeline Section */}
            <section>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 flex items-center justify-center">
                  <CalendarClock className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Timeline Pendaftaran</h2>
              </div>
              
              <div className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-4 md:ml-6 space-y-10 pb-4">
                {timeline.map((item, idx) => (
                  <div key={idx} className="relative pl-6 md:pl-8">
                    <div className="absolute w-5 h-5 bg-white dark:bg-gray-800 rounded-full -left-[11px] top-1 flex items-center justify-center">
                      <div className="w-3 h-3 bg-[#0B3B24] rounded-full" />
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800/80 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 inline-block w-full">
                      <h3 className="text-lg font-bold text-[#0B3B24] dark:text-[#D4AF37] mb-1">{item.date}</h3>
                      <h4 className="font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide text-sm">{item.title}</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>
        </div>

        {/* Layanan Informasi Box */}
        <div className="bg-white dark:bg-gray-800 border-2 border-[#0B3B24] rounded-2xl md:rounded-3xl p-8 shadow-xl text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-[#D4AF37]" />
          
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#0B3B24]/10 text-[#0B3B24] rounded-2xl mb-4">
            <Info className="w-8 h-8" />
          </div>
          
          <h2 className="text-2xl font-bold text-[#0B3B24] dark:text-white mb-2">Layanan Informasi & Pendaftaran</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-lg mx-auto">
            Layanan Informasi Setiap Hari Kerja:<br/>
            Sabtu s/d Kamis Jam 08:00 - 11:00 WIB (Jum'at Libur)
          </p>

          <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 max-w-sm mx-auto mb-8">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Hubungi Kami</p>
            <a 
              href="https://wa.me/6282338427319" 
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-3 text-2xl font-bold text-[#0B3B24] dark:text-[#D4AF37] hover:underline"
            >
              <Phone className="w-6 h-6" />
              +62 823 3842 7319
            </a>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-2">Ust. Hanafi, S.H.</p>
          </div>

          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Head Office</p>
            <p className="text-gray-800 dark:text-gray-300 font-medium max-w-xs mx-auto">
              Ruang Kantor, Gedung KH. Muhammad Cholil<br/>PTQA Batuan Sumenep
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
