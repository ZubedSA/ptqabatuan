import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Mengubah link Google Drive (viewer) menjadi link gambar langsung (direct link)
 * agar bisa ditampilkan di tag <img>.
 * Jika bukan link Google Drive, kembalikan URL aslinya.
 */
export function getDirectImageUrl(url: string | undefined | null): string {
  if (!url) return "";

  try {
    // Pola 1: https://drive.google.com/file/d/FILE_ID/view
    const driveRegex1 = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
    const match1 = url.match(driveRegex1);
    if (match1 && match1[1]) {
      // Proxy melalui backend Next.js untuk menghindari pemblokiran cookie
      return `/api/image-proxy?id=${match1[1]}`;
    }

    // Pola 2: https://drive.google.com/open?id=FILE_ID
    const driveRegex2 = /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/;
    const match2 = url.match(driveRegex2);
    if (match2 && match2[1]) {
      return `/api/image-proxy?id=${match2[1]}`;
    }

    // Pola 3: https://drive.google.com/drive/folders/... (Tidak bisa dikonversi jadi 1 gambar)
    // Jika ada pola lain, kembalikan aslinya saja.
  } catch (e) {
    console.error("Error parsing image URL:", e);
  }

  return url;
}
