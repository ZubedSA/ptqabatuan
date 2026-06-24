"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, Loader2, UploadCloud } from "lucide-react";
import Link from "next/link";

const FileInput = ({ label, id, isRequired = false, accept = "image/*,.pdf", file, onChange }: any) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
      {label} {isRequired && <span className="text-red-500">*</span>}
    </label>
    <div className={`relative border-2 border-dashed rounded-xl p-4 transition-colors group ${file ? 'border-green-300 bg-green-50/50 dark:border-green-800 dark:bg-green-900/10' : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:border-[#D4AF37]'}`}>
      <input
        type="file"
        id={id}
        accept={accept}
        required={isRequired && !file}
        onChange={(e) => onChange(e, id)}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      <div className="flex items-center gap-3 md:gap-4 text-gray-500">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${file ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-gray-200 dark:bg-gray-700 group-hover:bg-[#D4AF37]/20 group-hover:text-[#D4AF37]'}`}>
          {file ? <CheckCircle className="w-5 h-5" /> : <UploadCloud className="w-5 h-5" />}
        </div>
        <div className="flex-1 min-w-0">
          {file ? (
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={file.name}>
              {file.name}
            </p>
          ) : (
            <p className="text-[13px] md:text-sm text-gray-500">Klik atau seret file ke sini</p>
          )}
          <p className="text-[11px] md:text-xs text-gray-400 mt-0.5 md:mt-1">Maks. 5MB (JPG, PNG, PDF)</p>
        </div>
      </div>
    </div>
  </div>
);

export default function PPDBRegistrationPage() {
  const supabase = createClient();
  
  const [formData, setFormData] = useState({
    fullName: "",
    parentName: "",
    phone: "",
    address: "",
  });

  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    kk: null,
    akte: null,
    surat_ket_sd: null,
    surat_sehat: null,
    surat_izin: null,
    pas_foto: null,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    if (e.target.files && e.target.files[0]) {
      setFiles({
        ...files,
        [key]: e.target.files[0],
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Manual validation fallback
    if (!files.kk || !files.akte || !files.surat_sehat || !files.surat_izin || !files.pas_foto) {
      setError("Mohon lengkapi seluruh berkas yang wajib diunggah.");
      setIsLoading(false);
      return;
    }

    try {
      const documentsUrl: { [key: string]: string } = {};

      // Upload files
      for (const [key, file] of Object.entries(files)) {
        if (file) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}_${formData.phone.replace(/[^0-9]/g, '')}_${key}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from("ppdb_documents")
            .upload(fileName, file);

          if (uploadError) {
             console.error("Upload error details:", uploadError);
             throw new Error(`Gagal mengunggah ${key.toUpperCase()}: ${uploadError.message}`);
          }

          const { data: { publicUrl } } = supabase.storage
            .from("ppdb_documents")
            .getPublicUrl(fileName);
          
          documentsUrl[key] = publicUrl;
        }
      }

      // Insert to database
      const { error: submitError } = await supabase.from("ppdb").insert({
        full_name: formData.fullName,
        parent_name: formData.parentName,
        phone: formData.phone,
        address: formData.address,
        status: "pending",
        documents: documentsUrl
      });

      if (submitError) throw submitError;

      setIsSuccess(true);
    } catch (err: any) {
      console.error("Error submitting PPDB:", err);
      setError(err.message || "Terjadi kesalahan saat mengirim pendaftaran. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-gray-50 flex items-center justify-center p-4 md:p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-6 md:p-12 rounded-3xl shadow-xl max-w-lg w-full text-center border border-gray-100"
        >
          <div className="w-16 h-16 md:w-20 md:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 md:w-10 md:h-10 text-green-500" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Pendaftaran Berhasil!</h2>
          <p className="text-sm md:text-base text-gray-600 mb-8 leading-relaxed">
            Terima kasih, data pendaftaran santri baru atas nama <span className="font-semibold text-gray-900">{formData.fullName}</span> telah kami terima. Panitia akan segera memverifikasi berkas Anda.
          </p>
          <div className="flex flex-col gap-3">
            <Link 
              href="/ppdb/status"
              className="w-full px-6 py-3.5 bg-[#0B3B24] text-white font-medium rounded-xl hover:bg-[#0B3B24]/90 transition-colors shadow-lg shadow-[#0B3B24]/20"
            >
              Cek Status Anda
            </Link>
            <Link 
              href="/"
              className="w-full px-6 py-3.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
            >
              Ke Halaman Utama
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Link href="/ppdb" className="inline-flex items-center gap-2 text-gray-600 hover:text-[#0B3B24] mb-6 font-medium transition-colors text-sm md:text-base">
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="bg-[#0B3B24] p-6 md:p-10 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]" />
            <div className="relative z-10">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">Formulir Pendaftaran PPDB</h1>
              <p className="text-gray-300 text-sm md:text-base">Isi data dan unggah berkas persyaratan dengan lengkap.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-5 md:p-10">
            
            {error && (
              <div className="p-4 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-medium mb-6 md:mb-8">
                {error}
              </div>
            )}

            <div className="grid lg:grid-cols-2 gap-8 md:gap-10">
              {/* Data Diri */}
              <div className="space-y-5 md:space-y-6">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 md:gap-3 border-b pb-3">
                  <span className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#0B3B24]/10 text-[#0B3B24] flex items-center justify-center text-xs md:text-sm shrink-0">1</span>
                  Data Diri Calon Santri
                </h3>

                <div>
                  <label htmlFor="fullName" className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 md:mb-2">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-3.5 py-3 md:px-4 md:py-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm md:text-base"
                    placeholder="Sesuai ijazah/akta kelahiran"
                  />
                </div>

                <div>
                  <label htmlFor="parentName" className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 md:mb-2">
                    Nama Orang Tua / Wali <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="parentName"
                    name="parentName"
                    required
                    value={formData.parentName}
                    onChange={handleChange}
                    className="w-full px-3.5 py-3 md:px-4 md:py-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm md:text-base"
                    placeholder="Nama ayah/ibu/wali"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 md:mb-2">
                    Nomor WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3.5 py-3 md:px-4 md:py-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm md:text-base"
                    placeholder="Contoh: 081234567890"
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 md:mb-2">
                    Alamat Lengkap <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    required
                    rows={4}
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-3.5 py-3 md:px-4 md:py-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none transition-all resize-none dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm md:text-base"
                    placeholder="Jalan, RT/RW, Desa, Kec., Kab."
                  />
                </div>
              </div>

              {/* Upload Berkas */}
              <div className="space-y-5 md:space-y-6">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 md:gap-3 border-b pb-3">
                  <span className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#0B3B24]/10 text-[#0B3B24] flex items-center justify-center text-xs md:text-sm shrink-0">2</span>
                  Unggah Berkas
                </h3>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-3.5 md:p-4 rounded-xl text-xs md:text-sm mb-2">
                  Pastikan hasil scan/foto dokumen terlihat jelas dan dapat dibaca.
                </div>

                <div className="space-y-4">
                  <FileInput id="kk" label="Kartu Keluarga (KK)" isRequired={true} file={files.kk} onChange={handleFileChange} />
                  <FileInput id="akte" label="Akte Kelahiran" isRequired={true} file={files.akte} onChange={handleFileChange} />
                  <FileInput id="surat_ket_sd" label="Surat Keterangan Kelas VI SD / Ijazah" isRequired={false} file={files.surat_ket_sd} onChange={handleFileChange} />
                  <FileInput id="surat_sehat" label="Surat Keterangan Sehat" isRequired={true} file={files.surat_sehat} onChange={handleFileChange} />
                  <FileInput id="surat_izin" label="Surat Pernyataan Restu dan Izin Orangtua/Wali" isRequired={true} file={files.surat_izin} onChange={handleFileChange} />
                  <FileInput id="pas_foto" label="Pas Foto 3x4" isRequired={true} accept="image/*" file={files.pas_foto} onChange={handleFileChange} />
                </div>
                
              </div>
            </div>

            <div className="pt-8 md:pt-10 mt-8 md:mt-10 border-t border-gray-100 dark:border-gray-800">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-[#0B3B24] hover:bg-[#0B3B24]/90 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#0B3B24]/20 disabled:opacity-70 disabled:cursor-not-allowed text-sm md:text-base"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Memproses & Mengunggah...
                  </>
                ) : (
                  <>
                    Kirim Formulir Pendaftaran
                    <ArrowLeft className="w-5 h-5 rotate-180" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
