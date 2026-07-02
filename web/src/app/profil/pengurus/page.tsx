"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Users } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getDirectImageUrl } from "@/lib/utils";

export default function DetailPengurusPage() {
  const [staffs, setStaffs] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch staff roles sorted by priority
        const { data: rolesData } = await supabase
          .from("staff_roles")
          .select("*")
          .order("priority", { ascending: true });
        if (rolesData) setRoles(rolesData);

        // Fetch all staffs
        const { data: staffData } = await supabase
          .from("staffs")
          .select("*")
          .order("name", { ascending: true });
        if (staffData) setStaffs(staffData);
      } catch (err) {
        console.error("Error loading staffs:", err);
      } finally {
        setLoading(false);
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
    (pos) => !roles.some((role) => role.name === pos) && groupedStaffs[pos].length > 0
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

  const dbRowGroups = getRowGroups(roles);

  // Filter only roles with staff inside, and remove empty groups
  const activeDbTiers = dbRowGroups
    .map(group => group.filter(role => groupedStaffs[role.name] && groupedStaffs[role.name].length > 0))
    .filter(group => group.length > 0);

  // Map other positions to separate tiers at the bottom
  const otherTiers = otherPositions.map((posName, idx) => [
    {
      id: `other-${idx}`,
      name: posName,
      priority: 9999 + idx
    }
  ]);

  const allTiers = [...activeDbTiers, ...otherTiers];

  const getGridColsClass = (length: number) => {
    if (length === 1) return "grid-cols-1";
    if (length === 2) return "grid-cols-2 gap-4 md:gap-8 max-w-5xl";
    if (length === 3) return "grid-cols-3 gap-2 md:gap-8 max-w-6xl";
    return "grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-7xl";
  };

  return (
    <div className="flex flex-col min-h-screen pb-16 bg-white dark:bg-background">
      {/* Mini Hero Header */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 overflow-hidden bg-gradient-to-br from-[#0a3822] via-primary to-[#051c11]">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] z-0" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Link
              href="/profil"
              className="inline-flex p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
              title="Kembali ke Profil"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="text-white/80 text-sm font-medium">Kembali ke Profil</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white font-serif leading-tight">
            Struktur Lengkap <span className="text-[#D4AF37]">Kepengurusan</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-300 max-w-2xl mt-2 font-light">
            Daftar lengkap Dewan Pengurus, Pengurus Harian, Asatidz, dan Staff Pondok Pesantren Tahfizh Qur'an Al-Usymuni Batuan.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-16 flex-1 w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-gray-500">
            <Loader2 className="w-10 h-10 animate-spin text-[#0a3822] mb-4" />
            <p className="text-sm font-medium">Memuat struktur organisasi...</p>
          </div>
        ) : staffs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 border-2 border-dashed border-gray-100 rounded-3xl">
            <Users className="w-12 h-12 mb-3 text-gray-300" />
            <p className="text-base italic">Belum ada data pengurus yang dimasukkan.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-12">
            {allTiers.map((group, gIdx) => {
              const isLast = gIdx === allTiers.length - 1;
              const isParallel = group.length > 1;

              return (
                <div key={`tier-${gIdx}`} className="relative flex flex-col items-center w-full">
                  {/* Roles Container */}
                  <div className={`grid w-full justify-center ${getGridColsClass(group.length)}`}>
                    {group.map((role, rIdx) => {
                      const staffInRole = groupedStaffs[role.name] || [];
                      const memberCount = staffInRole.length;
                      
                      // Layout for staff members in a specific role
                      const memberGridClass = memberCount >= 4
                        ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6"
                        : memberCount === 3
                        ? "grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 justify-center"
                        : memberCount === 2
                        ? "grid grid-cols-2 gap-4 sm:gap-6 justify-center"
                        : "grid grid-cols-1 gap-4 justify-center";

                      return (
                        <div key={role.id} className="relative flex flex-col items-center">
                          {/* Connector Area above each role within parallel group */}
                          {isParallel && (
                            <div className="w-full h-6 md:h-8 relative">
                              {/* Horizontal segments connecting to the center */}
                              <div className={`absolute top-0 h-[2px] bg-[#D4AF37]/40 ${
                                rIdx === 0 ? 'left-1/2 right-0' : 
                                rIdx === group.length - 1 ? 'left-0 right-1/2' : 
                                'left-0 right-0'
                              }`} />
                              {/* Vertical drop down to the card */}
                              <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-gradient-to-b from-[#D4AF37]/40 to-[#0a3822]" />
                            </div>
                          )}

                          {/* Role Header Card */}
                          <div className="relative z-10 flex flex-col items-center">
                            <div className="bg-gradient-to-r from-[#0a3822] to-[#125837] dark:from-[#0a3822]/90 dark:to-emerald-950 px-3 sm:px-6 py-1.5 sm:py-2.5 rounded-xl sm:rounded-2xl border-2 border-[#D4AF37]/45 shadow-[0_4px_12px_rgba(10,56,34,0.15)] dark:shadow-none text-center">
                              <h3 className="text-[10px] sm:text-base font-bold text-white font-serif tracking-wide uppercase">
                                {role.name}
                              </h3>
                            </div>
                            
                            {/* Small arrow/indicator under role header */}
                            <div className="w-[2px] h-4 sm:h-6 bg-gradient-to-b from-[#0a3822] to-transparent dark:from-[#D4AF37]/60 dark:to-transparent" />
                          </div>

                          {/* Members Grid Container */}
                          <div className={`${memberGridClass} w-full px-1 sm:px-4`}>
                            {staffInRole.map((staff, idx) => (
                              <motion.div
                                key={staff.id}
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: idx * 0.05 }}
                                className="group relative flex flex-col items-center text-center p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-xl hover:border-[#D4AF37]/50 dark:hover:border-[#D4AF37]/35 hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm"
                              >
                                {/* Photo with double border */}
                                <div className="relative h-14 w-14 sm:h-24 sm:w-24 rounded-full overflow-hidden mb-2 sm:mb-3.5 border-[3px] border-double border-[#D4AF37]/50 group-hover:border-[#D4AF37] transition-all duration-300 shadow-md group-hover:scale-105">
                                  {staff.photo ? (
                                    <img
                                      src={getDirectImageUrl(staff.photo)}
                                      alt={staff.name}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="h-full w-full bg-[#0a3822]/10 dark:bg-gray-800 text-[#0a3822] dark:text-[#D4AF37] font-bold flex items-center justify-center text-base sm:text-2xl font-serif">
                                      {staff.name.charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                </div>
                                <h4 className="font-bold text-[10px] sm:text-sm text-gray-900 dark:text-white leading-tight px-0.5 sm:px-1 font-serif group-hover:text-[#0a3822] dark:group-hover:text-[#D4AF37] transition-colors duration-200">
                                  {staff.name}
                                </h4>
                                <p className="text-[8px] sm:text-xs text-secondary font-medium tracking-wide uppercase mt-0.5 sm:mt-1">
                                  {staff.position}
                                </p>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Vertical Connector to Next Level */}
                  {!isLast && (
                    <div className="w-full flex justify-center py-6">
                      <div className="flex flex-col items-center">
                        {/* Vertical Line with gold pulse dot */}
                        <div className="w-[2px] h-10 bg-gradient-to-b from-[#D4AF37]/60 to-[#0a3822]/60 dark:from-[#D4AF37]/60 dark:to-emerald-900/60 relative">
                          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[#D4AF37] rounded-full shadow-[0_0_8px_#D4AF37] animate-ping" />
                          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[#D4AF37] rounded-full shadow-[0_0_8px_#D4AF37]" />
                        </div>
                        <svg className="w-4 h-4 text-[#0a3822] dark:text-[#D4AF37] -mt-1.5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
