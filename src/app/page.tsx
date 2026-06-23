"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BookOpen, Users, Award, Building2 } from "lucide-react";

const stats = [
  { label: "Santri Aktif", value: "30+", icon: Users },
  { label: "Pengajar & Asatidz", value: "10+", icon: BookOpen },
  { label: "Santri Huffazh", value: "10+", icon: Award },
  { label: "Fasilitas Modern", value: "10+", icon: Building2 },
];

const programs = [
  {
    title: "Tahfizh Al-Qur'an",
    description: "Program unggulan hafalan 30 juz dengan sanad bersambung dan metode mutqin.",
    image: "https://images.unsplash.com/photo-1609599006353-e629aaab31fa?q=80&w=600&auto=format&fit=crop",
  },
  {
    title: "Diniyah & Kitab Kuning",
    description: "Pengkajian turats Islami berhaluan Ahlussunnah wal Jama'ah.",
    image: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=600&auto=format&fit=crop",
  },
  {
    title: "Bahasa Arab & Inggris",
    description: "Pembiasaan bahasa asing harian untuk mencetak generasi global.",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600&auto=format&fit=crop",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#0a3822] via-primary to-[#051c11]">
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto mt-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <span className="text-[#D4AF37] tracking-[0.1em] sm:tracking-[0.2em] text-xs sm:text-sm md:text-base font-semibold uppercase mb-6 sm:mb-8 text-center leading-relaxed">
              PP. TAHFIZH QUR'AN AL-USYMUNI BATUAN
            </span>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 sm:mb-8 leading-tight sm:leading-snug font-serif text-center">
              Mencetak Generasi <span className="text-[#D4AF37]">Qur'ani</span> & Berakhlak Mulia
            </h1>

            <div className="w-16 sm:w-24 h-0.5 bg-[#D4AF37] mb-6 sm:mb-8" />

            <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-10 sm:mb-12 max-w-3xl mx-auto font-light leading-relaxed text-center">
              Pondok Pesantren Tahfizh Qur'an Al-Usymuni Batuan mendidik santri menjadi hafidz yang menguasai ilmu agama, teknologi, dan bahasa untuk menjawab tantangan zaman.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full sm:w-auto">
              <Link
                href="/ppdb"
                className="w-full sm:w-auto px-10 py-4 bg-[#D4AF37] text-[#0B3B24] font-bold text-sm tracking-wider uppercase hover:bg-[#F3CE56] transition-all transform hover:-translate-y-1 shadow-[0_4px_14px_0_rgba(212,175,55,0.39)]"
              >
                Daftar Sekarang
              </Link>
              <Link
                href="/profil"
                className="w-full sm:w-auto px-10 py-4 bg-transparent border border-white/40 text-white font-bold text-sm tracking-wider uppercase hover:bg-white/10 transition-all backdrop-blur-sm"
              >
                Jelajahi Profil
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Decorative Arabesque SVG could go here */}
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white dark:bg-background">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col items-center text-center p-6 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:border-secondary/50 transition-all group"
              >
                <div className="h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <stat.icon className="h-7 w-7" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stat.value}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Definisi & Trilogi Santri Section */}
      <section className="py-24 bg-white dark:bg-background border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-stretch">

            {/* Kiri: Definisi Santri */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center text-center bg-gray-50/50 dark:bg-gray-900/30 p-8 sm:p-10 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm h-full"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-8">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Definisi Santri
              </div>

              {/* Arabic Quote */}
              <p
                className="text-xl sm:text-2xl font-arabic text-primary leading-loose text-center mb-8 tracking-wide select-none"
                dir="rtl"
              >
                بِشَاهِدِ حَالِهِ هُوَ مَنْ يَعْتَصِمُ بِحَبْلِ اللهِ اْلمَتِيْنِ، وَيَتَّبِعُ سنَّةَ الرَّسُوْلِ اْلاَمِيْنِ ﷺ ، وَلاَ يَمِيْلُ يُمْنَةً وَلاَيُسْرَةً فِي كُلِّ وَقْتٍ وَحِيْنٍ ، هَذَا مَعْنَاهُ بِالسِّيْرَةِ وَالْحَقِيْقَةِ لاَ يُبَدَّلُ وَلاَيُغَيَّرُ قَدِيْمًا وَحَدِيْثًا وَاللهُ اَعْلَمُ بِنَفْسِ اْلاَمْرِ وَحَقِيْقَةِ اْلحَالِ
              </p>

              {/* Decorative Divider */}
              <div className="flex items-center justify-center gap-3 mb-8 w-full">
                <div className="h-[1px] bg-[#D4AF37]/30 flex-1 max-w-[80px]" />
                <span className="text-[#D4AF37] text-sm">✦</span>
                <div className="h-[1px] bg-[#D4AF37]/30 flex-1 max-w-[80px]" />
              </div>

              {/* Indonesian Translation */}
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-sans italic leading-relaxed mb-8 flex-1">
                "Santri berdasarkan peninjauan tindak langkahnya adalah 'Orang yang berpegang teguh dengan Al-Qur'an dan mengikuti sunnah Rasul ﷺ serta teguh pendirian.' Ini adalah arti dengan bersandar sejarah dan kenyataan yang tidak dapat diganti dan diubah selama-lamanya."
              </p>

              {/* Author */}
              <span className="text-[#D4AF37] font-sans font-bold text-xs tracking-wider uppercase mt-auto">
                KH. Hasani Nawawi Sidogiri
              </span>
            </motion.div>

            {/* Kanan: Trilogi Santri */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex flex-col h-full bg-gradient-to-br from-[#0B3B24]/5 to-transparent dark:from-[#0B3B24]/10 p-8 sm:p-10 rounded-3xl border border-[#D4AF37]/20 shadow-sm"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary/15 text-secondary font-semibold text-sm mb-8 self-center lg:self-start">
                <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                Trilogi Santri
              </div>

              {/* Subtitle / Intro */}
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-8 text-center lg:text-left leading-relaxed">
                Tiga prinsip utama landasan langkah hidup dan pendidikan santri Pondok Pesantren Tahfizh Qur'an Al-Usymuni Batuan:
              </p>

              {/* Pillars list */}
              <div className="space-y-8 mb-8 flex-1">
                {[
                  { num: "01", title: "Taqwallah", desc: "Senantiasa meningkatkan ketakwaan dan menjaga hubungan dengan Allah SWT." },
                  { num: "02", title: "Berakhlakul Karimah", desc: "Membiasakan etika luhur, budi pekerti mulia, dan penghormatan kepada sesama." },
                  { num: "03", title: "Berilmu Amaliyah & Beramal Ilmiyah", desc: "Mengamalkan setiap ilmu yang didapat dan mendasari amal perbuatan dengan ilmu." }
                ].map((item, index) => (
                  <div key={index} className="flex gap-4 items-start group">
                    <span className="text-2xl sm:text-3xl font-bold text-[#D4AF37]/45 group-hover:text-[#D4AF37] transition-colors leading-none pt-0.5">
                      {item.num}
                    </span>
                    <div className="flex flex-col">
                      <h4 className="text-lg font-bold text-[#0B3B24] dark:text-white group-hover:text-secondary transition-colors leading-tight">
                        {item.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1.5 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Author */}
              <span className="text-[#D4AF37] font-sans font-bold text-xs tracking-wider uppercase mt-auto text-center lg:text-left">
                Drs. KH. Abdullah Cholil, M.Hum
              </span>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Sambutan Pengasuh */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl mb-10 lg:mb-0"
            >
              <img
                src="https://images.unsplash.com/photo-1552858725-2758b5fb1286?q=80&w=800&auto=format&fit=crop"
                alt="Pengasuh Pondok"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8">
                <h3 className="text-2xl font-bold text-white">KH. Miftahul Arifin, Lc.</h3>
                <p className="text-secondary">Pengasuh PTQA BATUAN</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-6">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Sambutan Pengasuh
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Membangun Peradaban Melalui Pendidikan Qur'ani
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                "Alhamdulillah, segala puji bagi Allah. Pondok Pesantren Al-Usymuni hadir sebagai jawaban atas tantangan umat di era modern. Kami berkomitmen untuk tidak hanya mencetak penghafal Al-Qur'an, tetapi juga generasi yang memahami maknanya, mengamalkan isinya, dan berakhlak mulia di tengah masyarakat."
              </p>
              <p className="text-2xl font-arabic text-primary mb-8 text-right leading-loose" dir="rtl">
                خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ
              </p>
              <p className="text-sm text-gray-500 italic text-right mb-8">
                "Sebaik-baik kalian adalah yang mempelajari Al-Qur'an dan mengajarkannya." (HR. Bukhari)
              </p>
              <Link
                href="/profil"
                className="inline-flex items-center gap-2 text-primary font-bold hover:text-primary/80 transition-colors group"
              >
                Baca Selengkapnya
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Program Unggulan */}
      <section className="py-24 bg-white dark:bg-background">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">Program Unggulan</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Kurikulum integratif yang menggabungkan pendidikan salafiyah dan modern untuk mencetak santri yang tangguh.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {programs.map((program, index) => (
              <motion.div
                key={program.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="group rounded-3xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl hover:shadow-2xl transition-all"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={program.image}
                    alt={program.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <h3 className="absolute bottom-6 left-6 text-2xl font-bold text-white">{program.title}</h3>
                </div>
                <div className="p-8">
                  <p className="text-gray-600 dark:text-gray-400 mb-6">{program.description}</p>
                  <Link
                    href="/program"
                    className="inline-flex items-center gap-2 text-primary font-semibold hover:text-secondary transition-colors"
                  >
                    Detail Program
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA PPDB */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]" />
        </div>
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Mari Bergabung Bersama Kami
            </h2>
            <p className="text-xl text-gray-200 mb-10">
              Pendaftaran Santri Baru Tahun Ajaran 2026/2027 telah dibuka. Kuota terbatas.
            </p>
            <Link
              href="/ppdb"
              className="inline-block px-10 py-5 rounded-full bg-secondary text-primary font-bold text-xl hover:bg-white hover:text-primary transition-all shadow-xl shadow-secondary/20 transform hover:-translate-y-1"
            >
              Daftar PPDB Online Sekarang
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
