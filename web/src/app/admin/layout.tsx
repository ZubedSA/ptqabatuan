"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { LayoutDashboard, FileText, Image as ImageIcon, Users, BookOpen, Settings, LogOut, Menu, X, UserCheck, Award, Heart } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signOut();
    router.push("/in-admin");
    router.refresh();
  };

  const menuItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "PPDB", href: "/admin/ppdb", icon: Users },
    { name: "Donasi & Wakaf", href: "/admin/donasi", icon: Heart },
    { name: "Berita", href: "/admin/berita", icon: FileText },
    { name: "Artikel", href: "/admin/artikel", icon: FileText },
    { name: "Galeri", href: "/admin/galeri", icon: ImageIcon },
    { name: "Program", href: "/admin/program", icon: BookOpen },
    { name: "Pengurus", href: "/admin/staff", icon: UserCheck },
    { name: "Huffazh", href: "/admin/huffazh", icon: Award },
    { name: "Pengaturan", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#f4f7f5] flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-[#0B3B24] border-r border-[#D4AF37]/15 z-50 transform transition-transform duration-300 lg:transform-none flex flex-col ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-[#D4AF37]/15 bg-[#072718]">
          <Link href="/admin" className="flex items-center gap-2.5 font-sans font-bold text-base text-white">
            <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center border border-[#D4AF37] shrink-0">
              <BookOpen className="h-4.5 w-4.5 text-[#0B3B24]" />
            </div>
            <div className="flex flex-col">
              <span className="leading-tight">Al-Usymuni</span>
              <span className="text-[9px] text-[#D4AF37] tracking-wider uppercase font-semibold leading-none mt-0.5">Admin Panel</span>
            </div>
          </Link>
          <button className="lg:hidden p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/5" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Sidebar Menu */}
        <div className="p-4 space-y-1.5 flex-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? "bg-[#D4AF37]/15 text-[#D4AF37] border-l-4 border-[#D4AF37] pl-3 shadow-[inset_0_0_12px_rgba(212,175,55,0.05)]" 
                    : "text-white/80 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? "text-[#D4AF37]" : "text-white/40 group-hover:text-white/70"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
        
        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#D4AF37]/10 bg-[#072718]/40 text-center text-[10px] text-white/40">
          &copy; {new Date().getFullYear()} PP. Al-Usymuni
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-150 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm">
          <button 
            className="lg:hidden p-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-50 border border-gray-100 cursor-pointer"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex-1" />
          
          <div className="flex items-center gap-5">
            <Link 
              href="/" 
              target="_blank" 
              className="text-sm font-semibold text-[#0B3B24] hover:text-[#D4AF37] flex items-center gap-1.5 transition-colors"
            >
              <span>Lihat Website</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </Link>
            <span className="h-4 w-[1px] bg-gray-200" />
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors cursor-pointer">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
