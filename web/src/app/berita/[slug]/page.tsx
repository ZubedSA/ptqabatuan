import { Metadata } from "next";
import { createClient } from "@/lib/supabase/client";
import { getDirectImageUrl } from "@/lib/utils";
import NewsDetailClient from "@/components/berita/NewsDetailClient";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createClient();
  const { data: newsItem } = await supabase.from("news").select("*").eq("slug", slug).single();

  if (!newsItem) {
    return {
      title: "Berita Tidak Ditemukan",
    };
  }

  const imageUrl = newsItem.thumbnail ? getDirectImageUrl(newsItem.thumbnail) : "";

  return {
    title: `${newsItem.title} | PTQA Al-Usymuni`,
    description: newsItem.excerpt || "Berita Pondok Pesantren Tahfizh Qur'an Al-Usymuni Batuan.",
    openGraph: {
      title: newsItem.title,
      description: newsItem.excerpt || "Berita Pondok Pesantren Tahfizh Qur'an Al-Usymuni Batuan.",
      url: `/berita/${slug}`,
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630, alt: newsItem.title }] : [],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: newsItem.title,
      description: newsItem.excerpt || "Berita Pondok Pesantren Tahfizh Qur'an Al-Usymuni Batuan.",
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function DetailBeritaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <NewsDetailClient slug={slug} />;
}
