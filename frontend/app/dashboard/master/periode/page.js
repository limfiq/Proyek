'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, X, Trash2, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';

export default function MasterPeriodePage() {
    const [periodes, setPeriodes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newPeriode, setNewPeriode] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [editOpen, setEditOpen] = useState(false);
    const [editData, setEditData] = useState({ id: null, nama: '', tanggalMulai: '', tanggalSelesai: '' });

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
            await api.post('/api/periode', {
                nama: newPeriode,
                tanggalMulai: startDate,
                tanggalSelesai: endDate,
                isActive: false
            });
            setNewPeriode('');
            setStartDate('');
            setEndDate('');
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

    const openEdit = (p) => {
        setEditData({
            id: p.id,
            nama: p.nama,
            tanggalMulai: p.tanggalMulai ? p.tanggalMulai.split('T')[0] : '',
            tanggalSelesai: p.tanggalSelesai ? p.tanggalSelesai.split('T')[0] : ''
        });
        setEditOpen(true);
    };

    const handleUpdate = async () => {
        try {
            await api.put(`/api/periode/${editData.id}`, {
                nama: editData.nama,
                tanggalMulai: editData.tanggalMulai,
                tanggalSelesai: editData.tanggalSelesai
            });
            setEditOpen(false);
            loadPeriodes();
        } catch (err) {
            console.error(err);
            alert('Failed to update');
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
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                                placeholder="Nama Periode (Contoh: 2024/2025 Ganjil)"
                                value={newPeriode}
                                onChange={(e) => setNewPeriode(e.target.value)}
                                required
                            />
                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground">Tanggal Mulai</span>
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground">Tanggal Selesai</span>
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <Button type="submit" disabled={loading}>Tambah</Button>
                    </form>
                </CardContent>
            </Card>

            <div className="grid gap-4">
                {periodes.map(p => (
                    <Card key={p.id} className="flex items-center justify-between p-4">
                        <div>
                            <p className="font-bold text-lg">{p.nama}</p>
                            <p className="text-sm text-gray-500 mb-1">
                                {p.tanggalMulai ? new Date(p.tanggalMulai).toLocaleDateString('id-ID') : '-'}
                                {' s/d '}
                                {p.tanggalSelesai ? new Date(p.tanggalSelesai).toLocaleDateString('id-ID') : '-'}
                            </p>
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
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEdit(p)}
                            >
                                <Edit className="h-4 w-4" />
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Periode</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nama Periode</Label>
                            <Input
                                value={editData.nama}
                                onChange={(e) => setEditData({ ...editData, nama: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Tanggal Mulai</Label>
                                <Input
                                    type="date"
                                    value={editData.tanggalMulai}
                                    onChange={(e) => setEditData({ ...editData, tanggalMulai: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Tanggal Selesai</Label>
                                <Input
                                    type="date"
                                    value={editData.tanggalSelesai}
                                    onChange={(e) => setEditData({ ...editData, tanggalSelesai: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setEditOpen(false)}>Batal</Button>
                        <Button onClick={handleUpdate}>Simpan Perubahan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
