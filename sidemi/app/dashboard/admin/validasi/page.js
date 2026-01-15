'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import { BadgeCheck, Clock, XCircle, UserCheck, Plus, Building2, Search, Upload, FileSpreadsheet, Download, Check, ChevronsUpDown } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { exportToExcel, exportToPDF } from '@/lib/exportUtils';
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
import { cn } from "@/lib/utils"

export default function AdminValidasiPage() {
    const [registrations, setRegistrations] = useState([]);
    const [dosens, setDosens] = useState([]);
    const [mahasiswas, setMahasiswas] = useState([]);
    const [instansis, setInstansis] = useState([]);

    const [loading, setLoading] = useState(true);
    const [selectedReg, setSelectedReg] = useState(null);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    // Process Form
    const [processForm, setProcessForm] = useState({ status: '', dosenPembimbingId: '' });

    // Create Form
    const [createForm, setCreateForm] = useState({
        mahasiswaId: '',
        instansiId: '',
        dosenPembimbingId: '',
        tipe: 'PKL1',
        judulProject: ''
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [filterTipe, setFilterTipe] = useState('ALL');
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [isImporting, setIsImporting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [resReg, resUsers, resInstansi] = await Promise.all([
                api.get('/api/pkl/all'),
                api.get('/api/users'), // Get all users for filtering
                api.get('/api/instansi')
            ]);
            setRegistrations(resReg.data);

            // Deduplicate users to prevent key warnings
            const uniqueUsers = Array.from(new Map(resUsers.data.map(u => [u.id, u])).values());

            const dosenList = uniqueUsers.filter(u => u.role === 'DOSEN');
            setDosens(dosenList);

            // Get available Mahasiswa (has profile)
            const mhsMap = new Map();
            uniqueUsers.forEach(u => {
                if (u.role === 'MAHASISWA' && u.mahasiswa) {
                    mhsMap.set(u.mahasiswa.id, u.mahasiswa);
                }
            });
            setMahasiswas(Array.from(mhsMap.values()));

            setInstansis(resInstansi.data);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleProcess = (reg) => {
        setSelectedReg(reg);
        setProcessForm({
            status: reg.status === 'PENDING' ? 'APPROVED' : reg.status,
            dosenPembimbingId: reg.dosenPembimbingId || ''
        });
    };

    const handleSubmitProcess = async () => {
        if (!selectedReg) return;
        try {
            await api.put(`/api/pkl/${selectedReg.id}/validate`, processForm);
            alert('Updated successfully');
            setSelectedReg(null);
            loadData();
        } catch (err) {
            alert('Failed to update');
        }
    };

    const handleCreate = async () => {
        if (!createForm.mahasiswaId || !createForm.instansiId) {
            alert('Mahasiswa dan Instansi wajib dipilih');
            return;
        }
        try {
            await api.post('/api/pkl/admin/register', createForm);
            alert('Pendaftaran created successfully');
            setIsAddDialogOpen(false);
            setCreateForm({
                mahasiswaId: '',
                instansiId: '',
                dosenPembimbingId: '',
                tipe: 'PKL1',
                judulProject: ''
            });
            loadData();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to create');
        }
    };


    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsImporting(true);
        const reader = new FileReader();

        reader.onload = async (event) => {
            const text = event.target.result;
            const rows = text.split('\n').map(row => row.split(','));

            // Assume Header: NIM, Instansi, Tipe, Judul
            // Skip header if needed? Let's check first row. If header, skip.
            // Simple check: if first col is 'NIM' (case insensitive)
            let dataRows = rows;
            if (rows.length > 0 && rows[0][0] && rows[0][0].toLowerCase().includes('nim')) {
                dataRows = rows.slice(1);
            }

            let successCount = 0;
            let failCount = 0;

            for (const row of dataRows) {
                if (row.length < 3) continue; // Skip empty/invalid lines
                const nim = row[0]?.trim();
                const instansiName = row[1]?.trim();
                const tipe = row[2]?.trim();
                const judul = row[3]?.trim() || '';

                if (!nim || !instansiName || !tipe) continue;

                // Map to IDs
                const mhs = mahasiswas.find(m => m.nim === nim);
                const inst = instansis.find(i => i.nama.toLowerCase() === instansiName.toLowerCase());

                if (mhs && inst) {
                    try {
                        const payload = {
                            mahasiswaId: String(mhs.id),
                            instansiId: String(inst.id),
                            dosenPembimbingId: '0', // Default
                            tipe: tipe.toUpperCase(),
                            judulProject: judul
                        };
                        // Use existing backend endpoint
                        await api.post('/api/pkl/admin/register', payload);
                        successCount++;
                    } catch (err) {
                        console.error(`Failed to import ${nim}:`, err.message);
                        failCount++;
                    }
                } else {
                    console.warn(`Skipping ${nim}: Mahasiswa or Instansi not found.`);
                    failCount++;
                }
            }

            alert(`Import Finished.\nSuccess: ${successCount}\nFailed: ${failCount}`);
            setIsImporting(false);
            loadData();
            e.target.value = null; // Reset input
        };

        reader.readAsText(file);
    };

    const handleDownloadTemplate = () => {
        const header = 'NIM,Instansi,Tipe,Judul\n';
        const sample1 = '12345678,PT. Teknologi Maju,PKL1,\n';
        const sample2 = '87654321,CV. Kreatif Digital,PKL2,Sistem Informasi Pegawai\n';
        const blob = new Blob([header + sample1 + sample2], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'template_validasi_pkl.csv';
        a.click();
    };

    const filteredRegistrations = registrations.filter(reg => {
        // Search Filter
        const query = searchQuery.toLowerCase();
        const mhsName = reg.mahasiswa?.nama?.toLowerCase() || '';
        const mhsNim = reg.mahasiswa?.nim?.toLowerCase() || '';
        const instName = reg.instansi?.nama?.toLowerCase() || '';
        const matchesSearch = mhsName.includes(query) || mhsNim.includes(query) || instName.includes(query);

        // Tipe Filter
        const matchesTipe = filterTipe === 'ALL' || reg.tipe === filterTipe;

        return matchesSearch && matchesTipe;
    });

    const totalPages = Math.ceil(filteredRegistrations.length / pageSize);
    // Handle "All" page size or specific logic
    const displayedRegs = pageSize === 'ALL'
        ? filteredRegistrations
        : filteredRegistrations.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const handleExportExcel = () => {
        const data = registrations.map((r, index) => ({
            No: index + 1,
            Mahasiswa: r.mahasiswa?.nama,
            NIM: r.mahasiswa?.nim,
            Prodi: r.mahasiswa?.prodi?.nama,
            Tipe: r.tipe,
            Instansi: r.instansi?.nama,
            Pembimbing: r.pembimbing?.nama || 'Belum ditunjuk',
            Status: r.status
        }));
        exportToExcel(data, 'Data_Validasi_PKL');
    };

    const handleExportPDF = () => {
        const columns = ['No', 'Mahasiswa', 'NIM', 'Prodi', 'Tipe', 'Instansi', 'Pembimbing', 'Status'];
        const data = registrations.map((r, index) => [
            index + 1,
            r.mahasiswa?.nama,
            r.mahasiswa?.nim,
            r.mahasiswa?.prodi?.nama,
            r.tipe,
            r.instansi?.nama,
            r.pembimbing?.nama || 'Belum ditunjuk',
            r.status
        ]);
        exportToPDF('Validasi & Plotting PKL', columns, data, 'Data_Validasi_PKL', 'landscape');
    };

    // Prepared Options for Combobox

    // Prepared Options for Combobox
    const mahasiswaOptions = mahasiswas.map(m => ({
        value: String(m.id),
        label: `${m.nama} (${m.nim})`
    }));

    const instansiOptions = instansis.map(i => ({
        value: String(i.id),
        label: i.nama
    }));

    const dosenOptions = dosens.map(d => ({
        value: String(d.dosen?.id || 0),
        label: d.dosen?.nama || d.username
    }));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Validasi & Plotting PKL</h1>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleExportExcel}>XLS</Button>
                    <Button variant="outline" size="sm" onClick={handleExportPDF}>PDF</Button>
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
                    <Button onClick={() => setIsAddDialogOpen(true)} className="bg-primary hover:bg-primary/90 text-white shadow-md">
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah
                    </Button>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white p-4 rounded-lg shadow-sm border flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-1/3">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Cari Mahasiswa, NIM, atau Instansi..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <Select value={filterTipe} onValueChange={setFilterTipe}>
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

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50/50 border-b text-left">
                            <th className="p-4 font-semibold text-gray-600">Mahasiswa</th>
                            <th className="p-4 font-semibold text-gray-600">Prodi</th>
                            <th className="p-4 font-semibold text-gray-600">Tipe</th>
                            <th className="p-4 font-semibold text-gray-600">Instansi</th>
                            <th className="p-4 font-semibold text-gray-600">Pembimbing</th>
                            <th className="p-4 font-semibold text-gray-600">Status</th>
                            <th className="p-4 font-semibold text-gray-600 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {filteredRegistrations.length === 0 && (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-gray-400 italic">
                                    Belum ada data pendaftaran PKL
                                </td>
                            </tr>
                        )}
                        {displayedRegs.map(reg => (
                            <tr key={reg.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="p-4">
                                    <div className="font-bold text-gray-900">{reg.mahasiswa?.nama}</div>
                                    <div className="text-gray-500 text-xs">{reg.mahasiswa?.nim}</div>
                                </td>
                                <td className="p-4">
                                    <div className="text-sm">{reg.mahasiswa?.prodi?.nama || '-'}</div>
                                    <span className="text-xs font-bold text-gray-400">{reg.mahasiswa?.prodi?.jenjang || ''}</span>
                                </td>
                                <td className="p-4">
                                    <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-xs font-bold border border-primary/20">
                                        {reg.tipe}
                                    </span>
                                </td>
                                <td className="p-4 text-gray-700">{reg.instansi?.nama || '-'}</td>
                                <td className="p-4">
                                    {reg.pembimbing ? (
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <UserCheck className="h-4 w-4 text-green-600" />
                                            <span className="text-xs font-medium">{reg.pembimbing.nama}</span>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 text-xs italic">Belum ditunjuk</span>
                                    )}
                                </td>
                                <td className="p-4">
                                    {reg.status === 'PENDING' && (
                                        <span className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded-md text-xs font-bold w-fit">
                                            <Clock className="h-3 w-3" /> PENDING
                                        </span>
                                    )}
                                    {(reg.status === 'APPROVED' || reg.status === 'ACTIVE') && (
                                        <span className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-bold w-fit">
                                            <BadgeCheck className="h-3 w-3" /> ACTIVE
                                        </span>
                                    )}
                                    {reg.status === 'REJECTED' && (
                                        <span className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded-md text-xs font-bold w-fit">
                                            <XCircle className="h-3 w-3" /> REJECTED
                                        </span>
                                    )}
                                    {reg.status === 'COMPLETED' && (
                                        <span className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs font-bold w-fit">
                                            <BadgeCheck className="h-3 w-3" /> SELESAI
                                        </span>
                                    )}
                                </td>
                                <td className="p-4 text-right">
                                    <Button
                                        size="sm"
                                        onClick={() => handleProcess(reg)}
                                        variant="outline"
                                        className="hover:border-primary hover:text-primary transition-all"
                                    >
                                        Process
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {pageSize !== 'ALL' && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}

            {/* PROCESS DIALOG */}
            {selectedReg && (
                <Dialog open={!!selectedReg} onOpenChange={() => setSelectedReg(null)}>
                    <DialogContent className="max-w-md p-0 overflow-hidden">
                        <DialogHeader className="p-6 bg-gray-50 border-b">
                            <DialogTitle className="text-xl text-gray-800">Validasi Pendaftaran</DialogTitle>
                            <p className="text-xs text-gray-500 mt-1">
                                {selectedReg.mahasiswa?.nama} - {selectedReg.tipe}
                            </p>
                        </DialogHeader>
                        <div className="p-6 space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Update Status</label>
                                <Select value={processForm.status} onValueChange={val => setProcessForm({ ...processForm, status: val })}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PENDING">PENDING</SelectItem>
                                        <SelectItem value="APPROVED">APPROVED (Active)</SelectItem>
                                        <SelectItem value="REJECTED">REJECTED</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Tunjuk Dosen Pembimbing</label>
                                <Combobox
                                    options={dosenOptions}
                                    value={String(processForm.dosenPembimbingId)}
                                    onChange={val => setProcessForm({ ...processForm, dosenPembimbingId: val })}
                                    placeholder="Pilih Dosen"
                                />
                            </div>
                        </div>
                        <DialogFooter className="p-6 bg-gray-50 border-t flex gap-2 justify-end">
                            <Button variant="ghost" onClick={() => setSelectedReg(null)}>Batal</Button>
                            <Button onClick={handleSubmitProcess} className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30">
                                Simpan Perubahan
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* ADD Pendaftaran DIALOG */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="max-w-md overflow-visible">
                    <DialogHeader>
                        <DialogTitle>Tambah Pendaftaran Manual</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="flex flex-col space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Mahasiswa</label>
                            <Combobox
                                options={mahasiswaOptions}
                                value={createForm.mahasiswaId}
                                onChange={val => setCreateForm({ ...createForm, mahasiswaId: val })}
                                placeholder="Pilih Mahasiswa"
                            />
                        </div>
                        <div className="flex flex-col space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Tipe PKL</label>
                            <Select defaultValue="PKL1" onValueChange={val => setCreateForm({ ...createForm, tipe: val })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PKL1">PKL 1</SelectItem>
                                    <SelectItem value="PKL2">PKL 2</SelectItem>
                                    <SelectItem value="MBKM">MBKM</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Instansi</label>
                            <Combobox
                                options={instansiOptions}
                                value={createForm.instansiId}
                                onChange={val => setCreateForm({ ...createForm, instansiId: val })}
                                placeholder="Pilih Instansi"
                            />
                        </div>
                        <div className="flex flex-col space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Dosen Pembimbing (Opsional)</label>
                            <Combobox
                                options={dosenOptions}
                                value={createForm.dosenPembimbingId}
                                onChange={val => setCreateForm({ ...createForm, dosenPembimbingId: val })}
                                placeholder="Pilih Dosen"
                            />
                        </div>
                        {createForm.tipe === 'PKL2' && (
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Judul Project</label>
                                <Input
                                    placeholder="Judul Project PKL"
                                    value={createForm.judulProject}
                                    onChange={e => setCreateForm({ ...createForm, judulProject: e.target.value })}
                                />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsAddDialogOpen(false)}>Batal</Button>
                        <Button onClick={handleCreate} className="bg-primary text-white">Buat Pendaftaran</Button>
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
                    className="w-full justify-between bg-white"
                >
                    {value
                        ? options.find((option) => option.value === value)?.label
                        : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-white">
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
