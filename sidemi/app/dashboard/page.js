'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { Users, Calendar, CheckCircle, Clock } from 'lucide-react';

export default function DashboardPage() {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [stats, setStats] = useState(null);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    useEffect(() => {
        const userData = localStorage.getItem('user');
        const userRole = localStorage.getItem('role');
        if (userData) {
            setUser(JSON.parse(userData));
        }
        if (userRole) {
            setRole(userRole);
            if (userRole === 'ADMIN' || userRole === 'DOSEN') {
                fetchStats();
            }
        }
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/api/pkl/stats');
            setStats(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const Widgets = () => {
        if (role === 'MAHASISWA') {
            return (
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm">Status PKL</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold">Cek Status</div><p className="text-xs text-muted-foreground">Lihat menu Pendaftaran</p></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm">Logbook</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold">Isi Harian</div><p className="text-xs text-muted-foreground">Jangan lupa isi logbook</p></CardContent>
                    </Card>
                </div>
            )
        }
        if (role === 'DOSEN' && stats) {
            return (
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-sm font-medium">Periode Aktif</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.periode ? stats.periode.nama : '-'}</div>
                            <p className="text-xs text-muted-foreground">{stats.periode ? `${new Date(stats.periode.tanggalMulai).toLocaleDateString('id-ID')} - ${new Date(stats.periode.tanggalSelesai).toLocaleDateString('id-ID')}` : 'Tidak ada'}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-sm font-medium">Bimbingan</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.bimbinganCount}</div>
                            <p className="text-xs text-muted-foreground">Mahasiswa Bimbingan</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-sm font-medium">Sidang</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.ujianCount}</div>
                            <p className="text-xs text-muted-foreground">Mahasiswa Ujian</p>
                        </CardContent>
                    </Card>
                </div>
            )
        }
        if (role === 'ADMIN' && stats) {
            return (
                <div className="space-y-6">
                    {/* Key Metrics Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Periode Aktif</CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.periode ? stats.periode.nama : 'Tidak Ada'}</div>
                                <p className="text-xs text-muted-foreground">
                                    {stats.periode ? `${new Date(stats.periode.tanggalMulai).toLocaleDateString('id-ID')} - ${new Date(stats.periode.tanggalSelesai).toLocaleDateString('id-ID')}` : 'Buat periode baru'}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Pendaftar</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalMahasiswa}</div>
                                <p className="text-xs text-muted-foreground">Mahasiswa terdaftar</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">PKL 1</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.breakdown.PKL1}</div>
                                <p className="text-xs text-muted-foreground">Etika Profesi</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">PKL 2</CardTitle>
                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.breakdown.PKL2}</div>
                                <p className="text-xs text-muted-foreground">Proyek Sistem</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Charts Section */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Statistik Status Pendaftaran</CardTitle>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={stats.statusStats}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]}>
                                            {stats.statusStats.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Pendaftaran Terbaru</CardTitle>
                                <CardDescription>5 pendaftar terakhir periode ini.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {stats.recent.map((item) => (
                                        <div key={item.id} className="flex items-center">
                                            <div className="ml-4 space-y-1">
                                                <p className="text-sm font-medium leading-none">{item.nama}</p>
                                                <p className="text-xs text-muted-foreground">{item.instansi || 'Belum ada instansi'}</p>
                                            </div>
                                            <div className={`ml-auto font-medium text-xs px-2 py-1 rounded-full ${item.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                                item.status === 'ACTIVE' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {item.status}
                                            </div>
                                        </div>
                                    ))}
                                    {stats.recent.length === 0 && <p className="text-sm text-gray-400 text-center">Belum ada data.</p>}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )
        }
        if ((role === 'ADMIN' || role === 'DOSEN') && !stats) return <p className="text-center p-4">Loading Dashboard...</p>;
        return null;
    };

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500">Welcome back, {user?.nama || 'User'}!</p>
            </motion.div>

            <Widgets />
        </div>
    );
}
