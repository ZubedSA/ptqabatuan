# Panduan Konfigurasi Google Apps Script (GAS) Upload Google Drive

Error **404 Not Found** dari Google Apps Script terjadi karena salah satu dari penyebab berikut:
1. URL Web App pada `GOOGLE_APPS_SCRIPT_UPLOAD_URL` di `web/.env.local` sudah kadaluwarsa, tidak valid, atau deployment lamanya telah dihapus.
2. Pengaturan akses (**Who has access**) pada Web App Google Apps Script belum diubah ke **"Anyone" (Siapa saja)**.

---

## 🛠️ Langkah Solusi (Deploy Ulang Google Apps Script)

### 1. Buka Google Apps Script
Buka [script.google.com](https://script.google.com/) dan buat proyek baru (*New Project*) atau buka script yang sudah ada.

### 2. Tempel Kode Script (`Code.gs`)
Hapus kode bawaan dan tempel kode berikut:

```javascript
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    
    // Opsi 1: Hapus File
    if (data.action === 'delete') {
      if (!data.fileId) {
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          error: 'fileId tidak ditemukan'
        })).setMimeType(ContentService.MimeType.JSON);
      }
      var fileToDelete = DriveApp.getFileById(data.fileId);
      fileToDelete.setTrashed(true);
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'File berhasil dihapus'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Opsi 2: Upload File Baru
    var base64Data = data.base64;
    var fileName = data.fileName || 'upload_' + new Date().getTime();
    var mimeType = data.mimeType || 'image/jpeg';
    var category = data.category || 'umum';

    if (!base64Data) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Data Base64 tidak ditemukan'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var decoded = Utilities.base64Decode(base64Data);
    var blob = Utilities.newBlob(decoded, mimeType, fileName);

    // Buat/Cari Folder Utama (Gunakan nama folder yang sudah ada di Google Drive Anda)
    var rootFolderName = 'PTQ_AlUsymuni_Storage';
    var rootFolders = DriveApp.getFoldersByName(rootFolderName);
    var rootFolder = rootFolders.hasNext() ? rootFolders.next() : DriveApp.createFolder(rootFolderName);

    // Buat/Cari Sub-Folder Kategori
    var categoryFolders = rootFolder.getFoldersByName(category);
    var targetFolder = categoryFolders.hasNext() ? categoryFolders.next() : rootFolder.createFolder(category);

    // Simpan Berkas & Set Hak Akses ke Publik (Anyone with link)
    var file = targetFolder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    var fileId = file.getId();
    var viewUrl = 'https://drive.google.com/uc?export=view&id=' + fileId;

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      fileId: fileId,
      url: viewUrl,
      fileName: fileName
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

### 3. Deploy Ulang sebagai Web App (**Paling Krusial**)
1. Di pojok kanan atas editor Apps Script, klik **Deploy** > **New deployment**.
2. Klik ikon gerigi (⚙️) di samping *Select type*, pilih **Web app**.
3. Isi konfigurasi:
   - **Description**: Upload Google Drive API
   - **Execute as**: `Me (email@gmail.com)`
   - **Who has access**: **`Anyone` (Siapa saja)** ⚠️ *(Wajib 'Anyone', jangan pilih 'Only myself')*
4. Klik **Deploy**.
5. Izinkan Akses (*Authorize Access*) dan selesaikan verifikasi akun Google Anda.
6. Salin **Web App URL** (URL berakhiran `/exec`).

### 4. Perbarui `.env.local`
Buka file `web/.env.local` dan masukkan Web App URL yang baru:

```env
GOOGLE_APPS_SCRIPT_UPLOAD_URL=https://script.google.com/macros/s/AKfycb.../exec
```

---

## 📌 Catatan Tambahan
- Setelah mengubah `.env.local`, restart server development (`npm run dev`) jika perubahan belum terbaca.
- Penanganan error di API Route Next.js (`/api/upload/gdrive`) sudah diperbarui agar memberikan pesan error yang informatif dan tidak menampilkan dump HTML 404 lagi.
