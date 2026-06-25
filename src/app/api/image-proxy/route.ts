import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new NextResponse("Missing image ID", { status: 400 });
  }

  try {
    // Gunakan endpoint download dari Google Drive
    const driveUrl = `https://drive.google.com/uc?export=download&id=${id}`;
    
    const response = await fetch(driveUrl, {
      method: "GET",
      // Jangan gunakan cookie untuk memastikan public access
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch from Google Drive. Status:", response.status);
      // Jika Google Drive menolak atau file tidak ada, kembalikan error
      return new NextResponse("Image not found or not public", { status: 404 });
    }

    // Ambil data gambar dalam bentuk buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Dapatkan tipe konten (biasanya image/jpeg atau image/png)
    const contentType = response.headers.get("content-type") || "image/jpeg";

    // Jika yang dikembalikan adalah HTML (misal redirect ke halaman login), berarti file di-private
    if (contentType.includes("text/html")) {
      return new NextResponse("File is not publicly shared in Google Drive", { status: 403 });
    }

    // Kembalikan gambar murni ke browser dengan header cache yang baik
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200", // Cache 1 hari
      },
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
