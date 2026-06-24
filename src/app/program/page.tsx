"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Languages, Sparkles, GraduationCap, Users, Monitor, Shield, Trophy, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getDirectImageUrl } from "@/lib/utils";

// Helper to render the correct icon based on the saved string
const renderIcon = (iconName: string, className: string = "w-8 h-8") => {
  switch (iconName) {
    case "Sparkles": return <Sparkles className={`${className} text-primary`} />;
    case "BookOpen": return <BookOpen className={`${className} text-secondary`} />;
    case "Languages": return <Languages className={`${className} text-blue-500`} />;
    case "GraduationCap": return <GraduationCap className={`${className} text-[#D4AF37]`} />;
    case "Users": return <Users className={`${className} text-indigo-500`} />;
    case "Monitor": return <Monitor className={`${className} text-sky-500`} />;
    case "Shield": return <Shield className={`${className} text-red-500`} />;
    case "Trophy": return <Trophy className={`${className} text-amber-500`} />;
    default: return <BookOpen className={`${className} text-primary`} />;
  }
};

export default function ProgramPage() {
  const supabase = createClient();
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrograms = async () => {
      const { data } = await supabase
        .from("educational_programs")
        .select("*")
        .order("created_at", { ascending: true });
      
      if (data) setPrograms(data);
      setLoading(false);
    };

    fetchPrograms();
  }, []);

  return (
    <div className="min-h-screen pb-12 bg-gray-50 dark:bg-background">
      {/* Header Section */}
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
            Program <span className="text-[#D4AF37]">Pendidikan</span>
          </motion.h1>
          <div className="w-16 sm:w-24 h-0.5 bg-[#D4AF37] mx-auto mb-4 sm:mb-6" />
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto font-light leading-relaxed px-4"
          >
            Kurikulum terpadu yang memadukan pendidikan pesantren salaf, tahfizh Al-Qur'an, dan pendidikan modern untuk mencetak santri yang siap menghadapi tantangan zaman.
          </motion.p>
        </div>
      </section>

      {/* Program List */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-10 space-y-24 min-h-[50vh]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <p className="text-gray-500 font-medium">Memuat program kurikulum...</p>
          </div>
        ) : programs.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Belum Ada Program</h3>
            <p className="text-gray-500">Program pendidikan pondok pesantren sedang dalam tahap pembaruan.</p>
          </div>
        ) : (
          programs.map((prog, idx) => (
            <motion.div 
              key={prog.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="relative bg-white dark:bg-[#111] rounded-[2.5rem] p-6 sm:p-10 lg:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] dark:shadow-none dark:border dark:border-white/5 transition-all duration-700 overflow-hidden group"
            >
              {/* Subtle background glow effect */}
              <div className={`absolute -top-40 w-[30rem] h-[30rem] bg-primary/5 dark:bg-primary/10 rounded-full blur-[100px] group-hover:bg-primary/10 transition-colors duration-700 pointer-events-none ${idx % 2 !== 0 ? '-left-40' : '-right-40'}`} />
              
              <div className={`relative z-10 flex flex-col lg:flex-row gap-10 lg:gap-16 items-center ${idx % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
                
                {/* Image Side */}
                <div className="w-full lg:w-[45%]">
                  <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl bg-gray-200 dark:bg-gray-800 transform group-hover:scale-[1.02] transition-transform duration-700">
                    {prog.image_url ? (
                      <img src={getDirectImageUrl(prog.image_url)} alt={prog.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                        <BookOpen className="w-16 h-16 mb-2 opacity-50" />
                        <span>Belum ada foto</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-primary/10 mix-blend-multiply pointer-events-none" />
                  </div>
                </div>

                {/* Content Side */}
                <div className="w-full lg:w-[55%] space-y-6 lg:space-y-8">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center border border-gray-100 dark:border-white/10 group-hover:border-[#D4AF37]/30 transition-colors">
                      {renderIcon(prog.icon_name, "w-7 h-7")}
                    </div>
                    <div className="w-12 h-[2px] bg-[#D4AF37]/50 rounded-full" />
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold font-serif text-gray-900 dark:text-white leading-tight group-hover:text-[#0a3822] dark:group-hover:text-[#D4AF37] transition-colors duration-500">
                      {prog.title}
                    </h2>
                    <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {prog.description}
                    </p>
                  </div>
                  
                  {prog.features && prog.features.length > 0 && (
                    <div className="bg-gray-50/50 dark:bg-white/[0.02] p-6 rounded-2xl border border-gray-100 dark:border-white/5">
                      <h4 className="text-sm font-bold tracking-wider uppercase text-gray-900 dark:text-gray-400 mb-5">Target Pembelajaran Utama</h4>
                      <ul className="grid sm:grid-cols-2 gap-y-4 gap-x-6">
                        {prog.features.map((feature: string, i: number) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] mt-1.5 flex-shrink-0 shadow-[0_0_8px_rgba(212,175,55,0.6)]" />
                            <span className="leading-snug">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          ))
        )}
      </section>
    </div>
  );
}
