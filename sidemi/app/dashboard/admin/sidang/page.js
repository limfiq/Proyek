'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import api from '@/lib/api';
import { Plus, Calendar, User, UserCheck, Printer } from 'lucide-react';

export default function AdminSidangPage() {
    const [pendaftarans, setPendaftarans] = useState([]);
    const [dosens, setDosens] = useState([]);
    const [sidangs, setSidangs] = useState([]);
    const [selectedStudentId, setSelectedStudentId] = useState(null); // ID or null
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [form, setForm] = useState({ dosenPengujiId: '', tanggal: '' });

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
        setForm({ dosenPengujiId: '', tanggal: '' });
        setIsDialogOpen(true);
    };

    const handleEdit = (pendaftaranId) => {
        const existing = sidangs.find(s => s.pendaftaranId === pendaftaranId);
        setSelectedStudentId(pendaftaranId);
        if (existing) {
            setForm({
                dosenPengujiId: String(existing.dosenPengujiId || ''),
                tanggal: existing.tanggal ? existing.tanggal.split('T')[0] : ''
            });
        } else {
            setForm({ dosenPengujiId: '', tanggal: '' });
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
    const availableStudents = pendaftarans.filter(p => !sidangs.find(s => s.pendaftaranId === p.id));

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
                        {pendaftarans.map(reg => {
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

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {selectedStudentId ? 'Edit Jadwal Sidang' : 'Tambah Jadwal Sidang'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {!selectedStudentId && (
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Mahasiswa</label>
                                <Select onValueChange={val => setForm({ ...form, manualStudentId: val })}>
                                    <SelectTrigger><SelectValue placeholder="Pilih Mahasiswa" /></SelectTrigger>
                                    <SelectContent>
                                        {availableStudents.map(s => (
                                            <SelectItem key={s.id} value={String(s.id)}>
                                                {s.mahasiswa?.nama} ({s.tipe})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Dosen Penguji</label>
                            <Select
                                value={form.dosenPengujiId}
                                onValueChange={val => setForm({ ...form, dosenPengujiId: val })}
                            >
                                <SelectTrigger><SelectValue placeholder="Pilih Penguji" /></SelectTrigger>
                                <SelectContent>
                                    {dosens.map(d => (
                                        <SelectItem key={d.dosen?.id || d.id} value={String(d.dosen?.id || 0)}>
                                            {d.dosen?.nama || d.username}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Tanggal Sidang</label>
                            <Input
                                type="date"
                                value={form.tanggal}
                                onChange={e => setForm({ ...form, tanggal: e.target.value })}
                            />
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
