'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import { BadgeCheck, Clock, XCircle, UserCheck, Plus, Building2 } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';

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

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

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

    const totalPages = Math.ceil(registrations.length / itemsPerPage);
    const paginatedRegistrations = registrations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Validasi & Plotting PKL</h1>
                <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-500">Total: {registrations.length} Pendaftaran</div>
                    <Button onClick={() => setIsAddDialogOpen(true)} className="bg-primary hover:bg-primary/90 text-white shadow-md">
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Pendaftaran
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50/50 border-b text-left">
                            <th className="p-4 font-semibold text-gray-600">Mahasiswa</th>
                            <th className="p-4 font-semibold text-gray-600">Tipe</th>
                            <th className="p-4 font-semibold text-gray-600">Instansi</th>
                            <th className="p-4 font-semibold text-gray-600">Pembimbing</th>
                            <th className="p-4 font-semibold text-gray-600">Status</th>
                            <th className="p-4 font-semibold text-gray-600 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {registrations.length === 0 && (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-gray-400 italic">
                                    Belum ada data pendaftaran PKL
                                </td>
                            </tr>
                        )}
                        {paginatedRegistrations.map(reg => (
                            <tr key={reg.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="p-4">
                                    <div className="font-bold text-gray-900">{reg.mahasiswa?.nama}</div>
                                    <div className="text-gray-500 text-xs">{reg.mahasiswa?.nim}</div>
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

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />

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
                                <Select
                                    value={String(processForm.dosenPembimbingId)}
                                    onValueChange={val => setProcessForm({ ...processForm, dosenPembimbingId: val })}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Pilih Dosen" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {dosens.map(d => (
                                            <SelectItem key={d.dosen?.id || d.id} value={String(d.dosen?.id || 0)}>
                                                {d.dosen?.nama || d.username}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Tambah Pendaftaran Manual</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Mahasiswa</label>
                            <Select onValueChange={val => setCreateForm({ ...createForm, mahasiswaId: val })}>
                                <SelectTrigger><SelectValue placeholder="Pilih Mahasiswa" /></SelectTrigger>
                                <SelectContent>
                                    {mahasiswas.map(m => (
                                        <SelectItem key={m.id} value={String(m.id)}>
                                            {m.nama} ({m.nim})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Tipe PKL</label>
                            <Select defaultValue="PKL1" onValueChange={val => setCreateForm({ ...createForm, tipe: val })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PKL1">PKL 1</SelectItem>
                                    <SelectItem value="PKL2">PKL 2</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Instansi</label>
                            <Select onValueChange={val => setCreateForm({ ...createForm, instansiId: val })}>
                                <SelectTrigger><SelectValue placeholder="Pilih Instansi" /></SelectTrigger>
                                <SelectContent>
                                    {instansis.map(i => (
                                        <SelectItem key={i.id} value={String(i.id)}>
                                            {i.nama}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Dosen Pembimbing (Opsional)</label>
                            <Select onValueChange={val => setCreateForm({ ...createForm, dosenPembimbingId: val })}>
                                <SelectTrigger><SelectValue placeholder="Pilih Dosen" /></SelectTrigger>
                                <SelectContent>
                                    {dosens.map(d => (
                                        <SelectItem key={d.dosen?.id || d.id} value={String(d.dosen?.id || 0)}>
                                            {d.dosen?.nama || d.username}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
