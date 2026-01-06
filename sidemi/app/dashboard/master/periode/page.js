'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, X, Trash2 } from 'lucide-react';
import api from '@/lib/api';

export default function MasterPeriodePage() {
    const [periodes, setPeriodes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newPeriode, setNewPeriode] = useState('');

    useEffect(() => {
        loadPeriodes();
    }, []);

    const loadPeriodes = async () => {
        try {
            const res = await api.get('/api/periode');
            setPeriodes(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newPeriode) return;
        setLoading(true);
        try {
            await api.post('/api/periode', { nama: newPeriode, isActive: false });
            setNewPeriode('');
            loadPeriodes();
        } catch (err) {
            alert('Failed to create periode');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (id, currentStatus) => {
        try {
            // If turning ON, backend assumes logic to turn others OFF or we should handle it? 
            // Sequelize model probably doesn't handle mutual exclusivity automatically, but for now we toggle.
            // Ideally backend should handle "only one active". Let's assume we just toggle this one.
            await api.put(`/api/periode/${id}`, { isActive: !currentStatus });
            loadPeriodes();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure?')) return;
        try {
            await api.delete(`/api/periode/${id}`);
            loadPeriodes();
        } catch (err) {
            alert('Failed to delete');
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Data Master Periode</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Tambah Periode Baru</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCreate} className="flex gap-4">
                        <Input
                            placeholder="Nama Periode (Contoh: 2024/2025 Ganjil)"
                            value={newPeriode}
                            onChange={(e) => setNewPeriode(e.target.value)}
                            required
                        />
                        <Button type="submit" disabled={loading}>Tambah</Button>
                    </form>
                </CardContent>
            </Card>

            <div className="grid gap-4">
                {periodes.map(p => (
                    <Card key={p.id} className="flex items-center justify-between p-4">
                        <div>
                            <p className="font-bold text-lg">{p.nama}</p>
                            <p className={`text-sm ${p.isActive ? 'text-green-600 font-bold' : 'text-gray-500'}`}>
                                {p.isActive ? 'AKTIF' : 'TIDAK AKTIF'}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant={p.isActive ? "secondary" : "default"}
                                onClick={() => handleToggleActive(p.id, p.isActive)}
                            >
                                {p.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                            </Button>
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(p.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
