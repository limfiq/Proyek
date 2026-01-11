'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Printer, Edit, Ban, PlusCircle, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Pagination } from '@/components/ui/pagination';

export default function AdminRekapPage() {
    const [recap, setRecap] = useState([]);
    const [kriteriaList, setKriteriaList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editOpen, setEditOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    const [editForm, setEditForm] = useState({ LOGBOOK: '', MONEV: '', PEMBIMBING: '', PENGUJI: '', INSTANSI: '' });

    const [periods, setPeriods] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState(null);

    const [activeTab, setActiveTab] = useState('PKL1');
    const [currentPage, setCurrentPage] = useState(1);

    // [NEW] Search and PageSize
    const [searchQuery, setSearchQuery] = useState('');
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (selectedPeriod) {
            loadRecap();
        }
    }, [selectedPeriod]);

    const loadInitialData = async () => {
        try {
            const [resKriteria, resPeriode] = await Promise.all([
                api.get('/api/kriteria'),
                api.get('/api/periode')
            ]);
            setKriteriaList(resKriteria.data);
            setPeriods(resPeriode.data);

            const active = resPeriode.data.find(p => p.isActive);
            if (active) {
                setSelectedPeriod(active.id.toString());
            } else if (resPeriode.data.length > 0) {
                // If no active period, select the last one (latest)
                setSelectedPeriod(resPeriode.data[resPeriode.data.length - 1].id.toString());
            } else {
                // If no periods at all - unlikely but handle gracefully
                setLoading(false);
            }
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const loadRecap = async () => {
        if (!selectedPeriod) return;
        setLoading(true);
        try {
            // Add timestamp to prevent caching
            const res = await api.get(`/api/nilai/rekap?periodeId=${selectedPeriod}&t=${new Date().getTime()}`);
            setRecap(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (student) => {
        setSelectedStudent(student);

        // Init form with LOGBOOK and MONEV
        const form = {
            LOGBOOK: student.scores.LOGBOOK || '',
            MONEV: student.scores.MONEV || ''
        };

        // Add detailed scores for criteria
        // We need to know which criteria apply to this student (based on Tipe)
        const relevantKriteria = kriteriaList.filter(k => k.tipe === student.tipe);

        relevantKriteria.forEach(k => {
            // If we have a stored value in 'detailed', use it.
            // student.detailed has keys as string or number? keys in JS objects are strings.
            // Try to access by ID.
            if (student.detailed && student.detailed[k.id] !== undefined) {
                form[k.id] = student.detailed[k.id];
            } else {
                form[k.id] = '';
            }
        });

        setEditForm(form);
        setEditOpen(true);
    };

    const handleSaveNilai = async () => {
        try {
            // Convert values to meaningful numbers/dates/strings as required by backend
            // Process scores: Convert empty strings to 0 or null, and others to float
            const processedScores = {};
            Object.keys(editForm).forEach(key => {
                const val = editForm[key];
                // checking if it is a number-like string
                if (val !== '' && val !== null && !isNaN(val)) {
                    processedScores[key] = parseFloat(val);
                } else {
                    processedScores[key] = 0; // or null, depending on backend requirement. defaulting to 0 for safety as text inputs are "number"
                }
            });

            // Backend aggregation removed to prevent crash

            console.log('Sending payload:', {
                pendaftaranId: selectedStudent.id,
                scores: processedScores
            });

            await api.post('/api/nilai/admin', {
                pendaftaranId: selectedStudent.id,
                scores: processedScores
            });

            setEditOpen(false);
            // specific cache busting might be handled by axios config or server headers, 
            // but just calling loadRecap should trigger a new GET.
            await loadRecap();
            alert("Nilai berhasil disimpan");
        } catch (err) {
            console.error('Failed to save values:', err);
            alert("Gagal menyimpan nilai: " + (err.response?.data?.message || err.message));
        }
    };

    const filteredRecap = recap.filter(r => {
        // 1. Filter by Tab (Tipe)
        if (r.tipe !== activeTab) return false;

        // 2. Filter by Search
        const query = searchQuery.toLowerCase();
        const mhs = r.mahasiswa?.toLowerCase() || '';
        const nim = r.nim?.toLowerCase() || '';
        if (query && !mhs.includes(query) && !nim.includes(query)) return false;

        return true;
    });

    const totalPages = Math.ceil(filteredRecap.length / (pageSize === 'ALL' ? filteredRecap.length : pageSize));
    const paginatedRecap = pageSize === 'ALL'
        ? filteredRecap
        : filteredRecap.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const renderScore = (score, status) => {
        if (!status) {
            return <span className="text-red-500 font-semibold bg-red-50 px-2 py-1 rounded text-xs">Belum</span>;
        }
        return <span className="font-medium">{score}</span>;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center no-print">
                <h1 className="text-2xl font-bold">Rekapitulasi Nilai PKL</h1>
                <div className="flex gap-2">
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Pilih Periode" />
                        </SelectTrigger>
                        <SelectContent>
                            {periods.map((p) => (
                                <SelectItem key={p.id} value={p.id.toString()}>
                                    {p.nama} {p.isActive ? '(Aktif)' : ''}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button onClick={() => window.print()}>
                        <Printer className="mr-2 h-4 w-4" /> Cetak Laporan
                    </Button>
                </div>
            </div>


            {/* Search and Limit Controls */}
            <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm no-print">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Cari Mahasiswa atau NIM..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Show:</span>
                    <Select value={String(pageSize)} onValueChange={val => {
                        setPageSize(val === 'ALL' ? 'ALL' : Number(val));
                        setCurrentPage(1);
                    }}>
                        <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Limit" />
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

            <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); setCurrentPage(1); }} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="PKL1">PKL 1 (Etika Profesi)</TabsTrigger>
                    <TabsTrigger value="PKL2">PKL 2 (Proyek Sistem)</TabsTrigger>
                    <TabsTrigger value="MBKM">MBKM (S1)</TabsTrigger>
                </TabsList>

                <TabsContent value="PKL1">
                    <RecapTable data={paginatedRecap} handleEdit={handleEdit} renderScore={renderScore} kriteriaList={kriteriaList} />
                </TabsContent>
                <TabsContent value="PKL2">
                    <RecapTable data={paginatedRecap} handleEdit={handleEdit} renderScore={renderScore} kriteriaList={kriteriaList} />
                </TabsContent>
                <TabsContent value="MBKM">
                    <RecapTable data={paginatedRecap} handleEdit={handleEdit} renderScore={renderScore} kriteriaList={kriteriaList} />
                </TabsContent>
            </Tabs>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />

            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Nilai: {selectedStudent?.mahasiswa}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-1">
                        <div className="grid grid-cols-4 items-center gap-4 border-b pb-4">
                            <Label htmlFor="logbook" className="text-right font-bold">Logbook (25%)</Label>
                            <Input id="logbook" value={editForm.LOGBOOK} onChange={(e) => setEditForm({ ...editForm, LOGBOOK: e.target.value })} className="col-span-3" type="number" placeholder="0-100" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4 border-b pb-4">
                            <Label htmlFor="monev" className="text-right font-bold">Monev (20%)</Label>
                            <Input id="monev" value={editForm.MONEV} onChange={(e) => setEditForm({ ...editForm, MONEV: e.target.value })} className="col-span-3" type="number" placeholder="0-100" />
                        </div>

                        {['PEMBIMBING', 'PENGUJI', 'INSTANSI'].map(role => {
                            // Filter kriteria for this student type and role
                            const items = kriteriaList.filter(k => k.tipe === selectedStudent?.tipe && k.role === role);
                            if (items.length === 0) return null;

                            return (
                                <div key={role} className="space-y-3">
                                    <h4 className="font-semibold text-sm text-gray-500 uppercase tracking-wide border-l-4 pl-2 border-primary/50">
                                        {role === 'PEMBIMBING' ? 'Dosen Pembimbing' : role === 'PENGUJI' ? 'Dosen Penguji' : 'Instansi'}
                                    </h4>
                                    {items.map(k => (
                                        <div key={k.id} className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor={`k-${k.id}`} className="text-right text-sm">{k.nama} <span className="text-[10px] text-gray-400">({k.bobot}%)</span></Label>
                                            <Input
                                                id={`k-${k.id}`}
                                                value={editForm[k.id] || ''}
                                                onChange={(e) => setEditForm({ ...editForm, [k.id]: e.target.value })}
                                                className="col-span-3"
                                                type="number"
                                                placeholder="0-100"
                                            />
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => setEditOpen(false)}>Batal</Button>
                        <Button type="button" onClick={handleSaveNilai}>Simpan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
}

function RecapTable({ data, handleEdit, renderScore, kriteriaList }) {
    const getGrade = (val) => {
        const s = parseFloat(val);
        if (isNaN(s)) return '-';
        if (s <= 10) return 'E';
        if (s <= 20) return 'DE';
        if (s <= 30) return 'D';
        if (s <= 40) return 'CD';
        if (s <= 50) return 'C';
        if (s <= 60) return 'BC';
        if (s <= 70) return 'B';
        if (s <= 80) return 'AB';
        return 'A';
    };

    const getRoleScore = (item, role) => {
        if (!kriteriaList?.length) return item.scores[role];
        const criteria = kriteriaList.filter(k => k.tipe === item.tipe && k.role === role);
        if (!criteria.length) return item.scores[role];

        let totalW = 0, totalS = 0, found = false;
        criteria.forEach(k => {
            const val = item.detailed?.[k.id];
            if (val !== undefined && val !== null) {
                totalS += (parseFloat(val) || 0) * k.bobot;
                totalW += k.bobot;
                found = true;
            }
        });

        // If we found details and have weight, calc average. 
        // Note: item.scores[role] might be 0/null if backend failed.
        if (found && totalW > 0) return (totalS / totalW).toFixed(2);

        return item.scores[role];
    };

    return (
        <Card id="printable-area">
            <CardHeader>
                <CardTitle>Daftar Nilai Mahasiswa</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Mahasiswa</TableHead>
                                <TableHead>Tipe</TableHead>
                                <TableHead className="text-center">Logbook</TableHead>
                                <TableHead className="text-center">Monev</TableHead>
                                <TableHead className="text-center">Pembimbing</TableHead>
                                <TableHead className="text-center">Penguji</TableHead>
                                <TableHead className="text-center">Instansi</TableHead>
                                <TableHead className="text-right">Nilai Akhir</TableHead>
                                <TableHead className="text-center">Nilai Huruf</TableHead>
                                <TableHead className="text-right no-print">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <div className="font-medium">{item.mahasiswa}</div>
                                        <div className="text-sm text-gray-500">{item.nim}</div>
                                    </TableCell>
                                    <TableCell>{item.tipe}</TableCell>
                                    <TableCell className="text-center">
                                        {renderScore(item.scores.LOGBOOK, item.status.LOGBOOK)}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {renderScore(item.scores.MONEV, item.status.MONEV)}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {renderScore(getRoleScore(item, 'PEMBIMBING'), item.status.PEMBIMBING || parseFloat(getRoleScore(item, 'PEMBIMBING')) > 0)}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {renderScore(getRoleScore(item, 'PENGUJI'), item.status.PENGUJI || parseFloat(getRoleScore(item, 'PENGUJI')) > 0)}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {renderScore(getRoleScore(item, 'INSTANSI'), item.status.INSTANSI || parseFloat(getRoleScore(item, 'INSTANSI')) > 0)}
                                    </TableCell>
                                    <TableCell className="text-right font-bold text-lg">
                                        {item.finalScore}
                                    </TableCell>
                                    <TableCell className="text-center font-bold text-lg">
                                        {getGrade(item.finalScore)}
                                    </TableCell>
                                    <TableCell className="text-right no-print">
                                        {parseFloat(item.finalScore) > 0 ? (
                                            <Button variant="ghost" size="sm" onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                                                <Edit className="h-4 w-4 mr-1" /> Edit
                                            </Button>
                                        ) : (
                                            <Button variant="ghost" size="sm" onClick={() => handleEdit(item)} className="text-green-600 hover:text-green-800 hover:bg-green-50">
                                                <PlusCircle className="h-4 w-4 mr-1" /> Input
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {data.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                                        Belum ada data nilai.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
