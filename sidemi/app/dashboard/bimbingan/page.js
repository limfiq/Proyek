'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GradingForm } from '@/components/dashboard/GradingForm';
import { Pagination } from '@/components/ui/pagination';
import api from '@/lib/api';

import { CheckCircle, XCircle, FileText, BookOpen } from 'lucide-react';

export default function BimbinganPage() {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [role, setRole] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    useEffect(() => {
        setRole(localStorage.getItem('role'));
        const loadStudents = async () => {
            try {
                const res = await api.get('/api/pkl/bimbingan');
                setStudents(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        loadStudents();
    }, []);

    const [feedback, setFeedback] = useState('');
    const [signedFileUrl, setSignedFileUrl] = useState('');

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

    const approveMingguan = async (id) => {
        try {
            // Include signedFileUrl if provided
            const payload = {};
            if (signedFileUrl) payload.signedFileUrl = signedFileUrl;

            await api.put(`/api/laporan/mingguan/${id}/approve`, payload);
            // Refresh mingguan
            const updated = mingguanList.map(l => l.id === id ? { ...l, status: 'APPROVED', signedFileUrl: signedFileUrl || l.signedFileUrl } : l);
            setMingguanList(updated);
            setSignedFileUrl('');
        } catch (err) {
            alert('Gagal approve');
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

    const approveLogbook = async (id) => {
        try {
            await api.put(`/api/laporan/harian/${id}/approve`, { feedback: feedback });
            // Refresh logbooks
            const updated = logbooks.map(l => l.id === id ? { ...l, status: 'APPROVED', feedback: feedback || l.feedback } : l);
            setLogbooks(updated);
            setFeedback('');
        } catch (err) {
            alert('Gagal approve');
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

    const totalPages = Math.ceil(students.length / itemsPerPage);
    const currentData = students.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Daftar Mahasiswa Bimbingan</h1>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentData.map(mhs => (
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
                                            <span className="text-xs text-gray-500">{mhs.stats?.logbookCount || 0} entri</span>
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
                                >
                                    {mhs.alreadyGraded ? 'Edit Nilai' : 'Input Nilai'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
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
                                <Button variant="ghost" size="sm" onClick={() => setShowLogbook(null)}>X</Button>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {logbooks.length === 0 && <p className="text-center text-gray-500">Belum ada logbook.</p>}
                                    {logbooks.map(l => (
                                        <div key={l.id} className="border p-3 rounded flex flex-col gap-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-bold text-sm">{l.tanggal}</p>
                                                    <p className="text-sm mt-1">{l.kegiatan}</p>
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
                                                        placeholder="Beri komentar (opsional)"
                                                        className="flex-1 text-sm p-2 border rounded"
                                                        value={feedback}
                                                        onChange={(e) => setFeedback(e.target.value)}
                                                    />
                                                    <Button size="xs" onClick={() => approveLogbook(l.id)}>Approve</Button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
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
                                                                value={signedFileUrl}
                                                                onChange={(e) => setSignedFileUrl(e.target.value)}
                                                            />
                                                            <Button size="xs" onClick={() => approveMingguan(item.id)}>Approve</Button>
                                                        </div>
                                                    )}
                                                    {item.signedFileUrl && (
                                                        <a href={item.signedFileUrl} target="_blank" rel="noreferrer" className="text-xs text-green-600 block mt-1 hover:underline">
                                                            Lihat TTD
                                                        </a>
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
