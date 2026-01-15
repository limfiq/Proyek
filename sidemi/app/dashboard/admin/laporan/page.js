'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Printer, Edit, PlusCircle, FileText, CheckCircle, XCircle, ExternalLink, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function AdminLaporanPage() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    // [NEW] Search, Filter, PageSize
    const [searchQuery, setSearchQuery] = useState('');
    const [filterTipe, setFilterTipe] = useState('ALL');
    const [pageSize, setPageSize] = useState(10);

    const [editOpen, setEditOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [uploadForm, setUploadForm] = useState({ fileUrl: '', type_iku: '', ikuUrl: '', finalUrl: '' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/pkl/all');
            const eligible = res.data.filter(p => p.status === 'ACTIVE' || p.status === 'APPROVED' || p.status === 'COMPLETED');

            // Parallel fetch details for pagination would be too heavy if we do ALL.
            // But client-side pagination requires all data for "total pages" if not handled by backend.
            // For now, let's fetch basic list, and maybe fetch details for the CURRENT PAGE only? 
            // Or just fetch all if list is small (<100). The user requested "rekap", implies seeing all.
            // Let's try fetching all but handled gracefully. 
            // Actually, usually fetching stats for 50 students is okay.

            // To optimze, we can fetch stats only for the rendered page.
            // Let's store the "eligible" list, and then a separate effect loads details for the current page.
            setStudents(eligible.map(s => ({ ...s, stats: null })));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Derived state for pagination
    const filteredStudents = students.filter(s => {
        const query = searchQuery.toLowerCase();
        const mhsName = s.mahasiswa?.nama?.toLowerCase() || '';
        const mhsNim = s.mahasiswa?.nim?.toLowerCase() || '';
        const matchesSearch = mhsName.includes(query) || mhsNim.includes(query);
        const matchesTipe = filterTipe === 'ALL' || s.tipe === filterTipe;
        return matchesSearch && matchesTipe;
    });

    const totalPages = Math.ceil(filteredStudents.length / (pageSize === 'ALL' ? filteredStudents.length : pageSize));
    const currentStudents = pageSize === 'ALL'
        ? filteredStudents
        : filteredStudents.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    // Fetch stats for current page students if they don't have stats yet
    useEffect(() => {
        const fetchStats = async () => {
            const studentsToFetch = currentStudents.filter(s => !s.stats);
            if (studentsToFetch.length === 0) return;

            const updatedStudents = [...students];

            await Promise.all(studentsToFetch.map(async (student) => {
                try {
                    // We need multiple endpoints:
                    // 1. Logbook Harian count
                    // 2. Mingguan count
                    // 3. Laporan Tengah
                    // 4. Laporan Akhir
                    // This is 'expensive', checking if there is a 'stats' generic endpoint would be better.
                    // Assuming no generic stats endpoint based on history, we fetch manually.

                    const [resHarian, resMingguan, resTengah, resAkhir] = await Promise.all([
                        api.get(`/api/laporan/harian?pendaftaranId=${student.id}`).catch(() => ({ data: [] })),
                        api.get(`/api/laporan/mingguan?pendaftaranId=${student.id}`).catch(() => ({ data: [] })),
                        api.get(`/api/laporan/tengah?pendaftaranId=${student.id}`).catch(() => ({ data: null })),
                        api.get(`/api/laporan/akhir?pendaftaranId=${student.id}`).catch(() => ({ data: null }))
                    ]);

                    const statData = {
                        harianCount: resHarian.data.length,
                        mingguanCount: resMingguan.data.length,
                        laporanTengah: resTengah.data,
                        laporanAkhir: resAkhir.data
                    };

                    // Update in main list
                    const index = updatedStudents.findIndex(s => s.id === student.id);
                    if (index !== -1) {
                        updatedStudents[index] = { ...updatedStudents[index], stats: statData };
                    }

                } catch (e) {
                    console.error("Failed stats for", student.id);
                }
            }));

            setStudents(updatedStudents);
        };

        if (currentStudents.length > 0) {
            fetchStats();
        }
    }, [currentPage, filteredStudents.length, pageSize, searchQuery, filterTipe]); // Update dep array

    const getLatestLaporan = (data) => {
        if (!data) return null;
        return Array.isArray(data) ? data[0] : data;
    };

    const handleEdit = (student) => {
        setSelectedStudent(student);
        const akhir = getLatestLaporan(student.stats?.laporanAkhir);
        setUploadForm({
            fileUrl: akhir?.fileUrl || '',
            type_iku: akhir?.type_iku || '',
            ikuUrl: akhir?.ikuUrl || '',
            finalUrl: akhir?.finalUrl || ''
        });
        setEditOpen(true);
    };

    const handleSaveUpload = async () => {
        try {
            await api.post('/api/laporan/akhir', {
                pendaftaranId: selectedStudent.id,
                ...uploadForm
            });
            alert('Laporan akhir berhasil disimpan');
            setEditOpen(false);

            // Force refresh stats for this student
            setStudents(prev => prev.map(s =>
                s.id === selectedStudent.id
                    ? { ...s, stats: null } // Setting stats to null triggers the effect to refetch
                    : s
            ));

        } catch (err) {
            console.error(err);
            alert('Gagal menyimpan laporan');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center no-print">
                <h1 className="text-2xl font-bold">Rekap Laporan Mahasiswa</h1>
                <Button onClick={() => window.print()}>
                    <Printer className="mr-2 h-4 w-4" /> Cetak Rekap
                </Button>
            </div>

            {/* FIlters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border flex flex-col md:flex-row gap-4 justify-between items-center no-print">
                <div className="relative w-full md:w-1/3">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Cari Mahasiswa atau NIM..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Select value={filterTipe} onValueChange={val => { setFilterTipe(val); setCurrentPage(1); }}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Tipe" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Semua Tipe</SelectItem>
                            <SelectItem value="PKL1">PKL 1</SelectItem>
                            <SelectItem value="PKL2">PKL 2</SelectItem>
                            <SelectItem value="MBKM">MBKM</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={String(pageSize)} onValueChange={val => {
                        setPageSize(val === 'ALL' ? 'ALL' : Number(val));
                        setCurrentPage(1);
                    }}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Show" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10 / Page</SelectItem>
                            <SelectItem value="20">20 / Page</SelectItem>
                            <SelectItem value="50">50 / Page</SelectItem>
                            <SelectItem value="ALL">Show All</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Card id="printable-area">
                <CardHeader>
                    <CardTitle>Daftar Status Laporan</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Mahasiswa</TableHead>
                                    <TableHead>Instansi</TableHead>
                                    <TableHead className="text-center">Logbook Harian</TableHead>
                                    <TableHead className="text-center">Logbook Mingguan</TableHead>
                                    <TableHead className="text-center">Laporan Tengah</TableHead>
                                    <TableHead className="text-center">Laporan Akhir</TableHead>
                                    <TableHead className="text-center">Bukti IKU</TableHead>
                                    <TableHead className="text-center">Laporan Final</TableHead>
                                    <TableHead className="text-right no-print">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentStudents.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <div className="font-medium">{item.mahasiswa?.nama}</div>
                                            <div className="text-sm text-gray-500">{item.mahasiswa?.nim}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">{item.instansi?.nama || '-'}</div>
                                            <div className="text-xs text-gray-400">{item.tipe}</div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {item.stats ? (
                                                <span className="font-medium">{item.stats.harianCount}</span>
                                            ) : <span className="text-gray-300">...</span>}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {item.stats ? (
                                                <span className="font-medium">{item.stats.mingguanCount}</span>
                                            ) : <span className="text-gray-300">...</span>}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {item.stats ? (
                                                item.stats.laporanTengah ? (
                                                    <a href={item.stats.laporanTengah.fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center text-green-600 hover:underline text-xs gap-1">
                                                        <CheckCircle className="h-3 w-3" /> Ada
                                                    </a>
                                                ) : <span className="text-gray-400 text-xs">-</span>
                                            ) : <span className="text-gray-300">...</span>}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {item.stats ? (
                                                (() => {
                                                    const akhir = getLatestLaporan(item.stats.laporanAkhir);
                                                    if (akhir && akhir.fileUrl) {
                                                        const url = akhir.fileUrl.startsWith('http') ? akhir.fileUrl : `https://${akhir.fileUrl}`;
                                                        return (
                                                            <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center text-blue-600 hover:underline text-xs gap-1">
                                                                <FileText className="h-3 w-3" /> Lihat Laporan
                                                            </a>
                                                        );
                                                    }
                                                    return <span className="text-red-400 text-xs italic">Belum</span>;
                                                })()
                                            ) : <span className="text-gray-300">...</span>}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {item.stats ? (
                                                (() => {
                                                    const akhir = getLatestLaporan(item.stats.laporanAkhir);
                                                    if (akhir && akhir.ikuUrl) {
                                                        const url = akhir.ikuUrl.startsWith('http') ? akhir.ikuUrl : `https://${akhir.ikuUrl}`;
                                                        return (
                                                            <div className="flex flex-col gap-1 items-center">
                                                                <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center text-orange-600 hover:underline text-xs gap-1">
                                                                    <ExternalLink className="h-3 w-3" /> {akhir.type_iku || 'Bukti'}
                                                                </a>
                                                            </div>
                                                        );
                                                    }
                                                    return <span className="text-gray-300 text-xs">-</span>;
                                                })()
                                            ) : <span className="text-gray-300">...</span>}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {item.stats ? (
                                                (() => {
                                                    const akhir = getLatestLaporan(item.stats.laporanAkhir);
                                                    if (akhir && akhir.finalUrl) {
                                                        const url = akhir.finalUrl.startsWith('http') ? akhir.finalUrl : `https://${akhir.finalUrl}`;
                                                        return (
                                                            <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center text-purple-600 hover:underline text-xs gap-1">
                                                                <FileText className="h-3 w-3" /> Final
                                                            </a>
                                                        );
                                                    }
                                                    return <span className="text-gray-300 text-xs">-</span>;
                                                })()
                                            ) : <span className="text-gray-300">...</span>}
                                        </TableCell>
                                        <TableCell className="text-right no-print">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEdit(item)}
                                                className={item.stats?.laporanAkhir ? "text-blue-600 hover:bg-blue-50" : "text-green-600 hover:bg-green-50"}
                                            >
                                                {getLatestLaporan(item.stats?.laporanAkhir) ? <><Edit className="h-4 w-4 mr-1" /> Edit</> : <><PlusCircle className="h-4 w-4 mr-1" /> Upload</>}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {students.length === 0 && !loading && (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                                            Belum ada data pendaftaran aktif.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />

            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Upload Laporan Akhir</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <p className="text-sm text-gray-500">
                            Mahasiswa: <span className="font-semibold text-gray-700">{selectedStudent?.mahasiswa?.nama}</span>
                        </p>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Link Laporan (Google Drive)</label>
                            <Input
                                placeholder="https://..."
                                value={uploadForm.fileUrl}
                                onChange={(e) => setUploadForm({ ...uploadForm, fileUrl: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Link Bukti IKU/IKT (Google Drive)</label>
                            <Input
                                placeholder="https://..."
                                value={uploadForm.ikuUrl}
                                onChange={(e) => setUploadForm({ ...uploadForm, ikuUrl: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Link Laporan Final (Setelah Sidang)</label>
                            <Input
                                placeholder="https://..."
                                value={uploadForm.finalUrl}
                                onChange={(e) => setUploadForm({ ...uploadForm, finalUrl: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setEditOpen(false)}>Batal</Button>
                        <Button onClick={handleSaveUpload}>Simpan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
