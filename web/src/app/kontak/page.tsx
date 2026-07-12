"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Send, MessageSquare, Navigation } from "lucide-react";

export default function KontakPage() {
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { name, subject, message } = formData;

    // Format pesan untuk WhatsApp
    const waText = encodeURIComponent(
      `Assalamu'alaikum, perkenalkan nama saya *${name}*.\n\n` +
      `Tujuan saya menghubungi: *${subject}*\n\n` +
      `Pesan:\n${message}`
    );

    // Ganti dengan nomor WhatsApp admin yang sebenarnya
    const waNumber = "6281717594886";
    const waUrl = `https://wa.me/${waNumber}?text=${waText}`;

    // Buka WhatsApp di tab baru
    window.open(waUrl, "_blank");

    // Reset form
    setFormData({ name: "", subject: "", message: "" });
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-background">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#0a3822] via-primary to-[#051c11]">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 font-semibold text-sm mb-6"
          >
            <MessageSquare className="w-4 h-4" />
            Tetap Terhubung
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 font-serif leading-tight"
          >
            Hubungi <span className="text-[#D4AF37]">Kami</span>
          </motion.h1>
          <div className="w-16 sm:w-24 h-0.5 bg-[#D4AF37] mx-auto mb-6" />
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed px-4"
          >
            Kami selalu terbuka untuk menjawab pertanyaan, mendengarkan saran, serta membantu Anda terkait informasi seputar pondok pesantren.
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 -mt-10 relative z-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Contact Information (Left) */}
            <div className="lg:col-span-1 space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700 h-full flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white font-serif mb-6">Informasi Kontak</h3>

                  <div className="space-y-8">
                    {/* Alamat */}
                    <div className="flex gap-4 group">
                      <div className="w-12 h-12 rounded-full bg-[#0B3B24]/10 dark:bg-primary/20 flex items-center justify-center shrink-0 group-hover:bg-[#0B3B24] transition-colors duration-300">
                        <MapPin className="w-5 h-5 text-[#0B3B24] dark:text-primary-foreground group-hover:text-white transition-colors duration-300" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-1">Alamat</h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                          Jl. Raya Batuan, Kec. Batuan,<br />
                          Kabupaten Sumenep, Jawa Timur
                        </p>
                      </div>
                    </div>

                    {/* WhatsApp */}
                    <a href="https://wa.me/6281717594886" target="_blank" rel="noreferrer" className="flex gap-4 group cursor-pointer block">
                      <div className="w-12 h-12 rounded-full bg-[#0B3B24]/10 dark:bg-primary/20 flex items-center justify-center shrink-0 group-hover:bg-green-600 transition-colors duration-300">
                        <Phone className="w-5 h-5 text-[#0B3B24] dark:text-primary-foreground group-hover:text-white transition-colors duration-300" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-1">Telepon / WhatsApp</h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed group-hover:text-green-600 transition-colors">
                          +62 817-1759-4886
                        </p>
                      </div>
                    </a>

                    {/* Email */}
                    <a href="mailto:tahfizhquranbatuan@gmail.com" className="flex gap-4 group cursor-pointer block">
                      <div className="w-12 h-12 rounded-full bg-[#0B3B24]/10 dark:bg-primary/20 flex items-center justify-center shrink-0 group-hover:bg-blue-600 transition-colors duration-300">
                        <Mail className="w-5 h-5 text-[#0B3B24] dark:text-primary-foreground group-hover:text-white transition-colors duration-300" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-1">Email</h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed group-hover:text-blue-600 transition-colors">
                          tahfizhquranbatuan@gmail.com
                        </p>
                      </div>
                    </a>

                    {/* Jam Kerja */}
                    <div className="flex gap-4 group">
                      <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center shrink-0 group-hover:bg-[#D4AF37] transition-colors duration-300">
                        <Clock className="w-5 h-5 text-[#D4AF37] group-hover:text-white transition-colors duration-300" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-1">Jam Operasional</h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                          Sabtu - Kamis: 07.00 - 16.00 WIB<br />
                          Jum'at : Libur
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Form Section (Right) */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-3xl p-8 sm:p-10 shadow-xl border border-gray-100 dark:border-gray-700"
              >
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white font-serif mb-2">Kirim Pesan Cepat</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Isi form di bawah ini dan pesan Anda akan langsung diteruskan ke WhatsApp admin kami.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    {/* Nama */}
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Contoh: Ahmad Abdullah"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all"
                      />
                    </div>

                    {/* Subjek */}
                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Tujuan/Subjek
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all appearance-none"
                      >
                        <option value="" disabled>Pilih Subjek</option>
                        <option value="Informasi PPDB">Informasi Pendaftaran Santri Baru</option>
                        <option value="Donasi & Wakaf">Informasi Donasi & Wakaf</option>
                        <option value="Kerjasama">Kerjasama & Kemitraan</option>
                        <option value="Lainnya">Lainnya (Pertanyaan Umum)</option>
                      </select>
                    </div>
                  </div>

                  {/* Pesan */}
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Isi Pesan
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      placeholder="Tuliskan pertanyaan atau pesan Anda di sini..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#0B3B24] to-[#115a37] text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    Kirim Pesan via WhatsApp
                  </motion.button>
                </form>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Peta Lokasi */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white font-serif">Lokasi Kami</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Kunjungi pondok pesantren kami langsung ke alamat ini.</p>
            </div>
            <a
              href="https://maps.app.goo.gl/5VENRQEQD72ZCHQeA"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all"
            >
              <Navigation className="w-4 h-4" />
              Dapatkan Rute
            </a>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 bg-gray-200 h-[400px] sm:h-[500px] relative"
          >
            {/* Embed Google Maps */}
            <iframe
              src="https://maps.google.com/maps?q=Ma'had%20Tahfizh%20Bahjatul%20Huffazh%20(Kompleks%20Al-Usymuni%20II)&t=&z=16&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Peta Lokasi Pesantren"
              className="absolute inset-0"
            />
          </motion.div>
        </div>
      </section>
    </div>
  );
}
