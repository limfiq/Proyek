'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';

export default function MasterProdiPage() {
    const [prodiList, setProdiList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ id: null, nama: '', jenjang: 'D3' });

    // Pagination & Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState("5");

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

    // Filter Logic
    const filteredProdi = prodiList.filter(item =>
        item.nama?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination Logic
    const totalItems = filteredProdi.length;
    const totalPages = itemsPerPage === 'all' ? 1 : Math.ceil(totalItems / parseInt(itemsPerPage));

    const paginatedProdi = itemsPerPage === 'all'
        ? filteredProdi
        : filteredProdi.slice(
            (currentPage - 1) * parseInt(itemsPerPage),
            currentPage * parseInt(itemsPerPage)
        );

    // Reset page when search or itemsPerPage changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, itemsPerPage]);

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
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                        <CardTitle>Daftar Prodi</CardTitle>
                        <div className="flex items-center gap-2">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari prodi..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                            <Select
                                value={itemsPerPage}
                                onValueChange={(value) => setItemsPerPage(value)}
                            >
                                <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder="Show" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5 Baris</SelectItem>
                                    <SelectItem value="10">10 Baris</SelectItem>
                                    <SelectItem value="25">25 Baris</SelectItem>
                                    <SelectItem value="all">Semua</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">No</TableHead>
                                <TableHead>Nama Prodi</TableHead>
                                <TableHead>Jenjang</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedProdi.length === 0 && !loading && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-4 text-gray-400">Belum ada data</TableCell>
                                </TableRow>
                            )}
                            {paginatedProdi.map((item, index) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        {itemsPerPage === 'all'
                                            ? index + 1
                                            : (currentPage - 1) * parseInt(itemsPerPage) + index + 1}
                                    </TableCell>
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

                    <div className="mt-4">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
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
