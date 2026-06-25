"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Target, CheckCircle2, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getDirectImageUrl } from "@/lib/utils";

export default function ProfilPage() {
  const [staffs, setStaffs] = useState<any[]>([]);
  const [huffazh, setHuffazh] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [loadingStaffs, setLoadingStaffs] = useState(true);
  const [loadingHuffazh, setLoadingHuffazh] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: staffData } = await supabase
          .from("staffs")
          .select("*")
          .order("name", { ascending: true });
        if (staffData) setStaffs(staffData);
      } catch (err) {
        console.error("Error loading staffs:", err);
      } finally {
        setLoadingStaffs(false);
      }

      try {
        const { data: huffazhData } = await supabase
          .from("huffazh")
          .select("*")
          .order("category", { ascending: true })
          .order("memorized_juz", { ascending: false })
          .order("name", { ascending: true });
        if (huffazhData) setHuffazh(huffazhData);
      } catch (err) {
        console.error("Error loading huffazh:", err);
      } finally {
        setLoadingHuffazh(false);
      }
    };
    loadData();
  }, []);

  // Filter huffazh list based on search query
  const filteredHuffazh = huffazh.filter((santri) =>
    santri.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper to determine category sorting priority
  const getCategoryPriority = (catName: string): number => {
    const name = (catName || "").toLowerCase().trim();
    if (name.includes("pertama") || name.includes("kesatu") || name.endsWith(" i") || name === "i") return 1;
    if (name.includes("kedua") || name.endsWith(" ii") || name === "ii") return 2;
    if (name.includes("ketiga") || name.endsWith(" iii") || name === "iii") return 3;
    if (name.includes("keempat") || name.endsWith(" iv") || name === "iv") return 4;
    if (name.includes("kelima") || name.endsWith(" v") || name === "v") return 5;
    if (name.includes("keenam") || name.endsWith(" vi") || name === "vi") return 6;
    if (name.includes("ketujuh") || name.endsWith(" vii") || name === "vii") return 7;
    if (name.includes("kedelapan") || name.endsWith(" viii") || name === "viii") return 8;
    if (name.includes("kesembilan") || name.endsWith(" ix") || name === "ix") return 9;
    if (name.includes("kesepuluh") || name.endsWith(" x") || name === "x") return 10;

    const numMatch = name.match(/\d+/);
    if (numMatch) return parseInt(numMatch[0], 10);

    return 100;
  };

  // Group huffazh by category
  const groupedHuffazh = filteredHuffazh.reduce((acc: { [key: string]: any[] }, santri) => {
    const cat = santri.category || "Kategori Pertama";
    if (!acc[cat]) {
      acc[cat] = [];
    }
    acc[cat].push(santri);
    return acc;
  }, {});

  // Get unique categories list sorted by priority, then alphabetically
  const categoriesList = Object.keys(groupedHuffazh).sort((a, b) => {
    const prioA = getCategoryPriority(a);
    const prioB = getCategoryPriority(b);
    if (prioA !== prioB) return prioA - prioB;
    return a.localeCompare(b);
  });

  return (
    <div className="flex flex-col min-h-screen pb-12 bg-white dark:bg-background">
      {/* Hero Section */}
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
            Profil <span className="text-[#D4AF37]">Pondok Pesantren</span>
          </motion.h1>
          <div className="w-16 sm:w-24 h-0.5 bg-[#D4AF37] mx-auto mb-4 sm:mb-6" />
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto font-light leading-relaxed px-4"
          >
            Mengenal lebih dekat sejarah, visi misi, dan fasilitas pendidikan di Pondok Pesantren Tahfizh Qur'an Al-Usymuni Batuan.
          </motion.p>
        </div>
      </section>

      {/* Sejarah & Sambutan */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/20 text-secondary font-semibold text-sm">
                Sejarah Singkat
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Jejak Langkah Al-Usymuni</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Pondok Pesantren Tahfizh Qur'an Al-Usymuni Batuan didirikan pada tahun 2000 dengan niat luhur mencetak generasi yang hafal Al-Qur'an dan memahami ilmu-ilmu keislaman secara komprehensif.
              </p>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Berawal dari sebuah majelis taklim kecil, kini Al-Usymuni telah berkembang menjadi lembaga pendidikan modern yang mengintegrasikan kurikulum salaf dan pendidikan formal, tanpa meninggalkan tradisi khas pesantren.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative rounded-3xl overflow-hidden shadow-2xl h-96"
            >
              <img
                src="https://images.unsplash.com/photo-1542816417-0983c9c9ad53?q=80&w=800&auto=format&fit=crop"
                alt="Sejarah Pesantren"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Visi & Misi */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Visi & Misi</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-xl border-t-4 border-primary"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
                <Target className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Visi</h3>
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                "Terwujudnya generasi Qur'ani yang berakhlak karimah, unggul dalam IMTAQ dan IPTEK, serta mampu bersaing di era global berlandaskan manhaj Ahlussunnah wal Jama'ah."
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-xl border-t-4 border-secondary"
            >
              <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary mb-6">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Misi</h3>
              <ul className="space-y-4">
                {[
                  "Menyelenggarakan pendidikan Tahfizh Al-Qur'an dengan metode mutqin.",
                  "Mengintegrasikan ilmu agama (Diniyah) dan ilmu umum.",
                  "Membentuk karakter santri yang mandiri, disiplin, dan berjiwa pemimpin.",
                  "Mengembangkan kemampuan berbahasa Arab dan Inggris.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                    <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Struktur Kepengurusan */}
      <section className="py-24 bg-white dark:bg-background border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-4">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Struktur Organisasi
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white font-serif">
              Dewan Pengurus & Asatidz
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-4 leading-relaxed">
              Sinergi asatidz dan pengurus profesional dalam membimbing santri mencapai kualitas hafalan terbaik dan berakhlak mulia.
            </p>
          </div>

          {loadingStaffs ? (
            <div className="text-center py-12 text-gray-500">
              <div className="h-8 w-8 animate-spin border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              Memuat data kepengurusan...
            </div>
          ) : staffs.length === 0 ? (
            <div className="text-center py-12 text-gray-400 italic">
              Belum ada data pengurus yang dimasukkan.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {staffs.map((staff, idx) => (
                <motion.div
                  key={staff.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  className="group flex flex-col items-center text-center p-6 rounded-3xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:border-secondary/30 transition-all"
                >
                  <div className="relative h-28 w-28 rounded-full overflow-hidden mb-5 border-2 border-[#D4AF37]/35 group-hover:scale-105 transition-transform duration-300">
                    {staff.photo ? (
                      <img
                        src={getDirectImageUrl(staff.photo)}
                        alt={staff.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-primary/10 text-primary font-bold flex items-center justify-center text-3xl">
                        {staff.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">
                    {staff.name}
                  </h4>
                  <p className="text-xs sm:text-sm text-secondary font-medium tracking-wide uppercase mt-2">
                    {staff.position}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Data Huffazh Santri */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/20 text-secondary font-semibold text-sm mb-4">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              Huffazh Al-Qur'an
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white font-serif">
              Data Huffazh Santri
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-4 leading-relaxed">
              Daftar santri PTQA Batuan telah menyelesaikan hafalan 30 juz Al-Qur'an.
            </p>
          </div>

          {/* Search bar */}
          <div className="max-w-md mx-auto mb-10 flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Cari nama santri..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-900 dark:text-white"
              />
              <svg className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
          </div>

          {loadingHuffazh ? (
            <div className="text-center py-12 text-gray-500">
              <div className="h-8 w-8 animate-spin border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              Memuat data huffazh...
            </div>
          ) : filteredHuffazh.length === 0 ? (
            <div className="text-center py-12 text-gray-400 italic bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl">
              Tidak ada data santri yang cocok.
            </div>
          ) : (
            <div className="space-y-12">
              {categoriesList.map((catName) => (
                <div key={catName} className="space-y-6">
                  {/* Category Header */}
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-bold text-[#0B3B24] dark:text-white font-serif bg-[#D4AF37]/10 dark:bg-secondary/20 px-4 py-1.5 rounded-full border border-[#D4AF37]/20 shadow-sm shrink-0">
                      {catName}
                    </h3>
                    <div className="flex-1 h-[1px] bg-gray-200 dark:bg-gray-800" />
                  </div>

                  {/* Grid cards for this category */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groupedHuffazh[catName].map((santri, idx) => {
                      const progressPercent = Math.min(100, Math.max(0, (santri.memorized_juz / 30) * 100));
                      return (
                        <motion.div
                          key={santri.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4, delay: idx * 0.05 }}
                          className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 animate-in fade-in zoom-in duration-300"
                        >
                          <div className="h-14 w-14 rounded-full overflow-hidden shrink-0 border border-gray-100 dark:border-gray-800">
                            {santri.photo ? (
                              <img
                                src={santri.photo}
                                alt={santri.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full bg-[#D4AF37]/10 text-[#D4AF37] font-bold flex items-center justify-center text-lg">
                                {santri.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 dark:text-white truncate">
                              {santri.name}
                            </h4>
                            <p className="text-xs text-gray-500 truncate mt-0.5">
                              {santri.class_or_status}
                            </p>
                            <div className="mt-3 space-y-1">
                              <div className="flex justify-between items-center text-[10px] font-semibold">
                                <span className="text-[#0B3B24] dark:text-primary-foreground/90 bg-[#0B3B24]/10 dark:bg-primary/20 px-1.5 py-0.5 rounded">
                                  Hafalan
                                </span>
                                <span className="text-[#D4AF37] font-bold">
                                  {santri.memorized_juz} Juz
                                </span>
                              </div>
                              <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                                <div
                                  style={{ width: `${progressPercent}%` }}
                                  className="bg-gradient-to-r from-[#D4AF37] to-[#F3CE56] h-full rounded-full transition-all duration-500"
                                />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Fasilitas */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Fasilitas Pesantren</h2>
            <p className="text-gray-600 dark:text-gray-400">Lingkungan belajar yang asri dan fasilitas memadai menunjang kenyamanan santri.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Masjid Utama", img: "https://images.unsplash.com/photo-1564683214965-3619addd900d?q=80&w=400" },
              { title: "Asrama Santri yang Nyaman", img: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=400" },
              { title: "Gedung Sekolah Modern", img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=400" },
              { title: "Perpustakaan Digital", img: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=400" },
              { title: "Laboratorium Komputer", img: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=400" },
              { title: "Klinik Kesehatan", img: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=400" },
            ].map((fasilitas, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative h-64 rounded-2xl overflow-hidden shadow-lg cursor-pointer"
              >
                <img src={fasilitas.img} alt={fasilitas.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h4 className="text-xl font-bold text-white">{fasilitas.title}</h4>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
