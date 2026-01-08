'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Trash2, Edit } from 'lucide-react';

export default function MasterKriteriaPage() {
    const [data, setData] = useState([]);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ id: null, nama: '', bobot: '', role: 'PEMBIMBING', tipe: 'PKL1' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const res = await api.get('/api/kriteria');
            setData(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (form.id) {
                await api.put(`/api/kriteria/${form.id}`, form);
            } else {
                await api.post('/api/kriteria', form);
            }
            setOpen(false);
            setForm({ id: null, nama: '', bobot: '', role: 'PEMBIMBING', tipe: 'PKL1' });
            loadData();
        } catch (err) {
            alert('Gagal menyimpan data');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Hapus kriteria ini?')) return;
        try {
            await api.delete(`/api/kriteria/${id}`);
            loadData();
        } catch (err) {
            alert('Gagal menghapus');
        }
    };

    const handleEdit = (item) => {
        setForm({ ...item });
        setOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Master Kriteria Nilai</h1>
                <Button onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" /> Tambah Kriteria</Button>
            </div>

            <div className="bg-white/50 p-1 rounded-lg">
                <Tabs defaultValue="PKL1" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-6 h-12">
                        <TabsTrigger value="PKL1" className="text-base">PKL 1 (Etika Profesi)</TabsTrigger>
                        <TabsTrigger value="PKL2" className="text-base">PKL 2 (Proyek Sistem)</TabsTrigger>
                        <TabsTrigger value="MBKM" className="text-base">MBKM (S1)</TabsTrigger>
                    </TabsList>
                    {['PKL1', 'PKL2', 'MBKM'].map(tipe => (
                        <TabsContent key={tipe} value={tipe} className="space-y-6 animate-in fade-in-50 duration-300">
                            {['PEMBIMBING', 'PENGUJI', 'INSTANSI'].map(role => {
                                const items = data.filter(d => d.tipe === tipe && d.role === role);
                                return (
                                    <div key={role} className="border rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-8 w-1 rounded-full ${role === 'PEMBIMBING' ? 'bg-blue-500' : role === 'PENGUJI' ? 'bg-orange-500' : 'bg-green-500'}`} />
                                                <h3 className="text-lg font-semibold text-gray-800">
                                                    {role === 'PEMBIMBING' && 'Dosen Pembimbing'}
                                                    {role === 'PENGUJI' && 'Dosen Penguji'}
                                                    {role === 'INSTANSI' && 'Instansi / Pembimbing Lapangan'}
                                                </h3>
                                            </div>
                                            <span className={`text-xs px-3 py-1 rounded-full font-medium ${items.reduce((s, i) => s + parseFloat(i.bobot), 0) === 100
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                Total Bobot: {items.reduce((s, i) => s + parseFloat(i.bobot), 0)}%
                                            </span>
                                        </div>

                                        {items.length > 0 ? (
                                            <div className="rounded-lg border overflow-hidden">
                                                <Table>
                                                    <TableHeader className="bg-gray-50/50">
                                                        <TableRow>
                                                            <TableHead className="w-[50%]">Kriteria Penilaian</TableHead>
                                                            <TableHead>Bobot</TableHead>
                                                            <TableHead className="text-right">Aksi</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {items.map(item => (
                                                            <TableRow key={item.id} className="hover:bg-gray-50/50">
                                                                <TableCell className="font-medium">{item.nama}</TableCell>
                                                                <TableCell>
                                                                    <span className="inline-flex items-center justify-center min-w-[3rem] px-2 py-1 rounded bg-blue-50 text-blue-700 font-medium text-xs">
                                                                        {item.bobot}%
                                                                    </span>
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    <div className="flex justify-end gap-2">
                                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-blue-600" onClick={() => handleEdit(item)}>
                                                                            <Edit className="h-4 w-4" />
                                                                        </Button>
                                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-red-600" onClick={() => handleDelete(item.id)}>
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        ) : (
                                            <div className="text-center py-6 bg-gray-50/50 rounded-lg border border-dashed">
                                                <p className="text-sm text-gray-400">Belum ada kriteria penilaian untuk kategori ini.</p>
                                                <Button variant="link" size="sm" className="mt-2 text-primary" onClick={() => {
                                                    setForm(prev => ({ ...prev, role, tipe }));
                                                    setOpen(true);
                                                }}>
                                                    + Tambah Kriteria
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </TabsContent>
                    ))}
                </Tabs>
            </div>

            <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) setForm({ id: null, nama: '', bobot: '', role: 'PEMBIMBING', tipe: 'PKL1' }); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{form.id ? 'Edit' : 'Tambah'} Kriteria</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nama Kriteria</label>
                            <Input value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Bobot (%)</label>
                            <Input type="number" value={form.bobot} onChange={e => setForm({ ...form, bobot: e.target.value })} required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Penilai</label>
                            <Select value={form.role} onValueChange={val => setForm({ ...form, role: val })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PEMBIMBING">Dosen Pembimbing</SelectItem>
                                    <SelectItem value="PENGUJI">Dosen Penguji</SelectItem>
                                    <SelectItem value="INSTANSI">Instansi / Pembimbing Lapangan</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tipe PKL</label>
                            <Select value={form.tipe} onValueChange={val => setForm({ ...form, tipe: val })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PKL1">PKL 1 (Etika Profesi)</SelectItem>
                                    <SelectItem value="PKL2">PKL 2 (Proyek Sistem)</SelectItem>
                                    <SelectItem value="MBKM">MBKM (S1)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Simpan</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
