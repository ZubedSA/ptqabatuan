import type { Metadata } from "next";
import { Montserrat, Amiri, Noto_Kufi_Arabic } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const amiri = Amiri({
  weight: ["400", "700"],
  variable: "--font-amiri",
  subsets: ["arabic"],
});

const notoKufi = Noto_Kufi_Arabic({
  weight: ["400", "600", "700"],
  variable: "--font-kufi",
  subsets: ["arabic"],
});

export const metadata: Metadata = {
  title: "Pondok Pesantren Tahfizh Qur'an Al-Usymuni Batuan",
  description: "Website resmi Pondok Pesantren Tahfizh Qur'an Al-Usymuni Batuan. Media informasi, dakwah, dan pendaftaran santri baru.",
  keywords: ["Pondok Pesantren", "Tahfizh", "Al-Usymuni", "Batuan", "Pesantren Modern", "PPDB"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${montserrat.variable} ${amiri.variable} ${notoKufi.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
