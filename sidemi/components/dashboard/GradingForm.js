'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';

export function GradingForm({ pendaftaranId, role, onClose, type, gradingRole }) {
    const [loading, setLoading] = useState(false);
    const [kriteriaList, setKriteriaList] = useState([]);
    const [scores, setScores] = useState({}); // { [kriteriaId]: value }
    const [revisi, setRevisi] = useState('');

    // Map role to grading type or use provided type
    let userRole = gradingRole || '';
    if (!userRole) {
        if (role === 'DOSEN') userRole = 'PENGUJI'; // Fallback
        if (role === 'INSTANSI') userRole = 'INSTANSI';
    }

    useEffect(() => {
        loadKriteria();
        loadExistingGrades();
    }, []);

    const loadExistingGrades = async () => {
        try {
            const res = await api.get(`/api/nilai/${pendaftaranId}`);
            if (res.data.detailed) {
                setScores(res.data.detailed);
            }
            if (res.data.revisi) {
                setRevisi(res.data.revisi);
            }
        } catch (err) {
            console.error("Failed to load existing grades", err);
        }
    };

    const loadKriteria = async () => {
        try {
            const res = await api.get('/api/kriteria');
            // Filter: Must match Student Type (PKL1/PKL2) AND Role (PENGUJI/etc)
            const filtered = res.data.filter(k => k.tipe === type && k.role === userRole);
            setKriteriaList(filtered);
        } catch (err) {
            console.error("Failed to load criteria", err);
        }
    };

    const handleChange = (id, val) => {
        setScores(prev => ({ ...prev, [id]: val }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/api/nilai/batch', {
                pendaftaranId,
                scores: scores,
                revisi
            });
            alert('Nilai tersimpan!');
            onClose();
        } catch (err) {
            console.error(err);
            alert('Gagal menyimpan nilai');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
            <CardHeader>
                <CardTitle>Input Nilai {userRole}</CardTitle>
                <p className="text-sm text-gray-500">Tipe: {type}</p>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {kriteriaList.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">
                            Memuat kriteria atau tidak ada kriteria untuk tipe ini.
                        </div>
                    ) : (
                        kriteriaList.map(k => (
                            <div key={k.id} className="space-y-1">
                                <Label htmlFor={`k-${k.id}`}>{k.nama} <span className="text-xs text-gray-400">({k.bobot}%)</span></Label>
                                <Input
                                    id={`k-${k.id}`}
                                    type="number"
                                    placeholder="0-100"
                                    value={scores[k.id] || ''}
                                    onChange={e => handleChange(k.id, e.target.value)}
                                    max="100"
                                    min="0"
                                    required
                                />
                            </div>
                        ))
                    )}


                    {userRole === 'PENGUJI' && (
                        <div className="space-y-1 pt-2 border-t">
                            <Label htmlFor="revisi">Revisi / Catatan Penguji</Label>
                            <textarea
                                id="revisi"
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Masukkan catatan revisi jika ada..."
                                value={revisi}
                                onChange={e => setRevisi(e.target.value)}
                            />
                        </div>
                    )}

                    <div className="flex gap-2 pt-4">
                        <Button type="button" variant="ghost" onClick={onClose} className="w-full">Batal</Button>
                        <Button type="submit" className="w-full" disabled={loading || kriteriaList.length === 0}>Simpan</Button>
                    </div>
                </form>
            </CardContent>
        </Card >
    );
}
