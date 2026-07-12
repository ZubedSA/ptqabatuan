"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Target, CheckCircle2, MapPin, ArrowRight, Award, ChevronDown, ChevronUp, Calendar, History } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getDirectImageUrl } from "@/lib/utils";

export default function ProfilPage() {
  const [staffs, setStaffs] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [huffazh, setHuffazh] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"huffazh" | "khotimin">("huffazh");
  const [showFullHistory, setShowFullHistory] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);

  const toggleHistory = () => {
    const nextState = !showFullHistory;
    setShowFullHistory(nextState);
    if (nextState) {
      setTimeout(() => {
        timelineRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    }
  };

  const [loadingStaffs, setLoadingStaffs] = useState(true);
  const [loadingHuffazh, setLoadingHuffazh] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch staff roles
        const { data: rolesData } = await supabase
          .from("staff_roles")
          .select("*")
          .order("priority", { ascending: true });
        if (rolesData) setRoles(rolesData);

        // Fetch staffs
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

  // Group staffs by position
  const groupedStaffs = staffs.reduce((acc: { [key: string]: any[] }, staff) => {
    const pos = staff.position || "Lainnya";
    if (!acc[pos]) {
      acc[pos] = [];
    }
    acc[pos].push(staff);
    return acc;
  }, {});

  // Get positions that are not in staff_roles but have staff
  const otherPositions = Object.keys(groupedStaffs).filter(
    pos => !roles.some(role => role.name === pos) && groupedStaffs[pos].length > 0
  );

  // Group all roles into row groups based on priority numbers (same priority = parallel)
  const getRowGroups = (allRoles: any[]) => {
    const groupsMap: { [key: number]: any[] } = {};
    for (const role of allRoles) {
      const priority = role.priority || 0;
      if (!groupsMap[priority]) {
        groupsMap[priority] = [];
      }
      groupsMap[priority].push(role);
    }
    const sortedKeys = Object.keys(groupsMap)
      .map(Number)
      .sort((a, b) => a - b);
    return sortedKeys.map(key => groupsMap[key]);
  };

  const rowGroups = getRowGroups(roles);

  // Filter by active tab (Huffazh vs Khotimin)
  const tabFilteredHuffazh = huffazh.filter(santri => {
    if (activeTab === "huffazh") {
      return santri.has_syahadah !== false;
    } else {
      return santri.has_syahadah === false;
    }
  });

  // Filter huffazh list based on search query
  const filteredHuffazh = tabFilteredHuffazh.filter((santri) =>
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
    let cat = santri.category || "Pertama";
    // Hapus kata "Kategori" (case-insensitive) dan rapikan spasi
    cat = cat.replace(/kategori\s+/gi, '').trim();
    // Kapitalisasi huruf pertama agar rapi
    if (cat.length > 0) {
      cat = cat.charAt(0).toUpperCase() + cat.slice(1);
    }

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
            Mengenal lebih dekat sejarah, visi misi, struktur kepengurusan, data huffazh dan fasilitas di Pondok Pesantren Tahfizh Qur'an Al-Usymuni Batuan.
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
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white font-serif">Jejak Langkah Al-Usymuni</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Pondok Pesantren Tahfizh Qur'an Al-Usymuni Batuan didirikan dengan niat luhur mencetak generasi penghafal Al-Qur'an yang taqwallah, berakhlaqul karimah, berilmu amaliah, dan beramal ilmiyyah.
              </p>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Kisah pendirian pondok ini dipenuhi dengan doa ikhlas para masyayikh, amanah bimbingan yang tulus, serta restu keluarga besar yang hingga kini terus berkiprah melayani umat.
              </p>

              <button
                onClick={toggleHistory}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0a3822] hover:bg-[#0a3822]/90 text-white rounded-full text-sm font-semibold shadow hover:shadow-md transition-all cursor-pointer group"
              >
                <span>{showFullHistory ? "Tampilkan Lebih Sedikit" : "Lihat Selengkapnya"}</span>
                {showFullHistory ? (
                  <ChevronUp className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
                ) : (
                  <ChevronDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
                )}
              </button>
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

          {/* Expanded Detailed Timeline */}
          <AnimatePresence>
            {showFullHistory && (
              <motion.div
                ref={timelineRef}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="mt-16 border-t border-gray-100 dark:border-gray-800 pt-16 overflow-hidden scroll-mt-24"
              >
                <div className="text-center max-w-2xl mx-auto mb-16">
                  <h3 className="text-2xl font-bold text-[#0a3822] dark:text-white font-serif">
                    Linimasa Cikal Bakal Pendirian
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-light">
                    Kisah perjalanan doa Kyai, amanah bimbingan, hingga terwujudnya Pondok Tahfizh di Batuan.
                  </p>
                </div>

                {/* Timeline Container */}
                <div className="relative max-w-4xl mx-auto pl-6 sm:pl-0">
                  {/* Center line (Desktop only) */}
                  <div className="hidden sm:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#D4AF37] via-[#0a3822] to-[#D4AF37]/20" />
                  {/* Left line (Mobile only) */}
                  <div className="sm:hidden absolute left-3 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#D4AF37] via-[#0a3822] to-[#D4AF37]/20" />

                  {/* Timeline Item 1: Doa Sang Kyai */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="relative flex flex-col sm:flex-row items-stretch mb-12 sm:mb-16"
                  >
                    {/* Circle Node Indicator */}
                    <div className="absolute left-0 sm:left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white dark:bg-gray-900 border-4 border-[#D4AF37] flex items-center justify-center z-10">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#0a3822]" />
                    </div>

                    {/* Left Block (Desktop only) */}
                    <div className="hidden sm:flex items-center justify-end w-1/2 pr-12 text-right">
                      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/35 text-[#0a3822] dark:text-[#D4AF37] text-xs font-bold font-mono">
                        <Calendar className="w-3.5 h-3.5" />
                        Tahun 2004
                      </div>
                    </div>

                    {/* Right Block (Content Card) */}
                    <div className="w-full sm:w-1/2 pl-8 sm:pl-12">
                      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                        <div className="sm:hidden inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/35 text-[#0a3822] dark:text-[#D4AF37] text-xs font-bold font-mono mb-3">
                          <Calendar className="w-3.5 h-3.5" />
                          Tahun 2004
                        </div>
                        <h4 className="text-base sm:text-lg font-bold text-[#0a3822] dark:text-[#D4AF37] font-serif mb-1">
                          Cikal Bakal: Doa Sang Kyai
                        </h4>
                        <p className="text-[10px] text-[#D4AF37] font-semibold tracking-wider uppercase mb-3">
                          Doa & Harapan di Atas Tanah Batuan
                        </p>
                        <div className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm leading-relaxed space-y-2">
                          <p>
                            Berawal dari sebuah doa yang terucap oleh Pendiri dan Pengasuh Pondok Pesantren Al-Usymuni Tarate, <strong>Drs. KH. Abdullah Cholil, M.Hum</strong> saat ditanya oleh masyarakat pada saat membeli sebidang tanah di Desa Batuan pada tahun 2004.
                          </p>
                          <p>
                            Beliau menjawab sambil berdoa dengan penuh keikhlasan:
                          </p>
                          <span className="block font-serif italic text-[#0a3822] dark:text-[#D4AF37] bg-gray-50 dark:bg-gray-950 p-3 rounded-xl mt-3 text-center border border-gray-100 dark:border-gray-800">
                            "Mik pola deggik bede nak poto kaule majege pondok e kakdinto"<br />
                            <span className="text-[10px] font-sans text-gray-500 block mt-1">(Barangkali suatu saat nanti ada keturunan saya yang bangun pondok disini)</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Timeline Item 2: Amanah Mertua */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="relative flex flex-col sm:flex-row-reverse items-stretch mb-12 sm:mb-16"
                  >
                    {/* Circle Node Indicator */}
                    <div className="absolute left-0 sm:left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white dark:bg-gray-900 border-4 border-[#0a3822] dark:border-[#D4AF37] flex items-center justify-center z-10">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                    </div>

                    {/* Left Block (Desktop only) */}
                    <div className="hidden sm:flex items-center justify-start w-1/2 pl-12 text-left">
                      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0a3822]/10 border border-[#0a3822]/35 text-[#0a3822] dark:text-emerald-400 text-xs font-bold font-mono">
                        <History className="w-3.5 h-3.5" />
                        Bimbingan Awal
                      </div>
                    </div>

                    {/* Right Block (Content Card) */}
                    <div className="w-full sm:w-1/2 pr-0 sm:pr-12 pl-8 sm:pl-0">
                      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                        <div className="sm:hidden inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0a3822]/10 border border-[#0a3822]/35 text-[#0a3822] dark:text-emerald-400 text-xs font-bold font-mono mb-3">
                          <History className="w-3.5 h-3.5" />
                          Bimbingan Awal
                        </div>
                        <h4 className="text-base sm:text-lg font-bold text-[#0a3822] dark:text-[#D4AF37] font-serif mb-1">
                          Amanah Mertua
                        </h4>
                        <p className="text-[10px] text-[#D4AF37] font-semibold tracking-wider uppercase mb-3">
                          Bimbingan Hafalan Pertama di Congkop
                        </p>
                        <div className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm leading-relaxed space-y-2">
                          <p>
                            <strong>Lora Miftahul Arifin</strong> merupakan suami Ning Hielma Hasanah (putri bungsu Drs. KH. Abdullah Cholil, M.Hum). Pengalaman Lora Miftah dalam bidang Al-Quran membuat Sang Mertua meminta beliau untuk mencari dan memilih santri Tarate yang berminat menghafalkan Al-Quran untuk diajari dan dibimbing.
                          </p>
                          <p>
                            Atas perintah itu, Lora Miftah mengumpulkan para santri yang memiliki keinginan untuk menghafal Al-Quran dan kemudian membimbing mereka setiap ba'da subuh dan maghrib di <strong>congkop (gazebo) dhelem barat</strong>.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Timeline Item 3: Doa yang Terwujud */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="relative flex flex-col sm:flex-row items-stretch"
                  >
                    {/* Circle Node Indicator */}
                    <div className="absolute left-0 sm:left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white dark:bg-gray-900 border-4 border-[#D4AF37] flex items-center justify-center z-10">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#0a3822]" />
                    </div>

                    {/* Left Block (Desktop only) */}
                    <div className="hidden sm:flex items-center justify-end w-1/2 pr-12 text-right">
                      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-bold font-mono">
                        <Calendar className="w-3.5 h-3.5" />
                        19 Oktober 2021
                      </div>
                    </div>

                    {/* Right Block (Content Card) */}
                    <div className="w-full sm:w-1/2 pl-8 sm:pl-12">
                      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                        <div className="sm:hidden inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-bold font-mono mb-3">
                          <Calendar className="w-3.5 h-3.5" />
                          19 Oktober 2021
                        </div>
                        <h4 className="text-base sm:text-lg font-bold text-[#0a3822] dark:text-[#D4AF37] font-serif mb-1">
                          Doa yang Terwujud
                        </h4>
                        <p className="text-[10px] text-[#D4AF37] font-semibold tracking-wider uppercase mb-3">
                          Perpindahan Resmi Kegiatan Tahfizh ke Batuan
                        </p>
                        <div className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm leading-relaxed space-y-2">
                          <p>
                            Pada pertengahan tahun 1443 H pada Maulid Agung (12 Rabiul Awal) bertepatan dengan tanggal <strong>19 Oktober 2021 M</strong> (Hari Rabu), Kyai Abdullah menyuruh Lora Miftah dan santri yang ngaji ke beliau untuk pindah ke Batuan dan memulai kegiatan Al-Quran di dhelem yang sudah disiapkan setahun sebelumnya agar fokus pada kegiatan tahfizh.
                          </p>
                          <p className="border-t border-gray-100 dark:border-gray-800 pt-3 font-medium text-gray-700 dark:text-gray-200">
                            Dan sejak saat itu hingga kini, PTQA Batuan berkiprah dalam Pendidikan Al-Quran untuk mewujudkan para santri penghafal Al-Quran yang <em>taqwallah</em>, <em>berakhlaqul karimah</em>, dan <em>berilmu amaliah beramal ilmiyyah</em>.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed font-serif italic">
                "Mewujudkan para santri penghafal Al-Quran yang taqwallah, berakhlaqul karimah dan berilmu amaliah beramal ilmiyyah"
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
                  "Melaksanakan pendidikan tahfizh Al-Quran secara tuntas dan efektif.",
                  "Menumbuhkan semangat membaca, memahami dan menafsirkan Al-Qur'an serta mengamalkannya dalam kehidupan sehari-hari.",
                  "Melaksanakan pendidikan Al-Quran yang komprehensif tilawatan, fahman wa amalan.",
                  "Membekali santri dengan tazkiyatun nafs, pemahaman ilmu agama, serta bahasa Arab sebagai bekal menempuh jenjang yang lebih tinggi dan persiapan untuk terjun ke masyarakat."
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
            <div className="space-y-12">
              {/* Only render active row groups, sliced to top 3 for main page */}
              {rowGroups
                .filter(group => group.some(role => groupedStaffs[role.name] && groupedStaffs[role.name].length > 0))
                .slice(0, 3)
                .map((group, gIdx) => {
                  if (group.length === 1) {
                    const role = group[0];
                    const memberCount = groupedStaffs[role.name]?.length || 0;
                    const gridClass = memberCount >= 2
                      ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-8"
                      : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8";

                    return (
                      <div key={role.id} className="space-y-6">
                        <div className="flex items-center gap-4">
                          <h3 className="text-lg font-bold text-[#0B3B24] dark:text-white font-serif bg-[#D4AF37]/10 dark:bg-secondary/20 px-5 py-2 rounded-full border border-[#D4AF37]/20 shadow-sm shrink-0">
                            {role.name}
                          </h3>
                          <div className="flex-1 h-[1px] bg-gray-200 dark:bg-gray-800" />
                        </div>

                        <div className={gridClass}>
                          {groupedStaffs[role.name].map((staff, idx) => (
                            <motion.div
                              key={staff.id}
                              initial={{ opacity: 0, y: 20 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.5, delay: idx * 0.05 }}
                              className="group flex flex-col items-center text-center p-4 sm:p-6 rounded-3xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:border-secondary/30 transition-all"
                            >
                              <div className="relative h-20 w-20 sm:h-28 sm:w-28 rounded-full overflow-hidden mb-4 sm:mb-5 border-2 border-[#D4AF37]/35 group-hover:scale-105 transition-transform duration-300">
                                {staff.photo ? (
                                  <img
                                    src={getDirectImageUrl(staff.photo)}
                                    alt={staff.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="h-full w-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xl sm:text-3xl">
                                    {staff.name.charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <h4 className="font-bold text-sm sm:text-lg text-gray-900 dark:text-white leading-tight px-1">
                                {staff.name}
                              </h4>
                              <p className="text-[10px] sm:text-xs text-secondary font-medium tracking-wide uppercase mt-1 sm:mt-2">
                                {staff.position}
                              </p>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    );
                  } else {
                    // Parallel roles rendered side-by-side
                    return (
                      <div key={`group-${gIdx}`} className={`grid grid-cols-1 md:grid-cols-${group.length} gap-8 items-start`}>
                        {group.map((role) => {
                          const staffInRole = groupedStaffs[role.name] || [];
                          if (staffInRole.length === 0) {
                            return <div key={role.id} />; // Empty column to keep alignment
                          }
                          const memberCount = staffInRole.length;
                          const gridClass = memberCount >= 2
                            ? "grid grid-cols-2 md:grid-cols-1 gap-4"
                            : "grid grid-cols-1 gap-4";

                          return (
                            <div key={role.id} className="space-y-6">
                              <div className="flex items-center gap-4">
                                <h3 className="text-lg font-bold text-[#0B3B24] dark:text-white font-serif bg-[#D4AF37]/10 dark:bg-secondary/20 px-5 py-2 rounded-full border border-[#D4AF37]/20 shadow-sm shrink-0">
                                  {role.name}
                                </h3>
                                <div className="flex-1 h-[1px] bg-gray-200 dark:bg-gray-800" />
                              </div>

                              <div className={gridClass}>
                                {staffInRole.map((staff, idx) => (
                                  <motion.div
                                    key={staff.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: idx * 0.05 }}
                                    className="group flex flex-col items-center text-center p-4 sm:p-5 rounded-3xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:border-secondary/30 transition-all"
                                  >
                                    <div className="relative h-16 w-16 sm:h-24 sm:w-24 rounded-full overflow-hidden mb-3 border-2 border-[#D4AF37]/35 group-hover:scale-105 transition-transform duration-300">
                                      {staff.photo ? (
                                        <img
                                          src={getDirectImageUrl(staff.photo)}
                                          alt={staff.name}
                                          className="h-full w-full object-cover"
                                        />
                                      ) : (
                                        <div className="h-full w-full bg-primary/10 text-primary font-bold flex items-center justify-center text-lg sm:text-2xl">
                                          {staff.name.charAt(0).toUpperCase()}
                                        </div>
                                      )}
                                    </div>
                                    <h4 className="font-bold text-xs sm:text-base text-gray-900 dark:text-white leading-tight px-1">
                                      {staff.name}
                                    </h4>
                                    <p className="text-[9px] sm:text-xs text-secondary font-medium tracking-wide uppercase mt-1">
                                      {staff.position}
                                    </p>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }
                })}

              {/* Lihat Selengkapnya button */}
              <div className="text-center mt-12">
                <Link
                  href="/profil/pengurus"
                  className="inline-flex items-center gap-2 bg-[#0a3822] hover:bg-[#0a3822]/90 text-white px-8 py-3 rounded-full font-semibold shadow hover:shadow-md transition-all cursor-pointer"
                >
                  <span>Lihat Selengkapnya</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Data Huffazh & Khotimin Santri */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/20 text-secondary font-semibold text-sm mb-4">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              Huffazh & Khotimin PTQA Batuan
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white font-serif">
              Data Huffazh & Khotimin
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-4 leading-relaxed">
              Daftar santri PTQA Batuan yang telah menyelesaikan khataman hafalan 30 juz Al-Qur'an.
            </p>

            {/* Keterangan Perbedaan Huffazh & Khotimin */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 sm:gap-8 justify-center text-left text-xs bg-white dark:bg-gray-900/60 backdrop-blur-sm px-6 py-4.5 rounded-2xl border border-[#D4AF37]/25 shadow-sm max-w-2xl">
              <div className="flex gap-2.5 items-start">
                <span className="inline-flex items-center justify-center p-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-lg shrink-0 mt-0.5">
                  <Award className="w-4 h-4" />
                </span>
                <div>
                  <p className="font-bold text-[#0a3822] dark:text-emerald-400">Huffazh</p>
                  <p className="text-gray-500 dark:text-gray-400 text-[11px] mt-0.5 leading-relaxed">
                    Santri yang telah menyelasaikan hafalan Al-Quran 30 Juz serta lulus ujian lajnah 30 sebagai syarat mendapatkan syahadah hifzhul qur'an (ijazah/sertifikat).
                  </p>
                </div>
              </div>
              <div className="hidden sm:block w-[1px] bg-gray-200 dark:bg-gray-800 self-stretch" />
              <div className="flex gap-2.5 items-start">
                <span className="inline-flex items-center justify-center p-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 rounded-lg shrink-0 mt-0.5">
                  <BookOpen className="w-4 h-4" />
                </span>
                <div>
                  <p className="font-bold text-amber-700 dark:text-amber-400">Khotimin</p>
                  <p className="text-gray-500 dark:text-gray-400 text-[11px] mt-0.5 leading-relaxed">
                    Santri yang telah selesai menyetorkan hafalan Al-Quran 30 Juz dan berproses mengikuti ujian lajnah 30 juz.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex justify-center mb-10">
            <div className="flex p-1 bg-gray-200/60 dark:bg-gray-800 rounded-xl relative z-10">
              <button
                onClick={() => setActiveTab("huffazh")}
                className={`relative px-5 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${activeTab === "huffazh"
                  ? "text-[#0a3822] dark:text-white"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900"
                  }`}
              >
                {activeTab === "huffazh" && (
                  <motion.div
                    layoutId="activeTabBg"
                    className="absolute inset-0 bg-white dark:bg-gray-750 rounded-lg shadow-sm z-0"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Huffazh ({huffazh.filter(s => s.has_syahadah !== false).length})
                </span>
              </button>
              <button
                onClick={() => setActiveTab("khotimin")}
                className={`relative px-5 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${activeTab === "khotimin"
                  ? "text-[#0a3822] dark:text-white"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900"
                  }`}
              >
                {activeTab === "khotimin" && (
                  <motion.div
                    layoutId="activeTabBg"
                    className="absolute inset-0 bg-white dark:bg-gray-750 rounded-lg shadow-sm z-0"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Khotimin ({huffazh.filter(s => s.has_syahadah === false).length})
                </span>
              </button>
            </div>
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
                                src={getDirectImageUrl(santri.photo)}
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
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[#0B3B24] dark:text-primary-foreground/90 bg-[#0B3B24]/10 dark:bg-primary/20 px-1.5 py-0.5 rounded">
                                    Hafalan
                                  </span>
                                  {santri.has_syahadah !== false && (
                                    <span className="inline-flex items-center gap-0.5 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 px-1.5 py-0.5 rounded text-[9px] font-bold border border-emerald-100 dark:border-emerald-900/35">
                                      <Award className="w-3 h-3 shrink-0" />
                                      Syahadah
                                    </span>
                                  )}
                                </div>
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
              { title: "Musholla PTQA", img: "/musholla.jpeg" },
              { title: "Asrama Santri", img: "/kelas.jpeg" },
              { title: "Gedung Maqori' PTQA", img: "/ruang maqori'.jpeg" },
              { title: "Studio Maqori' PTQA", img: "/studio.jpeg" },
              { title: "Lapangan Olahraga", img: "/lapangan.jpeg" },
              { title: "Dapur Santri", img: "/dapur.jpeg" },
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
