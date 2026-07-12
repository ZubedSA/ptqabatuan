"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, Camera, Video, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  const pathname = usePathname();

  // Jangan render footer publik di halaman admin atau halaman login rahasia
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/in-admin")) return null;

  return (
    <footer className="bg-primary text-white border-t border-primary/20">
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative h-10 w-10 md:h-11 md:w-11 rounded-full bg-white flex items-center justify-center border-2 border-[#D4AF37] shadow-[0_2px_10px_rgba(0,0,0,0.1)] group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                <Image
                  src="/LOGO PTQA.jpeg"
                  alt="Logo PTQA Batuan"
                  fill
                  className="object-contain p-0.5"
                />
              </div>
              <div className="flex flex-col">
                <span 
                  className="text-white text-xl sm:text-2xl leading-none mb-1 font-bold group-hover:text-[#D4AF37] transition-all pb-1"
                  style={{ fontFamily: "'Al Jazeera', 'AlJazeera', sans-serif", letterSpacing: "1px" }}
                  dir="rtl"
                >
                  معهد الأشموني لتحفيظ القرآن
                </span>
                <span className="text-[9px] sm:text-[10px] text-[#D4AF37] font-semibold tracking-[0.18em] uppercase leading-none mt-0.5">
                  PP. Tahfizh Qur&#39;an Al-Usymuni
                </span>
              </div>
            </Link>
            <p className="text-sm leading-6 text-gray-300">
              Mencetak generasi Qur'ani yang taqwallah, berakhlak mulia, berilmu amaliah, dan beramal ilmiah berlandaskan manhaj Ahlussunnah wal Jama'ah.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-300 hover:text-secondary transition-colors">
                <span className="sr-only">Facebook</span>
                <Globe className="h-6 w-6" aria-hidden="true" />
              </a>
              <a href="#" className="text-gray-300 hover:text-secondary transition-colors">
                <span className="sr-only">Instagram</span>
                <Camera className="h-6 w-6" aria-hidden="true" />
              </a>
              <a href="#" className="text-gray-300 hover:text-secondary transition-colors">
                <span className="sr-only">YouTube</span>
                <Video className="h-6 w-6" aria-hidden="true" />
              </a>
            </div>
          </div>
          <div className="mt-16 xl:col-span-2 xl:mt-0 flex justify-end">
            <div>
              <h3 className="text-sm font-semibold leading-6 text-white uppercase tracking-wider">Kontak</h3>
              <ul role="list" className="mt-6 space-y-4">
                <li className="flex gap-3 text-sm leading-6 text-gray-300">
                  <MapPin className="h-6 w-6 shrink-0 text-secondary" />
                  <span>Jl. Raya Batuan, Sumenep, Jawa Timur, Indonesia</span>
                </li>
                <li className="flex gap-3 text-sm leading-6 text-gray-300">
                  <Phone className="h-5 w-5 shrink-0 text-secondary" />
                  <span>+62 817-1759-4886</span>
                </li>
                <li className="flex gap-3 text-sm leading-6 text-gray-300">
                  <Mail className="h-5 w-5 shrink-0 text-secondary" />
                  <span>tahfizhquranbatuan@gmail.com</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-white/10 pt-8 sm:mt-20 lg:mt-24">
          <p className="text-xs leading-5 text-gray-400 text-center">
            &copy; {new Date().getFullYear()} Pondok Pesantren Tahfizh Qur'an Al-Usymuni Batuan. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
