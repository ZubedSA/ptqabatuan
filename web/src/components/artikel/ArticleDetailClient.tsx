"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { getDirectImageUrl } from "@/lib/utils";
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  BookOpen, 
  Clock, 
  Share2, 
  Loader2, 
  Copy, 
  Check, 
  Minus, 
  Plus, 
  Type, 
  Quote, 
  ChevronRight,
  Sparkles
} from "lucide-react";

export default function ArticleDetailClient({ slug }: { slug: string }) {
  const router = useRouter();
  const supabase = createClient();

  const [article, setArticle] = useState<any>(null);
  const [relatedArticles, setRelatedArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState<"base" | "lg" | "xl">("lg");
  const [copied, setCopied] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const fetchArticleData = async () => {
      try {
        const { data, error } = await supabase
          .from("articles")
          .select("*")
          .eq("slug", slug)
          .eq("is_published", true)
          .single();

        if (error || !data) {
          router.replace("/artikel");
          return;
        }

        setArticle(data);

        const { data: related } = await supabase
          .from("articles")
          .select("*")
          .eq("category", data.category)
          .eq("is_published", true)
          .neq("id", data.id)
          .order("created_at", { ascending: false })
          .limit(3);

        if (related) {
          setRelatedArticles(related);
        }
      } catch (err) {
        console.error("Error fetching article data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchArticleData();
    }
  }, [slug, router]);

  // Track reading progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleShareWhatsApp = () => {
    if (!article) return;
    const shareText = `*${article.title}*\n\nBaca selengkapnya artikel Pondok Tahfizh Qur'an Al-Usymuni Batuan:\n`;
    const shareUrl = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: shareText,
        url: shareUrl,
      }).catch(() => {});
    } else {
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + shareUrl)}`;
      window.open(waUrl, "_blank");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 pt-20">
        <Loader2 className="w-10 h-10 animate-spin text-[#0a3822] mb-4" />
        <p className="text-gray-500 font-medium animate-pulse text-sm">Menyiapkan artikel untuk Anda...</p>
      </div>
    );
  }

  if (!article) return null;

  const readingTime = Math.max(1, Math.ceil((article.content || "").split(" ").length / 200));

  // Determine font size classes
  const fontClasses = {
    base: "text-base sm:text-lg leading-relaxed sm:leading-loose",
    lg: "text-lg sm:text-xl leading-relaxed sm:leading-loose",
    xl: "text-xl sm:text-2xl leading-relaxed sm:leading-loose",
  }[fontSize];

  // Parse raw text into structured HTML paragraphs
  const rawParagraphs = (article.content || "")
    .split(/\r?\n/)
    .map((p: string) => p.trim())
    .filter((p: string) => p.length > 0);

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFBF7] dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans selection:bg-[#0a3822]/20 selection:text-[#0a3822]">
      
      {/* Top Fixed Reading Progress Indicator */}
      <div className="fixed top-0 left-0 w-full h-1 z-50 bg-gray-200/50 dark:bg-gray-800">
        <div 
          className="h-full bg-gradient-to-r from-[#0a3822] via-[#D4AF37] to-[#0a3822] transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Header Banner */}
      <section className="relative pt-24 pb-12 md:pt-32 md:pb-24 w-full bg-[#0a3822] text-white overflow-hidden">
        {article.thumbnail ? (
          <div className="absolute inset-0 z-0">
            <img 
              src={getDirectImageUrl(article.thumbnail)} 
              alt={article.title}
              className="w-full h-full object-cover opacity-25 scale-105 blur-xs"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a3822] via-[#0a3822]/80 to-black/40" />
          </div>
        ) : (
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#0a3822] via-[#0F5132] to-[#052114]">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10" />
          </div>
        )}

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-amber-200/80 mb-6 font-medium">
            <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
            <ChevronRight className="w-3.5 h-3.5 text-white/40" />
            <Link href="/artikel" className="hover:text-white transition-colors">Artikel</Link>
            <ChevronRight className="w-3.5 h-3.5 text-white/40" />
            <span className="text-white/60 truncate max-w-[160px] sm:max-w-xs">{article.title}</span>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1 bg-[#D4AF37] text-gray-950 font-bold px-3 py-1 text-xs uppercase tracking-wider rounded-full shadow-sm">
                <Sparkles className="w-3 h-3 fill-current" />
                {article.category || "Artikel"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 font-serif leading-tight sm:leading-snug tracking-normal">
              {article.title}
            </h1>

            {/* Date & Reading Time Meta Bar */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-white/80 text-xs sm:text-sm pt-4 border-t border-white/15">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#D4AF37]" />
                <span>{new Date(article.created_at).toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#D4AF37]" />
                <span>Waktu baca ~{readingTime} menit</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Article Main Section */}
      <section className="relative pb-20 pt-4 md:pt-8">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8">
          
          {/* Main Reading Card */}
          <article className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-5 sm:p-8 md:p-12 -mt-10 sm:-mt-16 md:-mt-20 relative z-20 transition-all">

            {/* Reading Helper Controls Bar */}
            <div className="flex items-center justify-between gap-4 pb-6 mb-8 border-b border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
              <Link 
                href="/artikel" 
                className="inline-flex items-center gap-1.5 text-[#0a3822] dark:text-amber-400 font-semibold hover:underline"
              >
                <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar
              </Link>

              {/* Font Resizer Control */}
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 px-2 hidden sm:inline">Ukuran Teks:</span>
                <button
                  onClick={() => setFontSize("base")}
                  className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                    fontSize === "base"
                      ? "bg-white dark:bg-gray-700 text-[#0a3822] dark:text-white shadow-xs font-bold"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                  }`}
                  title="Ukuran Standar"
                >
                  A
                </button>
                <button
                  onClick={() => setFontSize("lg")}
                  className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                    fontSize === "lg"
                      ? "bg-white dark:bg-gray-700 text-[#0a3822] dark:text-white shadow-xs font-bold"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                  }`}
                  title="Ukuran Sedang"
                >
                  A+
                </button>
                <button
                  onClick={() => setFontSize("xl")}
                  className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                    fontSize === "xl"
                      ? "bg-white dark:bg-gray-700 text-[#0a3822] dark:text-white shadow-xs font-bold"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                  }`}
                  title="Ukuran Besar"
                >
                  A++
                </button>
              </div>
            </div>

            {/* Featured Image inside card (if available) */}
            {article.thumbnail && (
              <div className="mb-10 rounded-2xl overflow-hidden shadow-md border border-gray-100 dark:border-gray-800">
                <img 
                  src={getDirectImageUrl(article.thumbnail)} 
                  alt={article.title}
                  className="w-full max-h-[480px] object-cover"
                />
                {article.title && (
                  <p className="p-3 bg-gray-50 dark:bg-gray-800/80 text-xs text-gray-500 dark:text-gray-400 text-center italic border-t border-gray-100 dark:border-gray-800">
                    Ilustrasi: {article.title}
                  </p>
                )}
              </div>
            )}

            {/* Excerpt / Lead Quote Box */}
            {article.excerpt && (
              <div className="mb-10 p-4 sm:p-6 bg-gradient-to-br from-[#0a3822]/5 via-amber-500/5 to-transparent dark:from-[#0a3822]/30 dark:via-amber-500/10 dark:to-transparent border-l-4 border-[#D4AF37] rounded-r-2xl shadow-xs">
                <div className="flex gap-3">
                  <Quote className="w-6 h-6 text-[#D4AF37] shrink-0 mt-0.5" />
                  <p className="text-base sm:text-lg text-gray-800 dark:text-gray-200 font-medium leading-relaxed italic text-justify">
                    "{article.excerpt}"
                  </p>
                </div>
              </div>
            )}

            {/* Structured Paragraph Content */}
            <div className={`space-y-6 sm:space-y-8 text-gray-800 dark:text-gray-200 font-sans tracking-wide ${fontClasses}`}>
              {rawParagraphs.map((paragraph: string, idx: number) => {
                const isArabic = /[\u0600-\u06FF]/.test(paragraph);
                const isQuote = paragraph.startsWith('"') || paragraph.startsWith('>') || paragraph.startsWith('“');
                const isHeading = paragraph.startsWith('#') || (paragraph.length < 60 && !paragraph.endsWith('.') && idx > 0 && idx % 3 === 0);

                if (isArabic) {
                  return (
                    <div 
                      key={idx} 
                      dir="rtl"
                      className="p-4 sm:p-6 my-6 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/50 rounded-2xl text-right font-arabic text-2xl sm:text-3xl leading-[2.2] text-emerald-950 dark:text-emerald-200 shadow-xs"
                    >
                      {paragraph}
                    </div>
                  );
                }

                if (isQuote) {
                  return (
                    <blockquote 
                      key={idx}
                      className="my-6 p-4 sm:p-5 border-l-4 border-[#0a3822] bg-gray-50 dark:bg-gray-800/50 rounded-r-xl italic font-serif text-gray-700 dark:text-gray-300 text-justify"
                    >
                      {paragraph.replace(/^[">“]\s*/, '')}
                    </blockquote>
                  );
                }

                if (isHeading) {
                  return (
                    <h3 
                      key={idx}
                      className="text-xl sm:text-2xl font-bold font-serif text-gray-900 dark:text-white pt-4 pb-2 border-b border-gray-100 dark:border-gray-800 text-[#0a3822] dark:text-amber-400"
                    >
                      {paragraph.replace(/^#+\s*/, '')}
                    </h3>
                  );
                }

                // First paragraph drop cap effect
                if (idx === 0) {
                  return (
                    <p key={idx} className="text-justify first-letter:text-4xl sm:first-letter:text-5xl first-letter:font-bold first-letter:font-serif first-letter:text-[#0a3822] dark:first-letter:text-amber-400 first-letter:mr-3 first-letter:float-left first-letter:leading-none">
                      {paragraph}
                    </p>
                  );
                }

                return (
                  <p key={idx} className="text-gray-800 dark:text-gray-200 leading-relaxed sm:leading-loose text-justify">
                    {paragraph}
                  </p>
                );
              })}
            </div>

            {/* Bottom Actions Bar (Share & Copy) */}
            <div className="mt-12 sm:mt-16 pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bagikan Artikel:</span>
                
                <button 
                  onClick={handleShareWhatsApp}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>WhatsApp</span>
                </button>

                <button 
                  onClick={handleCopyLink}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl transition-colors text-xs font-semibold cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Salin Tautan</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 bg-[#0a3822]/10 dark:bg-[#0a3822]/30 text-[#0a3822] dark:text-amber-300 text-xs font-bold rounded-lg border border-[#0a3822]/20">
                  #{article.category ? article.category.toLowerCase().replace(/\s+/g, '') : 'artikel'}
                </span>
                <span className="px-3 py-1.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold rounded-lg border border-amber-500/20">
                  #PTQABatuan
                </span>
              </div>
            </div>

          </article>
        </div>
      </section>

      {/* Related Articles Section */}
      {relatedArticles.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-[#FDFBF7] to-gray-100 dark:from-gray-950 dark:to-gray-900 border-t border-gray-200/60 dark:border-gray-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">Rekomendasi</span>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white font-serif">
                  Artikel Terkait Lainnya
                </h3>
              </div>
              <Link 
                href="/artikel" 
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#0a3822] dark:text-amber-400 hover:underline"
              >
                Lihat Semua <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {relatedArticles.map((related) => (
                <Link 
                  key={related.id} 
                  href={`/artikel/${related.slug}`} 
                  className="group flex flex-col bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-800">
                    {related.thumbnail ? (
                      <img 
                        src={getDirectImageUrl(related.thumbnail)} 
                        alt={related.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
                        <BookOpen className="w-12 h-12" />
                      </div>
                    )}
                    <span className="absolute top-3 left-3 bg-[#0a3822] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {related.category || "Artikel"}
                    </span>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                      <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{new Date(related.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>

                    <h4 className="text-base font-bold text-gray-900 dark:text-white mb-2 group-hover:text-[#0a3822] dark:group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug font-serif">
                      {related.title}
                    </h4>

                    {related.excerpt && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed mt-auto pt-2">
                        {related.excerpt}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

