'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  MapPin,
  Briefcase,
  Building2,
  Users,
  TrendingUp,
  ChevronRight,
  Star,
  CheckCircle,
  ShieldCheck
} from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function LandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [vacancies, setVacancies] = useState([]);
  const [loadingVacancies, setLoadingVacancies] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
    fetchVacancies();
  }, []);

  const fetchVacancies = async () => {
    try {
      // Import api dynamically or use the one we add. 
      // Note: I will add import statement in previous chunk or here if I can, but imports are at top.
      // I'll assume I can add import in another step or user `axios` directly if I import it.
      // Or better: use fetch directly with NEXT_PUBLIC_API_URL for now to avoid import issues in this chunk, 
      // BUT api.js is better. I will add import at top in next step.
      // Let's perform fetch here assuming `api` is imported.
      // Wait, I can't add import in this tool call easily if it's far away.
      // I will use `fetch` with hardcoded fallback or env.
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${baseUrl}/api/public/lowongan`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setVacancies(data);
      }
    } catch (error) {
      console.error("Failed to fetch vacancies", error);
    } finally {
      setLoadingVacancies(false);
    }
  };

  // Static fallback if API fails or empty (optional, but requested to use real data)
  // We will use state.

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-4 bg-gradient-to-br from-blue-50 via-white to-blue-50/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-100/30 skew-x-12 transform origin-top-right z-0"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight"
            >
              Temukan Tempat <span className="text-primary">Magang Impianmu</span> <br />
              Kembangkan Potensimu
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg text-gray-600 mb-8"
            >
              Platform resmi yang menghubungkan mahasiswa dengan ribuan peluang magang berkualitas di berbagai perusahaan ternama.
            </motion.p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white p-2 rounded-full shadow-xl shadow-blue-100/50 border border-gray-100 flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto"
            >
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  className="w-full h-12 pl-12 pr-4 rounded-full bg-transparent focus:outline-none text-gray-700 placeholder:text-gray-400"
                  placeholder="Cari posisi atau perusahaan..."
                />
              </div>
              <div className="h-8 w-px bg-gray-200 my-auto hidden sm:block"></div>
              <div className="flex-1 relative">
                <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  className="w-full h-12 pl-12 pr-4 rounded-full bg-transparent focus:outline-none text-gray-700 placeholder:text-gray-400"
                  placeholder="Lokasi (cth: Jakarta)"
                />
              </div>
              <Button className="h-12 rounded-full px-8 bg-primary hover:bg-blue-700">
                Cari
              </Button>
            </motion.div>
            <div className="mt-6 text-sm text-gray-500">
              Pencarian Populer: <span className="text-primary cursor-pointer hover:underline">UI/UX Design</span>, <span className="text-primary cursor-pointer hover:underline">Data Analyst</span>, <span className="text-primary cursor-pointer hover:underline">Web Developer</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-16">
            {[
              { label: "Lowongan Magang", val: "1,250+", icon: Briefcase },
              { label: "Mitra Perusahaan", val: "120+", icon: Building2 },
              { label: "Peserta Aktif", val: "500+", icon: Users },
              { label: "Alumni Sukses", val: "350+", icon: Star }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + (i * 0.1) }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow"
              >
                <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-primary">
                  <stat.icon size={20} />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.val}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Vacancies */}
      <section id="lowongan" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Lowongan Terbaru</h2>
              <p className="text-gray-600">Jelajahi kesempatan magang yang baru ditambahkan minggu ini.</p>
            </div>
            <Link href="/lowongan">
              <Button variant="outline" className="hidden sm:flex text-primary border-primary hover:bg-blue-50">
                Lihat Semua <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {loadingVacancies ? (
            <div className="text-center py-20 text-gray-500">Memuat lowongan...</div>
          ) : vacancies.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vacancies.slice(0, 6).map((job, idx) => (
                <motion.div
                  key={job.id || idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  viewport={{ once: true }}
                  className="bg-white p-6 rounded-xl border border-gray-200 hover:border-primary/50 hover:shadow-lg transition-all group cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 font-bold text-xl overflow-hidden">
                        {job.logoUrl ? (
                          <img src={job.logoUrl} alt={job.nama} className="w-full h-full object-cover" />
                        ) : (
                          job.nama ? job.nama[0] : '?'
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors">{job.posisi || 'Posisi Terbuka'}</h3>
                        <p className="text-sm text-gray-500">{job.nama}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${job.jenisLowongan === 'MBKM' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                      {job.jenisLowongan || 'Magang'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" /> {job.kota || 'Lokasi tidak tersedia'}
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" /> Full Time
                    </div>
                  </div>
                  <Button className="w-full bg-white text-primary border border-primary hover:bg-primary hover:text-white transition-all">
                    Lihat Detail
                  </Button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500 bg-white rounded-xl border border-dashed">
              Belum ada lowongan tersedia saat ini.
            </div>
          )}
          <div className="mt-8 text-center sm:hidden">
            <Button variant="outline" className="text-primary border-primary">
              Lihat Semua <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Why Join */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">Mengapa Menggunakan SID3MI?</h2>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="text-center">
              <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Pengembangan Karir</h3>
              <p className="text-gray-600 leading-relaxed">
                Dapatkan pengalaman kerja nyata dan relevan untuk meningkatkan daya saing di dunia kerja.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-success" />
              </div>
              <h3 className="text-xl font-bold mb-3">Konversi SKS</h3>
              <p className="text-gray-600 leading-relaxed">
                Kegiatan magang yang tervalidasi dapat dikonversi menjadi SKS perkuliahan secara otomatis.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Terverifikasi & Aman</h3>
              <p className="text-gray-600 leading-relaxed">
                Seluruh mitra perusahaan telah melalui proses verifikasi ketat untuk menjamin keamanan peserta.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto bg-gradient-to-r from-primary to-blue-600 rounded-3xl p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -ml-48 -mb-48"></div>

          <h2 className="text-3xl md:text-5xl font-extrabold mb-6 relative z-10">Siap untuk Memulai Langkah Awal Karirmu?</h2>
          <p className="text-white/90 text-lg mb-10 max-w-2xl mx-auto relative z-10">
            Bergabunglah dengan ribuan mahasiswa lainnya yang telah menemukan tempat magang impian mereka.
          </p>
          <Link href={isLoggedIn ? "/dashboard" : "/login"}>
            <Button size="lg" className="h-14 px-10 text-lg bg-white text-primary border-none hover:bg-gray-100 font-bold shadow-lg">
              {isLoggedIn ? "Masuk ke Dashboard" : "Daftar Sekarang - Gratis"}
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white py-16 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl font-bold text-white">SID3MI</span>
            </div>
            <p className="text-sm leading-relaxed text-white">
              Platform ekosistem digital untuk pengelolaan program Magang dan Studi Independen Bersertifikat (MSIB) dan PKL.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Program</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-primary transition-colors">Magang Bersertifikat</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Studi Independen</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">PKL Reguler</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Magang Mandiri</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Bantuan</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-primary transition-colors">Pusat Bantuan</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Syarat & Ketentuan</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Kebijakan Privasi</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Hubungi Kami</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Ikuti Kami</h4>
            <div className="flex gap-4">
              {['Facebook', 'Twitter', 'Instagram', 'LinkedIn'].map((social) => (
                <div key={social} className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors cursor-pointer text-white">
                  <span className="sr-only">{social}</span>
                  <div className="w-4 h-4 bg-current rounded-sm"></div>
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm">
              Email: <br />
              <span className="text-white">support@sidemi.id</span>
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-16 pt-8 border-t border-gray-800 text-sm text-center text-white">
          © 2026 SID3MI System. All rights reserved. Made with ❤️ for Education.
        </div>
      </footer>
    </div>
  );
}
