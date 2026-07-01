import { Metadata } from "next";
import { createClient } from "@/lib/supabase/client";
import { getDirectImageUrl } from "@/lib/utils";
import GalleryClient from "@/components/galeri/GalleryClient";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ id?: string }> }): Promise<Metadata> {
  const { id } = await searchParams;
  if (!id) {
    return {
      title: "Galeri Dokumentasi | PTQA Al-Usymuni",
      description: "Galeri foto kegiatan dan fasilitas Pondok Pesantren Tahfizh Qur'an Al-Usymuni Batuan.",
    };
  }

  const supabase = createClient();
  const { data: item } = await supabase.from("gallery").select("*").eq("id", id).single();

  if (!item) {
    return {
      title: "Galeri Foto | PTQA Al-Usymuni",
    };
  }

  const imageUrl = item.image_url ? getDirectImageUrl(item.image_url) : "";

  return {
    title: `${item.title} | Galeri PTQA Al-Usymuni`,
    description: `Dokumentasi kategori ${item.category} di Pondok Pesantren Tahfizh Qur'an Al-Usymuni Batuan.`,
    openGraph: {
      title: item.title,
      description: `Dokumentasi kategori ${item.category} di Pondok Pesantren Tahfizh Qur'an Al-Usymuni Batuan.`,
      url: `/galeri?id=${id}`,
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630, alt: item.title }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: item.title,
      description: `Dokumentasi kategori ${item.category} di PTQA Al-Usymuni Batuan.`,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function GaleriPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  return <GalleryClient initialId={id} />;
}
