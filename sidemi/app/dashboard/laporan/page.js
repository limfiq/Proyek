'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Upload } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import api from '@/lib/api';
import { motion } from 'framer-motion';

export default function LaporanPage() {
    const [activeTab, setActiveTab] = useState('harian');
    const [harianList, setHarianList] = useState([]);
    const [pendaftaran, setPendaftaran] = useState(null);
    const [formHarian, setFormHarian] = useState({ tanggal: '', kegiatan: '' });
    const [formTengah, setFormTengah] = useState({ fileUrl: '' });
    const [formAkhir, setFormAkhir] = useState({ fileUrl: '' });
    const [mingguanList, setMingguanList] = useState([]);
    const [formMingguan, setFormMingguan] = useState({ mingguKe: '', fileUrl: '' });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const [harianPage, setHarianPage] = useState(1);
    const [mingguanPage, setMingguanPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        loadPendaftaran();
    }, []);

    const loadPendaftaran = async () => {
        try {
            const res = await api.get('/api/pkl/me');
            if (res.data.length > 0) {
                // Assume active one
                const active = res.data.find(p => p.status === 'ACTIVE' || p.status === 'APPROVED' || p.status === 'PENDING');
                setPendaftaran(active);
                if (active) {
                    loadHarian(active.id);
                    loadMingguan(active.id);
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    const loadHarian = async (id) => {
        try {
            const res = await api.get(`/api/laporan/harian?pendaftaranId=${id}`);
            setHarianList(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const loadMingguan = async (id) => {
        try {
            const res = await api.get(`/api/laporan/mingguan?pendaftaranId=${id}`);
            setMingguanList(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmitHarian = async (e) => {
        e.preventDefault();
        if (!pendaftaran) return;
        setLoading(true);
        try {
            await api.post('/api/laporan/harian', {
                pendaftaranId: pendaftaran.id,
                ...formHarian
            });
            setMessage('Laporan harian disimpan!');
            loadHarian(pendaftaran.id);
            setFormHarian({ tanggal: '', kegiatan: '' });
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitTengah = async (e) => {
        e.preventDefault();
        if (!pendaftaran) return;
        setLoading(true);
        try {
            await api.post('/api/laporan/tengah', {
                pendaftaranId: pendaftaran.id,
                ...formTengah
            });
            setMessage('Laporan tengah disubmit!');
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitAkhir = async (e) => {
        e.preventDefault();
        if (!pendaftaran) return;
        setLoading(true);
        try {
            await api.post('/api/laporan/akhir', {
                pendaftaranId: pendaftaran.id,
                ...formAkhir
            });
            setMessage('Laporan akhir disubmit!');
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitMingguan = async (e) => {
        e.preventDefault();
        if (!pendaftaran) return;
        setLoading(true);
        try {
            await api.post('/api/laporan/mingguan', {
                pendaftaranId: pendaftaran.id,
                ...formMingguan
            });
            setMessage('Laporan mingguan disimpan!');
            loadMingguan(pendaftaran.id);
            setFormMingguan({ mingguKe: '', fileUrl: '' });
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!pendaftaran) {
        return (
            <div className="p-8 text-center text-gray-500">
                Anda belum memiliki pendaftaran PKL yang aktif. Silakan mendaftar terlebih dahulu.
            </div>
        )
    }

    const harianTotalPages = Math.ceil(harianList.length / itemsPerPage);
    const harianPaginated = harianList.slice((harianPage - 1) * itemsPerPage, harianPage * itemsPerPage);

    const mingguanTotalPages = Math.ceil(mingguanList.length / itemsPerPage);
    const mingguanPaginated = mingguanList.slice((mingguanPage - 1) * itemsPerPage, mingguanPage * itemsPerPage);

    return (
        <div className="space-y-6">
            <div className="flex gap-4 border-b">
                <button
                    onClick={() => setActiveTab('harian')}
                    className={`px-4 py-2 border-b-2 transition-colors ${activeTab === 'harian' ? 'border-primary text-primary font-bold' : 'border-transparent text-gray-500'}`}
                >
                    Laporan Harian
                </button>
                <button
                    onClick={() => setActiveTab('mingguan')}
                    className={`px-4 py-2 border-b-2 transition-colors ${activeTab === 'mingguan' ? 'border-primary text-primary font-bold' : 'border-transparent text-gray-500'}`}
                >
                    Laporan Mingguan
                </button>
                <button
                    onClick={() => setActiveTab('tengah')}
                    className={`px-4 py-2 border-b-2 transition-colors ${activeTab === 'tengah' ? 'border-primary text-primary font-bold' : 'border-transparent text-gray-500'}`}
                >
                    Laporan Tengah
                </button>
                <button
                    onClick={() => setActiveTab('akhir')}
                    className={`px-4 py-2 border-b-2 transition-colors ${activeTab === 'akhir' ? 'border-primary text-primary font-bold' : 'border-transparent text-gray-500'}`}
                >
                    Laporan Akhir
                </button>
            </div>

            <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
            >
                {activeTab === 'harian' ? (
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Input Laporan Harian</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {message && <p className="text-green-600 mb-2 text-sm">{message}</p>}
                                <form onSubmit={handleSubmitHarian} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Tanggal</label>
                                        <Input
                                            type="date"
                                            value={formHarian.tanggal}
                                            onChange={(e) => setFormHarian({ ...formHarian, tanggal: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Kegiatan</label>
                                        <textarea
                                            className="w-full min-h-[100px] p-3 rounded-md border text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                                            placeholder="Deskripsikan kegiatan..."
                                            value={formHarian.kegiatan}
                                            onChange={(e) => setFormHarian({ ...formHarian, kegiatan: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={loading}>
                                        Simpan Laporan
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Riwayat Laporan</h3>
                            {harianPaginated.map((item) => (
                                <Card key={item.id} className="bg-white">
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-gray-800">{item.tanggal}</p>
                                                <p className="text-sm text-gray-600 mt-1">{item.kegiatan}</p>
                                                {item.feedback && <p className="text-xs text-orange-600 mt-2 bg-orange-50 p-2 rounded">Komentar Pembimbing: {item.feedback}</p>}
                                            </div>
                                            <span className={`text-xs px-2 py-1 rounded-full ${item.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {item.status}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            <Pagination
                                currentPage={harianPage}
                                totalPages={harianTotalPages}
                                onPageChange={setHarianPage}
                            />
                        </div>
                    </div>
                ) : activeTab === 'mingguan' ? (
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Upload Laporan Mingguan</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {message && <p className="text-green-600 mb-2 text-sm">{message}</p>}
                                <form onSubmit={handleSubmitMingguan} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Minggu Ke-</label>
                                        <Input
                                            type="number"
                                            min="1"
                                            max="24"
                                            value={formMingguan.mingguKe}
                                            onChange={(e) => setFormMingguan({ ...formMingguan, mingguKe: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Link Dokumen (G-Drive)</label>
                                        <Input
                                            placeholder="https://..."
                                            value={formMingguan.fileUrl}
                                            onChange={(e) => setFormMingguan({ ...formMingguan, fileUrl: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={loading}>
                                        Simpan
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Riwayat Mingguan</h3>
                            <Card className="bg-white">
                                <CardContent className="p-0">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 text-gray-700 font-medium">
                                            <tr>
                                                <th className="p-3">Minggu</th>
                                                <th className="p-3">Link</th>
                                                <th className="p-3">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {mingguanList.length === 0 && (
                                                <tr>
                                                    <td colSpan="3" className="p-4 text-center text-gray-500">Belum ada laporan.</td>
                                                </tr>
                                            )}
                                            {mingguanPaginated.map((item) => (
                                                <tr key={item.id} className="border-t">
                                                    <td className="p-3 font-bold text-center">{item.mingguKe}</td>
                                                    <td className="p-3">
                                                        <a href={item.fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline block">
                                                            Buka Link
                                                        </a>
                                                        {item.signedFileUrl && (
                                                            <a href={item.signedFileUrl} target="_blank" rel="noreferrer" className="text-green-600 hover:underline text-xs mt-1 block">
                                                                Download Logbook TTD
                                                            </a>
                                                        )}
                                                    </td>
                                                    <td className="p-3">
                                                        <span className={`text-xs px-2 py-1 rounded-full ${item.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'}`}>
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </CardContent>
                            </Card>
                            <Pagination
                                currentPage={mingguanPage}
                                totalPages={mingguanTotalPages}
                                onPageChange={setMingguanPage}
                            />
                        </div>
                    </div>
                ) : activeTab === 'tengah' ? (
                    <Card className="max-w-md mx-auto">
                        <CardHeader>
                            <CardTitle>Upload Laporan Tengah (50%)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {message && <p className="text-green-600 mb-2 text-sm">{message}</p>}
                            <form onSubmit={handleSubmitTengah} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Link Google Drive / Dokumen</label>
                                    <div className="relative">
                                        <Upload className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="https://docs.google.com/..."
                                            className="pl-10"
                                            value={formTengah.fileUrl}
                                            onChange={(e) => setFormTengah({ ...formTengah, fileUrl: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    Submit Laporan
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="max-w-md mx-auto">
                        <CardHeader>
                            <CardTitle>Upload Laporan Akhir (100%)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {message && <p className="text-green-600 mb-2 text-sm">{message}</p>}
                            <form onSubmit={handleSubmitAkhir} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Link Google Drive / Dokumen</label>
                                    <div className="relative">
                                        <Upload className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="https://docs.google.com/..."
                                            className="pl-10"
                                            value={formAkhir.fileUrl}
                                            onChange={(e) => setFormAkhir({ ...formAkhir, fileUrl: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    Submit Laporan Akhir
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}
            </motion.div>
        </div>
    );
}
