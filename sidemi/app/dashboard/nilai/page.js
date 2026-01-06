'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';

export default function NilaiPage() {
    const [pendaftaran, setPendaftaran] = useState(null);
    const [nilai, setNilai] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // 1. Get Active Pendaftaran
            const resPkl = await api.get('/api/pkl/me');
            const active = resPkl.data.find(p => p.status === 'ACTIVE' || p.status === 'APPROVED' || p.status === 'FINISHED');

            if (active) {
                setPendaftaran(active);
                // 2. Get Nilai
                const resNilai = await api.get(`/api/nilai/${active.id}`);
                setNilai(resNilai.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading nilai...</div>;

    if (!pendaftaran) {
        return (
            <div className="p-8 text-center text-gray-500">
                Anda belum memiliki pendaftaran PKL yang aktif untuk melihat nilai.
            </div>
        );
    }

    if (!nilai) {
        return (
            <div className="p-8 text-center text-gray-500">
                Data nilai belum tersedia.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Transkrip Nilai PKL</h1>

            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Rincian Nilai</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between border-b pb-2">
                            <span>Nilai Logbook Harian (30%)</span>
                            <span className="font-bold">{nilai.details.HARIAN || 0}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span>Nilai Pembimbing (30%)</span>
                            <span className="font-bold">{nilai.details.PEMBIMBING || 0}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span>Nilai Penguji/Sidang ({nilai.tipe === 'PKL1' ? '20%' : '25%'})</span>
                            <span className="font-bold">{nilai.details.PENGUJI || 0}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span>Nilai Instansi ({nilai.tipe === 'PKL1' ? '20%' : '15%'})</span>
                            <span className="font-bold">{nilai.details.INSTANSI || 0}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-primary text-white">
                    <CardHeader>
                        <CardTitle className="text-white">Nilai Akhir</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center py-8">
                        <div className="text-6xl font-bold">{nilai.finalScore}</div>
                        <div className="text-sm mt-2 opacity-80">
                            {Number(nilai.finalScore) >= 85 ? 'Grade A' :
                                Number(nilai.finalScore) >= 75 ? 'Grade B' :
                                    Number(nilai.finalScore) >= 60 ? 'Grade C' : 'Grade D/E'}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
