"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { getDirectImageUrl } from "@/lib/utils";
import { Loader2, X, Image as ImageIcon, ZoomIn } from "lucide-react";

export default function GaleriPage() {
  const supabase = createClient();
  const [gallery, setGallery] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>(["Semua"]);
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [selectedImage, setSelectedImage] = useState<any>(null); // For Lightbox

  useEffect(() => {
    const fetchGallery = async () => {
      const { data } = await supabase
        .from("gallery")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) {
        setGallery(data);
        const uniqueCats = Array.from(new Set(data.map(d => d.category).filter(Boolean))) as string[];
        setCategories(["Semua", ...uniqueCats]);
      }
      setLoading(false);
    };

    fetchGallery();
  }, []);

  // Handle keyboard interaction for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedImage(null);
    };
    if (selectedImage) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // lock body scroll
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [selectedImage]);

  const filteredGallery = selectedCategory === "Semua"
    ? gallery
    : gallery.filter(item => item.category === selectedCategory);

  return (
    <div className="flex flex-col min-h-screen pb-12 bg-white dark:bg-background">

      {/* Header Section */}
      <section className="relative pt-24 pb-16 overflow-hidden bg-gray-50 dark:bg-gray-900/50">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#0a3822]/5 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-6">
            <ImageIcon className="w-4 h-4" />
            Dokumentasi & Visual
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 font-serif leading-tight"
          >
            Galeri <span className="text-[#D4AF37]">Pesantren</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed"
          >
            Melihat lebih dekat fasilitas, momen kebersamaan, dan berbagai kegiatan edukatif serta spiritual santri.
          </motion.p>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex overflow-x-auto pb-4 md:pb-0 scrollbar-hide justify-start md:justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 ${selectedCategory === cat
                    ? "bg-[#0a3822] text-white shadow-[0_4px_14px_rgba(10,56,34,0.3)] transform scale-105"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Masonry/Grid Gallery Content */}
      <section className="py-16 flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <p className="text-gray-500 font-medium animate-pulse">Memuat foto...</p>
          </div>
        ) : filteredGallery.length === 0 ? (
          <div className="text-center py-24 bg-gray-50 dark:bg-gray-800/30 rounded-3xl border border-gray-100 dark:border-gray-800">
            <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Tidak Ditemukan</h3>
            <p className="text-gray-500">Belum ada foto yang sesuai dengan filter kategori ini.</p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <AnimatePresence>
              {filteredGallery.map((item, idx) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="group flex flex-col cursor-pointer relative rounded-[1.25rem] overflow-hidden bg-white dark:bg-gray-800 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-gray-300 dark:border-gray-600 hover:border-[#D4AF37] dark:hover:border-[#D4AF37]"
                  onClick={() => setSelectedImage(item)}
                >
                  {/* Image Container */}
                  <div className="aspect-[4/3] w-full relative overflow-hidden bg-gray-100 dark:bg-gray-900">
                    <img
                      src={getDirectImageUrl(item.image_url)}
                      alt={item.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />

                    {/* Hover Zoom Overlay */}
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="w-12 h-12 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center transform scale-50 group-hover:scale-100 transition-transform duration-300">
                        <ZoomIn className="w-6 h-6 text-white drop-shadow-md" />
                      </div>
                    </div>
                  </div>

                  {/* Text Container Below Image */}
                  <div className="p-5 md:p-6 flex flex-col flex-1">
                    <span className="inline-block px-2.5 py-1 bg-[#D4AF37]/10 text-[#D4AF37] text-[10px] font-bold uppercase tracking-wider rounded-md w-fit mb-3">
                      {item.category}
                    </span>
                    <h3 className="text-gray-900 dark:text-white text-base md:text-lg font-bold line-clamp-2 leading-snug group-hover:text-[#0a3822] dark:group-hover:text-[#D4AF37] transition-colors">
                      {item.title}
                    </h3>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 md:p-10"
            onClick={() => setSelectedImage(null)}
          >
            <button
              className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors z-50"
              onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
            >
              <X className="w-6 h-6" />
            </button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={getDirectImageUrl(selectedImage.image_url)}
                alt={selectedImage.title}
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
              />
              <div className="w-full mt-4 text-center">
                <span className="inline-block px-3 py-1 bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 text-xs font-bold uppercase tracking-wider rounded-full mb-3">
                  {selectedImage.category}
                </span>
                <h3 className="text-2xl font-bold text-white mb-2">{selectedImage.title}</h3>
                <p className="text-gray-400 text-sm">
                  Diunggah pada {new Date(selectedImage.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
