'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import api from '@/lib/api';
import { Plus, Calendar, User, UserCheck, Printer, Check, ChevronsUpDown, Download, FileSpreadsheet, Search } from 'lucide-react';
import { cn } from "@/lib/utils"
import { Pagination } from '@/components/ui/pagination';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function AdminSidangPage() {
    const [pendaftarans, setPendaftarans] = useState([]);
    const [dosens, setDosens] = useState([]);
    const [sidangs, setSidangs] = useState([]);
    const [selectedStudentId, setSelectedStudentId] = useState(null); // ID or null
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [form, setForm] = useState({ dosenPengujiId: '', tanggal: '', ruang: '', sesi: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [resPkl, resDosens, resSidang] = await Promise.all([
                api.get('/api/pkl/all'),
                api.get('/api/users?role=DOSEN'),
                api.get('/api/sidang/all')
            ]);

            const eligible = resPkl.data.filter(p => p.status === 'ACTIVE' || p.status === 'APPROVED');
            setPendaftarans(eligible);

            const dosenList = resDosens.data.filter(u => u.role === 'DOSEN');
            setDosens(dosenList);

            setSidangs(resSidang.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAdd = () => {
        setSelectedStudentId(null); // No student pre-selected
        setForm({ dosenPengujiId: '', tanggal: '', ruang: '', sesi: '' });
        setIsDialogOpen(true);
    };

    const handleEdit = (pendaftaranId) => {
        const existing = sidangs.find(s => s.pendaftaranId === pendaftaranId);
        setSelectedStudentId(pendaftaranId);
        if (existing) {
            setForm({
                dosenPengujiId: String(existing.dosenPengujiId || ''),
                tanggal: existing.tanggal ? existing.tanggal.split('T')[0] : '',
                ruang: existing.ruang || '',
                sesi: existing.sesi || ''
            });
        } else {
            setForm({ dosenPengujiId: '', tanggal: '', ruang: '', sesi: '' });
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!selectedStudentId && !form.manualStudentId) {
            // In "Add" mode, we need a student selection
            return alert("Pilih mahasiswa terlebih dahulu");
        }

        const targetId = selectedStudentId || form.manualStudentId;

        try {
            await api.post('/api/sidang/schedule', {
                pendaftaranId: targetId,
                ...form
            });
            alert('Jadwal saved');
            setIsDialogOpen(false);
            loadData();
        } catch (err) {
            console.error(err);
            alert('Failed to save');
        }
    };

    const getSidangInfo = (id) => sidangs.find(s => s.pendaftaranId === id);

    // Filter students who don't have sidang yet for the dropdown
    const availableStudents = pendaftarans
        .filter(p => !sidangs.find(s => s.pendaftaranId === p.id))
        .map(s => ({
            value: String(s.id),
            label: `${s.mahasiswa?.nama} (${s.tipe})`
        }));

    const dosenOptions = dosens.map(d => ({
        value: String(d.dosen?.id || 0),
        label: d.dosen?.nama || d.username
    }));

    const ruangOptions = [
        { value: "Lab. Basis Data", label: "Lab. Basis Data" },
        { value: "Lab. RPL", label: "Lab. RPL" },
        { value: "Lab. Multimedia", label: "Lab. Multimedia" },
        { value: "Lab. Pemrograman", label: "Lab. Pemrograman" },
        { value: "Lab. AI.Citra", label: "Lab. AI.Citra" },
        { value: "Lab. Jaringan", label: "Lab. Jaringan" },
        { value: "Ruang 3.2", label: "Ruang 3.2" },
        { value: "Ruang 3.3", label: "Ruang 3.3" },
        { value: "Ruang Aula", label: "Ruang Aula" },
        { value: "Ruang Seminar", label: "Ruang Seminar" },
    ];

    const sesiOptions = [
        { value: "Sesi 1", label: "08.00 - 08.45" },
        { value: "Sesi 2", label: "08.45 - 09.30" },
        { value: "Sesi 3", label: "09.30 - 10.15" },
        { value: "Sesi 4", label: "10.15 - 11.00" },
        { value: "Sesi 5", label: "11.00 - 11.45" },
        { value: "Sesi 6", label: "11.45 - 12.30" },
    ];

    // Pagination logic moved below filters
    const [searchQuery, setSearchQuery] = useState('');
    const [filterTipe, setFilterTipe] = useState('ALL');
    const [pageSize, setPageSize] = useState(10);
    const [isImporting, setIsImporting] = useState(false);

    const handleDownloadTemplate = () => {
        const header = 'NIM,Penguji,Tanggal,Ruang,Sesi\n';
        const sample1 = '12345678,Dr. Budi Santoso,2023-12-01,Lab. Basis Data,Sesi 1\n';
        const sample2 = '87654321,Siti Aminah M.Kom,2023-12-02,Ruang 3.2,Sesi 2\n';
        const blob = new Blob([header + sample1 + sample2], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'template_jadwal_sidang.csv';
        a.click();
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsImporting(true);
        const reader = new FileReader();

        reader.onload = async (event) => {
            const text = event.target.result;
            const rows = text.split('\n').map(row => row.split(','));

            // Header Check: NIM,Penguji,Tanggal,Ruang,Sesi
            let dataRows = rows;
            if (rows.length > 0 && rows[0][0] && rows[0][0].toLowerCase().includes('nim')) {
                dataRows = rows.slice(1);
            }

            let successCount = 0;
            let failCount = 0;
            const errors = [];

            for (const row of dataRows) {
                if (row.length < 5) continue;
                const nim = row[0]?.trim();
                const pengujiName = row[1]?.trim();
                const tanggal = row[2]?.trim();
                const ruang = row[3]?.trim();
                const sesi = row[4]?.trim();

                if (!nim) continue;

                // 1. Find Pendaftar by NIM
                const studentReg = pendaftarans.find(p => p.mahasiswa?.nim === nim);
                if (!studentReg) {
                    failCount++;
                    errors.push(`${nim}: Mahasiswa not found or not eligible`);
                    continue;
                }

                // 2. Find Penguji by Name
                const penguji = dosens.find(d =>
                    (d.dosen?.nama && d.dosen.nama.toLowerCase() === pengujiName.toLowerCase()) ||
                    (d.username && d.username.toLowerCase() === pengujiName.toLowerCase())
                );
                if (!penguji) {
                    failCount++;
                    errors.push(`${nim}: Penguji '${pengujiName}' not found`);
                    continue;
                }

                try {
                    await api.post('/api/sidang/schedule', {
                        pendaftaranId: studentReg.id,
                        dosenPengujiId: String(penguji.dosen?.id || penguji.id), // Fallback if dosen relation missing but user exists
                        tanggal: tanggal,
                        ruang: ruang,
                        sesi: sesi
                    });
                    successCount++;
                } catch (err) {
                    console.error(`Failed to import ${nim}:`, err.message);
                    failCount++;
                    errors.push(`${nim}: ${err.response?.data?.message || err.message}`);
                }
            }

            let msg = `Import Finished.\nSuccess: ${successCount}\nFailed: ${failCount}`;
            if (errors.length > 0) msg += `\nErrors:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? '...' : ''}`;
            alert(msg);

            setIsImporting(false);
            loadData();
            e.target.value = null;
        };

        reader.readAsText(file);
    };

    // Filter Logic
    const filteredPendaftarans = pendaftarans.filter(reg => {
        const query = searchQuery.toLowerCase();
        const mhsName = reg.mahasiswa?.nama?.toLowerCase() || '';
        const mhsNim = reg.mahasiswa?.nim?.toLowerCase() || '';
        const matchesSearch = mhsName.includes(query) || mhsNim.includes(query);
        const matchesTipe = filterTipe === 'ALL' || reg.tipe === filterTipe;
        return matchesSearch && matchesTipe;
    });

    const totalPages = Math.ceil(filteredPendaftarans.length / (pageSize === 'ALL' ? filteredPendaftarans.length : pageSize));
    const paginatedPendaftarans = pageSize === 'ALL'
        ? filteredPendaftarans
        : filteredPendaftarans.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center no-print">
                <h1 className="text-2xl font-bold text-gray-800">Jadwal Sidang PKL</h1>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleDownloadTemplate} title="Download Template CSV">
                        <Download className="h-4 w-4 mr-2" />
                        Template
                    </Button>
                    <label htmlFor="csv-upload" className="cursor-pointer">
                        <Button variant="outline" size="sm" className="hidden md:flex gap-2" asChild disabled={isImporting}>
                            <span>
                                <FileSpreadsheet className="h-4 w-4" />
                                {isImporting ? 'Importing...' : 'Import CSV'}
                            </span>
                        </Button>
                        <input
                            id="csv-upload"
                            type="file"
                            accept=".csv"
                            className="hidden"
                            onChange={handleFileUpload}
                            disabled={isImporting}
                        />
                    </label>
                    <Button onClick={() => window.print()} variant="outline" className="shadow-sm">
                        <Printer className="h-4 w-4 mr-2" />
                        Cetak Jadwal
                    </Button>
                    <Button onClick={handleAdd} className="bg-primary hover:bg-primary/90 text-white shadow-md">
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Jadwal Sidang
                    </Button>
                </div>
            </div>

            {/* Filters */}
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

            <div id="printable-area" className="rounded-xl border bg-white shadow-sm overflow-hidden print:border-none print:shadow-none">
                <div className="hidden print:block text-center mb-6 pt-4">
                    <h1 className="text-2xl font-bold uppercase">Jadwal Sidang PKL</h1>
                    <p className="text-sm text-gray-500">{new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</p>
                </div>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50/50 border-b text-left print:bg-transparent print:border-black">
                            <th className="p-4 font-semibold text-gray-600">Mahasiswa</th>
                            <th className="p-4 font-semibold text-gray-600">Instansi</th>
                            <th className="p-4 font-semibold text-gray-600">Pembimbing</th>
                            <th className="p-4 font-semibold text-gray-600">Penguji & Tanggal</th>
                            <th className="p-4 font-semibold text-gray-600 text-right no-print">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {pendaftarans.length === 0 && (
                            <tr><td colSpan="5" className="p-8 text-center text-gray-400">Belum ada mahasiswa eligible.</td></tr>
                        )}
                        {paginatedPendaftarans.map(reg => {
                            const sidang = getSidangInfo(reg.id);
                            return (
                                <tr key={reg.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-bold text-gray-900">{reg.mahasiswa?.nama}</div>
                                        <div className="text-gray-500 text-xs">{reg.mahasiswa?.nim}</div>
                                    </td>
                                    <td className="p-4 text-gray-700">{reg.instansi?.nama || '-'}</td>
                                    <td className="p-4 text-gray-700">{reg.pembimbing?.nama || '-'}</td>
                                    <td className="p-4">
                                        {sidang ? (
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-gray-800 font-medium text-xs">
                                                    <UserCheck className="h-3 w-3 text-blue-600" />
                                                    {sidang.penguji?.nama}
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-500 text-xs">
                                                    <Calendar className="h-3 w-3" />
                                                    {sidang.tanggal ? new Date(sidang.tanggal).toLocaleDateString('id-ID', { dateStyle: 'long' }) : '-'}
                                                </div>
                                                <div className="text-gray-500 text-xs mt-1">
                                                    {sidang.ruang && <span className="mr-2">Ruang: {sidang.ruang}</span>}
                                                    {sidang.sesi && <span>Sesi: {sidang.sesi}</span>}
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-500 text-xs font-medium">
                                                Belum dijadwalkan
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right no-print">
                                        <Button size="sm" variant="outline" onClick={() => handleEdit(reg.id)} className="hover:text-primary hover:border-primary">
                                            {sidang ? 'Edit Jadwal' : 'Atur Jadwal'}
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="no-print">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="overflow-visible">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedStudentId ? 'Edit Jadwal Sidang' : 'Tambah Jadwal Sidang'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {!selectedStudentId && (
                            <div className="flex flex-col space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Mahasiswa</label>
                                <Combobox
                                    options={availableStudents}
                                    value={form.manualStudentId}
                                    onChange={val => setForm({ ...form, manualStudentId: val })}
                                    placeholder="Pilih Mahasiswa"
                                />
                            </div>
                        )}
                        <div className="flex flex-col space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Dosen Penguji</label>
                            <Combobox
                                options={dosenOptions}
                                value={form.dosenPengujiId}
                                onChange={val => setForm({ ...form, dosenPengujiId: val })}
                                placeholder="Pilih Penguji"
                            />
                        </div>
                        <div className="flex flex-col space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Tanggal Sidang</label>
                            <Input
                                type="date"
                                value={form.tanggal}
                                onChange={e => setForm({ ...form, tanggal: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Ruang</label>
                                <Combobox
                                    options={ruangOptions}
                                    value={form.ruang}
                                    onChange={val => setForm({ ...form, ruang: val })}
                                    placeholder="Pilih Ruang"
                                />
                            </div>
                            <div className="flex flex-col space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Sesi</label>
                                <Combobox
                                    options={sesiOptions}
                                    value={form.sesi}
                                    onChange={val => setForm({ ...form, sesi: val })}
                                    placeholder="Pilih Sesi"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmit} className="bg-primary text-white">Save Jadwal</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function Combobox({ options, value, onChange, placeholder }) {
    const [open, setOpen] = useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {value
                        ? options.find((option) => option.value === value)?.label
                        : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                    <CommandInput placeholder={`Cari ${placeholder?.toLowerCase()}...`} />
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.label}
                                    onSelect={(currentValue) => {
                                        onChange(option.value === value ? "" : option.value)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === option.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
