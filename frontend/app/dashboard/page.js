'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Users, Calendar, CheckCircle, Clock, FileText, Phone, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [stats, setStats] = useState(null);
    const [studentSidang, setStudentSidang] = useState(null);
    const [pendaftaranData, setPendaftaranData] = useState(null);
    const [jadwalData, setJadwalData] = useState([]);
    const [agendaFilter, setAgendaFilter] = useState('ALL');
    const [isLoading, setIsLoading] = useState(true);

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? '-' : date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    useEffect(() => {
        const userData = localStorage.getItem('user');
        const userRole = localStorage.getItem('role');
        if (userData) {
            setUser(JSON.parse(userData));
        }
        if (userRole) {
            setRole(userRole);
            const init = async () => {
                setIsLoading(true);
                const promises = [fetchStats(), fetchJadwal()];
                if (userRole === 'MAHASISWA') {
                    promises.push(fetchStudentData());
                }
                await Promise.all(promises);
                setIsLoading(false);
            };
            init();
        }
    }, []);

    const fetchStudentData = async () => {
        try {
            const pklRes = await api.get('/api/pkl/me');
            const allPkl = Array.isArray(pklRes.data) ? pklRes.data : [pklRes.data];
            const activePkl = allPkl.find(p => p.periode && p.periode.isActive);
            const pklData = activePkl || allPkl[0];

            if (pklData) {
                setPendaftaranData(pklData);
                let sidang = pklData.sidang;
                if (!sidang && pklData.id) {
                    try {
                        const sidRes = await api.get(`/api/sidang/schedule?pendaftaranId=${pklData.id}`);
                        sidang = sidRes.data;
                    } catch (e) { /* ignore */ }
                }
                if (activePkl && sidang) {
                    setStudentSidang(sidang);
                } else {
                    setStudentSidang(null);
                }
            } else {
                setPendaftaranData(null);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await api.get('/api/pkl/stats');
            setStats(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchJadwal = async () => {
        try {
            const res = await api.get('/api/jadwal');
            setJadwalData(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const Widgets = () => {
        if (isLoading) {
            return (
                <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                        {[1, 2, 3, 4].map((i) => (
                            <Card key={i}>
                                <CardHeader className="pb-2">
                                    <Skeleton className="h-4 w-24" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-8 w-32 mb-2" />
                                    <Skeleton className="h-3 w-40" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card className="md:col-span-2">
                            <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
                            <CardContent><Skeleton className="h-[200px] w-full" /></CardContent>
                        </Card>
                        <Card>
                            <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
                            <CardContent><Skeleton className="h-[200px] w-full" /></CardContent>
                        </Card>
                    </div>
                </div>
            )
        }
        if (role === 'MAHASISWA') {
            return (
                <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="pb-2"><CardTitle className="text-sm">Status PKL</CardTitle></CardHeader>
                            <CardContent><div className="text-2xl font-bold">Cek Status</div><p className="text-xs text-muted-foreground">Lihat menu Pendaftaran</p></CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2"><CardTitle className="text-sm">Logbook</CardTitle></CardHeader>
                            <CardContent><div className="text-2xl font-bold">Isi Harian</div><p className="text-xs text-muted-foreground">Jangan lupa isi logbook</p></CardContent>
                        </Card>

                        <Card className={studentSidang ? "border-blue-200 bg-blue-50" : ""}>
                            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-sm font-medium">Jadwal Sidang</CardTitle>
                                <Calendar className="h-4 w-4 text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                {studentSidang ? (
                                    <div className="space-y-1">
                                        <div className="text-lg font-bold text-blue-700">
                                            {formatDate(studentSidang.tanggal)}
                                        </div>
                                        <div className="text-xs text-gray-600 flex items-center gap-1">
                                            <Clock className="h-3 w-3" /> {studentSidang.sesi || '-'}
                                            <span className="mx-1">|</span>
                                            {studentSidang.ruang || '-'}
                                        </div>
                                        {studentSidang.dosenPenguji && (
                                            <p className="text-xs text-gray-500 mt-1">Penguji: {studentSidang.dosenPenguji.nama}</p>
                                        )}
                                    </div>
                                ) : (
                                    <div>
                                        <div className="text-2xl font-bold">-</div>
                                        <p className="text-xs text-muted-foreground">Belum dijadwalkan</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Supervisor Card */}
                        <Card className={pendaftaranData?.pembimbing ? "border-green-200 bg-green-50" : ""}>
                            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-sm font-medium">Dosen Pembimbing</CardTitle>
                                <Users className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                {pendaftaranData?.pembimbing ? (
                                    <div className="space-y-2">
                                        <div className="text-lg font-bold text-green-700 leading-tight">
                                            {pendaftaranData.pembimbing.nama}
                                        </div>
                                        {pendaftaranData.pembimbing.noHp ? (
                                            <div className="text-xs text-gray-600 flex items-center gap-1.5 bg-white/50 w-fit px-2 py-1 rounded border border-green-100">
                                                <Phone className="h-3 w-3 text-green-600" />
                                                <span className="font-medium">{pendaftaranData.pembimbing.noHp}</span>
                                            </div>
                                        ) : (
                                            <p className="text-xs text-gray-500 italic">Kontak belum tersedia</p>
                                        )}
                                    </div>
                                ) : (
                                    <div>
                                        <div className="text-2xl font-bold">-</div>
                                        <p className="text-xs text-muted-foreground">Belum ada pembimbing</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Revision Card */}
                        <Card className={studentSidang && studentSidang.revisiPenguji ? "border-amber-200 bg-amber-50" : ""}>
                            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-sm font-medium">Revisi Dosen</CardTitle>
                                <Calendar className="h-4 w-4 text-amber-500" />
                            </CardHeader>
                            <CardContent>
                                {studentSidang && studentSidang.revisiPenguji ? (
                                    <div className="space-y-1">
                                        <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-[100px] overflow-y-auto">
                                            {studentSidang.revisiPenguji}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-2">Segera perbaiki dan temui dosen.</p>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="text-2xl font-bold">-</div>
                                        <p className="text-xs text-muted-foreground">Tidak ada revisi</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Jadwal Widget for Student */}
                    <Card className="mt-6 border-l-4 border-l-indigo-600">
                        <CardHeader className="pb-3 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-bold">Jadwal Mendatang</CardTitle>
                                <CardDescription>Agenda kegiatan magang/PKL yang akan datang</CardDescription>
                            </div>
                            <div className="bg-indigo-50 p-2 rounded-full">
                                <Calendar className="h-5 w-5 text-indigo-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {jadwalData
                                    .filter(item => item.kategori === 'GENERAL' || (pendaftaranData && item.kategori === pendaftaranData.tipe))
                                    .filter(item => new Date(item.tanggal) >= new Date().setHours(0, 0, 0, 0))
                                    .slice(0, 5)
                                    .map((item) => (
                                        <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg border bg-gray-50/50 hover:bg-white transition-colors">
                                            <div className="flex flex-col items-center justify-center min-w-[60px] p-2 bg-indigo-600 text-white rounded-md shadow-sm">
                                                <span className="text-[10px] uppercase font-bold text-indigo-100">{new Date(item.tanggal).toLocaleDateString('id-ID', { month: 'short' })}</span>
                                                <span className="text-xl font-black leading-none">{new Date(item.tanggal).getDate()}</span>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-gray-900 leading-tight">{item.namaKegiatan}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.kategori === 'GENERAL' ? 'bg-gray-200 text-gray-600' : 'bg-indigo-100 text-indigo-700'
                                                        }`}>
                                                        {item.kategori}
                                                    </span>
                                                    <span className="text-xs text-gray-500">{formatDate(item.tanggal)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                {jadwalData.filter(item => item.kategori === 'GENERAL' || (pendaftaranData && item.kategori === pendaftaranData.tipe)).length === 0 && (
                                    <p className="text-center text-gray-500 py-4 italic text-sm">Belum ada jadwal kegiatan mendatang.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Detailed Logbook Stats for MAHASISWA */}
                    {stats && stats.logbookStats && (
                        <div className="grid gap-4 md:grid-cols-2 mt-6">
                            <Card className="border-l-4 border-l-blue-600 bg-white">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-lg font-bold">Progress Logbook Harian</CardTitle>
                                        <div className="bg-blue-50 p-2 rounded-full">
                                            <FileText className="h-5 w-5 text-blue-600" />
                                        </div>
                                    </div>
                                    <CardDescription>Target pengisian logbook berdasarkan hari kerja PKL</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div>
                                            <p className="text-[10px] text-gray-500 uppercase font-bold">Harus Diisi</p>
                                            <p className="text-2xl font-black text-gray-900">{stats.logbookStats.daily.target}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-500 uppercase font-bold">Sudah Terisi</p>
                                            <p className="text-2xl font-black text-green-600">{stats.logbookStats.daily.filled}</p>
                                        </div>
                                        <div className={`rounded-lg py-2 border ${stats.logbookStats.daily.target - stats.logbookStats.daily.filled > 0 ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                                            <p className={`text-[10px] uppercase font-bold ${stats.logbookStats.daily.target - stats.logbookStats.daily.filled > 0 ? 'text-red-700' : 'text-green-700'}`}>Belum Diisi</p>
                                            <p className={`text-2xl font-black ${stats.logbookStats.daily.target - stats.logbookStats.daily.filled > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                {Math.max(0, stats.logbookStats.daily.target - stats.logbookStats.daily.filled)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-4 w-full bg-gray-100 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${Math.min(100, (stats.logbookStats.daily.filled / stats.logbookStats.daily.target) * 100) || 0}%` }}
                                        ></div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-l-4 border-l-purple-600 bg-white">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-lg font-bold">Progress Laporan Mingguan</CardTitle>
                                        <div className="bg-purple-50 p-2 rounded-full">
                                            <Calendar className="h-5 w-5 text-purple-600" />
                                        </div>
                                    </div>
                                    <CardDescription>Target pengisian laporan berdasarkan minggu aktif PKL</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div>
                                            <p className="text-[10px] text-gray-500 uppercase font-bold">Harus Diisi</p>
                                            <p className="text-2xl font-black text-gray-900">{stats.logbookStats.weekly.target}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-500 uppercase font-bold">Sudah Terisi</p>
                                            <p className="text-2xl font-black text-green-600">{stats.logbookStats.weekly.filled}</p>
                                        </div>
                                        <div className={`rounded-lg py-2 border ${stats.logbookStats.weekly.target - stats.logbookStats.weekly.filled > 0 ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                                            <p className={`text-[10px] uppercase font-bold ${stats.logbookStats.weekly.target - stats.logbookStats.weekly.filled > 0 ? 'text-red-700' : 'text-green-700'}`}>Belum Diisi</p>
                                            <p className={`text-2xl font-black ${stats.logbookStats.weekly.target - stats.logbookStats.weekly.filled > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                {Math.max(0, stats.logbookStats.weekly.target - stats.logbookStats.weekly.filled)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-4 w-full bg-gray-100 rounded-full h-2">
                                        <div
                                            className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${Math.min(100, (stats.logbookStats.weekly.filled / stats.logbookStats.weekly.target) * 100) || 0}%` }}
                                        ></div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            );
        }

        if (role === 'DOSEN' && stats) {
            return (
                <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-sm font-medium">Periode Aktif</CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.periode ? stats.periode.nama : '-'}</div>
                                <p className="text-xs text-muted-foreground">{stats.periode ? `${formatDate(stats.periode.tanggalMulai)} - ${formatDate(stats.periode.tanggalSelesai)}` : 'Tidak ada'}</p>
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

                    <div className="grid gap-6 md:grid-cols-3 mt-6">
                        {/* Jadwal Widget for Lecturer */}
                        <Card className="md:col-span-1 border-l-4 border-l-indigo-600">
                            <CardHeader className="pb-3">
                                <div className="flex flex-row items-center justify-between group">
                                    <div>
                                        <CardTitle className="text-lg font-bold">Agenda Kegiatan</CardTitle>
                                        <CardDescription>Jadwal program magang/PKL</CardDescription>
                                    </div>
                                    <div className="bg-indigo-50 p-2 rounded-full group-hover:bg-indigo-100 transition-colors">
                                        <Calendar className="h-5 w-5 text-indigo-600" />
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <Select value={agendaFilter} onValueChange={setAgendaFilter}>
                                        <SelectTrigger className="w-full h-8 text-[11px] font-semibold bg-white">
                                            <div className="flex items-center gap-2">
                                                <Filter className="h-3 w-3 text-indigo-500" />
                                                <SelectValue placeholder="Semua Kategori" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ALL" className="text-xs font-medium">Semua Agenda</SelectItem>
                                            <SelectItem value="PKL" className="text-xs font-medium text-blue-600">Filter PKL (1 & 2)</SelectItem>
                                            <SelectItem value="MBKM" className="text-xs font-medium text-orange-600">Filter MBKM (1 & 2)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {jadwalData
                                        .filter(item => {
                                            const itemDate = new Date(item.tanggal);
                                            const isFuture = itemDate >= new Date().setHours(0, 0, 0, 0);
                                            if (!isFuture) return false;

                                            if (agendaFilter === 'ALL') return true;
                                            if (item.kategori === 'GENERAL') return true;

                                            // Handle PKL grouping
                                            if (agendaFilter === 'PKL') {
                                                return item.kategori === 'PKL1' || item.kategori === 'PKL2';
                                            }
                                            // Handle MBKM grouping
                                            if (agendaFilter === 'MBKM') {
                                                return item.kategori === 'MBKM' || item.kategori === 'MBKM2';
                                            }

                                            return item.kategori === agendaFilter;
                                        })
                                        .slice(0, 5)
                                        .map((item) => (
                                            <div key={item.id} className="flex items-start gap-3 p-2.5 rounded-lg border bg-white shadow-sm hover:border-indigo-200 transition-all group">
                                                <div className="flex flex-col items-center justify-center min-w-[45px] py-1.5 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-colors">
                                                    <span className="text-[9px] uppercase font-black opacity-80">{new Date(item.tanggal).toLocaleDateString('id-ID', { month: 'short' })}</span>
                                                    <span className="text-base font-black leading-none">{new Date(item.tanggal).getDate()}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-sm text-gray-900 truncate group-hover:text-indigo-700 transition-colors">{item.namaKegiatan}</h4>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter ${item.kategori === 'GENERAL' ? 'bg-slate-100 text-slate-600' :
                                                            item.kategori.startsWith('PKL') ? 'bg-blue-50 text-blue-600' :
                                                                'bg-orange-50 text-orange-600'
                                                            }`}>
                                                            {item.kategori}
                                                        </span>
                                                        <span className="text-[10px] text-gray-500 font-medium">{formatDate(item.tanggal)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    {jadwalData.filter(item => {
                                        if (agendaFilter === 'ALL') return true;
                                        if (item.kategori === 'GENERAL') return true;
                                        if (agendaFilter === 'PKL') return item.kategori === 'PKL1' || item.kategori === 'PKL2';
                                        if (agendaFilter === 'MBKM') return item.kategori === 'MBKM' || item.kategori === 'MBKM2';
                                        return item.kategori === agendaFilter;
                                    }).length === 0 && (
                                            <div className="flex flex-col items-center justify-center py-8 text-center bg-gray-50 rounded-lg border-2 border-dashed">
                                                <Calendar className="h-8 w-8 text-gray-300 mb-2" />
                                                <p className="text-gray-500 italic text-xs">Belum ada agenda kegiatan.</p>
                                            </div>
                                        )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Existing Logbook Stats wrapping inside grid */}
                        <div className="md:col-span-2 space-y-6">
                            {stats.logbookStats && (
                                /* existing logbook stats cards */
                                <div className="grid gap-4 md:grid-cols-2">
                                    {/* ... same daily/weekly cards ... */}
                                </div>
                            )}

                            {/* [NEW] Supervised Students List */}
                            {stats.bimbinganList && stats.bimbinganList.length > 0 && (
                                <Card className="border-t-4 border-t-green-600">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle>Mahasiswa Bimbingan</CardTitle>
                                                <CardDescription>Daftar mahasiswa yang Anda bimbing periode ini.</CardDescription>
                                            </div>
                                            <Users className="h-5 w-5 text-green-600" />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="border-b text-left text-muted-foreground uppercase text-[10px] font-bold">
                                                        <th className="pb-2">Nama / NIM</th>
                                                        <th className="pb-2">Instansi</th>
                                                        <th className="pb-2 text-right">Kontak</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y">
                                                    {stats.bimbinganList.map((mhs) => (
                                                        <tr key={mhs.id} className="hover:bg-slate-50 transition-colors">
                                                            <td className="py-3">
                                                                <div className="font-bold text-gray-900">{mhs.nama}</div>
                                                                <div className="text-[10px] text-muted-foreground font-mono">{mhs.nim}</div>
                                                            </td>
                                                            <td className="py-3 text-xs text-slate-600">{mhs.instansi || '-'}</td>
                                                            <td className="py-3 text-right">
                                                                {mhs.noHp ? (
                                                                    <a
                                                                        href={`https://wa.me/${mhs.noHp.replace(/\D/g, '')}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-100 text-green-700 text-[10px] font-bold hover:bg-green-200"
                                                                    >
                                                                        <Phone className="h-3 w-3" />
                                                                        {mhs.noHp}
                                                                    </a>
                                                                ) : (
                                                                    <span className="text-[10px] text-gray-400 italic">No contact</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        if (role === 'ADMIN' && stats) {
            return (
                <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Periode Aktif</CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.periode ? stats.periode.nama : 'Tidak Ada'}</div>
                                <p className="text-xs text-muted-foreground">{stats.periode ? `${formatDate(stats.periode.tanggalMulai)} - ${formatDate(stats.periode.tanggalSelesai)}` : 'Buat periode baru'}</p>
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
                                <p className="text-xs text-muted-foreground">Pembuatan Sistem Informasi</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">MBKM 1</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.breakdown.MBKM}</div>
                                <p className="text-xs text-muted-foreground">Program MBKM 1</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">MBKM 2</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.breakdown.MBKM2}</div>
                                <p className="text-xs text-muted-foreground">Program MBKM 2</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Statistik Status Pendaftaran</CardTitle>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={stats.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Legend />
                                        <Bar dataKey="PKL1" stackId="a" fill="#0088FE" radius={[0, 0, 4, 4]} name="PKL 1" />
                                        <Bar dataKey="PKL2" stackId="a" fill="#00C49F" radius={[0, 0, 0, 0]} name="PKL 2" />
                                        <Bar dataKey="MBKM" stackId="a" fill="#FFBB28" radius={[0, 0, 0, 0]} name="MBKM 1" />
                                        <Bar dataKey="MBKM2" stackId="a" fill="#FF8042" radius={[4, 4, 0, 0]} name="MBKM 2" />
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
            );
        }

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
