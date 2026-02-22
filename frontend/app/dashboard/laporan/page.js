'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Upload, Camera, MapPin, RefreshCw } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import Webcam from 'react-webcam';
import { useToast } from "@/components/ui/use-toast";

export default function LaporanPage() {
    const [activeTab, setActiveTab] = useState('harian');
    const [harianList, setHarianList] = useState([]);
    const [pendaftaran, setPendaftaran] = useState(null);
    const [formHarian, setFormHarian] = useState({ tanggal: '', kegiatan: '', lokasi: '' });
    const [fotoFile, setFotoFile] = useState(null);
    const [showCamera, setShowCamera] = useState(false);
    const webcamRef = useRef(null);

    const [formTengah, setFormTengah] = useState({ fileUrl: '' });
    const [formAkhir, setFormAkhir] = useState({ fileUrl: '', finalUrl: '' });
    const [mingguanList, setMingguanList] = useState([]);
    const [formMingguan, setFormMingguan] = useState({ mingguKe: '', fileUrl: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(''); // Changed from message to error
    const [editingLogbook, setEditingLogbook] = useState(null); // [NEW] State for editing

    const { toast } = useToast();
    const [laporanTengah, setLaporanTengah] = useState(null);
    const [laporanAkhir, setLaporanAkhir] = useState(null);

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
                // [NEW] Filter for Active Period
                // If API returns array, find the one where periode.isActive is true
                const active = res.data.find(p => p.periode && p.periode.isActive);

                // If found, set it. If not, maybe show "No active period" state?
                // For now, let's set it if found.
                if (active) {
                    setPendaftaran(active);
                    loadHarian(active.id);
                    loadMingguan(active.id);
                    loadTengah(active.id);
                    loadAkhir(active.id);
                } else {
                    setPendaftaran(null); // Explicitly set null if no active period found
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

    const loadTengah = async (id) => {
        try {
            const res = await api.get(`/api/laporan/tengah?pendaftaranId=${id}`);
            if (res.data) setLaporanTengah(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const loadAkhir = async (id) => {
        try {
            const res = await api.get(`/api/laporan/akhir?pendaftaranId=${id}`);
            if (res.data) setLaporanAkhir(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCapture = () => {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
            // Convert base64 to blob
            fetch(imageSrc)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
                    setFotoFile(file);
                    setShowCamera(false);
                });
        }
    };

    const handleLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const loc = `${position.coords.latitude}, ${position.coords.longitude}`;
                setFormHarian(prev => ({ ...prev, lokasi: loc }));
            }, (error) => {
                alert("Gagal mengambil lokasi: " + error.message);
            });
        } else {
            alert("Geolocation tidak didukung browser ini.");
        }
    };

    const handleSubmitHarian = async (e) => {
        e.preventDefault();
        if (!pendaftaran) return;
        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('pendaftaranId', pendaftaran.id);
        formData.append('tanggal', formHarian.tanggal);
        formData.append('kegiatan', formHarian.kegiatan);
        formData.append('lokasi', formHarian.lokasi);
        if (fotoFile) {
            formData.append('foto', fotoFile);
        }

        try {
            const token = localStorage.getItem('token');
            if (editingLogbook) {
                // UPDATE
                await api.put(`/api/laporan/harian/${editingLogbook.id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    }
                });
                toast({ title: 'Berhasil', description: 'Laporan harian berhasil diperbarui.' });
                setEditingLogbook(null);
            } else {
                // CREATE
                await api.post('/api/laporan/harian', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    }
                });
                toast({ title: 'Berhasil', description: 'Laporan harian berhasil disimpan.' });
            }

            // Reset form
            setFormHarian({ tanggal: '', kegiatan: '', lokasi: '' });
            setFotoFile(null); // Reset foto file
            setShowCamera(false); // Hide camera if it was open

            // Reload list
            if (pendaftaran) loadHarian(pendaftaran.id);

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Gagal menyimpan laporan.');
            toast({ title: 'Gagal', description: err.response?.data?.message || 'Gagal menyimpan laporan.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item) => {
        setEditingLogbook(item);
        setFormHarian({
            tanggal: item.tanggal,
            kegiatan: item.kegiatan,
            lokasi: item.lokasi || '',
        });
        setFotoFile(null); // Don't pre-fill foto, user needs to re-upload if needed
        setShowCamera(false);
        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingLogbook(null);
        setFormHarian({ tanggal: '', kegiatan: '', lokasi: '' });
        setFotoFile(null);
        setShowCamera(false);
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
            toast({ title: 'Berhasil', description: 'Laporan tengah disubmit!' });
            loadTengah(pendaftaran.id);
        } catch (err) {
            toast({ title: 'Gagal', description: err.message, variant: 'destructive' });
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
            toast({ title: 'Berhasil', description: 'Laporan akhir disubmit!' });
            loadAkhir(pendaftaran.id);
        } catch (err) {
            toast({ title: 'Gagal', description: err.message, variant: 'destructive' });
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
            toast({ title: 'Berhasil', description: 'Laporan mingguan disimpan!' });
            loadMingguan(pendaftaran.id);
            setFormMingguan({ mingguKe: '', fileUrl: '' });
        } catch (err) {
            toast({ title: 'Gagal', description: err.message, variant: 'destructive' });
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
                                <CardTitle>{editingLogbook ? 'Edit Laporan Harian' : 'Input Laporan Harian'}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {/* Alert if editing */}
                                {editingLogbook && (
                                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded mb-4 flex justify-between items-center">
                                        <span>Sedang mengedit laporan tanggal {editingLogbook.tanggal}</span>
                                        <Button variant="outline" size="sm" onClick={handleCancelEdit}>Batal</Button>
                                    </div>
                                )}
                                {error && <p className="text-red-600 mb-2 text-sm">{error}</p>}
                                <form onSubmit={handleSubmitHarian} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Tanggal</label>
                                        <Input
                                            type="date"
                                            value={formHarian.tanggal}
                                            max={new Date().toISOString().split('T')[0]} // Max today
                                            min={new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} // Min 7 days ago
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

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Lokasi</label>
                                        <div className="flex gap-2">
                                            <Input
                                                value={formHarian.lokasi}
                                                readOnly
                                                placeholder="Koordinat lokasi..."
                                                className="bg-gray-50"
                                            />
                                            <Button type="button" variant="outline" size="icon" onClick={handleLocation} title="Ambil Lokasi">
                                                <MapPin className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Foto Kegiatan</label>
                                        {showCamera ? (
                                            <div className="rounded-md overflow-hidden border">
                                                <Webcam
                                                    audio={false}
                                                    ref={webcamRef}
                                                    screenshotFormat="image/jpeg"
                                                    className="w-full"
                                                />
                                                <div className="p-2 bg-gray-100 flex justify-center gap-2">
                                                    <Button type="button" size="sm" onClick={handleCapture}>Ambil Foto</Button>
                                                    <Button type="button" size="sm" variant="ghost" onClick={() => setShowCamera(false)}>Batal</Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-2">
                                                {fotoFile ? (
                                                    <div className="relative w-full h-48 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                                                        <img src={URL.createObjectURL(fotoFile)} alt="Preview" className="h-full object-contain" />
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            size="xs"
                                                            className="absolute top-2 right-2"
                                                            onClick={() => setFotoFile(null)}
                                                        >
                                                            Hapus
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div
                                                        className="w-full h-32 border-2 border-dashed rounded-md flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-50 hover:border-blue-300 transition-colors"
                                                        onClick={() => setShowCamera(true)}
                                                    >
                                                        <Camera className="h-8 w-8 mb-2" />
                                                        <span className="text-xs">Klik untuk ambil foto</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <Button type="submit" className="w-full" disabled={loading}>
                                        {loading ? 'Menyimpan...' : (editingLogbook ? 'Simpan Perubahan' : 'Simpan Laporan')}
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
                                                <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{item.kegiatan}</p>
                                                {item.lokasi && (
                                                    <div className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" /> {item.lokasi}
                                                    </div>
                                                )}
                                                <div className="flex gap-2 mt-2">
                                                    {item.status !== 'APPROVED' && (
                                                        <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                                                            Edit
                                                        </Button>
                                                    )}
                                                    {item.feedback && (
                                                        <div className="bg-red-50 text-red-600 p-2 rounded text-sm flex-1">
                                                            <strong>Feedback:</strong> {item.feedback}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className={`text-xs px-2 py-1 rounded-full ${item.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                    {item.status}
                                                </span>
                                                {item.foto && (
                                                    <a href={`${process.env.NEXT_PUBLIC_API_URL}${item.foto}`} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline flex items-center mt-1">
                                                        <Camera className="h-3 w-3 mr-1" /> FOTO
                                                    </a>
                                                )}
                                            </div>
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
                    <>
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
                        <div className="mt-6">
                            {laporanTengah && (
                                <Card className="max-w-md mx-auto bg-blue-50 border-blue-100">
                                    <CardContent className="pt-6">
                                        <h3 className="font-semibold text-blue-900 mb-2">Laporan Submitted</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Status:</span>
                                                <span className="font-medium">{laporanTengah.status}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">File:</span>
                                                <a href={laporanTengah.fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                                                    Buka Link
                                                </a>
                                            </div>
                                            <div className="text-xs text-gray-500 pt-2 text-right">
                                                Last updated: {new Date(laporanTengah.updatedAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </>
                ) : (
                    <>
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
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Link Laporan Final (Setelah Sidang)</label>
                                        <div className="relative">
                                            <Upload className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Input
                                                placeholder="https://docs.google.com/..."
                                                className="pl-10"
                                                value={formAkhir.finalUrl}
                                                onChange={(e) => setFormAkhir({ ...formAkhir, finalUrl: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <Button type="submit" className="w-full" disabled={loading}>
                                        Submit Laporan Akhir
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        <div className="mt-6">
                            {laporanAkhir && (
                                <Card className="max-w-md mx-auto bg-purple-50 border-purple-100">
                                    <CardContent className="pt-6">
                                        <h3 className="font-semibold text-purple-900 mb-2">Laporan Akhir Submitted</h3>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Status:</span>
                                                <span className="font-medium bg-purple-100 px-2 py-0.5 rounded text-purple-800">{laporanAkhir.status}</span>
                                            </div>
                                            <div className="flex justify-between items-center bg-white p-2 rounded border">
                                                <span className="text-gray-600">Laporan Akhir:</span>
                                                <a href={laporanAkhir.fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-medium">
                                                    Buka
                                                </a>
                                            </div>
                                            {laporanAkhir.finalUrl && (
                                                <div className="flex justify-between items-center bg-white p-2 rounded border">
                                                    <span className="text-gray-600">Laporan Final:</span>
                                                    <a href={laporanAkhir.finalUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-medium">
                                                        Buka
                                                    </a>
                                                </div>
                                            )}
                                            <div className="text-xs text-gray-500 pt-2 text-right">
                                                Last updated: {new Date(laporanAkhir.updatedAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </>
                )}
            </motion.div>
        </div >
    );
}
