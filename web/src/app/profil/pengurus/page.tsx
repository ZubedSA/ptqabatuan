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

  const rowGroups = getRowGroups(roles);

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
            <div className="space-y-16">
              {/* Render active sorted row groups (including parallel roles) */}
              {rowGroups
                .filter(group => group.some(role => groupedStaffs[role.name] && groupedStaffs[role.name].length > 0))
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
                    // Parallel roles side-by-side row
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

            {/* Render other roles not defined in roles table */}
            {otherPositions.map((posName) => {
              const memberCount = groupedStaffs[posName]?.length || 0;
              const gridClass = memberCount > 2
                ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-8"
                : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8";

              return (
                <div key={posName} className="space-y-6">
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-bold text-[#0B3B24] dark:text-white font-serif bg-gray-100 dark:bg-secondary/20 px-5 py-2 rounded-full border border-gray-200 shadow-sm shrink-0">
                      {posName}
                    </h3>
                    <div className="flex-1 h-[1px] bg-gray-200 dark:bg-gray-800" />
                  </div>

                  <div className={gridClass}>
                    {groupedStaffs[posName].map((staff, idx) => (
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
                            <div className="h-full w-full bg-[#0a3822]/10 text-[#0a3822] font-bold flex items-center justify-center text-xl sm:text-3xl">
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
            })}
          </div>
        )}
      </main>
    </div>
  );
}
