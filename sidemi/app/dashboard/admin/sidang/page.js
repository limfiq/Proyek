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
import { Plus, Calendar, User, UserCheck, Printer, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from "@/lib/utils"
import { Pagination } from '@/components/ui/pagination';

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

    const totalPages = Math.ceil(pendaftarans.length / itemsPerPage);
    const paginatedPendaftarans = pendaftarans.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center no-print">
                <h1 className="text-2xl font-bold text-gray-800">Jadwal Sidang PKL</h1>
                <div className="flex gap-2">
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
