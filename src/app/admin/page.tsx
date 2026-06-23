export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0B3B24] font-sans">Selamat Datang di Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Ringkasan data dan aktivitas Pondok Pesantren Tahfizh Qur'an Al-Usymuni.</p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { name: "Pendaftar PPDB", stat: "0", bg: "from-[#0B3B24] to-[#072718]", text: "text-white" },
          { name: "Artikel Aktif", stat: "0", bg: "from-white to-gray-50/50", text: "text-gray-900" },
          { name: "Total Donasi (Rp)", stat: "0", bg: "from-white to-gray-50/50", text: "text-gray-900" },
          { name: "Pesan Masuk", stat: "0", bg: "from-white to-gray-50/50", text: "text-gray-900" },
        ].map((item, idx) => (
          <div 
            key={item.name} 
            className={`overflow-hidden rounded-2xl bg-gradient-to-br ${item.bg} p-6 border ${idx === 0 ? "border-[#D4AF37]/30" : "border-gray-150"} shadow-[0_4px_15px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(11,59,36,0.08)] transition-all duration-300 group`}
          >
            <span className={`text-xs font-semibold uppercase tracking-wider ${idx === 0 ? "text-[#D4AF37]" : "text-gray-400"}`}>
              {item.name}
            </span>
            <div className={`mt-3 text-3.5xl font-bold tracking-tight ${item.text} leading-none`}>
              {item.stat}
            </div>
            {idx === 0 && (
              <div className="mt-4 text-[11px] text-white/60 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-ping" />
                <span>PPDB Sedang Berlangsung</span>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Recent PPDB Applicants */}
      <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-gray-150 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#0B3B24]">Pendaftaran PPDB Terbaru</h2>
          <span className="text-xs text-gray-500 font-medium">Santri Baru 2026/2027</span>
        </div>
        <div className="text-center py-16 text-gray-400 font-medium">
          <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3 border border-gray-100">
            <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <span>Belum ada data pendaftar baru masuk hari ini</span>
        </div>
      </div>
    </div>
  );
}
