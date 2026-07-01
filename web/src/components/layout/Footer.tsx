"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, Camera, Video, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  const pathname = usePathname();

  // Jangan render footer publik di halaman admin
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="bg-primary text-white border-t border-primary/20">
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative h-10 w-10 rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-secondary shadow-inner">
                <Image
                  src="/LOGO PTQA.jpeg"
                  alt="Logo PTQA Batuan"
                  fill
                  className="object-contain p-0.5"
                />
              </div>
              <img src="/khot.png" alt="Khot PTQA Batuan" className="h-8 w-auto" />
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
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white uppercase tracking-wider">Navigasi</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li>
                    <Link href="/profil" className="text-sm leading-6 text-gray-300 hover:text-secondary">
                      Profil Pondok
                    </Link>
                  </li>
                  <li>
                    <Link href="/program" className="text-sm leading-6 text-gray-300 hover:text-secondary">
                      Program Pendidikan
                    </Link>
                  </li>
                  <li>
                    <Link href="/artikel" className="text-sm leading-6 text-gray-300 hover:text-secondary">
                      Artikel & Berita
                    </Link>
                  </li>
                  <li>
                    <Link href="/galeri" className="text-sm leading-6 text-gray-300 hover:text-secondary">
                      Galeri Kegiatan
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-white uppercase tracking-wider">Layanan</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li>
                    <Link href="/ppdb" className="text-sm leading-6 text-gray-300 hover:text-secondary">
                      PPDB Online
                    </Link>
                  </li>
                  <li>
                    <Link href="/donasi" className="text-sm leading-6 text-gray-300 hover:text-secondary">
                      Donasi & Wakaf
                    </Link>
                  </li>
                  <li>
                    <Link href="/kontak" className="text-sm leading-6 text-gray-300 hover:text-secondary">
                      Hubungi Kami
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-1 md:gap-8">
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
