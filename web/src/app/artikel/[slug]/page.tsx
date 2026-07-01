import { Metadata } from "next";
import { createClient } from "@/lib/supabase/client";
import { getDirectImageUrl } from "@/lib/utils";
import ArticleDetailClient from "@/components/artikel/ArticleDetailClient";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createClient();
  const { data: article } = await supabase.from("articles").select("*").eq("slug", slug).single();

  if (!article) {
    return {
      title: "Artikel Tidak Ditemukan",
    };
  }

  const imageUrl = article.thumbnail ? getDirectImageUrl(article.thumbnail) : "";

  return {
    title: `${article.title} | PTQA Al-Usymuni`,
    description: article.excerpt || "Artikel Pondok Pesantren Tahfizh Qur'an Al-Usymuni Batuan.",
    openGraph: {
      title: article.title,
      description: article.excerpt || "Artikel Pondok Pesantren Tahfizh Qur'an Al-Usymuni Batuan.",
      url: `/artikel/${slug}`,
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630, alt: article.title }] : [],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt || "Artikel Pondok Pesantren Tahfizh Qur'an Al-Usymuni Batuan.",
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function DetailArtikelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ArticleDetailClient slug={slug} />;
}
