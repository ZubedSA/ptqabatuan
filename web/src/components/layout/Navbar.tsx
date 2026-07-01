"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { name: "Beranda", href: "/" },
  { name: "Profil", href: "/profil" },
  { name: "Program", href: "/program" },
  { name: "Artikel", href: "/artikel" },
  { name: "Galeri", href: "/galeri" },
  { name: "PPDB", href: "/ppdb" },
  { name: "Donasi", href: "/donasi" },
];

const responsiveCSS = `
  .navbar-topbar { display: none !important; }
  .navbar-desktop { display: none !important; }
  .navbar-hamburger { display: flex !important; }

  @media (min-width: 768px) {
    .navbar-topbar { display: flex !important; }
    .navbar-desktop { display: flex !important; }
    .navbar-hamburger { display: none !important; }
  }
`;

export function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Jangan render navbar publik di halaman admin
  if (pathname?.startsWith("/admin")) return null;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const showSolid = scrolled || !isHome;

  return (
    <>
      {/* Critical responsive CSS — injected directly, bypasses PostCSS */}
      <style dangerouslySetInnerHTML={{ __html: responsiveCSS }} />

      {/* ========== HEADER ========== */}
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          showSolid ? "translate-y-0" : "translate-y-0"
        )}
      >

        {/* ── Main Navigation Bar ── */}
        <div
          className={cn(
            "transition-all duration-300",
            showSolid
              ? "bg-[#0B3B24]/95 backdrop-blur-md py-3 shadow-[0_4px_30px_rgba(0,0,0,0.15)] border-b border-[#D4AF37]/20"
              : "bg-transparent py-4 md:py-5 border-b border-white/5"
          )}
        >
          <div
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
          >
            {/* ── Logo ── */}
            <Link href="/" className="flex items-center gap-3 group" style={{ flexShrink: 0 }}>
              <div className="relative h-10 w-10 md:h-11 md:w-11 rounded-full bg-white flex items-center justify-center border-2 border-[#D4AF37] shadow-[0_2px_10px_rgba(0,0,0,0.1)] group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                <Image
                  src="/LOGO PTQA.jpeg"
                  alt="Logo PTQA Batuan"
                  fill
                  className="object-contain p-0.5"
                />
              </div>
              <div className="flex flex-col">
                <img
                  src="/khot.png"
                  alt="Khot PTQA Batuan"
                  className="h-7 sm:h-8 w-auto mb-1 group-hover:brightness-125 transition-all"
                />
                <span className="text-[9px] sm:text-[10px] text-[#D4AF37] font-semibold tracking-[0.18em] uppercase leading-none mt-0.5">
                  PP. Tahfizh Qur&#39;an Al-Usymuni
                </span>
              </div>
            </Link>

            {/* ── Desktop Navigation ── */}
            <nav
              className="navbar-desktop items-center gap-1 lg:gap-2"
              style={{ alignItems: "center" }}
            >
              {navLinks.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname?.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "relative text-sm font-semibold px-3 lg:px-3.5 py-2 rounded-lg transition-all duration-300",
                      isActive
                        ? "text-[#D4AF37] bg-white/5"
                        : "text-white/90 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <span>{item.name}</span>
                    {isActive && (
                      <motion.div
                        layoutId="navActiveIndicator"
                        className="absolute bottom-1 left-3.5 right-3.5 h-[2px] bg-[#D4AF37] rounded-full"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}

              {/* CTA */}
              <Link
                href="/kontak"
                className="ml-2 lg:ml-3 text-xs lg:text-sm font-bold px-4 lg:px-5 py-2 lg:py-2.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F3CE56] text-[#0B3B24] shadow-[0_4px_14px_rgba(212,175,55,0.25)] hover:shadow-[0_6px_20px_rgba(212,175,55,0.4)] hover:scale-[1.03] active:scale-[0.97] transition-all duration-300"
              >
                Hubungi Kami
              </Link>
            </nav>

            {/* ── Mobile Hamburger Button ── */}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Buka menu navigasi"
              className="navbar-hamburger items-center justify-center text-[#D4AF37] hover:text-white active:scale-95 transition-colors duration-200 cursor-pointer"
              style={{
                width: "40px",
                height: "40px",
                flexShrink: 0,
                zIndex: 50
              }}
            >
              <Menu className="h-8 w-8" strokeWidth={2} />
            </button>
          </div>
        </div>
      </header>

      {/* ========== MOBILE DRAWER ========== */}
      <AnimatePresence>
        {menuOpen && (
          <div className="fixed inset-0 z-[100]" style={{ display: "flex", justifyContent: "flex-end" }}>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-md"
              onClick={() => setMenuOpen(false)}
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="relative w-full max-w-[320px] sm:max-w-sm bg-gradient-to-b from-[#0B3B24] to-[#051c11] h-full shadow-2xl overflow-y-auto z-[101] border-l border-[#D4AF37]/20"
              style={{ display: "flex", flexDirection: "column" }}
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 rounded-full bg-white flex items-center justify-center border-2 border-[#D4AF37] shadow-inner overflow-hidden">
                    <Image
                      src="/LOGO PTQA.jpeg"
                      alt="Logo PTQA Batuan"
                      fill
                      className="object-contain p-0.5"
                    />
                  </div>
                  <img src="/khot.png" alt="Khot PTQA Batuan" className="h-7 w-auto" />
                </div>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white hover:text-[#D4AF37] active:scale-95 transition-all cursor-pointer"
                  aria-label="Tutup menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="flex-1 px-4 py-6 space-y-1.5">
                {navLinks.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/" && pathname?.startsWith(item.href));
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        "flex items-center justify-between w-full px-4 py-3.5 rounded-xl text-base font-semibold transition-all duration-200",
                        isActive
                          ? "bg-[#D4AF37]/15 text-[#D4AF37] border-l-4 border-[#D4AF37]"
                          : "text-white/80 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <span>{item.name}</span>
                      <svg
                        className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          isActive
                            ? "text-[#D4AF37] translate-x-1 opacity-100"
                            : "text-white opacity-40"
                        )}
                        fill="none" stroke="currentColor" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </Link>
                  );
                })}
              </div>

              {/* Drawer Footer */}
              <div className="p-5 border-t border-white/10 bg-black/10 space-y-6">
                {/* CTA Button */}
                <Link
                  href="/kontak"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full text-center px-4 py-3.5 rounded-xl text-base font-bold bg-gradient-to-r from-[#D4AF37] to-[#F3CE56] text-[#0B3B24] shadow-[0_4px_12px_rgba(212,175,55,0.2)] hover:shadow-[0_6px_18px_rgba(212,175,55,0.3)] transition-all duration-200"
                >
                  Hubungi Kami
                </Link>

                {/* Contact Info */}
                <div className="space-y-3.5 text-xs text-white/60">
                  <div className="flex items-start gap-3">
                    <svg className="h-4 w-4 text-[#D4AF37] shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>Jl. Raya Batuan, Sumenep, Jawa Timur, Indonesia</span>
                  </div>
                  <a href="tel:+6281234567890" className="flex items-center gap-3 hover:text-white transition-colors">
                    <svg className="h-4 w-4 text-[#D4AF37] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <span>+62 817-1759-4886</span>
                  </a>
                  <a href="mailto:tahfizhquranbatuan@gmail.com" className="flex items-center gap-3 hover:text-white transition-colors">
                    <svg className="h-4 w-4 text-[#D4AF37] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    <span>tahfizhquranbatuan@gmail.com</span>
                  </a>
                </div>

                {/* Social Media */}
                <div className="flex items-center justify-center gap-4 pt-1.5">
                  <a href="#" className="h-9 w-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-[#D4AF37] hover:border-[#D4AF37]/50 transition-colors" aria-label="Instagram">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                  </a>
                  <a href="#" className="h-9 w-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-[#D4AF37] hover:border-[#D4AF37]/50 transition-colors" aria-label="Facebook">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a href="#" className="h-9 w-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-[#D4AF37] hover:border-[#D4AF37]/50 transition-colors" aria-label="YouTube">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.42 4.814a2.502 2.502 0 0 1-1.768 1.768c-1.56.419-7.812.419-7.812.419s-6.253 0-7.812-.419a2.502 2.502 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.42-4.814a2.502 2.502 0 0 1 1.768-1.768c1.56-.419 7.812-.419 7.812-.419s6.252 0 7.812.419zM9.75 15.02l6-3.02-6-3v6.04z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
