'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Search,
    FileText,
    Download,
    ExternalLink,
    ArrowLeft,
    BookOpen,
    ShieldCheck,
    HelpCircle,
    ChevronRight,
    Clock,
    GraduationCap,
    Briefcase,
    Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';

export default function PanduanPublicPage() {
    const [guides, setGuides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchGuides();
    }, []);

    const fetchGuides = async () => {
        try {
            const res = await api.get('/api/public/panduan');
            setGuides(res.data);
        } catch (error) {
            console.error("Failed to fetch guides", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredGuides = guides.filter(g =>
        (g.judul && g.judul.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (g.deskripsi && g.deskripsi.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (g.kategori && g.kategori.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getKategoriIcon = (kat) => {
        switch (kat?.toUpperCase()) {
            case 'MAHASISWA': return <GraduationCap className="text-blue-500" size={18} />;
            case 'DOSEN': return <Briefcase className="text-purple-500" size={18} />;
            case 'MITRA':
            case 'INSTANSI': return <Building2 className="text-green-500" size={18} />;
            default: return <HelpCircle className="text-orange-500" size={18} />;
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getFullUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        return `http://localhost:5000${path}`;
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <Navbar />

            <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
                {/* Hero Section */}
                <div className="mb-12">
                    <div className="flex items-center gap-2 text-primary mb-6 cursor-pointer hover:underline group w-fit" onClick={() => window.history.back()}>
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-semibold uppercase tracking-wider">Kembali</span>
                    </div>

                    <div className="relative overflow-hidden bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-gray-100">
                        <div className="relative z-10">
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
                                Pusat Panduan<span className="text-primary"> & </span>Ketentuan
                            </h1>
                            <p className="text-slate-500 text-lg max-w-2xl leading-relaxed">
                                Temukan informasi lengkap mengenai alur pendaftaran, ketentuan magang, serta dokumen-dokumen pendukung lainnya untuk memudahkan pengalaman Anda di SiMagang.
                            </p>
                        </div>

                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-80 h-80 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
                    </div>

                    <div className="mt-8 flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full md:max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <Input
                                placeholder="Cari panduan..."
                                className="pl-12 h-14 bg-white border-none shadow-md rounded-2xl focus:ring-2 focus:ring-primary/20 text-slate-700"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost" className="rounded-xl font-bold text-slate-500 hover:bg-white" onClick={() => setSearchTerm('')}>Reset</Button>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-32 bg-slate-200 animate-pulse rounded-3xl"></div>
                        ))}
                    </div>
                ) : filteredGuides.length > 0 ? (
                    <div className="space-y-6">
                        {filteredGuides.map((g, idx) => (
                            <motion.div
                                key={g.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <Card className="border-none shadow-sm hover:shadow-xl transition-all rounded-[2rem] overflow-hidden group">
                                    <CardContent className="p-8">
                                        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                                            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-colors shadow-inner">
                                                {getKategoriIcon(g.kategori)}
                                            </div>

                                            <div className="flex-1 space-y-2">
                                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                                    <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 px-3 py-1 rounded-full">
                                                        {g.kategori}
                                                    </span>
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                        <Clock size={12} />
                                                        {formatDate(g.createdAt)}
                                                    </div>
                                                </div>
                                                <h3 className="text-2xl font-bold text-slate-900 leading-tight group-hover:text-primary transition-colors">
                                                    {g.judul}
                                                </h3>
                                                <p className="text-slate-500 text-sm md:text-base leading-relaxed line-clamp-2 font-medium">
                                                    {g.deskripsi || 'Tidak ada deskripsi tambahan.'}
                                                </p>
                                            </div>

                                            <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
                                                {g.fileUrl ? (
                                                    <Button
                                                        onClick={() => window.open(getFullUrl(g.fileUrl), '_blank')}
                                                        className="flex-1 md:flex-none h-14 px-8 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-slate-200"
                                                    >
                                                        <ExternalLink size={18} />
                                                        Buka File
                                                    </Button>
                                                ) : (
                                                    <Button disabled className="flex-1 md:flex-none h-14 px-8 bg-slate-100 text-slate-400 rounded-2xl font-bold">
                                                        Teks Saja
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-300">
                        <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                            <BookOpen size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900">Belum Ada Panduan</h3>
                        <p className="text-slate-500 max-w-xs mx-auto mt-2 font-medium">Mohon maaf, saat ini belum ada panduan atau ketentuan yang diterbitkan.</p>
                    </div>
                )}

                {/* FAQ Help Section */}
                <div className="mt-20 p-12 bg-primary rounded-[3rem] text-white overflow-hidden relative">
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="text-center md:text-left">
                            <h2 className="text-3xl font-black mb-2">Butuh Bantuan Lebih Lanjut?</h2>
                            <p className="text-blue-100 font-medium opacity-90">Tim dukungan kami siap membantu Anda menyelesaikan kendala yang dihadapi.</p>
                        </div>
                        <Button className="h-16 px-10 bg-white text-primary hover:bg-blue-50 rounded-2xl font-black text-lg shadow-xl shrink-0">
                            Hubungi Support
                        </Button>
                    </div>
                    {/* Decorative pulse element */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl animate-pulse"></div>
                </div>
            </main>
        </div>
    );
}
