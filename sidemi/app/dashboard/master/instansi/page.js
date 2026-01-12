'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Edit } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import api from '@/lib/api';

export default function MasterInstansiPage() {
    const [instansis, setInstansis] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        nama: '', alamat: '', kontak: '',
        mapsUrl: '', pimpinan: '', logoUrl: '', noSurat: ''
    });

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

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Data Master Instansi</h1>

            <Card>
                <CardHeader>
                    <CardTitle>{form.id ? 'Edit Instansi' : 'Tambah Instansi'}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Input
                                placeholder="Nama Instansi"
                                value={form.nama || ''}
                                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <Textarea
                                placeholder="Alamat"
                                value={form.alamat || ''}
                                onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                            />
                        </div>
                        <div>
                            <Input
                                placeholder="Kontak / Email PIC"
                                value={form.kontak || ''}
                                onChange={(e) => setForm({ ...form, kontak: e.target.value })}
                            />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <Input
                                placeholder="Pin Maps (URL)"
                                value={form.mapsUrl || ''}
                                onChange={(e) => setForm({ ...form, mapsUrl: e.target.value })}
                            />
                            <Input
                                placeholder="Nama Pimpinan (Penandatangan)"
                                value={form.pimpinan || ''}
                                onChange={(e) => setForm({ ...form, pimpinan: e.target.value })}
                            />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
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
                        <Button type="submit" disabled={loading}>
                            {form.id ? 'Update Data' : 'Simpan Data'}
                        </Button>
                        {form.id && (
                            <Button type="button" variant="outline" onClick={() => setForm({
                                id: null, nama: '', alamat: '', kontak: '',
                                mapsUrl: '', pimpinan: '', logoUrl: '', noSurat: ''
                            })} className="ml-2">
                                Batal
                            </Button>
                        )}
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Data Instansi</CardTitle>
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
                                    <TableHead>Pimpinan</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {instansis.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                            Belum ada data instansi
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    instansis.map((item, index) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell className="font-medium">{item.nama}</TableCell>
                                            <TableCell className="max-w-[300px] truncate" title={item.alamat}>
                                                {item.alamat || '-'}
                                            </TableCell>
                                            <TableCell>{item.kontak || '-'}</TableCell>
                                            <TableCell>{item.pimpinan || '-'}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleEdit(item)}
                                                    >
                                                        <Edit className="h-4 w-4 text-blue-500" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleDelete(item.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
