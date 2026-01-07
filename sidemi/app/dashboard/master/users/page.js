'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { Pagination } from '@/components/ui/pagination';

export default function MasterUsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ username: '', password: '', role: 'MAHASISWA' });
    const [profile, setProfile] = useState({ nama: '', nim: '', nidn: '', kelas: '', angkatan: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const res = await api.get('/api/users');
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreate = async (e) => {
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
                } else if (form.role === 'DOSEN') {
                    payload.profileData.nidn = profile.nidn;
                }
            }

            await api.post('/api/users', payload);
            alert('User created!');
            setForm({ username: '', password: '', role: 'MAHASISWA' });
            setProfile({ nama: '', nim: '', nidn: '', kelas: '', angkatan: '' });
            loadUsers();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create user');
        } finally {
            setLoading(false);
        }
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

    const totalPages = Math.ceil(users.length / itemsPerPage);
    const paginatedUsers = users.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Data Master Users</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Tambah User Baru</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Username</label>
                                <Input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Password</label>
                                <Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
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
                                </>
                            )}
                            {form.role === 'DOSEN' && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">NIDN</label>
                                    <Input value={profile.nidn} onChange={e => setProfile({ ...profile, nidn: e.target.value })} required />
                                </div>
                            )}
                        </div>
                        <Button type="submit" disabled={loading}>Create User</Button>
                    </form>
                </CardContent>
            </Card>

            <div className="rounded-md border bg-white">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b bg-gray-50 text-left">
                            <th className="p-4 font-medium">Username</th>
                            <th className="p-4 font-medium">Role</th>
                            <th className="p-4 font-medium">Nama (Profile)</th>
                            <th className="p-4 font-medium">Detail ID</th>
                            <th className="p-4 font-medium text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedUsers.map(u => (
                            <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50">
                                <td className="p-4">{u.username}</td>
                                <td className="p-4"><span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold">{u.role}</span></td>
                                <td className="p-4">
                                    {u.role === 'MAHASISWA' ? u.mahasiswa?.nama :
                                        u.role === 'DOSEN' ? u.dosen?.nama :
                                            u.role === 'INSTANSI' ? u.instansi?.nama : '-'}
                                </td>
                                <td className="p-4">
                                    {u.role === 'MAHASISWA' ? u.mahasiswa?.nim :
                                        u.role === 'DOSEN' ? u.dosen?.nidn : '-'}
                                </td>
                                <td className="p-4 text-right">
                                    <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDelete(u.id)}>
                                        <Trash2 className="h-4 w-4" />
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
        </div>
    );
}
