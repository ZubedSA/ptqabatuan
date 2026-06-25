"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, CheckCircle, XCircle, Clock, Eye, Trash2, FileText, Download } from "lucide-react";

export default function AdminPPDBPage() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocs, setSelectedDocs] = useState<{ [key: string]: string } | null>(null);
  const supabase = createClient();

  const fetchRegistrations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("ppdb")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) setRegistrations(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    if (!confirm(`Yakin ingin mengubah status menjadi ${newStatus}?`)) return;
    
    const { error } = await supabase
      .from("ppdb")
      .update({ status: newStatus })
      .eq("id", id);
      
    if (!error) {
      fetchRegistrations();
    } else {
      alert("Gagal mengubah status: " + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus data pendaftar ini?")) return;
    
    const { error } = await supabase
      .from("ppdb")
      .delete()
      .eq("id", id);
      
    if (!error) {
      fetchRegistrations();
    } else {
      alert("Gagal menghapus pendaftar: " + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen PPDB</h1>
          <p className="mt-1 text-sm text-gray-500">Kelola pendaftaran santri baru.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#0a3822] mb-4" />
            <p className="text-gray-500">Memuat data PPDB...</p>
          </div>
        ) : registrations.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 border border-dashed border-gray-300 m-6 rounded-xl">
            <h3 className="text-lg font-medium text-gray-900 mb-1">Belum Ada Pendaftar</h3>
            <p className="text-gray-500 text-sm">Data pendaftaran santri baru akan muncul di sini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama Santri / Wali
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kontak
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {registrations.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{item.full_name}</div>
                      <div className="text-sm text-gray-500">{item.parent_name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{item.phone}</div>
                      <div className="text-xs text-gray-500 max-w-[200px] truncate" title={item.address}>
                        {item.address}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.status === 'pending' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Clock className="w-3.5 h-3.5" /> Menunggu
                        </span>
                      )}
                      {item.status === 'verified' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3.5 h-3.5" /> Terverifikasi
                        </span>
                      )}
                      {item.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <XCircle className="w-3.5 h-3.5" /> Ditolak
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {item.documents && Object.keys(item.documents).length > 0 && (
                          <button 
                            onClick={() => setSelectedDocs(item.documents)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                            title="Lihat Berkas"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        )}
                        {item.status !== 'verified' && (
                          <button
                            onClick={() => handleUpdateStatus(item.id, 'verified')}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Verifikasi"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {item.status !== 'rejected' && (
                          <button
                            onClick={() => handleUpdateStatus(item.id, 'rejected')}
                            className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Tolak"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus Data"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal View Documents */}
      {selectedDocs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="font-bold text-gray-900">Berkas Terlampir</h3>
              <button 
                onClick={() => setSelectedDocs(null)}
                className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-3">
              {Object.keys(selectedDocs).length === 0 ? (
                <p className="text-center text-sm text-gray-500 py-4">Tidak ada berkas yang diunggah.</p>
              ) : (
                Object.entries(selectedDocs).map(([key, url]) => (
                  <div 
                    key={key} 
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-[#D4AF37] hover:bg-orange-50/30 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-[#D4AF37]/20 group-hover:text-[#D4AF37] transition-colors">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="font-medium text-gray-800 capitalize">{key.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <a 
                        href={`${url}?download=`} 
                        className="text-xs font-semibold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200 flex items-center gap-1.5 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Unduh</span>
                      </a>
                      <a 
                        href={url as string} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xs font-semibold text-[#0a3822] bg-[#0a3822]/10 px-3 py-1.5 rounded-lg hover:bg-[#0a3822]/20 flex items-center gap-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> Buka
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button 
                onClick={() => setSelectedDocs(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
