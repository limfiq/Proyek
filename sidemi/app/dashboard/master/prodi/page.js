'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function MasterProdiPage() {
    const [prodiList, setProdiList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ id: null, nama: '', jenjang: 'D3' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/prodi');
            setProdiList(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (form.id) {
                await api.put(`/api/prodi/${form.id}`, form);
            } else {
                await api.post('/api/prodi', form);
            }
            setOpen(false);
            loadData();
            setForm({ id: null, nama: '', jenjang: 'D3' });
        } catch (err) {
            console.error(err);
            alert('Gagal menyimpan data');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Yakin hapus data prodi ini?')) return;
        try {
            await api.delete(`/api/prodi/${id}`);
            loadData();
        } catch (err) {
            console.error(err);
            alert('Gagal menghapus data');
        }
    };

    const handleEdit = (item) => {
        setForm(item);
        setOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Data Program Studi</h1>
                <Button onClick={() => { setForm({ id: null, nama: '', jenjang: 'D3' }); setOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Tambah Prodi
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Daftar Prodi</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>No</TableHead>
                                <TableHead>Nama Prodi</TableHead>
                                <TableHead>Jenjang</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {prodiList.length === 0 && !loading && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-4 text-gray-400">Belum ada data</TableCell>
                                </TableRow>
                            )}
                            {prodiList.map((item, index) => (
                                <TableRow key={item.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell className="font-medium">{item.nama}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${item.jenjang === 'S1' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                            {item.jenjang}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                                            <Edit className="h-4 w-4 text-blue-500" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{form.id ? 'Edit Prodi' : 'Tambah Prodi'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Nama Prodi</Label>
                            <Input
                                placeholder="Contoh: Teknik Informatika"
                                value={form.nama}
                                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Jenjang</Label>
                            <Select value={form.jenjang} onValueChange={(val) => setForm({ ...form, jenjang: val })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="D3">D3 (Diploma 3)</SelectItem>
                                    <SelectItem value="S1">S1 (Sarjana)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setOpen(false)}>Batal</Button>
                        <Button onClick={handleSave}>Simpan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
