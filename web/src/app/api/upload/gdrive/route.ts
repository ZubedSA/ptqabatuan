import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string || 'umum';

    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });
    }

    // Security Check: Hanya izinkan upload tanpa login jika kategorinya adalah 'ppdb'
    if (category !== 'ppdb') {
      const supabase = await createClient();
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        return NextResponse.json({ error: 'Unauthorized: Hubungan ditolak' }, { status: 401 });
      }
    }

    // Ubah file menjadi buffer kemudian Base64 string
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64String = buffer.toString('base64');

    const gasUrl = process.env.GOOGLE_APPS_SCRIPT_UPLOAD_URL;
    if (!gasUrl) {
      return NextResponse.json(
        { error: 'Konfigurasi URL Google Apps Script belum diset di .env.local' },
        { status: 500 }
      );
    }

    // Kirim request ke Google Apps Script Web App
    const gasResponse = await fetch(gasUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        base64: base64String,
        fileName: file.name,
        mimeType: file.type,
        category: category,
      }),
    });

    if (!gasResponse.ok) {
      const errorText = await gasResponse.text();
      return NextResponse.json(
        { error: `Google Apps Script mengembalikan error status ${gasResponse.status}: ${errorText}` },
        { status: 500 }
      );
    }

    const result = await gasResponse.json();

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Gagal mengunggah file ke Google Drive via GAS' },
        { status: 500 }
      );
    }

    // Kembalikan URL publik dan fileId
    return NextResponse.json({
      success: true,
      url: result.url,
      fileId: result.fileId,
      fileName: result.fileName,
    });

  } catch (error: any) {
    console.error('Error uploading file to Google Drive:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan internal server' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    // Security Check: Hanya admin/user terautentikasi yang boleh menghapus berkas
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Hubungan ditolak' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return NextResponse.json({ error: 'fileId tidak ditemukan di query parameter' }, { status: 400 });
    }

    const gasUrl = process.env.GOOGLE_APPS_SCRIPT_UPLOAD_URL;
    if (!gasUrl) {
      return NextResponse.json(
        { error: 'Konfigurasi URL Google Apps Script belum diset di .env.local' },
        { status: 500 }
      );
    }

    // Kirim request penghapusan ke Google Apps Script
    const gasResponse = await fetch(gasUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'delete',
        fileId: fileId,
      }),
    });

    if (!gasResponse.ok) {
      const errorText = await gasResponse.text();
      return NextResponse.json(
        { error: `Google Apps Script mengembalikan error status ${gasResponse.status}: ${errorText}` },
        { status: 500 }
      );
    }

    const result = await gasResponse.json();

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Gagal menghapus file dari Google Drive via GAS' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    });

  } catch (error: any) {
    console.error('Error deleting file from Google Drive:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan internal server' },
      { status: 500 }
    );
  }
}
