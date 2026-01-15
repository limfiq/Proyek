'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
    MapPin,
    Briefcase,
    Search
} from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function LowonganPage() {
    const [vacancies, setVacancies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchVacancies();
    }, []);

    const fetchVacancies = async () => {
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${baseUrl}/api/public/lowongan`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setVacancies(data);
            }
        } catch (error) {
            console.error("Failed to fetch vacancies", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredVacancies = vacancies.filter(v =>
    (v.posisi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.kota?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">
            <Navbar />

            <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">Temukan Lowongan Magang</h1>
                    <p className="text-gray-600">Jelajahi berbagai kesempatan magang dari mitra perusahaan kami.</p>
                </div>

                {/* Search */}
                <div className="max-w-xl mx-auto mb-16 relative">
                    <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari posisi, perusahaan, atau kota..."
                        className="w-full h-12 pl-12 pr-4 rounded-full border border-gray-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {loading ? (
                    <div className="text-center py-20 text-gray-500">Memuat lowongan...</div>
                ) : filteredVacancies.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredVacancies.map((job, idx) => (
                            <motion.div
                                key={job.id || idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-white p-6 rounded-xl border border-gray-200 hover:border-primary/50 hover:shadow-lg transition-all group flex flex-col h-full"
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
                                            <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1">{job.posisi || 'Posisi Terbuka'}</h3>
                                            <p className="text-sm text-gray-500 line-clamp-1">{job.nama}</p>
                                        </div>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${job.jenisLowongan === 'MBKM' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                                        {job.jenisLowongan || 'Magang'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 mt-auto">
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" /> {job.kota || 'Lokasi tidak tersedia'}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Briefcase className="h-4 w-4" /> Full Time
                                    </div>
                                </div>
                                <Link href={`/lowongan/${job.id}`} className="block mt-auto">
                                    <Button className="w-full bg-white text-primary border border-primary hover:bg-primary hover:text-white transition-all">
                                        Lihat Detail
                                    </Button>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-500 bg-gray-50 rounded-xl">
                        Tidak ditemukan lowongan yang sesuai.
                    </div>
                )}
            </div>
        </div>
    );
}
