/**
 * Kompres gambar menggunakan Canvas API di sisi client (browser).
 * Memperkecil dimensi jika melebihi batas maksimal, dan mengompres kualitasnya.
 */
export async function compressImage(file: File, maxDimension: number = 1200, quality: number = 0.75): Promise<File> {
  // Hanya kompres jika tipe berkas adalah gambar
  if (!file.type.startsWith('image/')) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Hitung proporsi rasio jika melebihi dimensi maksimal
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            // Buat berkas baru dari hasil kompresi
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg', // Ubah ke jpeg agar ukuran berkas optimal
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}

/**
 * Mengunggah file ke Google Drive melalui API Route Next.js.
 * Melakukan kompresi otomatis jika file tersebut adalah gambar.
 */
export async function uploadToGDrive(file: File, category: string = 'umum'): Promise<{ url: string; fileId: string }> {
  let fileToUpload = file;

  // 1. Kompres gambar jika tipenya image/*
  if (file.type.startsWith('image/')) {
    try {
      fileToUpload = await compressImage(file);
    } catch (e) {
      console.warn('Gagal melakukan kompresi gambar, menggunakan file asli:', e);
    }
  }

  // 2. Siapkan FormData
  const formData = new FormData();
  formData.append('file', fileToUpload);
  formData.append('category', category);

  // 3. Kirim ke API Route Next.js
  const response = await fetch('/api/upload/gdrive', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Upload gagal dengan status ${response.status}`);
  }

  const result = await response.json();
  return {
    url: result.url,
    fileId: result.fileId,
  };
}

/**
 * Mengekstrak ID File dari URL Google Drive
 */
export function extractFileId(url: string | undefined | null): string | null {
  if (!url) return null;

  try {
    // Pola 1: /file/d/FILE_ID/view
    const regex1 = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
    const match1 = url.match(regex1);
    if (match1 && match1[1]) return match1[1];

    // Pola 2: ?id=FILE_ID
    const regex2 = /[?&]id=([a-zA-Z0-9_-]+)/;
    const match2 = url.match(regex2);
    if (match2 && match2[1]) return match2[1];

    // Pola 3: uc?id=FILE_ID
    const regex3 = /drive\.google\.com\/uc\?export=\w+&id=([a-zA-Z0-9_-]+)/;
    const match3 = url.match(regex3);
    if (match3 && match3[1]) return match3[1];
  } catch (e) {
    console.error("Error extracting file ID:", e);
  }

  return null;
}

/**
 * Menghapus file dari Google Drive berdasarkan URL-nya.
 * Jika URL valid dan memiliki ID File, akan memanggil API Route dengan method DELETE.
 */
export async function deleteFromGDrive(url: string | undefined | null): Promise<boolean> {
  const fileId = extractFileId(url);
  if (!fileId) return false;

  try {
    const response = await fetch(`/api/upload/gdrive?fileId=${fileId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Gagal menghapus dengan status ${response.status}`);
    }

    const result = await response.json();
    return result.success;
  } catch (e) {
    console.error("Gagal menghapus file dari Google Drive:", e);
    return false;
  }
}
