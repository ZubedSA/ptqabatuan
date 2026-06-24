"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, Search, UserCheck, Loader2 } from "lucide-react";
import Link from "next/link";

export default function PPDBPengumumanPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const supabase = createClient();

  useEffect(() => {
    const fetchVerifiedStudents = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("ppdb")
        .select("id, full_name, address, created_at")
        .eq("status", "verified")
        .order("full_name", { ascending: true });
      
      if (data) setStudents(data);
      setLoading(false);
    };

    fetchVerifiedStudents();
  }, []);

  const filteredStudents = students.filter(student => 
    student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-24 pb-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Link href="/ppdb" className="inline-flex items-center gap-2 text-gray-600 hover:text-[#0B3B24] mb-8 font-medium transition-colors text-sm md:text-base">
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-br from-[#0a3822] to-[#072718] p-8 md:p-12 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]" />
            <div className="relative z-10 text-center">
              <div className="w-16 h-16 bg-[#D4AF37]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <UserCheck className="w-8 h-8 text-[#D4AF37]" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Pengumuman Kelulusan</h1>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Daftar calon santri baru yang telah lolos verifikasi berkas dan dinyatakan <strong className="text-[#D4AF37]">DITERIMA</strong> di Pondok Pesantren Tahfizh Qur'an Al-Usymuni Batuan.
              </p>
            </div>
          </div>

          <div className="p-6 md:p-10">
            {/* Search Box */}
            <div className="relative max-w-md mx-auto mb-10">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-11 pr-4 py-3.5 border border-gray-300 dark:border-gray-600 rounded-full leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-all sm:text-sm"
                placeholder="Cari nama santri atau alamat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-10 h-10 animate-spin text-[#0a3822] mb-4" />
                <p className="text-gray-500 font-medium">Memuat data pengumuman...</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-600">
                <p className="text-gray-500 dark:text-gray-400 text-lg">Tidak ada data santri yang ditemukan.</p>
                {searchQuery === "" && (
                  <p className="text-sm mt-2 text-gray-400">Belum ada santri yang diverifikasi saat ini.</p>
                )}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {filteredStudents.map((student, idx) => (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-start gap-4 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-[#D4AF37] hover:shadow-md transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 flex items-center justify-center shrink-0">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 dark:text-white truncate group-hover:text-[#0B3B24] transition-colors">
                        {student.full_name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1" title={student.address}>
                        {student.address}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
