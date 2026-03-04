'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Trash2, Edit2, Plus, RefreshCw } from 'lucide-react';
import api from '@/lib/api';
import { useToast } from "@/components/ui/use-toast";
import { formatDate } from '@/lib/utils';

export default function AdminJadwalPage() {
    const { toast } = useToast();
    const [jadwal, setJadwal] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({
        namaKegiatan: '',
        tanggal: '',
        kategori: 'GENERAL'
    });

    useEffect(() => {
        fetchJadwal();
    }, []);

    const fetchJadwal = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/jadwal');
            setJadwal(res.data);
        } catch (err) {
            toast({
                title: "Error",
                description: 'Gagal mengambil data jadwal',
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingId) {
                await api.put(`/api/jadwal/${editingId}`, form);
                toast({
                    title: "Sukses",
                    description: 'Jadwal berhasil diperbarui'
                });
            } else {
                await api.post('/api/jadwal', form);
                toast({
                    title: "Sukses",
                    description: 'Jadwal berhasil ditambahkan'
                });
            }
            setForm({ namaKegiatan: '', tanggal: '', kategori: 'GENERAL' });
            setEditingId(null);
            fetchJadwal();
        } catch (err) {
            toast({
                title: "Error",
                description: 'Gagal menyimpan jadwal',
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item) => {
        setEditingId(item.id);
        setForm({
            namaKegiatan: item.namaKegiatan,
            tanggal: item.tanggal,
            kategori: item.kategori
        });
    };

    const handleDelete = async (id) => {
        if (!confirm('Yakin ingin menghapus jadwal ini?')) return;
        try {
            await api.delete(`/api/jadwal/${id}`);
            toast({
                title: "Sukses",
                description: 'Jadwal berhasil dihapus'
            });
            fetchJadwal();
        } catch (err) {
            toast({
                title: "Error",
                description: 'Gagal menghapus jadwal',
                variant: "destructive"
            });
        }
    };


    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Manajemen Jadwal Kegiatan</h1>
                <Button variant="outline" size="sm" onClick={fetchJadwal}>
                    <RefreshCw className={loading ? "animate-spin h-4 w-4" : "h-4 w-4"} />
                </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>{editingId ? 'Edit Jadwal' : 'Tambah Jadwal'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nama Kegiatan</label>
                                <Input
                                    value={form.namaKegiatan}
                                    onChange={e => setForm({ ...form, namaKegiatan: e.target.value })}
                                    required
                                    placeholder="Contoh: Pembekalan Magang"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Tanggal</label>
                                <Input
                                    type="date"
                                    value={form.tanggal}
                                    onChange={e => setForm({ ...form, tanggal: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Kategori</label>
                                <Select
                                    value={form.kategori}
                                    onValueChange={val => setForm({ ...form, kategori: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Kategori" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="GENERAL">GENERAL</SelectItem>
                                        <SelectItem value="PKL1">PKL1</SelectItem>
                                        <SelectItem value="PKL2">PKL2</SelectItem>
                                        <SelectItem value="MBKM">MBKM</SelectItem>
                                        <SelectItem value="MBKM2">MBKM2</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" className="flex-1" disabled={loading}>
                                    {editingId ? 'Update' : 'Simpan'}
                                </Button>
                                {editingId && (
                                    <Button type="button" variant="ghost" onClick={() => {
                                        setEditingId(null);
                                        setForm({ namaKegiatan: '', tanggal: '', kategori: 'GENERAL' });
                                    }}>
                                        Batal
                                    </Button>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Daftar Jadwal</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">Kegiatan</th>
                                        <th className="px-6 py-3 font-medium">Tanggal</th>
                                        <th className="px-6 py-3 font-medium">Kategori</th>
                                        <th className="px-6 py-3 font-medium text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {jadwal.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-4 text-center text-gray-500 italic">Belum ada jadwal.</td>
                                        </tr>
                                    ) : (
                                        jadwal.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 font-medium">{item.namaKegiatan}</td>
                                                <td className="px-6 py-4">{formatDate(item.tanggal)}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${item.kategori === 'GENERAL' ? 'bg-gray-100 text-gray-600' :
                                                        item.kategori.startsWith('PKL') ? 'bg-blue-100 text-blue-600' :
                                                            'bg-purple-100 text-purple-600'
                                                        }`}>
                                                        {item.kategori}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right space-x-2">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(item.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
