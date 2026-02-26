'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    MapPin,
    Building2,
    ArrowLeft,
    Globe,
    Phone,
    Mail,
    ChevronRight,
    Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import Navbar from '@/components/Navbar';
import api from '@/lib/api';

export default function MitraPage() {
    const [mitra, setMitra] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMitra, setSelectedMitra] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchMitra();
    }, []);

    const fetchMitra = async () => {
        try {
            const res = await api.get('/api/public/lowongan');
            setMitra(res.data);
        } catch (error) {
            console.error("Failed to fetch mitra", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredMitra = mitra.filter(m =>
        m.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.kota && m.kota.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const openDetails = (m) => {
        setSelectedMitra(m);
        setIsModalOpen(true);
    };

    const getLogoUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `${api.defaults.baseURL}${url}`;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="mb-12">
                    <div className="flex items-center gap-2 text-primary mb-4 cursor-pointer hover:underline" onClick={() => window.history.back()}>
                        <ArrowLeft size={16} />
                        <span className="text-sm font-medium">Kembali</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Mitra Perusahaan</h1>
                            <p className="text-gray-600 mt-2 max-w-2xl">
                                Jelajahi daftar mitra perusahaan resmi yang bekerja sama dengan SiMagang untuk menyediakan peluang pengembangan karir terbaik bagi mahasiswa.
                            </p>
                        </div>
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Cari nama atau kota..."
                                className="pl-10 h-11 bg-white border-none shadow-sm focus:ring-2 focus:ring-primary/20"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Grid Section */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-2xl"></div>
                        ))}
                    </div>
                ) : filteredMitra.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredMitra.map((m, idx) => (
                            <motion.div
                                key={m.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                whileHover={{ y: -5 }}
                                className="cursor-pointer"
                                onClick={() => openDetails(m)}
                            >
                                <Card className="h-full border-none shadow-sm hover:shadow-xl transition-all overflow-hidden group">
                                    <CardContent className="p-6 flex flex-col items-center text-center h-full">
                                        <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors overflow-hidden">
                                            {m.logoUrl ? (
                                                <img src={getLogoUrl(m.logoUrl)} alt={m.nama} className="w-full h-full object-cover" />
                                            ) : (
                                                <Building2 size={32} className="text-primary group-hover:text-white" />
                                            )}
                                        </div>
                                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{m.nama}</h3>
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full">
                                            <MapPin size={12} />
                                            {m.kota || 'LOKASI TIDAK TERTERA'}
                                        </div>
                                        <div className="mt-auto pt-4 flex items-center text-primary text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                            LIHAT DETAIL <ChevronRight size={14} />
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                        <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <Search size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Tidak ada hasil ditemukan</h3>
                        <p className="text-gray-500">Coba kata kunci lain atau periksa koneksi internet Anda.</p>
                        <Button variant="outline" className="mt-6" onClick={() => setSearchTerm('')}>
                            Reset Pencarian
                        </Button>
                    </div>
                )}
            </main>

            {/* Detail Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none rounded-3xl">
                    {selectedMitra && (
                        <div>
                            <div className="h-32 bg-gradient-to-r from-primary to-blue-600 relative">
                                <div className="absolute -bottom-12 left-8 p-1 bg-white rounded-3xl shadow-lg">
                                    <div className="w-24 h-24 rounded-2xl bg-blue-50 flex items-center justify-center overflow-hidden">
                                        {selectedMitra.logoUrl ? (
                                            <img src={getLogoUrl(selectedMitra.logoUrl)} alt={selectedMitra.nama} className="w-full h-full object-cover" />
                                        ) : (
                                            <Building2 size={40} className="text-primary" />
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="pt-16 pb-8 px-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 leading-tight">{selectedMitra.nama}</h2>
                                        <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium mt-1">
                                            <MapPin size={14} className="text-gray-400" />
                                            {selectedMitra.kota || 'Lokasi tidak tersedia'}
                                        </div>
                                    </div>
                                    <div className="bg-primary/10 text-primary text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                                        MITRA AKTIF
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 flex-shrink-0">
                                            <MapPin size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Alamat Lengkap</p>
                                            <p className="text-sm text-gray-700 leading-relaxed font-medium">
                                                {selectedMitra.alamat || 'Alamat belum dilengkapi.'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                                            <Phone size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Kontak & Informasi</p>
                                            <p className="text-sm text-gray-700 font-medium">
                                                {selectedMitra.kontak || 'Kontak belum tersedia.'}
                                            </p>
                                        </div>
                                    </div>

                                    {selectedMitra.posisi && (
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 flex-shrink-0">
                                                <Info size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Posisi Tersedia</p>
                                                <p className="text-sm text-gray-700 font-medium">
                                                    {selectedMitra.posisi}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-10 flex gap-3">
                                    <Button className="flex-1 bg-primary hover:bg-blue-700 h-12 rounded-2xl font-bold shadow-lg shadow-blue-200">
                                        Ajukan Magang
                                    </Button>
                                    <Button variant="outline" className="h-12 w-12 rounded-2xl p-0 border-gray-200 hover:bg-gray-50 flex items-center justify-center group">
                                        <Globe size={18} className="text-gray-400 group-hover:text-primary" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
