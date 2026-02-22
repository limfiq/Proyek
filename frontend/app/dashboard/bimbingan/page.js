'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GradingForm } from '@/components/dashboard/GradingForm';
import { Pagination } from '@/components/ui/pagination';
import api from '@/lib/api';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"; // [NEW]

import { CheckCircle, XCircle, FileText, BookOpen } from 'lucide-react';

export default function BimbinganPage() {
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]); // [NEW]
    const [periodes, setPeriodes] = useState([]); // [NEW]
    const [selectedPeriode, setSelectedPeriode] = useState(''); // [NEW]
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedWeek, setSelectedWeek] = useState('ALL'); // [NEW]
    const [role, setRole] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    useEffect(() => {
        setRole(localStorage.getItem('role'));
        const loadStudents = async () => {
            try {
                const [res, resPeriode] = await Promise.all([
                    api.get('/api/pkl/bimbingan'),
                    api.get('/api/periode')
                ]); // [NEW] Fetch periods

                setStudents(res.data);
                setPeriodes(resPeriode.data);

                // [NEW] Default to active period
                const active = resPeriode.data.find(p => p.isActive);
                if (active) {
                    setSelectedPeriode(String(active.id));
                } else {
                    setSelectedPeriode('ALL');
                }
            } catch (err) {
                console.error(err);
            }
        };
        loadStudents();
    }, []);

    // [NEW] Filter Logic
    useEffect(() => {
        let res = students;
        if (selectedPeriode && selectedPeriode !== 'ALL') {
            res = res.filter(s => String(s.periodeId) === String(selectedPeriode));
        }
        setFilteredStudents(res);
        setCurrentPage(1); // Reset page on filter change
    }, [selectedPeriode, students]);

    const [logbookFeedback, setLogbookFeedback] = useState({}); // [NEW]
    const [mingguanFeedback, setMingguanFeedback] = useState({}); // [NEW]
    const [mingguanSignedFileUrl, setMingguanSignedFileUrl] = useState({}); // [NEW]

    const [showLogbook, setShowLogbook] = useState(null);
    const [logbooks, setLogbooks] = useState([]);

    const [showMingguan, setShowMingguan] = useState(null);
    const [mingguanList, setMingguanList] = useState([]);

    const loadMingguan = async (pendaftaranId) => {
        try {
            const res = await api.get(`/api/laporan/mingguan?pendaftaranId=${pendaftaranId}`);
            setMingguanList(res.data);
            setShowMingguan(pendaftaranId);
        } catch (err) {
            console.error(err);
        }
    };

    const approveMingguan = async (id, status = 'APPROVED') => {
        try {
            const currentSigned = mingguanSignedFileUrl[id] || '';
            const currentFeedback = mingguanFeedback[id] || '';

            const payload = { status };
            if (currentSigned) payload.signedFileUrl = currentSigned;
            if (currentFeedback) payload.feedback = currentFeedback;

            await api.put(`/api/laporan/mingguan/${id}/approve`, payload);
            // Refresh mingguan
            const updated = mingguanList.map(l => l.id === id ? { ...l, status, signedFileUrl: currentSigned || l.signedFileUrl, feedback: currentFeedback || l.feedback } : l);
            setMingguanList(updated);

            // Clear specific entry state
            setMingguanSignedFileUrl(prev => ({ ...prev, [id]: '' }));
            setMingguanFeedback(prev => ({ ...prev, [id]: '' }));
        } catch (err) {
            alert('Gagal update status');
        }
    };

    const loadLogbooks = async (pendaftaranId) => {
        try {
            const res = await api.get(`/api/laporan/harian?pendaftaranId=${pendaftaranId}`);
            setLogbooks(res.data);
            setShowLogbook(pendaftaranId);
        } catch (err) {
            console.error(err);
        }
    };

    const approveLogbook = async (id, status = 'APPROVED') => {
        try {
            const currentFeedback = logbookFeedback[id] || '';
            await api.put(`/api/laporan/harian/${id}/approve`, { status, feedback: currentFeedback });
            // Refresh logbooks
            const updated = logbooks.map(l => l.id === id ? { ...l, status, feedback: currentFeedback || l.feedback } : l);
            setLogbooks(updated);
            setLogbookFeedback(prev => ({ ...prev, [id]: '' }));
        } catch (err) {
            alert('Gagal update status logbook');
        }
    };

    const [showTengah, setShowTengah] = useState(null);
    const [laporanTengah, setLaporanTengah] = useState(null);

    const [showAkhir, setShowAkhir] = useState(null);
    const [laporanAkhir, setLaporanAkhir] = useState(null);

    const checkLaporanTengah = async (pendaftaranId) => {
        try {
            const res = await api.get(`/api/laporan/tengah?pendaftaranId=${pendaftaranId}`);
            if (res.data) {
                setLaporanTengah(res.data);
                setShowTengah(true);
            } else {
                alert('Mahasiswa belum upload laporan tengah.');
            }
        } catch (err) {
            console.error(err);
            alert('Mahasiswa belum upload laporan tengah.');
        }
    };

    const checkLaporanAkhir = async (pendaftaranId) => {
        try {
            const res = await api.get(`/api/laporan/akhir?pendaftaranId=${pendaftaranId}`);
            if (res.data) {
                setLaporanAkhir(res.data);
                setShowAkhir(true);
            } else {
                alert('Mahasiswa belum upload laporan akhir.');
            }
        } catch (err) {
            console.error(err);
            alert('Mahasiswa belum upload laporan akhir.');
        }
    };

    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    const currentData = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Daftar Mahasiswa Bimbingan</h1>
                {/* [NEW] Period Filter */}
                <div className="w-[200px]">
                    <Select value={selectedPeriode} onValueChange={setSelectedPeriode}>
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih Periode" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Semua Periode</SelectItem>
                            {periodes.map(p => (
                                <SelectItem key={p.id} value={String(p.id)}>
                                    {p.nama} {p.isActive ? '(Aktif)' : ''}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentData.map(mhs => {
                    const isActivePeriod = periodes.find(p => String(p.id) === String(mhs.periodeId))?.isActive;
                    return (
                        <Card key={mhs.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">{mhs.mahasiswa.nama}</CardTitle>
                                <p className="text-sm text-gray-500">{mhs.mahasiswa.nim}</p>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col gap-2">
                                    {mhs.tipe}
                                    {mhs.judulProject && <p className="text-sm italic">"{mhs.judulProject}"</p>}

                                    <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                                        <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded" onClick={() => loadLogbooks(mhs.id)}>
                                            <BookOpen className="h-4 w-4 text-blue-500" />
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-xs">Harian</span>
                                                <div className="flex gap-2 text-[10px] text-gray-500">
                                                    <span className="text-green-600">Diisi: {mhs.stats?.logbookCount || 0}</span>
                                                    <span className="text-red-500">Belum: {mhs.stats?.missingLogbooks || 0}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded" onClick={() => loadMingguan(mhs.id)}>
                                            <BookOpen className="h-4 w-4 text-purple-500" />
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-xs">Mingguan</span>
                                                <span className="text-xs text-gray-500">{mhs.stats?.mingguanCount || 0} entri</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded" onClick={() => checkLaporanTengah(mhs.id)}>
                                            {mhs.stats?.hasLaporanTengah ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-gray-400" />}
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-xs">Lap. Tengah</span>
                                                <span className="text-[10px] text-gray-500">{mhs.stats?.hasLaporanTengah ? 'Uploaded' : 'Belum'}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded" onClick={() => checkLaporanAkhir(mhs.id)}>
                                            {mhs.stats?.hasLaporanAkhir ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-gray-400" />}
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-xs">Lap. Akhir</span>
                                                <span className="text-[10px] text-gray-500">{mhs.stats?.hasLaporanAkhir ? 'Uploaded' : 'Belum'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        size="sm"
                                        className={`mt-4 w-full ${mhs.alreadyGraded ? 'bg-orange-600 hover:bg-orange-700' : ''}`}
                                        onClick={() => setSelectedStudent(mhs.id)}
                                        disabled={!isActivePeriod} // [NEW] Disable if inactive
                                        title={!isActivePeriod ? "Periode tidak aktif" : undefined}
                                    >
                                        {mhs.alreadyGraded ? 'Edit Nilai' : 'Input Nilai'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />

            {
                selectedStudent && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <GradingForm
                            pendaftaranId={selectedStudent}
                            role={role}
                            gradingRole={role === 'DOSEN' ? 'PEMBIMBING' : 'INSTANSI'}
                            type={students.find(s => s.id === selectedStudent)?.tipe}
                            onClose={() => setSelectedStudent(null)}
                        />
                    </div>
                )
            }

            {
                showLogbook && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Logbook Harian</CardTitle>
                                <div className="flex items-center gap-2">
                                    {/* [NEW] Week Filter */}
                                    <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                                        <SelectTrigger className="w-[140px]">
                                            <SelectValue placeholder="Semua Minggu" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ALL">Semua Minggu</SelectItem>
                                            {[...Array(24)].map((_, i) => (
                                                <SelectItem key={i + 1} value={String(i + 1)}>Minggu ke-{i + 1}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button variant="ghost" size="sm" onClick={() => { setShowLogbook(null); setSelectedWeek('ALL'); }}>X</Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {(() => {
                                        // Filter Logic
                                        const student = students.find(s => s.id === showLogbook);
                                        const startDate = student?.periode?.tanggalMulai;

                                        let filteredLogbooks = logbooks;
                                        if (selectedWeek !== 'ALL' && startDate) {
                                            filteredLogbooks = logbooks.filter(l => {
                                                const logDate = new Date(l.tanggal);
                                                logDate.setHours(0, 0, 0, 0);
                                                const start = new Date(startDate);
                                                start.setHours(0, 0, 0, 0);

                                                const diffTime = logDate - start;
                                                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                                                const weekNum = Math.floor(diffDays / 7) + 1;
                                                return String(weekNum) === String(selectedWeek);
                                            });
                                        }

                                        if (filteredLogbooks.length === 0) return <p className="text-center text-gray-500">Belum ada logbook{selectedWeek !== 'ALL' ? ' di minggu ini' : ''}.</p>;

                                        return filteredLogbooks.map(l => (
                                            <div key={l.id} className="border p-3 rounded flex flex-col gap-3">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-bold text-sm">{l.tanggal}</p>
                                                        <p className="text-sm mt-1 whitespace-pre-wrap">{l.kegiatan}</p>
                                                        {l.lokasi && <p className="text-xs text-gray-500 mt-1">📍 {l.lokasi}</p>}
                                                        {l.foto && (
                                                            <div className="mt-2">
                                                                <a href={l.foto} target="_blank" rel="noreferrer" className="text-blue-600 text-xs underline">
                                                                    Lihat Foto
                                                                </a>
                                                            </div>
                                                        )}
                                                        {l.feedback && <p className="text-xs text-orange-600 mt-1">Komentar: {l.feedback}</p>}
                                                    </div>
                                                    <span className={`text-xs px-2 py-1 rounded-full ${l.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                        {l.status}
                                                    </span>
                                                </div>

                                                {l.status !== 'APPROVED' && (
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Beri komentar / Catatan Revisi"
                                                            className="flex-1 text-sm p-2 border rounded"
                                                            value={logbookFeedback[l.id] || ''}
                                                            onChange={(e) => setLogbookFeedback(prev => ({ ...prev, [l.id]: e.target.value }))}
                                                        />
                                                        <div className="flex gap-1">
                                                            <Button size="xs" onClick={() => approveLogbook(l.id, 'APPROVED')} disabled={!periodes.find(p => String(p.id) === String(students.find(s => s.id === showLogbook)?.periodeId))?.isActive}>Approve</Button>
                                                            <Button size="xs" variant="destructive" onClick={() => approveLogbook(l.id, 'REJECTED')} disabled={!periodes.find(p => String(p.id) === String(students.find(s => s.id === showLogbook)?.periodeId))?.isActive}>Revisi</Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ));
                                    })()}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )
            }

            {
                showMingguan && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <Card className="w-full max-w-3xl max-h-[80vh] overflow-y-auto">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Logbook Mingguan</CardTitle>
                                <Button variant="ghost" size="sm" onClick={() => setShowMingguan(null)}>X</Button>
                            </CardHeader>
                            <CardContent>
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-700 font-medium">
                                        <tr>
                                            <th className="p-3">Minggu</th>
                                            <th className="p-3">Link</th>
                                            <th className="p-3">Status</th>
                                            <th className="p-3">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {mingguanList.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="p-4 text-center text-gray-500">Belum ada laporan mingguan.</td>
                                            </tr>
                                        )}
                                        {mingguanList.map((item) => (
                                            <tr key={item.id} className="border-t">
                                                <td className="p-3 font-bold text-center">{item.mingguKe}</td>
                                                <td className="p-3">
                                                    <a href={item.fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                                                        Buka Link
                                                    </a>
                                                </td>
                                                <td className="p-3">
                                                    <span className={`text-xs px-2 py-1 rounded-full ${item.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'}`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="p-3">
                                                    {item.status !== 'APPROVED' && (
                                                        <div className="flex flex-col gap-2">
                                                            <input
                                                                type="text"
                                                                placeholder="Link TTD (opsional)"
                                                                className="text-xs p-1 border rounded"
                                                                value={mingguanSignedFileUrl[item.id] || ''}
                                                                onChange={(e) => setMingguanSignedFileUrl(prev => ({ ...prev, [item.id]: e.target.value }))}
                                                            />
                                                            <textarea
                                                                placeholder="Catatan Revisi / Feedback"
                                                                className="text-xs p-1 border rounded"
                                                                rows="2"
                                                                value={mingguanFeedback[item.id] || ''}
                                                                onChange={(e) => setMingguanFeedback(prev => ({ ...prev, [item.id]: e.target.value }))}
                                                            />
                                                            <div className="flex gap-1">
                                                                <Button size="xs" onClick={() => approveMingguan(item.id, 'APPROVED')} disabled={!periodes.find(p => String(p.id) === String(students.find(s => s.id === showMingguan)?.periodeId))?.isActive}>Approve</Button>
                                                                <Button size="xs" variant="destructive" onClick={() => approveMingguan(item.id, 'REJECTED')} disabled={!periodes.find(p => String(p.id) === String(students.find(s => s.id === showMingguan)?.periodeId))?.isActive}>Revisi</Button>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {item.signedFileUrl && (
                                                        <a href={item.signedFileUrl} target="_blank" rel="noreferrer" className="text-xs text-green-600 block mt-1 hover:underline">
                                                            Lihat TTD
                                                        </a>
                                                    )}
                                                    {item.feedback && (
                                                        <p className="text-xs text-red-500 mt-1">Revisi: {item.feedback}</p>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    </div>
                )
            }

            {
                showTengah && laporanTengah && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <Card className="w-full max-w-md">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Laporan Tengah</CardTitle>
                                <Button variant="ghost" size="sm" onClick={() => { setShowTengah(null); setLaporanTengah(null); }}>X</Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-bold block mb-1">File/Link:</label>
                                    <a href={laporanTengah.fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline text-sm break-all">
                                        {laporanTengah.fileUrl}
                                    </a>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )
            }

            {
                showAkhir && laporanAkhir && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <Card className="w-full max-w-md">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Laporan Akhir</CardTitle>
                                <Button variant="ghost" size="sm" onClick={() => { setShowAkhir(null); setLaporanAkhir(null); }}>X</Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-bold block mb-1">File/Link:</label>
                                    <a href={laporanAkhir.fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline text-sm break-all">
                                        {laporanAkhir.fileUrl}
                                    </a>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )
            }
        </div >
    );
}
