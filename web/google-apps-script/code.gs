// Konfigurasi Nama Folder Utama di Google Drive Anda
const PARENT_FOLDER_NAME = "PTQ_AlUsymuni_Storage";

/**
 * Endpoint POST yang menerima data JSON dari Next.js backend.
 * Mendukung aksi upload file dan penghapusan file (setTrashed).
 */
function doPost(e) {
  try {
    const jsonString = e.postData.contents;
    const data = JSON.parse(jsonString);
    
    // Cek Aksi: Hapus atau Unggah
    if (data.action === "delete") {
      return deleteFile(data.fileId);
    }
    
    return uploadFile(data);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Fungsi untuk mengunggah berkas baru
 */
function uploadFile(data) {
  const base64Data = data.base64; // String data file dalam Base64
  const fileName = data.fileName; // Nama file asli (contoh: gambar.jpg)
  const mimeType = data.mimeType; // Jenis mime (contoh: image/jpeg)
  const category = data.category || "umum"; // Folder kategori
  
  // 1. Dapatkan atau buat Folder Utama
  const parentFolder = getOrCreateFolder(DriveApp.getRootFolder(), PARENT_FOLDER_NAME);
  
  // 2. Dapatkan atau buat Sub-folder Kategori
  const categoryFolder = getOrCreateFolder(parentFolder, category);
  
  // 3. Dekode data Base64 kembali menjadi byte array
  const decodedBytes = Utilities.base64Decode(base64Data);
  const blob = Utilities.newBlob(decodedBytes, mimeType, fileName);
  
  // 4. Simpan ke Google Drive
  const file = categoryFolder.createFile(blob);
  
  // 5. Atur hak akses file agar bisa dilihat oleh umum (Public Read-Only)
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  const fileId = file.getId();
  const viewUrl = `https://drive.google.com/file/d/${fileId}/view?usp=drivesdk`;
  
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    fileId: fileId,
    url: viewUrl,
    fileName: fileName
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Fungsi untuk memindahkan berkas ke tempat sampah Google Drive (Trash)
 */
function deleteFile(fileId) {
  try {
    if (!fileId) {
      throw new Error("File ID tidak boleh kosong!");
    }
    
    const file = DriveApp.getFileById(fileId);
    file.setTrashed(true); // Pindahkan ke Trash (aman & bisa di-restore dalam 30 hari)
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: `File dengan ID ${fileId} berhasil dipindahkan ke tempat sampah.`
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Helper untuk mengambil atau membuat folder jika belum ada
 */
function getOrCreateFolder(parent, folderName) {
  const folders = parent.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return parent.createFolder(folderName);
}
