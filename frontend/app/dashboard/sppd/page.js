'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MapPin, Camera, Save, Info, CheckCircle, FileText, Calendar as CalendarIcon, Users, RefreshCw, Upload } from 'lucide-react';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { formatDate } from '@/lib/utils';
import Webcam from 'react-webcam';
import { useToast } from "@/components/ui/use-toast";

export default function SppdPage() {
    const { toast } = useToast();
    const [bimbingan, setBimbingan] = useState([]);
    const [sppdList, setSppdList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [form, setForm] = useState({
        pendaftaranId: '',
        tanggal: new Date().toISOString().split('T')[0],
        lokasi: '',
        yangDitemui: '',
        koordinat: '',
        keterangan: ''
    });

    const [fotoFiles, setFotoFiles] = useState([]); // [NEW] Multiple files
    const [showCamera, setShowCamera] = useState(false);
    const [facingMode, setFacingMode] = useState("user");
    const webcamRef = useRef(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setFetching(true);
        try {
            const [bRes, sRes] = await Promise.all([
                api.get('/api/sppd/bimbingan'),
                api.get('/api/sppd')
            ]);
            setBimbingan(bRes.data);
            setSppdList(sRes.data);
        } catch (err) {
            console.error(err);
            toast({ title: 'Gagal', description: 'Gagal memuat data.', variant: 'destructive' });
        } finally {
            setFetching(false);
        }
    };

    const handleSelectBimbingan = (id) => {
        const item = bimbingan.find(b => String(b.id) === String(id));
        if (item) {
            setForm(prev => ({
                ...prev,
                pendaftaranId: id,
                lokasi: `${item.instansi?.nama || ''} - ${item.instansi?.alamat || ''}`
            }));
        } else {
            setForm(prev => ({ ...prev, pendaftaranId: '', lokasi: '' }));
        }
    };

    const handleLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const loc = `${position.coords.latitude}, ${position.coords.longitude}`;
                setForm(prev => ({ ...prev, koordinat: loc }));
                toast({ title: 'Lokasi Berhasil', description: 'Koordinat berhasil diambil.' });
            }, (error) => {
                toast({ title: 'Gagal', description: "Gagal mengambil lokasi: " + error.message, variant: 'destructive' });
            });
        } else {
            toast({ title: 'Gagal', description: "Geolocation tidak didukung browser ini.", variant: 'destructive' });
        }
    };

    const handleCapture = () => {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
            fetch(imageSrc)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], `sppd_${Date.now()}.jpg`, { type: "image/jpeg" });
                    setFotoFiles(prev => [...prev, file]);
                    setShowCamera(false);
                    toast({ title: 'Berhasil', description: 'Foto berhasil diambil.' });
                });
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setFotoFiles(prev => [...prev, ...newFiles]);
        }
    };

    const removeFoto = (index) => {
        setFotoFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.pendaftaranId) return toast({ title: 'Peringatan', description: 'Pilih mahasiswa bimbingan.', variant: 'destructive' });
        if (fotoFiles.length === 0) return toast({ title: 'Peringatan', description: 'Ambil foto dokumentasi terlebih dahulu.', variant: 'destructive' });

        setLoading(true);
        const formData = new FormData();
        Object.keys(form).forEach(key => formData.append(key, form[key]));
        fotoFiles.forEach(file => formData.append('foto', file));

        try {
            await api.post('/api/sppd', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast({ title: 'Berhasil', description: 'Data SPPD berhasil disimpan.' });
            setForm({
                pendaftaranId: '',
                tanggal: new Date().toISOString().split('T')[0],
                lokasi: '',
                yangDitemui: '',
                koordinat: '',
                keterangan: ''
            });
            setFotoFiles([]);
            loadData();
        } catch (err) {
            toast({ title: 'Gagal', description: err.response?.data?.message || 'Gagal menyimpan data.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-bold text-gray-900">SPPD Dosen</h1>
                <p className="text-gray-500">Input Kunjungan Lapangan (Surat Perjalanan Dinas)</p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Form Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            Input Data Kunjungan
                        </CardTitle>
                        <CardDescription>Lengkapi data kunjungan ke instansi mahasiswa</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Mahasiswa Bimbingan</label>
                                <select
                                    className="w-full p-2 border rounded-md text-sm"
                                    value={form.pendaftaranId}
                                    onChange={(e) => handleSelectBimbingan(e.target.value)}
                                    required
                                >
                                    <option value="">Pilih Mahasiswa</option>
                                    {bimbingan.length === 0 ? (
                                        <option value="" disabled>Tidak ada mahasiswa aktif periode ini</option>
                                    ) : (
                                        bimbingan.map(b => (
                                            <option key={b.id} value={b.id}>
                                                {b.mahasiswa?.nama} ({b.instansi?.nama})
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Tanggal</label>
                                    <Input
                                        type="date"
                                        value={form.tanggal}
                                        onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Koordinat</label>
                                    <div className="flex gap-2">
                                        <Input value={form.koordinat} readOnly placeholder="Lat, Long" />
                                        <Button type="button" size="icon" onClick={handleLocation} variant="outline">
                                            <MapPin className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Lokasi / Instansi</label>
                                <Input value={form.lokasi} readOnly placeholder="Otomatis dari data instansi" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Pihak yang Ditemui</label>
                                <Input
                                    placeholder="Contoh: Bapak Ahmad (HRD)"
                                    value={form.yangDitemui}
                                    onChange={(e) => setForm({ ...form, yangDitemui: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Keterangan / Hasil Kunjungan</label>
                                <textarea
                                    className="w-full p-2 border rounded-md text-sm min-h-[80px]"
                                    placeholder="Masukkan hasil tinjauan atau catatan lainnya..."
                                    value={form.keterangan}
                                    onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Foto Dokumentasi (Maks 5)</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {fotoFiles.map((file, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-md overflow-hidden border bg-gray-50 group">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeFoto(idx)}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <RefreshCw className="h-3 w-3 rotate-45" />
                                            </button>
                                        </div>
                                    ))}
                                    {fotoFiles.length < 5 && (
                                        <>
                                            <Button
                                                type="button"
                                                className="aspect-square border-dashed border-2 flex flex-col gap-1 p-0"
                                                variant="outline"
                                                onClick={() => setShowCamera(true)}
                                            >
                                                <Camera className="h-5 w-5 text-gray-400" />
                                                <span className="text-[10px]">Kamera</span>
                                            </Button>
                                            <label className="aspect-square flex flex-col items-center justify-center gap-1 border-2 border-dashed rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                                                <Upload className="h-5 w-5 text-gray-400" />
                                                <span className="text-[10px]">File</span>
                                                <input type="file" className="hidden" accept="image/*" multiple onChange={handleFileChange} />
                                            </label>
                                        </>
                                    )}
                                </div>
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                Simpan Data SPPD
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* History Section */}
                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5 text-primary" />
                            Riwayat SPPD
                        </CardTitle>
                        <CardDescription>Daftar kunjungan yang telah dilakukan</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                            {fetching ? (
                                <p className="text-center text-gray-500 py-4">Memuat data...</p>
                            ) : sppdList.length === 0 ? (
                                <p className="text-center text-gray-500 py-4">Belum ada riwayat SPPD</p>
                            ) : (
                                sppdList.map((item) => (
                                    <div key={item.id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-sm">{formatDate(item.tanggal)}</p>
                                                <p className="text-xs text-gray-600 font-medium">{item.pendaftaran?.mahasiswa?.nama || 'N/A'}</p>
                                            </div>
                                            {item.fotoUrl && (() => {
                                                let urls = [];
                                                try {
                                                    const parsed = JSON.parse(item.fotoUrl);
                                                    urls = Array.isArray(parsed) ? parsed : [item.fotoUrl];
                                                } catch (e) {
                                                    urls = [item.fotoUrl];
                                                }
                                                return (
                                                    <div className="flex gap-1 mt-1 overflow-x-auto pb-1 no-scrollbar">
                                                        {urls.map((u, i) => (
                                                            <a
                                                                key={i}
                                                                href={u.startsWith('http') ? u : `${api.defaults.baseURL}${u}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex-shrink-0"
                                                            >
                                                                <img
                                                                    src={u.startsWith('http') ? u : `${api.defaults.baseURL}${u}`}
                                                                    alt="SPPD"
                                                                    className="w-12 h-12 object-cover rounded border bg-gray-100"
                                                                />
                                                            </a>
                                                        ))}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                        <div className="mt-2 space-y-1">
                                            <p className="text-xs flex items-center gap-1">
                                                <Building2 className="h-3 w-3 text-gray-400" />
                                                {item.lokasi}
                                            </p>
                                            <p className="text-xs flex items-center gap-1">
                                                <Users className="h-3 w-3 text-gray-400" />
                                                Ditemui: {item.yangDitemui}
                                            </p>
                                            {item.keterangan && (
                                                <p className="text-xs italic text-gray-500 line-clamp-2 bg-gray-50 p-1 rounded">
                                                    "{item.keterangan}"
                                                </p>
                                            )}
                                            {item.koordinat && (
                                                <p className="text-[10px] text-gray-400 font-mono">
                                                    {item.koordinat}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Camera Modal */}
            {showCamera && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                    <div className="bg-white rounded-xl overflow-hidden max-w-md w-full">
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            className="w-full aspect-square object-cover"
                            videoConstraints={{ facingMode: facingMode }}
                        />
                        <div className="p-4 flex flex-col gap-3">
                            <div className="flex gap-3">
                                <Button className="flex-1" onClick={handleCapture}>Ambil Foto</Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1 gap-2"
                                    onClick={() => setFacingMode(prev => prev === "user" ? "environment" : "user")}
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Ganti Kamera
                                </Button>
                            </div>
                            <Button variant="ghost" className="w-full" onClick={() => setShowCamera(false)}>Batal</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Minimal Building2 icon replacement if not imported
function Building2({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
            <path d="M9 22v-4h6v4" />
            <path d="M8 6h.01" />
            <path d="M16 6h.01" />
            <path d="M8 10h.01" />
            <path d="M16 10h.01" />
            <path d="M8 14h.01" />
            <path d="M16 14h.01" />
            <path d="M8 18h.01" />
            <path d="M16 18h.01" />
        </svg>
    );
}
