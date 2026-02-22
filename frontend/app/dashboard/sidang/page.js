'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GradingForm } from '@/components/dashboard/GradingForm';
import { FileText, Calendar, MapPin, Clock, ExternalLink } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"; // [NEW]
import api from '@/lib/api';

export default function SidangPage() {
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]); // [NEW]
    const [periodes, setPeriodes] = useState([]); // [NEW]
    const [selectedPeriode, setSelectedPeriode] = useState(''); // [NEW]
    const [selectedStudent, setSelectedStudent] = useState(null);

    useEffect(() => {
        loadStudents();
    }, []);

    const loadStudents = async () => {
        try {
            // Attempt to fetch Dosen's specific schedules (list)
            let dosenSidangs = [];
            try {
                // /api/sidang generally returns list for current user in many REST defaults
                const sidRes = await api.get('/api/sidang');
                if (Array.isArray(sidRes.data)) {
                    dosenSidangs = sidRes.data;
                }
            } catch (e) {
                // ignore
            }

            const res = await api.get('/api/pkl/ujian');
            const studentData = res.data;

            // Fetch report and schedule for each student
            const studentsWithReports = await Promise.all(studentData.map(async (student) => {
                // 1. Check from bulk list or embedded
                let sidangData = dosenSidangs.find(s => s.pendaftaranId === student.id) || student.sidang || null;

                // 2. Fallback: individual endpoints (handling Array response)
                if (!sidangData) {
                    const endpoints = [
                        `/api/sidang/schedule?pendaftaranId=${student.id}`,
                        `/api/sidang?pendaftaranId=${student.id}`,
                        `/api/sidang/${student.id}`
                    ];

                    for (const endpoint of endpoints) {
                        try {
                            const sidRes = await api.get(endpoint);
                            const data = sidRes.data;
                            // Check if Array (take 1st) or Object
                            const candidate = Array.isArray(data) ? data[0] : data;

                            if (candidate && (candidate.tanggal || candidate.ruang || candidate.sesi)) {
                                sidangData = candidate;
                                break;
                            }
                        } catch (e) {
                            // try next
                        }
                    }
                }

                try {
                    const reportRes = await api.get(`/api/laporan/akhir?pendaftaranId=${student.id}`);
                    return { ...student, laporanAkhir: reportRes.data, sidang: sidangData };
                } catch (error) {
                    return { ...student, laporanAkhir: null, sidang: sidangData };
                }
            }));

            setStudents(studentsWithReports);

            // [NEW] Fetch Periods
            try {
                const resPeriode = await api.get('/api/periode');
                setPeriodes(resPeriode.data);
                const active = resPeriode.data.find(p => p.isActive);
                if (active) {
                    setSelectedPeriode(String(active.id));
                } else {
                    setSelectedPeriode('ALL');
                }
            } catch (e) {
                console.error("Failed to fetch periods", e);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // [NEW] Filter Logic
    useEffect(() => {
        let res = students;
        if (selectedPeriode && selectedPeriode !== 'ALL') {
            res = res.filter(s => String(s.periodeId) === String(selectedPeriode));
        }
        setFilteredStudents(res);
    }, [selectedPeriode, students]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Penilaian Sidang Magang</h1>
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
                {filteredStudents.map(mhs => {
                    const isActivePeriod = periodes.find(p => String(p.id) === String(mhs.periodeId))?.isActive;
                    return (
                        <Card key={mhs.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">{mhs.mahasiswa.nama}</CardTitle>
                                <p className="text-sm text-gray-500">{mhs.mahasiswa.nim}</p>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col gap-2">
                                    <div className="text-sm bg-purple-50 text-purple-700 px-2 py-1 rounded w-fit">
                                        {mhs.tipe}
                                    </div>
                                    {mhs.judulProject && <p className="text-sm italic">"{mhs.judulProject}"</p>}

                                    {(mhs.sidang || mhs.tanggalSidang) && (
                                        <div className="mt-2 text-sm text-gray-700 space-y-1 bg-gray-50 p-2 rounded border mb-2">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-3 w-3 text-blue-500" />
                                                <span className="font-medium">
                                                    {new Date(mhs.sidang?.tanggal || mhs.tanggalSidang).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-3 w-3 text-orange-500" />
                                                <span>{mhs.sidang?.sesi || '-'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-3 w-3 text-red-500" />
                                                <span>{mhs.sidang?.ruang || '-'}</span>
                                            </div>
                                        </div>
                                    )}

                                    {mhs.laporanAkhir ? (
                                        <a
                                            href={mhs.laporanAkhir.fileUrl || mhs.laporanAkhir}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1"
                                        >
                                            <FileText className="h-4 w-4" />
                                            Lihat Laporan Akhir
                                        </a>
                                    ) : (
                                        <p className="text-xs text-gray-400 italic mt-1 flex items-center gap-1">
                                            <FileText className="h-4 w-4" />
                                            Belum upload laporan akhir
                                        </p>
                                    )}

                                    {mhs.laporanAkhir?.ikuUrl && (
                                        <a
                                            href={mhs.laporanAkhir.ikuUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-sm text-orange-600 hover:underline flex items-center gap-1 mt-1"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                            Lihat Bukti {mhs.laporanAkhir.type_iku || 'IKU'}
                                        </a>
                                    )}

                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="mt-2"
                                        onClick={() => setSelectedStudent(mhs.id)}
                                        disabled={!isActivePeriod} // [NEW] Disable if inactive
                                        title={!isActivePeriod ? "Periode tidak aktif" : undefined}
                                    >
                                        {mhs.alreadyGraded ? 'Edit Nilai Penguji' : 'Input Nilai Penguji'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {selectedStudent && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <GradingForm
                        pendaftaranId={selectedStudent}
                        role="DOSEN"
                        gradingRole="PENGUJI"
                        type={students.find(s => s.id === selectedStudent)?.tipe} // Pass PKL1/PKL2 type
                        onClose={() => setSelectedStudent(null)}
                    />
                </div>
            )}
        </div>
    );
}
