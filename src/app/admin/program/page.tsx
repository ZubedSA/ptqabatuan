"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Plus, Edit, Trash2, Loader2, BookOpen, Languages, Sparkles, GraduationCap, Users, Monitor, Shield, Trophy } from "lucide-react";

// Helper to render the correct icon based on the saved string
const renderIcon = (iconName: string, className: string = "w-5 h-5") => {
  switch (iconName) {
    case "Sparkles": return <Sparkles className={className} />;
    case "BookOpen": return <BookOpen className={className} />;
    case "Languages": return <Languages className={className} />;
    case "GraduationCap": return <GraduationCap className={className} />;
    case "Users": return <Users className={className} />;
    case "Monitor": return <Monitor className={className} />;
    case "Shield": return <Shield className={className} />;
    case "Trophy": return <Trophy className={className} />;
    default: return <BookOpen className={className} />;
  }
};

export default function AdminProgramPage() {
  const supabase = createClient();
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPrograms = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("educational_programs")
      .select("*")
      .order("created_at", { ascending: true });
    
    if (data) setPrograms(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const handleDelete = async (id: string, imageUrl: string) => {
    if (!confirm("Yakin ingin menghapus program pendidikan ini?")) return;

    // Optional: Delete image from storage
    if (imageUrl) {
      try {
        const filePath = imageUrl.split("/").pop();
        if (filePath) {
          await supabase.storage.from("programs").remove([filePath]);
        }
      } catch (e) {
        console.error("Gagal menghapus foto:", e);
      }
    }

    await supabase.from("educational_programs").delete().eq("id", id);
    fetchPrograms();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Program Pendidikan</h1>
          <p className="mt-1 text-sm text-gray-500">Kelola daftar kurikulum dan program unggulan pondok.</p>
        </div>
        <Link
          href="/admin/program/tambah"
          className="inline-flex items-center gap-2 bg-[#0a3822] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#0a3822]/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Tambah Program
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#0a3822]" />
        </div>
      ) : programs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Belum Ada Program</h3>
          <p className="text-gray-500 text-sm mb-4">Tambahkan program pendidikan seperti Tahfizh atau Diniyah.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((prog) => (
            <div key={prog.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
              <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                {prog.image_url ? (
                  <img src={prog.image_url} alt={prog.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">Tanpa Foto</div>
                )}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-sm">
                  {renderIcon(prog.icon_name, "w-6 h-6 text-[#0a3822]")}
                </div>
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1">{prog.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-grow">{prog.description}</p>
                <div className="flex items-center gap-2 border-t border-gray-100 pt-4 mt-auto">
                  <Link
                    href={`/admin/program/${prog.id}/edit`}
                    className="flex-1 inline-flex justify-center items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                  >
                    <Edit className="w-4 h-4" /> Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(prog.id, prog.image_url)}
                    className="flex-1 inline-flex justify-center items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
