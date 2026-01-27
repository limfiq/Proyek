'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Edit, Search, Building2 } from 'lucide-react';
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
import { exportToExcel, exportToPDF } from '@/lib/exportUtils';
import Link from 'next/link';

export default function InfoLokerPage() {
    const [lokers, setLokers] = useState([]);
    const [instansis, setInstansis] = useState([]); // For Dropdown
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        id: null,
        instansiId: '',
        posisi: '',
        jenisLowongan: '',
        kota: '',
        kuota: '',
        deskripsi: '',
        status: 'OPEN'
    });

    // Pagination & Search
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState("5");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [lokerRes, instansiRes] = await Promise.all([
                api.get('/api/loker'),
                api.get('/api/instansi')
            ]);
            setLokers(lokerRes.data);
            setInstansis(instansiRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleExportExcel = () => {
        const data = lokers.map((item, index) => ({
            No: index + 1,
            Instansi: item.instansi?.nama,
            Posisi: item.posisi,
            Kota: item.kota,
            Jenis: item.jenisLowongan,
            Status: item.status
        }));
        exportToExcel(data, 'Info_Loker');
    };

    const handleExportPDF = () => {
        const columns = ['No', 'Instansi', 'Posisi', 'Kota', 'Jenis', 'Status'];
        const data = lokers.map((item, index) => [
            index + 1,
            item.instansi?.nama,
            item.posisi,
            item.kota,
            item.jenisLowongan,
            item.status
        ]);
        exportToPDF('Info Lowongan Kerja', columns, data, 'Info_Loker');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (form.id) {
                await api.put(`/api/loker/${form.id}`, form);
            } else {
                await api.post('/api/loker', form);
            }
            // Reset form
            setForm({
                id: null, instansiId: '', posisi: '', jenisLowongan: '',
                kota: '', kuota: '', deskripsi: '', status: 'OPEN'
            });
            loadData();
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || 'Failed to save loker';
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item) => {
        setForm({
            id: item.id,
            instansiId: item.instansiId.toString(), // Select value matches string
            posisi: item.posisi,
            jenisLowongan: item.jenisLowongan,
            kota: item.kota,
            kuota: item.kuota,
            deskripsi: item.deskripsi,
            status: item.status
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure?')) return;
        try {
            await api.delete(`/api/loker/${id}`);
            loadData();
        } catch (err) {
            alert('Failed to delete');
        }
    };

    // Filter Logic
    const filteredLokers = lokers.filter(item =>
        item.instansi?.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.posisi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.kota?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination Logic
    const totalItems = filteredLokers.length;
    const totalPages = itemsPerPage === 'all' ? 1 : Math.ceil(totalItems / parseInt(itemsPerPage));

    const paginatedLokers = itemsPerPage === 'all'
        ? filteredLokers
        : filteredLokers.slice(
            (currentPage - 1) * parseInt(itemsPerPage),
            currentPage * parseInt(itemsPerPage)
        );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, itemsPerPage]);

    // Applicants Modal Logic
    const [selectedLokerForApplicants, setSelectedLokerForApplicants] = useState(null);
    const [applicants, setApplicants] = useState([]);
    const [loadingApplicants, setLoadingApplicants] = useState(false);
    const [showApplicantsModal, setShowApplicantsModal] = useState(false);

    const handleViewApplicants = async (lokerId) => {
        setSelectedLokerForApplicants(lokerId);
        setLoadingApplicants(true);
        setShowApplicantsModal(true);
        try {
            const res = await api.get(`/api/loker/${lokerId}/applicants`);
            setApplicants(res.data);
        } catch (err) {
            console.error(err);
            alert("Gagal mengambil data pendaftar.");
        } finally {
            setLoadingApplicants(false);
        }
    };

    const handleUpdateStatus = async (pendaftaranId, newStatus) => {
        const action = newStatus === 'APPROVED' ? 'Menerima' : 'Menolak';
        if (!confirm(`Apakah anda yakin ingin ${action} pendaftar ini?`)) return;

        try {
            await api.put(`/api/loker/application/${pendaftaranId}`, { status: newStatus });
            alert(`Berhasil ${action} pendaftar.`);
            // Refresh applicants list
            handleViewApplicants(selectedLokerForApplicants);
        } catch (err) {
            console.error(err);
            alert("Gagal mengupdate status.");
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Info Lowongan Kerja (Loker)</h1>

            {/* Applicants Modal */}
            {showApplicantsModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-3xl max-h-[80vh] overflow-y-auto">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Daftar Pendaftar</CardTitle>
                            <Button size="icon" variant="ghost" onClick={() => setShowApplicantsModal(false)}>
                                X
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {loadingApplicants ? (
                                <p>Loading...</p>
                            ) : applicants.length === 0 ? (
                                <p className="text-gray-500">Belum ada pendaftar.</p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nama</TableHead>
                                            <TableHead>NIM</TableHead>
                                            <TableHead>Prodi</TableHead>
                                            <TableHead>Tanggal</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {applicants.map((app) => (
                                            <TableRow key={app.id}>
                                                <TableCell>{app.mahasiswa?.nama || 'N/A'}</TableCell>
                                                <TableCell>{app.mahasiswa?.nim || 'N/A'}</TableCell>
                                                <TableCell>{app.mahasiswa?.prodiId || '-'}</TableCell>
                                                <TableCell>{new Date(app.createdAt).toLocaleDateString()}</TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${app.status === 'APPROVED' || app.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                                            app.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                                'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {app.status}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {app.status === 'PENDING' && (
                                                        <div className="flex justify-end gap-2">
                                                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white h-7 text-xs" onClick={() => handleUpdateStatus(app.id, 'APPROVED')}>
                                                                Terima
                                                            </Button>
                                                            <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => handleUpdateStatus(app.id, 'REJECTED')}>
                                                                Tolak
                                                            </Button>
                                                        </div>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>{form.id ? 'Edit Loker' : 'Tambah Loker'}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Pilih Instansi</label>
                                    <Select
                                        value={form.instansiId}
                                        onValueChange={(val) => setForm({ ...form, instansiId: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Instansi..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {instansis.map((instansi) => (
                                                <SelectItem key={instansi.id} value={instansi.id.toString()}>
                                                    {instansi.nama}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {instansis.length === 0 && (
                                        <p className="text-xs text-red-500 mt-1">Belum ada data Instansi. <Link href="/dashboard/master/instansi" className="underline">Tambah Instansi</Link> dulu.</p>
                                    )}
                                </div>
                                <Input
                                    placeholder="Posisi (misal: Frontend Dev)"
                                    value={form.posisi || ''}
                                    onChange={(e) => setForm({ ...form, posisi: e.target.value })}
                                    required
                                />
                                <Input
                                    placeholder="Kota Penempatan"
                                    value={form.kota || ''}
                                    onChange={(e) => setForm({ ...form, kota: e.target.value })}
                                />
                            </div>
                            <div className="space-y-4">
                                <Select
                                    value={form.jenisLowongan || ''}
                                    onValueChange={(val) => setForm({ ...form, jenisLowongan: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Jenis Lowongan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Magang Reguler">Magang Reguler</SelectItem>
                                        <SelectItem value="Magang Bersertifikat">Magang Bersertifikat</SelectItem>
                                        <SelectItem value="Magang Mandiri">Magang Mandiri</SelectItem>
                                        <SelectItem value="MBKM">MBKM</SelectItem>
                                        <SelectItem value="Lowongan Pekerjaan">Lowongan Pekerjaan</SelectItem>
                                    </SelectContent>
                                </Select>
                                <div className="grid grid-cols-2 gap-2">
                                    <Input
                                        type="number"
                                        placeholder="Kuota"
                                        value={form.kuota || ''}
                                        onChange={(e) => setForm({ ...form, kuota: e.target.value })}
                                    />
                                    <Select
                                        value={form.status}
                                        onValueChange={(val) => setForm({ ...form, status: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="OPEN">Open</SelectItem>
                                            <SelectItem value="CLOSED">Closed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Textarea
                                    placeholder="Deskripsi Pekerjaan / Syarat"
                                    value={form.deskripsi || ''}
                                    onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                                    className="h-[50px]"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button type="submit" disabled={loading}>
                                {form.id ? 'Update Data' : 'Simpan Data'}
                            </Button>
                            {form.id && (
                                <Button type="button" variant="outline" onClick={() => setForm({
                                    id: null, instansiId: '', posisi: '', jenisLowongan: '',
                                    kota: '', kuota: '', deskripsi: '', status: 'OPEN'
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
                        <CardTitle>Daftar Lowongan</CardTitle>
                        <div className="flex flex-col md:flex-row items-center gap-2">
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={handleExportExcel}>Export Excel</Button>
                                <Button variant="outline" size="sm" onClick={handleExportPDF}>Export PDF</Button>
                            </div>
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari loker..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">No</TableHead>
                                    <TableHead>Instansi</TableHead>
                                    <TableHead>Posisi</TableHead>
                                    <TableHead>Kota</TableHead>
                                    <TableHead>Jenis</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedLokers.length > 0 ? (
                                    paginatedLokers.map((item, index) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                {itemsPerPage === 'all'
                                                    ? index + 1
                                                    : (currentPage - 1) * parseInt(itemsPerPage) + index + 1}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="w-4 h-4 text-gray-400" />
                                                    {item.instansi?.nama || 'Unknown'}
                                                </div>
                                            </TableCell>
                                            <TableCell>{item.posisi}</TableCell>
                                            <TableCell>{item.kota || '-'}</TableCell>
                                            <TableCell>{item.jenisLowongan}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${item.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {item.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="sm" className="text-xs" onClick={() => handleViewApplicants(item.id)}>
                                                        Lihat Pendaftar
                                                    </Button>
                                                    <Button size="icon" variant="ghost" onClick={() => handleEdit(item)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(item.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            Tidak ada data lowongan ditemukan.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="mt-4">
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
