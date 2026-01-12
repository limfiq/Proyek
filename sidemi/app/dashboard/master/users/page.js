'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Pencil, Search, FileSpreadsheet, Download } from 'lucide-react';
import api from '@/lib/api';
import { Pagination } from '@/components/ui/pagination';

export default function MasterUsersPage() {
    const [users, setUsers] = useState([]);
    const [prodiList, setProdiList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ username: '', password: '', role: 'MAHASISWA' });
    const [profile, setProfile] = useState({ nama: '', nim: '', nidn: '', kelas: '', angkatan: '', prodiId: '' });
    const [editingId, setEditingId] = useState(null);

    // Pagination & Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState("10");

    const [isImporting, setIsImporting] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const [resUsers, resProdi] = await Promise.all([
                api.get('/api/users'),
                api.get('/api/prodi').catch(() => ({ data: [] }))
            ]);
            setUsers(resUsers.data);
            setProdiList(resProdi.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Construct payload
            const payload = { ...form };
            if (form.role !== 'ADMIN') {
                payload.profileData = {};
                payload.profileData.nama = profile.nama;
                if (form.role === 'MAHASISWA') {
                    payload.profileData.nim = profile.nim;
                    payload.profileData.kelas = profile.kelas;
                    payload.profileData.angkatan = profile.angkatan;
                    payload.profileData.prodiId = profile.prodiId;
                } else if (form.role === 'DOSEN') {
                    payload.profileData.nidn = profile.nidn;
                }
            }

            if (editingId) {
                await api.put(`/api/users/${editingId}`, payload);
                alert('User updated!');
            } else {
                await api.post('/api/users', payload);
                alert('User created!');
            }

            resetForm();
            loadUsers();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to save user');
        } finally {
            setLoading(false);
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

            // Header Check: Username,Password,Role,Nama,NIM_NIDN,Kelas,Angkatan,Prodi
            let dataRows = rows;
            if (rows.length > 0 && rows[0][0] && rows[0][0].toLowerCase().includes('username')) {
                dataRows = rows.slice(1);
            }

            let successCount = 0;
            let failCount = 0;
            const errors = [];

            for (const row of dataRows) {
                if (row.length < 3) continue; // Skip if not enough cols

                // Helper to safely get value
                const getVal = (idx) => row[idx]?.trim() || '';

                const username = getVal(0);
                const password = getVal(1);
                const role = getVal(2).toUpperCase();
                const nama = getVal(3);
                const nomerInduk = getVal(4); // NIM or NIDN

                // If username empty, skip
                if (!username) continue;

                // Construct base payload
                const payload = {
                    username,
                    password: password || username, // Default pwd = username if empty
                    role,
                    profileData: {
                        nama: nama
                    }
                };

                // Add specifics
                if (role === 'MAHASISWA') {
                    payload.profileData.nim = nomerInduk;
                    payload.profileData.kelas = getVal(5);
                    payload.profileData.angkatan = getVal(6);
                    const prodiName = getVal(7);

                    // Match prodi
                    const foundProdi = prodiList.find(p => p.nama.toLowerCase() === prodiName.toLowerCase());
                    if (foundProdi) {
                        payload.profileData.prodiId = String(foundProdi.id);
                    }
                } else if (role === 'DOSEN') {
                    payload.profileData.nidn = nomerInduk;
                }

                try {
                    await api.post('/api/users', payload);
                    successCount++;
                } catch (err) {
                    console.error(`Failed to import ${username}:`, err.message);
                    failCount++;
                    errors.push(`${username}: ${err.response?.data?.message || err.message}`);
                }
            }

            let msg = `Import Finished.\nSuccess: ${successCount}\nFailed: ${failCount}`;
            if (errors.length > 0) msg += `\nErrors:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? '...' : ''}`;
            alert(msg);

            setIsImporting(false);
            loadUsers();
            e.target.value = null;
        };
        reader.readAsText(file);
    };

    const handleDownloadTemplate = () => {
        const header = 'Username,Password,Role,Nama,NIM_NIDN,Kelas,Angkatan,Prodi\n';
        const sample1 = 'mhs1,mhs123,MAHASISWA,Budi Santoso,12345678,3A,2023,Teknik Informatika\n';
        const sample2 = 'dosen1,dosen123,DOSEN,Dr. Agus,98765432,,,,\n';
        const blob = new Blob([header + sample1 + sample2], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'template_users.csv';
        a.click();
    };

    const handleEdit = (user) => {
        setEditingId(user.id);
        const newForm = { username: user.username, password: '', role: user.role };
        setForm(newForm);

        const newProfile = { nama: '', nim: '', nidn: '', kelas: '', angkatan: '', prodiId: '' };

        if (user.role === 'MAHASISWA' && user.mahasiswa) {
            newProfile.nama = user.mahasiswa.nama || '';
            newProfile.nim = user.mahasiswa.nim || '';
            newProfile.kelas = user.mahasiswa.kelas || '';
            newProfile.angkatan = user.mahasiswa.angkatan || '';

            if (user.mahasiswa.prodi) {
                newProfile.prodiId = String(user.mahasiswa.prodi.id);
            }
        } else if (user.role === 'DOSEN' && user.dosen) {
            newProfile.nama = user.dosen.nama || '';
            newProfile.nidn = user.dosen.nidn || '';
        } else if (user.role === 'INSTANSI' && user.instansi) {
            newProfile.nama = user.instansi.nama || '';
        }
        setProfile(newProfile);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setForm({ username: '', password: '', role: 'MAHASISWA' });
        setProfile({ nama: '', nim: '', nidn: '', kelas: '', angkatan: '', prodiId: '' });
        setEditingId(null);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure? This will delete the user and their profile.')) return;
        try {
            await api.delete(`/api/users/${id}`);
            loadUsers();
        } catch (err) {
            alert('Failed to delete');
        }
    };

    const filteredUsers = users.filter(user => {
        const query = searchQuery.toLowerCase();
        const username = user.username.toLowerCase();

        let profileName = '';
        if (user.role === 'MAHASISWA') profileName = user.mahasiswa?.nama || '';
        else if (user.role === 'DOSEN') profileName = user.dosen?.nama || '';
        else if (user.role === 'INSTANSI') profileName = user.instansi?.nama || '';

        return username.includes(query) || profileName.toLowerCase().includes(query);
    });

    // Pagination Logic
    const totalItems = filteredUsers.length;
    const totalPages = itemsPerPage === 'all' ? 1 : Math.ceil(totalItems / parseInt(itemsPerPage));

    const paginatedUsers = itemsPerPage === 'all'
        ? filteredUsers
        : filteredUsers.slice(
            (currentPage - 1) * parseInt(itemsPerPage),
            currentPage * parseInt(itemsPerPage)
        );

    // Reset page when search or itemsPerPage changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, itemsPerPage]);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Data Master Users</h1>

            <Card>
                <CardHeader>
                    <CardTitle>{editingId ? 'Edit User' : 'Tambah User Baru'}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Username</label>
                                <Input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Password {editingId && '(Leave blank to keep current)'}</label>
                                <Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required={!editingId} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Role</label>
                                <Select value={form.role} onValueChange={val => setForm({ ...form, role: val })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MAHASISWA">MAHASISWA</SelectItem>
                                        <SelectItem value="DOSEN">DOSEN</SelectItem>
                                        <SelectItem value="INSTANSI">INSTANSI</SelectItem>
                                        <SelectItem value="ADMIN">ADMIN</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {form.role !== 'ADMIN' && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Nama Lengkap</label>
                                    <Input value={profile.nama} onChange={e => setProfile({ ...profile, nama: e.target.value })} required />
                                </div>
                            )}
                            {form.role === 'MAHASISWA' && (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">NIM</label>
                                        <Input value={profile.nim} onChange={e => setProfile({ ...profile, nim: e.target.value })} required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Kelas</label>
                                        <Input value={profile.kelas} onChange={e => setProfile({ ...profile, kelas: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Angkatan</label>
                                        <Input value={profile.angkatan} onChange={e => setProfile({ ...profile, angkatan: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Prodi</label>
                                        <Select value={profile.prodiId} onValueChange={val => setProfile({ ...profile, prodiId: val })}>
                                            <SelectTrigger><SelectValue placeholder="Pilih Prodi" /></SelectTrigger>
                                            <SelectContent>
                                                {prodiList.map(p => (
                                                    <SelectItem key={p.id} value={String(p.id)}>{p.nama} ({p.jenjang})</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </>
                            )}
                            {form.role === 'DOSEN' && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">NIDN</label>
                                    <Input value={profile.nidn} onChange={e => setProfile({ ...profile, nidn: e.target.value })} required />
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit" disabled={loading}>{editingId ? 'Update User' : 'Create User'}</Button>
                            {editingId && (
                                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>

            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-md border gap-4">
                <div className="flex items-center gap-2 flex-1 w-full relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        type="search"
                        placeholder="Search by username or name..."
                        className="pl-9 w-full md:max-w-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
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
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleDownloadTemplate} title="Download Template CSV">
                        <Download className="h-4 w-4 mr-2" />
                        Template
                    </Button>
                    <label className="cursor-pointer">
                        <Button variant="outline" size="sm" className="gap-2" asChild disabled={isImporting}>
                            <span>
                                <FileSpreadsheet className="h-4 w-4" />
                                {isImporting ? 'Importing...' : 'Import Excel'}
                            </span>
                        </Button>
                        <input
                            type="file"
                            accept=".csv"
                            className="hidden"
                            onChange={handleFileUpload}
                            disabled={isImporting}
                        />
                    </label>
                </div>
            </div>

            <div className="rounded-md border bg-white">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b bg-gray-50 text-left">
                            <th className="p-4 font-medium">No</th>
                            <th className="p-4 font-medium">Username</th>
                            <th className="p-4 font-medium">Role</th>
                            <th className="p-4 font-medium">Nama (Profile)</th>
                            <th className="p-4 font-medium">Detail ID</th>
                            <th className="p-4 font-medium text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedUsers.length > 0 ? (
                            paginatedUsers.map((u, index) => (
                                <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50">
                                    <td className="p-4">
                                        {itemsPerPage === 'all'
                                            ? index + 1
                                            : (currentPage - 1) * parseInt(itemsPerPage) + index + 1}
                                    </td>
                                    <td className="p-4">{u.username}</td>
                                    <td className="p-4"><span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold">{u.role}</span></td>
                                    <td className="p-4">
                                        {u.role === 'MAHASISWA' ? u.mahasiswa?.nama :
                                            u.role === 'DOSEN' ? u.dosen?.nama :
                                                u.role === 'INSTANSI' ? u.instansi?.nama : '-'}
                                        {u.role === 'MAHASISWA' && u.mahasiswa?.prodi && (
                                            <div className="text-xs text-gray-500">{u.mahasiswa.prodi.nama}</div>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        {u.role === 'MAHASISWA' ? u.mahasiswa?.nim :
                                            u.role === 'DOSEN' ? u.dosen?.nidn : '-'}
                                    </td>
                                    <td className="p-4 text-right">
                                        <Button size="sm" variant="ghost" className="text-blue-500 mr-1" onClick={() => handleEdit(u)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDelete(u.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="text-center p-4">Tidak ada data</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
    );
}
