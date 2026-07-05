"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { getDirectImageUrl } from "@/lib/utils";
import { Search, Calendar, User, ArrowRight, Loader2, BookOpen } from "lucide-react";

export default function BeritaPage() {
  const supabase = createClient();
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [categories, setCategories] = useState<string[]>(["Semua"]);

  useEffect(() => {
    const fetchNews = async () => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (data) {
        setNews(data);

        // Extract unique categories
        const uniqueCats = Array.from(new Set(data.map(d => d.category).filter(Boolean))) as string[];
        setCategories(["Semua", ...uniqueCats]);
      }
      setLoading(false);
    };

    fetchNews();
  }, []);

  const filteredNews = news.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.excerpt && item.excerpt.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "Semua" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredNews = filteredNews.length > 0 ? filteredNews[0] : null;
  const regularNews = filteredNews.length > 1 ? filteredNews.slice(1) : [];

  return (
    <div className="flex flex-col min-h-screen pb-12 bg-white dark:bg-background">
      {/* Header Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-20 overflow-hidden bg-gray-50 dark:bg-gray-900/50">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#0a3822]/5 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-6">
            <BookOpen className="w-4 h-4" />
            Kabar & Informasi
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 font-serif leading-tight"
          >
            Berita <span className="text-[#D4AF37]">PTQA</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed"
          >
            Temukan berita terbaru, kegiatan santri, pengumuman, dan berbagai informasi seputar Pondok Pesantren Tahfizh Qur'an Al-Usymuni Batuan.
          </motion.p>
        </div>
      </section>

      {/* Filter & Search */}
      <section className="py-8 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Category Pills */}
            <div className="flex overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === cat
                    ? "bg-[#0a3822] text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-80 shrink-0">
              <input
                type="text"
                placeholder="Cari berita..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-900 dark:text-white transition-all"
              />
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 md:py-16 flex-1">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-gray-500">Memuat berita...</p>
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-800">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Tidak Ditemukan</h3>
              <p className="text-gray-500">Belum ada berita yang cocok dengan pencarian atau filter Anda.</p>
            </div>
          ) : (
            <div className="space-y-16">
              {/* Featured News */}
              {featuredNews && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="group relative bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-xl border border-gray-100 dark:border-gray-800 flex flex-col lg:flex-row"
                >
                  <div className="lg:w-3/5 h-64 sm:h-80 lg:h-auto relative overflow-hidden">
                    {featuredNews.thumbnail ? (
                      <img
                        src={getDirectImageUrl(featuredNews.thumbnail)}
                        alt={featuredNews.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-gray-300" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="bg-[#D4AF37] text-white px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full shadow-lg">
                        {featuredNews.category}
                      </span>
                    </div>
                  </div>
                  <div className="lg:w-2/5 p-8 md:p-12 flex flex-col justify-center">
                    <div className="flex items-center gap-4 text-xs font-medium text-gray-500 mb-4">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-primary" />
                        {new Date(featuredNews.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                    <Link href={`/berita/${featuredNews.slug}`}>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-primary transition-colors font-serif leading-tight">
                        {featuredNews.title}
                      </h2>
                    </Link>
                    <p className="text-gray-600 dark:text-gray-300 mb-8 line-clamp-3 leading-relaxed">
                      {featuredNews.excerpt || "Baca selengkapnya mengenai berita ini..."}
                    </p>
                    <Link
                      href={`/berita/${featuredNews.slug}`}
                      className="inline-flex items-center gap-2 text-primary font-semibold hover:text-[#D4AF37] transition-colors group/link mt-auto w-fit"
                    >
                      Baca Selengkapnya
                      <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              )}

              {/* Grid News */}
              {regularNews.length > 0 && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {regularNews.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      className="group flex flex-col bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-md hover:shadow-xl border border-gray-100 dark:border-gray-800 transition-all"
                    >
                      <Link href={`/berita/${item.slug}`} className="relative h-48 overflow-hidden block">
                        {item.thumbnail ? (
                          <img
                            src={getDirectImageUrl(item.thumbnail)}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <BookOpen className="w-10 h-10 text-gray-300" />
                          </div>
                        )}
                        <div className="absolute top-3 left-3">
                          <span className="bg-white/90 backdrop-blur-sm text-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded shadow-sm">
                            {item.category}
                          </span>
                        </div>
                      </Link>
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex items-center gap-2 text-[11px] font-medium text-gray-500 mb-3">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(item.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                        <Link href={`/berita/${item.slug}`}>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors line-clamp-2">
                            {item.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4 flex-1">
                          {item.excerpt || "Klik untuk membaca selengkapnya..."}
                        </p>
                        <Link
                          href={`/berita/${item.slug}`}
                          className="text-primary text-sm font-semibold flex items-center gap-1 group-hover:text-[#D4AF37] transition-colors w-fit"
                        >
                          Baca Berita <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
