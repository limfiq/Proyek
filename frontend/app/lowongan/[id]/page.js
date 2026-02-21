'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    MapPin,
    Briefcase,
    Building2,
    Calendar,
    ArrowLeft,
    Share2,
    Clock
} from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function LowonganDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (params.id) {
            fetchJobDetail(params.id);
        }
    }, [params]);

    const fetchJobDetail = async (id) => {
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${baseUrl}/api/public/lowongan/${id}`);
            if (!res.ok) {
                if (res.status === 404) throw new Error("Lowongan tidak ditemukan");
                throw new Error("Gagal mengambil data");
            }
            const data = await res.json();
            setJob(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white font-sans">
                <Navbar />
                <div className="pt-32 flex justify-center text-gray-400">Loading...</div>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="min-h-screen bg-white font-sans">
                <Navbar />
                <div className="pt-32 text-center">
                    <h1 className="text-2xl font-bold mb-4">Oops! {error || "Data tidak ditemukan"}</h1>
                    <Link href="/lowongan">
                        <Button variant="outline">Kembali ke Daftar Lowongan</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            <Navbar />

            <div className="pt-28 pb-20 px-4 max-w-5xl mx-auto">
                <Link href="/lowongan" className="inline-flex items-center text-gray-500 hover:text-primary mb-6 text-sm font-medium">
                    <ArrowLeft className="h-4 w-4 mr-1" /> Kembali ke Lowongan
                </Link>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {/* Header Banner */}
                    <div className="h-48 bg-gradient-to-r from-blue-50 to-indigo-50 relative">
                        <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl transform translate-x-12 -translate-y-12"></div>
                    </div>

                    <div className="px-8 pb-8 -mt-16 relative">
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            <div className="w-32 h-32 bg-white rounded-xl shadow-md p-2 flex items-center justify-center border border-gray-100 flex-shrink-0">
                                {job.logoUrl ? (
                                    <img src={job.logoUrl} alt={job.nama} className="w-full h-full object-contain rounded-lg" />
                                ) : (
                                    <div className="text-4xl font-bold text-gray-300">{job.nama?.[0]}</div>
                                )}
                            </div>

                            <div className="flex-1 pt-1 md:pt-16">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    <div>
                                        <span className={`inline-block mb-2 px-3 py-1 rounded-full text-xs font-semibold ${job.jenisLowongan === 'MBKM' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                                            {job.jenisLowongan || 'Magang'}
                                        </span>
                                        <h1 className="text-3xl font-bold text-gray-900 mb-1">{job.posisi || 'Posisi Magang'}</h1>
                                        <div className="flex items-center gap-2 text-primary font-medium text-lg">
                                            <Building2 className="h-5 w-5" />
                                            {job.nama}
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button variant="outline" size="icon" className="rounded-full">
                                            <Share2 className="h-5 w-5" />
                                        </Button>
                                        <Link href="/login">
                                            <Button size="lg" className="rounded-full px-8 bg-primary hover:bg-blue-700 shadow-lg shadow-blue-200">
                                                Lamar Sekarang
                                            </Button>
                                        </Link>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-100">
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <div className="p-2 bg-gray-50 rounded-lg"><MapPin className="h-5 w-5 text-gray-500" /></div>
                                        <div className="text-sm">
                                            <div className="text-gray-400 text-xs uppercase font-bold tracking-wider">Lokasi</div>
                                            {job.kota || 'Tidak tersedia'}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <div className="p-2 bg-gray-50 rounded-lg"><Clock className="h-5 w-5 text-gray-500" /></div>
                                        <div className="text-sm">
                                            <div className="text-gray-400 text-xs uppercase font-bold tracking-wider">Tipe</div>
                                            Full Time / On-site
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <div className="p-2 bg-gray-50 rounded-lg"><Calendar className="h-5 w-5 text-gray-500" /></div>
                                        <div className="text-sm">
                                            <div className="text-gray-400 text-xs uppercase font-bold tracking-wider">Diperbarui</div>
                                            {new Date(job.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mt-8">
                    <div className="md:col-span-2 space-y-8">
                        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                            <h2 className="text-xl font-bold mb-6">Deskripsi Pekerjaan</h2>
                            <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed">
                                <p>
                                    Posisi <strong>{job.posisi}</strong> di <strong>{job.nama}</strong> membuka kesempatan bagi mahasiswa aktif untuk bergabung dalam program magang.
                                    Anda akan terlibat langsung dalam proyek nyata dan dibimbing oleh mentor profesional.
                                </p>
                                <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">Tanggung Jawab:</h3>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Membantu tim dalam pengembangan proyek harian.</li>
                                    <li>Mengikuti sesi mentoring dan pelatihan yang disediakan instansi.</li>
                                    <li>Menyusun laporan kegiatan secara berkala.</li>
                                    <li>Berkolaborasi dengan anggota tim dari berbagai divisi.</li>
                                </ul>

                                <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">Kualifikasi:</h3>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Mahasiswa aktif semester 5 ke atas.</li>
                                    <li>Memiliki pemahaman dasar sesuai bidang ({job.posisi}).</li>
                                    <li>Komunikatif dan mampu bekerja dalam tim.</li>
                                    <li>Bersedia mengikuti magang sesuai durasi yang ditentukan.</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="text-lg font-bold mb-4">Tentang Perusahaan</h3>
                            <div className="text-sm text-gray-600 space-y-4">
                                <div>
                                    <div className="font-semibold text-gray-900 mb-1">Alamat</div>
                                    <p>{job.alamat || 'Alamat tidak ditampilkan'}</p>
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900 mb-1">Kontak Reviewer</div>
                                    <p>{job.kontak || '-'}</p>
                                </div>
                            </div>
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <Button className="w-full" variant="outline" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.alamat || job.kota)}`, '_blank')}>
                                    Lihat di Google Maps
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
