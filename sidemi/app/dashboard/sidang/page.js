'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GradingForm } from '@/components/dashboard/GradingForm';
import { FileText } from 'lucide-react';
import api from '@/lib/api';

export default function SidangPage() {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);

    useEffect(() => {
        loadStudents();
    }, []);

    const loadStudents = async () => {
        try {
            // Fetch students assigned to this user (Dosen Penguji)
            const res = await api.get('/api/pkl/ujian');
            const studentData = res.data;

            // Fetch report for each student
            const studentsWithReports = await Promise.all(studentData.map(async (student) => {
                try {
                    const reportRes = await api.get(`/api/laporan/akhir?pendaftaranId=${student.id}`);
                    return { ...student, laporanAkhir: reportRes.data };
                } catch (error) {
                    return { ...student, laporanAkhir: null };
                }
            }));

            setStudents(studentsWithReports);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Penilaian Sidang PKL</h1>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {students.map(mhs => (
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

                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="mt-2"
                                    onClick={() => setSelectedStudent(mhs.id)}
                                >
                                    {mhs.alreadyGraded ? 'Edit Nilai Penguji' : 'Input Nilai Penguji'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
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
