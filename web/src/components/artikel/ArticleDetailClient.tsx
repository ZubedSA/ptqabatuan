"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { getDirectImageUrl } from "@/lib/utils";
import { ArrowLeft, Calendar, User, BookOpen, Clock, Share2, Loader2, MessageCircle } from "lucide-react";

export default function ArticleDetailClient({ slug }: { slug: string }) {
  const router = useRouter();
  const supabase = createClient();

  const [article, setArticle] = useState<any>(null);
  const [relatedArticles, setRelatedArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticleData = async () => {
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

      setLoading(false);
    };

    if (slug) {
      fetchArticleData();
    }
  }, [slug, router]);

  const handleShareWhatsApp = () => {
    const shareText = `${article.title}\n\nBaca artikel selengkapnya di PTQA Batuan:\n`;
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-background pt-20">
        <Loader2 className="w-10 h-10 animate-spin text-[#0a3822] mb-4" />
        <p className="text-gray-500 font-medium animate-pulse">Memuat artikel...</p>
      </div>
    );
  }

  if (!article) return null;

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-background">
      {/* Article Hero Banner */}
      <section className="relative pt-24 pb-0 h-[60vh] md:h-[70vh] min-h-[400px] w-full flex items-end">
        {article.thumbnail ? (
          <div className="absolute inset-0 z-0">
            <img 
              src={getDirectImageUrl(article.thumbnail)} 
              alt={article.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20" />
          </div>
        ) : (
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#0a3822] to-primary">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10" />
          </div>
        )}

        <div className="relative z-10 w-full pb-16 pt-32">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <Link 
              href="/artikel" 
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Artikel
            </Link>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block bg-[#D4AF37] text-white px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full mb-6">
                {article.category}
              </span>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 font-serif leading-tight">
                {article.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm font-medium">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#D4AF37]" />
                  {new Date(article.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-white/30" />
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#D4AF37]" />
                  {Math.max(1, Math.ceil((article.content || "").split(" ").length / 200))} Menit Membaca
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-900 rounded-3xl md:-mt-32 relative z-20 p-8 md:p-12 shadow-2xl border border-gray-100 dark:border-gray-800">
            
            {article.excerpt && (
              <div className="mb-10 p-6 bg-[#0a3822]/5 dark:bg-[#0a3822]/20 border-l-4 border-[#D4AF37] rounded-r-xl">
                <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 font-medium italic leading-relaxed">
                  "{article.excerpt}"
                </p>
              </div>
            )}

            <div 
              className="prose prose-lg dark:prose-invert max-w-none 
                prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-p:leading-loose prose-p:mb-8
                prose-headings:font-serif prose-headings:text-gray-900 dark:prose-headings:text-white
                prose-a:text-primary hover:prose-a:text-[#D4AF37] prose-a:transition-colors
                prose-strong:text-gray-900 dark:prose-strong:text-white"
            >
              {(article.content || "").split("\n").map((paragraph: string, idx: number) => {
                if (!paragraph.trim()) return <br key={idx} />;
                const isArabic = /[\u0600-\u06FF]/.test(paragraph);
                return (
                  <p 
                    key={idx} 
                    dir={isArabic ? "rtl" : "ltr"}
                    className={`${isArabic ? 'font-arabic text-2xl leading-loose' : 'font-sans'}`}
                  >
                    {paragraph}
                  </p>
                );
              })}
            </div>

            {/* Footer Actions */}
            <div className="mt-16 pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-500">Bagikan:</span>
                <button 
                  onClick={handleShareWhatsApp}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold rounded-full transition-all shadow-md hover:-translate-y-0.5 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share ke WhatsApp</span>
                </button>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Tautan artikel berhasil disalin ke clipboard!");
                  }}
                  className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full transition-colors text-xs font-semibold cursor-pointer"
                >
                  Salin Link
                </button>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-semibold rounded-full">
                  #{article.category.toLowerCase().replace(/\s+/g, '')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white font-serif mb-10 text-center">
              Artikel Terkait di <span className="text-primary">{article.category}</span>
            </h3>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedArticles.map((related) => (
                <Link key={related.id} href={`/artikel/${related.slug}`} className="group flex flex-col bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700 transition-all">
                  <div className="relative h-48 overflow-hidden">
                    {related.thumbnail ? (
                      <img 
                        src={getDirectImageUrl(related.thumbnail)} 
                        alt={related.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <BookOpen className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 text-[11px] font-medium text-gray-500 mb-2">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(related.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                      {related.title}
                    </h4>
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
