'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Upload, Camera, MapPin, RefreshCw, ChevronDown, ChevronRight, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
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
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [editingLogbook, setEditingLogbook] = useState(null); // [NEW] State for editing
    const [editingMingguan, setEditingMingguan] = useState(null); // [NEW] Weekly edit state
    const [isEditingTengah, setIsEditingTengah] = useState(false); // [NEW] Tengah edit mode
    const [isEditingAkhir, setIsEditingAkhir] = useState(false); // [NEW] Akhir edit mode
    const [expandedWeeks, setExpandedWeeks] = useState({}); // [NEW] Weekly collapse state

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
            const data = res.data;
            setHarianList(data);

            // [NEW] Default expand latest week
            if (data.length > 0) {
                // Use T00:00:00 to avoid timezone shifts
                const startDateStr = pendaftaran?.periode?.tanggalMulai || new Date().toISOString().split('T')[0];
                const startDate = new Date(startDateStr + 'T00:00:00');
                let maxWeek = 1;
                data.forEach(item => {
                    const itemDate = new Date(item.tanggal + 'T00:00:00');
                    const diffTime = itemDate - startDate;
                    // weekNum starts from 1 based on days from startDate
                    const weekNum = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7)) + 1;
                    if (weekNum > maxWeek) maxWeek = weekNum;
                });
                setExpandedWeeks(prev => ({ ...prev, [maxWeek]: true }));
            }
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
            setIsEditingTengah(false);
            loadTengah(pendaftaran.id);
        } catch (err) {
            toast({ title: 'Gagal', description: err.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleEditTengah = () => {
        setIsEditingTengah(true);
        setFormTengah({ fileUrl: laporanTengah?.fileUrl || '' });
    };

    const handleCancelEditTengah = () => {
        setIsEditingTengah(false);
        setFormTengah({ fileUrl: '' });
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
            setIsEditingAkhir(false);
            loadAkhir(pendaftaran.id);
        } catch (err) {
            toast({ title: 'Gagal', description: err.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleEditAkhir = () => {
        setIsEditingAkhir(true);
        setFormAkhir({
            fileUrl: laporanAkhir?.fileUrl || '',
            finalUrl: laporanAkhir?.finalUrl || ''
        });
    };

    const handleCancelEditAkhir = () => {
        setIsEditingAkhir(false);
        setFormAkhir({ fileUrl: '', finalUrl: '' });
    };

    const handleSubmitMingguan = async (e) => {
        e.preventDefault();
        if (!pendaftaran) return;
        setLoading(true);
        try {
            if (editingMingguan) {
                await api.put(`/api/laporan/mingguan/${editingMingguan.id}`, formMingguan);
                toast({ title: 'Berhasil', description: 'Laporan mingguan diperbarui!' });
                setEditingMingguan(null);
            } else {
                await api.post('/api/laporan/mingguan', {
                    pendaftaranId: pendaftaran.id,
                    ...formMingguan
                });
                toast({ title: 'Berhasil', description: 'Laporan mingguan disimpan!' });
            }
            loadMingguan(pendaftaran.id);
            setFormMingguan({ mingguKe: '', fileUrl: '' });
        } catch (err) {
            toast({ title: 'Gagal', description: err.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleEditMingguan = (item) => {
        setEditingMingguan(item);
        setFormMingguan({
            mingguKe: item.mingguKe,
            fileUrl: item.fileUrl
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEditMingguan = () => {
        setEditingMingguan(null);
        setFormMingguan({ mingguKe: '', fileUrl: '' });
    };

    if (!pendaftaran) {
        return (
            <div className="p-8 text-center text-gray-500">
                Anda belum memiliki pendaftaran Magang yang aktif. Silakan mendaftar terlebih dahulu.
            </div>
        )
    }

    const harianTotalPages = Math.ceil(harianList.length / itemsPerPage);
    const harianPaginated = harianList.slice((harianPage - 1) * itemsPerPage, harianPage * itemsPerPage);

    const getGroups = () => {
        if (!pendaftaran || !pendaftaran.periode || !harianList.length) return [];

        const startDate = new Date(pendaftaran.periode.tanggalMulai + 'T00:00:00');
        const groups = {};

        harianList.forEach(item => {
            const itemDate = new Date(item.tanggal + 'T00:00:00');
            const diffTime = itemDate - startDate;
            // Handle day as 0-indexed offset from start date
            const weekNum = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7)) + 1;

            if (!groups[weekNum]) groups[weekNum] = [];
            groups[weekNum].push(item);
        });

        // Sort weeks descending numerically
        return Object.keys(groups)
            .sort((a, b) => Number(b) - Number(a))
            .map(week => ({
                week,
                items: groups[week].sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
            }));
    };

    const groupedHarian = getGroups();

    const toggleWeek = (week) => {
        setExpandedWeeks(prev => ({
            ...prev,
            [week]: !prev[week]
        }));
    };

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
                    Laporan Kemajuan
                </button>
                <button
                    onClick={() => setActiveTab('akhir')}
                    className={`px-4 py-2 border-b-2 transition-colors ${activeTab === 'akhir' ? 'border-primary text-primary font-bold' : 'border-transparent text-gray-500'}`}
                >
                    Laporan Akhir
                </button>
            </div>

            {pendaftaran?.status === 'PENDING' && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-md mb-6 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold text-sm">Status Kegiatan: PENDING</p>
                        <p className="text-xs">
                            Anda belum dapat mengisi laporan harian, mingguan, atau kemajuan karena status kegiatan Anda belum aktif/disetujui.
                            Mohon tunggu hingga status Anda divalidasi oleh admin.
                        </p>
                    </div>
                </div>
            )}

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

                                    <Button type="submit" className="w-full" disabled={loading || pendaftaran?.status === 'PENDING'}>
                                        {loading ? 'Menyimpan...' : (editingLogbook ? 'Simpan Perubahan' : 'Simpan Laporan')}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        <div className="space-y-6">
                            <h3 className="font-semibold text-lg flex items-center justify-between">
                                <span>Riwayat Laporan</span>
                                <span className="text-sm font-normal text-gray-500">{harianList.length} logbook</span>
                            </h3>

                            {groupedHarian.length === 0 && (
                                <p className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg border-2 border-dashed">Belum ada riwayat laporan.</p>
                            )}

                            {groupedHarian.map((group) => (
                                <div key={group.week} className="space-y-3">
                                    <button
                                        onClick={() => toggleWeek(group.week)}
                                        className="w-full flex items-center gap-2 group hover:opacity-80 transition-opacity"
                                    >
                                        <div className="h-px bg-gray-200 flex-1"></div>
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full border border-gray-200 shadow-sm">
                                            {expandedWeeks[group.week] ? <ChevronDown className="h-3.5 w-3.5 text-primary" /> : <ChevronRight className="h-3.5 w-3.5 text-gray-400" />}
                                            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Minggu {group.week}</span>
                                            <span className="text-[10px] text-gray-400 font-normal">({group.items.length})</span>
                                        </div>
                                        <div className="h-px bg-gray-200 flex-1"></div>
                                    </button>

                                    {expandedWeeks[group.week] && (
                                        <div className="space-y-3 pt-1">
                                            {group.items.map((item) => (
                                                <Card key={item.id} className="bg-white hover:shadow-md transition-shadow border-l-4 border-l-primary/20">
                                                    <CardContent className="p-4">
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <CalendarIcon className="h-3.5 w-3.5 text-primary/60" />
                                                                    <p className="font-bold text-gray-800">{new Date(item.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                                                </div>
                                                                <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap leading-relaxed">{item.kegiatan}</p>
                                                                {item.lokasi && (
                                                                    <div className="text-xs text-blue-600 mt-2 flex items-center gap-1 bg-blue-50 w-fit px-2 py-0.5 rounded">
                                                                        <MapPin className="h-3 w-3" /> {item.lokasi}
                                                                    </div>
                                                                )}
                                                                <div className="flex gap-2 mt-4">
                                                                    {item.status !== 'APPROVED' && (
                                                                        <Button variant="outline" size="sm" onClick={() => handleEdit(item)} className="h-8">
                                                                            Edit
                                                                        </Button>
                                                                    )}
                                                                    {item.feedback && (
                                                                        <div className="bg-red-50 text-red-600 p-2 rounded text-xs flex-1 border border-red-100">
                                                                            <strong className="block mb-1">Feedback Dosen:</strong>
                                                                            {item.feedback}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col items-end gap-2 ml-4">
                                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${item.status === 'APPROVED' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-yellow-100 text-yellow-700 border border-yellow-200'}`}>
                                                                    {item.status}
                                                                </span>
                                                                {item.foto && (
                                                                    <a href={`${process.env.NEXT_PUBLIC_API_URL}${item.foto}`} target="_blank" rel="noreferrer" className="group">
                                                                        <div className="w-14 h-14 rounded-md border bg-gray-50 flex items-center justify-center relative overflow-hidden ring-1 ring-gray-200">
                                                                            <img src={`${process.env.NEXT_PUBLIC_API_URL}${item.foto}`} alt="Logbook" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                                                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                <Camera className="h-4 w-4 text-white" />
                                                                            </div>
                                                                        </div>
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : activeTab === 'mingguan' ? (
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>{editingMingguan ? 'Edit Laporan Mingguan' : 'Upload Laporan Mingguan'}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {editingMingguan && (
                                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded mb-4 flex justify-between items-center">
                                        <span>Sedang mengedit Minggu ke-{editingMingguan.mingguKe}</span>
                                        <Button variant="outline" size="sm" onClick={handleCancelEditMingguan}>Batal</Button>
                                    </div>
                                )}
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
                                    <Button type="submit" className="w-full" disabled={loading || pendaftaran?.status === 'PENDING'}>
                                        {loading ? 'Menyimpan...' : (editingMingguan ? 'Simpan Perubahan' : 'Simpan')}
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
                                                <th className="p-3 text-right">Aksi</th>
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
                                                    <td className="p-3 text-right">
                                                        {item.status !== 'APPROVED' && (
                                                            <Button
                                                                variant="outline"
                                                                size="xs"
                                                                onClick={() => handleEditMingguan(item)}
                                                            >
                                                                Edit
                                                            </Button>
                                                        )}
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
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle>{isEditingTengah ? 'Edit Laporan Kemajuan (50%)' : 'Upload Laporan Kemajuan (50%)'}</CardTitle>
                                    {isEditingTengah && (
                                        <Button variant="ghost" size="sm" onClick={handleCancelEditTengah}>Batal</Button>
                                    )}
                                </div>
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
                                    <Button type="submit" className="w-full" disabled={loading || pendaftaran?.status === 'PENDING'}>
                                        {loading ? 'Menyimpan...' : (isEditingTengah ? 'Simpan Perubahan' : 'Submit Laporan')}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg uppercase tracking-tight text-gray-500">Riwayat Kemajuan</h3>
                            <Card className="bg-white overflow-hidden shadow-sm">
                                <CardContent className="p-0">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 text-gray-700 font-medium">
                                            <tr>
                                                <th className="p-3">Tipe</th>
                                                <th className="p-3">Link / Dokumen</th>
                                                <th className="p-3">Status</th>
                                                <th className="p-3 text-right">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {!laporanTengah ? (
                                                <tr>
                                                    <td colSpan="4" className="p-4 text-center text-gray-500 italic">Belum ada laporan disubmit.</td>
                                                </tr>
                                            ) : (
                                                <tr className="border-t hover:bg-gray-50 transition-colors">
                                                    <td className="p-3 font-medium">Laporan Kemajuan</td>
                                                    <td className="p-3">
                                                        <a href={laporanTengah.fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1 font-semibold">
                                                            <ExternalLink className="h-3 w-3" /> Buka Link
                                                        </a>
                                                    </td>
                                                    <td className="p-3">
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${laporanTengah.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                            {laporanTengah.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-right">
                                                        {laporanTengah.status !== 'APPROVED' && (
                                                            <Button
                                                                variant="outline"
                                                                size="xs"
                                                                onClick={handleEditTengah}
                                                            >
                                                                Edit
                                                            </Button>
                                                        )}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </CardContent>
                            </Card>
                            {laporanTengah && (
                                <div className="text-[10px] text-gray-400 text-right italic">
                                    Terakhir diperbarui: {new Date(laporanTengah.updatedAt).toLocaleString('id-ID')}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle>{isEditingAkhir ? 'Edit Laporan Akhir (100%)' : 'Upload Laporan Akhir (100%)'}</CardTitle>
                                    {isEditingAkhir && (
                                        <Button variant="ghost" size="sm" onClick={handleCancelEditAkhir}>Batal</Button>
                                    )}
                                </div>
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
                                    <Button type="submit" className="w-full" disabled={loading || pendaftaran?.status === 'PENDING'}>
                                        {loading ? 'Menyimpan...' : (isEditingAkhir ? 'Simpan Perubahan' : 'Submit Laporan Akhir')}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg uppercase tracking-tight text-gray-500">Riwayat Laporan Akhir</h3>
                            <Card className="bg-white overflow-hidden shadow-sm">
                                <CardContent className="p-0">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 text-gray-700 font-medium">
                                            <tr>
                                                <th className="p-3">Tipe</th>
                                                <th className="p-3">Link / Dokumen</th>
                                                <th className="p-3">Status</th>
                                                <th className="p-3 text-right">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {!laporanAkhir ? (
                                                <tr>
                                                    <td colSpan="4" className="p-4 text-center text-gray-500 italic">Belum ada laporan disubmit.</td>
                                                </tr>
                                            ) : (
                                                <>
                                                    <tr className="border-t hover:bg-gray-50 transition-colors">
                                                        <td className="p-3 font-medium">Laporan Akhir (100%)</td>
                                                        <td className="p-3">
                                                            <a href={laporanAkhir.fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1 font-semibold">
                                                                <FileText className="h-3 w-3" /> Buka Laporan
                                                            </a>
                                                        </td>
                                                        <td className="p-3" rowSpan={laporanAkhir.finalUrl ? 2 : 1}>
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${laporanAkhir.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                                                                {laporanAkhir.status}
                                                            </span>
                                                        </td>
                                                        <td className="p-3 text-right" rowSpan={laporanAkhir.finalUrl ? 2 : 1}>
                                                            {laporanAkhir.status !== 'APPROVED' && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="xs"
                                                                    onClick={handleEditAkhir}
                                                                >
                                                                    Edit
                                                                </Button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                    {laporanAkhir.finalUrl && (
                                                        <tr className="border-t hover:bg-gray-50 transition-colors bg-purple-50/20">
                                                            <td className="p-3 font-medium text-purple-700 italic">Laporan Final</td>
                                                            <td className="p-3">
                                                                <a href={laporanAkhir.finalUrl} target="_blank" rel="noreferrer" className="text-purple-600 hover:underline inline-flex items-center gap-1 font-semibold">
                                                                    <CheckCircle className="h-3 w-3" /> Buka Final
                                                                </a>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </>
                                            )}
                                        </tbody>
                                    </table>
                                </CardContent>
                            </Card>
                            {laporanAkhir && (
                                <div className="text-[10px] text-gray-400 text-right italic">
                                    Terakhir diperbarui: {new Date(laporanAkhir.updatedAt).toLocaleString('id-ID')}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </motion.div>
        </div >
    );
}
