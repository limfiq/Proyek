'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Printer, FileText, Search, MapPin, Camera, Download, Filter, RefreshCw, ExternalLink, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { exportToExcel, exportToPDF } from '@/lib/exportUtils';
import { formatDate } from '@/lib/utils';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function AdminSppdPage() {
    const [sppdList, setSppdList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [periodes, setPeriodes] = useState([]);
    const [dosens, setDosens] = useState([]);
    const [selectedPeriode, setSelectedPeriode] = useState('ALL');
    const [selectedDosen, setSelectedDosen] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        loadSppd();
    }, [selectedPeriode, selectedDosen]);

    const loadInitialData = async () => {
        try {
            const [perRes, dosRes] = await Promise.all([
                api.get('/api/periode'),
                api.get('/api/users?role=DOSEN')
            ]);
            setPeriodes(perRes.data);
            setDosens(dosRes.data.filter(u => u.dosen).map(u => ({ id: u.dosen.id, nama: u.nama })));

            const active = perRes.data.find(p => p.isActive);
            if (active) setSelectedPeriode(String(active.id));
        } catch (err) {
            console.error('Failed to load initial data:', err);
        }
    };

    const loadSppd = async () => {
        setLoading(true);
        try {
            let url = '/api/sppd/admin/all?';
            if (selectedPeriode !== 'ALL') url += `periodeId=${selectedPeriode}&`;
            if (selectedDosen !== 'ALL') url += `dosenId=${selectedDosen}&`;

            const res = await api.get(url);
            setSppdList(res.data.filter(item => item));
        } catch (err) {
            console.error('Failed to load SPPD:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredList = sppdList.filter(item => {
        const query = searchQuery.toLowerCase();
        const dosenName = item.dosen?.user?.nama?.toLowerCase() || '';
        const mhsName = item.pendaftaran?.mahasiswa?.nama?.toLowerCase() || '';
        const instansiName = item.pendaftaran?.instansi?.nama?.toLowerCase() || '';
        return dosenName.includes(query) || mhsName.includes(query) || instansiName.includes(query);
    });

    const handleExportExcel = () => {
        const data = filteredList.map((item, index) => ({
            No: index + 1,
            Tanggal: formatDate(item.tanggal),
            Dosen: item.dosen?.user?.nama,
            Mahasiswa: item.pendaftaran?.mahasiswa?.nama,
            Instansi: item.pendaftaran?.instansi?.nama,
            Lokasi: item.lokasi,
            Ditemui: item.yangDitemui,
            Koordinat: item.koordinat || '-',
            Keterangan: item.keterangan || '-'
        }));
        exportToExcel(data, `Rekap_SPPD_${new Date().getTime()}`);
    };

    const handleExportPDF = () => {
        const columns = ['No', 'Tanggal', 'Dosen', 'Mahasiswa', 'Instansi', 'Lokasi', 'Keterangan'];
        const data = filteredList.map((item, index) => [
            index + 1,
            formatDate(item.tanggal),
            item.dosen?.user?.nama,
            item.pendaftaran?.mahasiswa?.nama,
            item.pendaftaran?.instansi?.nama,
            item.lokasi,
            item.keterangan || '-'
        ]);
        exportToPDF(columns, data, 'Rekapitulasi SPPD Dosen');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Rekapitulasi SPPD</h1>
                    <p className="text-sm text-gray-500">Monitoring kunjungan lapangan (Supervisi) oleh Dosen Pembimbing</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleExportExcel} className="gap-2">
                        <Download className="h-4 w-4" /> Excel
                    </Button>
                    <Button variant="outline" onClick={handleExportPDF} className="gap-2">
                        <Printer className="h-4 w-4" /> PDF
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Cari Dosen/Mhs/Instansi..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Select value={selectedPeriode} onValueChange={setSelectedPeriode}>
                            <SelectTrigger>
                                <SelectValue placeholder="Semua Periode" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Semua Periode</SelectItem>
                                {periodes.map(p => (
                                    <SelectItem key={p.id} value={String(p.id)}>{p.nama} {p.isActive ? '(Aktif)' : ''}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={selectedDosen} onValueChange={setSelectedDosen}>
                            <SelectTrigger>
                                <SelectValue placeholder="Semua Dosen" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Semua Dosen</SelectItem>
                                {dosens.map(d => (
                                    <SelectItem key={d.id} value={String(d.id)}>{d.nama}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button variant="ghost" onClick={() => { setSelectedPeriode('ALL'); setSelectedDosen('ALL'); setSearchQuery(''); }} className="gap-2">
                            <RefreshCw className="h-4 w-4" /> Reset
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-hidden">
                        <Table>
                            <TableHeader className="bg-gray-50">
                                <TableRow>
                                    <TableHead className="w-[50px] text-center">No</TableHead>
                                    <TableHead>Dosen & Tanggal</TableHead>
                                    <TableHead>Mahasiswa & Instansi</TableHead>
                                    <TableHead>Kunjungan</TableHead>
                                    <TableHead className="text-center">Dokumentasi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-32 text-center text-gray-400">
                                            Memuat data...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredList.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-32 text-center text-gray-400">
                                            Tidak ada data SPPD ditemukan.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredList.map((item, index) => (
                                        <TableRow key={item.id} className="hover:bg-gray-50/50">
                                            <TableCell className="text-center font-medium text-gray-500">{index + 1}</TableCell>
                                            <TableCell>
                                                <div className="font-bold text-gray-900">{item.dosen?.user?.nama}</div>
                                                <div className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-0.5">
                                                    <FileText className="h-3 w-3" /> {formatDate(item.tanggal)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-semibold text-primary">{item.pendaftaran?.mahasiswa?.nama}</div>
                                                <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                    <Building2 className="h-3 w-3" /> {item.pendaftaran?.instansi?.nama}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm font-medium">{item.yangDitemui}</div>
                                                <div className="text-[10px] text-gray-400 italic line-clamp-1 max-w-[200px]">
                                                    {item.lokasi}
                                                </div>
                                                {item.koordinat && (
                                                    <a
                                                        href={`https://www.google.com/maps/search/?api=1&query=${item.koordinat}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-[10px] text-blue-500 flex items-center gap-0.5 mt-1 hover:underline"
                                                    >
                                                        <MapPin className="h-2.5 w-2.5" /> Lihat Map
                                                    </a>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {item.fotoUrl && (() => {
                                                    let urls = [];
                                                    try {
                                                        const parsed = JSON.parse(item.fotoUrl);
                                                        urls = Array.isArray(parsed) ? parsed : [item.fotoUrl];
                                                    } catch (e) {
                                                        urls = [item.fotoUrl];
                                                    }
                                                    return (
                                                        <div className="flex -space-x-2 justify-center overflow-hidden">
                                                            {urls.slice(0, 3).map((u, i) => (
                                                                <a
                                                                    key={i}
                                                                    href={u}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white overflow-hidden bg-gray-100"
                                                                >
                                                                    <img src={u} alt="SPPD" className="h-full w-full object-cover" />
                                                                </a>
                                                            ))}
                                                            {urls.length > 3 && (
                                                                <div className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-white bg-gray-200 text-[10px] font-bold text-gray-600">
                                                                    +{urls.length - 3}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })()}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
