'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Edit, Search } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Pagination } from '@/components/ui/pagination';
import api from '@/lib/api';

export default function MasterInstansiPage() {
    const [instansis, setInstansis] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        nama: '', alamat: '', kontak: '',
        mapsUrl: '', pimpinan: '', logoUrl: '', noSurat: ''
    });

    // Pagination & Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState("5");

    useEffect(() => {
        loadInstansi();
    }, []);

    const loadInstansi = async () => {
        try {
            const res = await api.get('/api/instansi');
            setInstansis(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (form.id) {
                await api.put(`/api/instansi/${form.id}`, form);
            } else {
                await api.post('/api/instansi', form);
            }
            setForm({
                id: null,
                nama: '', alamat: '', kontak: '',
                mapsUrl: '', pimpinan: '', logoUrl: '', noSurat: ''
            });
            loadInstansi();
        } catch (err) {
            alert('Failed to save instansi');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item) => {
        setForm({ ...item });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure?')) return;
        try {
            await api.delete(`/api/instansi/${id}`);
            loadInstansi();
        } catch (err) {
            alert('Failed to delete');
        }
    };

    // Filter Logic
    const filteredInstansis = instansis.filter(item =>
        item.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.alamat?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination Logic
    const totalItems = filteredInstansis.length;
    const totalPages = itemsPerPage === 'all' ? 1 : Math.ceil(totalItems / parseInt(itemsPerPage));

    const paginatedInstansis = itemsPerPage === 'all'
        ? filteredInstansis
        : filteredInstansis.slice(
            (currentPage - 1) * parseInt(itemsPerPage),
            currentPage * parseInt(itemsPerPage)
        );

    // Reset page when search or itemsPerPage changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, itemsPerPage]);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Data Master Instansi</h1>

            <Card>
                <CardHeader>
                    <CardTitle>{form.id ? 'Edit Instansi' : 'Tambah Instansi'}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <Input
                                    placeholder="Nama Instansi"
                                    value={form.nama || ''}
                                    onChange={(e) => setForm({ ...form, nama: e.target.value })}
                                    required
                                />
                                <Input
                                    placeholder="Kontak / Email PIC"
                                    value={form.kontak || ''}
                                    onChange={(e) => setForm({ ...form, kontak: e.target.value })}
                                />
                                <Input
                                    placeholder="Pin Maps (URL)"
                                    value={form.mapsUrl || ''}
                                    onChange={(e) => setForm({ ...form, mapsUrl: e.target.value })}
                                />
                            </div>
                            <div className="space-y-4">
                                <Textarea
                                    placeholder="Alamat"
                                    value={form.alamat || ''}
                                    onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                                    className="h-[120px]"
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                            <Input
                                placeholder="Nama Pimpinan"
                                value={form.pimpinan || ''}
                                onChange={(e) => setForm({ ...form, pimpinan: e.target.value })}
                            />
                            <Input
                                placeholder="Logo URL"
                                value={form.logoUrl || ''}
                                onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                            />
                            <Input
                                placeholder="Nomor Surat Mitra"
                                value={form.noSurat || ''}
                                onChange={(e) => setForm({ ...form, noSurat: e.target.value })}
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button type="submit" disabled={loading}>
                                {form.id ? 'Update Data' : 'Simpan Data'}
                            </Button>
                            {form.id && (
                                <Button type="button" variant="outline" onClick={() => setForm({
                                    id: null, nama: '', alamat: '', kontak: '',
                                    mapsUrl: '', pimpinan: '', logoUrl: '', noSurat: ''
                                })}>
                                    Batal
                                </Button>
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                        <CardTitle>Daftar Instansi</CardTitle>
                        <div className="flex items-center gap-2">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari instansi..."
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
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">No</TableHead>
                                    <TableHead>Nama Instansi</TableHead>
                                    <TableHead>Alamat</TableHead>
                                    <TableHead>Kontak</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedInstansis.length > 0 ? (
                                    paginatedInstansis.map((item, index) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                {itemsPerPage === 'all'
                                                    ? index + 1
                                                    : (currentPage - 1) * parseInt(itemsPerPage) + index + 1}
                                            </TableCell>
                                            <TableCell className="font-medium">{item.nama}</TableCell>
                                            <TableCell>{item.alamat || '-'}</TableCell>
                                            <TableCell>{item.kontak || '-'}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => handleEdit(item)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="text-red-500 hover:text-red-600"
                                                        onClick={() => handleDelete(item.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            Tidak ada data ditemukan.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="mt-4">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
