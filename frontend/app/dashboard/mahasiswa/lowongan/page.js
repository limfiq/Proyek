'use strict';
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, MapPin, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';

export default function StudentLokerPage() {
    const [lokers, setLokers] = useState([]);
    const [myApplications, setMyApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [lokerRes, myRes] = await Promise.all([
                api.get('/api/loker'),
                api.get('/api/pkl/me')
            ]);
            setLokers(lokerRes.data);
            setMyApplications(myRes.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApply = async (lokerId) => {
        if (!confirm('Apakah anda yakin ingin mendaftar di lowongan ini?')) return;

        try {
            await api.post('/api/loker/apply', { lokerId });
            alert('Berhasil mendaftar! Silahkan cek status di menu Pendaftaran.');
            fetchData(); // Refresh to show new application
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || 'Gagal mendaftar';
            alert(msg);
        }
    };

    const filteredLokers = lokers.filter(item =>
        item.status === 'OPEN' && (
            item.instansi?.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.posisi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.kota?.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Info Lowongan & Ajuan</h1>

            {/* Active Applications Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Ajuan Aktif</CardTitle>
                </CardHeader>
                <CardContent>
                    {myApplications.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="p-3">Instansi</th>
                                        <th className="p-3">Posisi</th>
                                        <th className="p-3">Tipe</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3">Tanggal Daftar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {myApplications.map((app) => (
                                        <tr key={app.id} className="border-b hover:bg-gray-50">
                                            <td className="p-3">{app.instansi?.nama || 'N/A'}</td>
                                            <td className="p-3">{app.loker?.posisi || app.judulProject || '-'}</td>
                                            <td className="p-3">{app.tipe}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${app.status === 'APPROVED' || app.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                                        app.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {app.status}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                {new Date(app.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-4 text-gray-500">
                            <p>Belum ada ajuan aktif.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="flex flex-col md:flex-row justify-between gap-4 items-center pt-4 border-t">
                <h2 className="text-xl font-semibold text-gray-800">Lowongan Tersedia</h2>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Cari posisi atau instansi..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-10">Loading...</div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLokers.length > 0 ? (
                        filteredLokers.map((loker) => (
                            <Card key={loker.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg font-bold text-primary">{loker.posisi}</CardTitle>
                                            <p className="text-sm font-medium text-gray-600 mt-1 flex items-center gap-1">
                                                <Building2 className="w-3 h-3" /> {loker.instansi?.nama}
                                            </p>
                                        </div>
                                        {loker.instansi?.logoUrl && (
                                            <img src={loker.instansi.logoUrl} alt="Logo" className="w-10 h-10 object-contain rounded" />
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 space-y-3">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span className="px-2 py-1 bg-gray-100 rounded-full">{loker.jenisLowongan}</span>
                                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {loker.kota || 'N/A'}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 line-clamp-3">
                                        {loker.deskripsi || 'Tidak ada deskripsi.'}
                                    </p>
                                    <div className="text-xs text-gray-400">
                                        Kuota: {loker.kuota || '-'}
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-0">
                                    <Button
                                        className="w-full"
                                        onClick={() => handleApply(loker.id)}
                                    >
                                        Daftar Sekarang
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-10 text-gray-500">
                            Tidak ada lowongan yang sesuai kriteria.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
