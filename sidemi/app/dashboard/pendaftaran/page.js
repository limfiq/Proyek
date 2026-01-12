'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Building2, Briefcase } from 'lucide-react';
import api from '@/lib/api';
import { motion } from 'framer-motion';

export default function PendaftaranPage() {
    const [instansiList, setInstansiList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        tipe: 'PKL1',
        instansiId: '',
        judulProject: '',
        isNewInstansi: false,
        newInstansiName: '',
        newInstansiAlamat: '',
        newInstansiKontak: ''
    });
    const [message, setMessage] = useState('');

    const [availableTypes, setAvailableTypes] = useState([]);

    useEffect(() => {
        loadInstansi();
        checkStatus();
    }, []);

    const loadInstansi = async () => {
        try {
            const res = await api.get('/api/instansi');
            setInstansiList(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const checkStatus = async () => {
        try {
            const res = await api.get('/api/pkl/me');
            if (res.data) {
                // If already registered, we don't strictly need to limit availableTypes for display 
                // as the form won't be shown (status view takes over), 
                // but for consistency we can still fetch profile.
                // However, priority is to show status.
                // let's just fetch profile if no registration status or always.
            }

            // Fetch user profile to determine Prodi
            // Fetch user profile to determine Prodi
            const userRes = await api.get('/auth/me');

            if (userRes && userRes.data && userRes.data.mahasiswa && userRes.data.mahasiswa.prodi) {
                const jenjang = userRes.data.mahasiswa.prodi.jenjang;
                if (jenjang === 'S1') {
                    setAvailableTypes(['MBKM']);
                    setFormData(f => ({ ...f, tipe: 'MBKM' }));
                } else {
                    setAvailableTypes(['PKL1', 'PKL2']);
                }
            } else {
                // Default fallback
                setAvailableTypes(['PKL1', 'PKL2']);
            }

            // Re-set status if we got it
            if (res.data) {
                // ... handle status
            }

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        // Validate
        if (!availableTypes.includes(formData.tipe)) {
            setMessage('Tipe program tidak sesuai dengan Prodi anda.');
            setLoading(false);
            return;
        }

        try {
            let finalInstansiId = formData.instansiId;

            if (formData.isNewInstansi) {
                // Create new proposed instansi
                const resIs = await api.post('/api/instansi', {
                    nama: formData.newInstansiName,
                    alamat: formData.newInstansiAlamat,
                    kontak: formData.newInstansiKontak,
                    isProposed: true
                });
                finalInstansiId = resIs.data.id;
            }

            await api.post('/api/pkl/register', {
                tipe: formData.tipe,
                instansiId: finalInstansiId,
                judulProject: formData.tipe === 'PKL2' ? formData.judulProject : ''
            });

            setMessage('Pendaftaran berhasil dikirim! Menunggu persetujuan.');
        } catch (err) {
            setMessage(err.response?.data?.message || 'Gagal mendaftar');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="glass">
                    <CardHeader>
                        <CardTitle className="text-2xl text-primary flex items-center gap-2">
                            <Briefcase className="h-6 w-6" />
                            Pendaftaran PKL
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {message && (
                            <div className={`p-4 mb-4 rounded-lg ${message.includes('berhasil') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {message}
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Jenis PKL</label>
                                <div className="flex gap-4">
                                    {availableTypes.map((type) => (
                                        <div
                                            key={type}
                                            onClick={() => setFormData({ ...formData, tipe: type })}
                                            className={`flex-1 p-4 rounded-lg border cursor-pointer transition-all ${formData.tipe === type ? 'border-primary bg-blue-50 ring-2 ring-primary ring-offset-2' : 'hover:bg-gray-50'}`}
                                        >
                                            <span className="font-bold">{type}</span>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {type === 'PKL1' ? 'Fokus Etika Profesi (1 Bulan)' :
                                                    type === 'PKL2' ? 'Fokus Sistem Informasi (6 Bulan/4 Bulan)' :
                                                        'Program MBKM (Khusus S1)'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Instansi / Tempat Magang</label>
                                <div className="flex items-center gap-2 mb-2">
                                    <input
                                        type="checkbox"
                                        id="newInstansi"
                                        checked={formData.isNewInstansi}
                                        onChange={(e) => setFormData({ ...formData, isNewInstansi: e.target.checked })}
                                        className="h-4 w-4 text-primary rounded"
                                    />
                                    <label htmlFor="newInstansi" className="text-sm text-gray-600">Ajukan Instansi Baru</label>
                                </div>

                                {!formData.isNewInstansi ? (
                                    <select
                                        className="w-full h-10 px-3 py-2 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                        value={formData.instansiId}
                                        onChange={(e) => setFormData({ ...formData, instansiId: e.target.value })}
                                        required
                                    >
                                        <option value="">Pilih Instansi...</option>
                                        {instansiList.map(item => (
                                            <option key={item.id} value={item.id}>{item.nama}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className="space-y-3 p-4 border rounded-lg bg-gray-50/50">
                                        <Input
                                            placeholder="Nama Instansi"
                                            value={formData.newInstansiName}
                                            onChange={(e) => setFormData({ ...formData, newInstansiName: e.target.value })}
                                            required
                                        />
                                        <Input
                                            placeholder="Alamat"
                                            value={formData.newInstansiAlamat}
                                            onChange={(e) => setFormData({ ...formData, newInstansiAlamat: e.target.value })}
                                            required
                                        />
                                        <Input
                                            placeholder="Kontak (Telp/Email)"
                                            value={formData.newInstansiKontak}
                                            onChange={(e) => setFormData({ ...formData, newInstansiKontak: e.target.value })}
                                            required
                                        />
                                    </div>
                                )}
                            </div>

                            {(formData.tipe === 'PKL2' || formData.tipe === 'MBKM') && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        {formData.tipe === 'MBKM' ? 'Link MBKM / Nama Program' : 'Judul Project (Rencana)'}
                                    </label>
                                    <Input
                                        placeholder="Contoh: Sistem Informasi Inventory Gudang"
                                        value={formData.judulProject}
                                        onChange={(e) => setFormData({ ...formData, judulProject: e.target.value })}
                                        required
                                    />
                                </div>
                            )}

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Mengirim...' : 'Daftar PKL'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
