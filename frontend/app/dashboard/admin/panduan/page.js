'use client';

import { useEffect, useState } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    FileText,
    ExternalLink,
    Upload,
    CheckCircle2,
    XCircle,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import api from '@/lib/api';

export default function AdminPanduanPage() {
    const [guides, setGuides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        id: null,
        judul: '',
        deskripsi: '',
        kategori: 'MAHASISWA',
        isActive: 'true',
        file: null,
        existingFileUrl: ''
    });

    useEffect(() => {
        fetchGuides();
    }, []);

    const fetchGuides = async () => {
        try {
            const res = await api.get('/api/panduan');
            setGuides(res.data);
        } catch (error) {
            console.error("Failed to fetch guides", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (guide = null) => {
        if (guide) {
            setFormData({
                id: guide.id,
                judul: guide.judul,
                deskripsi: guide.deskripsi || '',
                kategori: guide.kategori,
                isActive: String(guide.isActive),
                file: null,
                existingFileUrl: guide.fileUrl || ''
            });
        } else {
            setFormData({
                id: null,
                judul: '',
                deskripsi: '',
                kategori: 'MAHASISWA',
                isActive: 'true',
                file: null,
                existingFileUrl: ''
            });
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const data = new FormData();
        data.append('judul', formData.judul);
        data.append('deskripsi', formData.deskripsi);
        data.append('kategori', formData.kategori);
        data.append('isActive', formData.isActive);
        if (formData.file) {
            data.append('file', formData.file);
        } else {
            data.append('existingFileUrl', formData.existingFileUrl);
        }

        try {
            if (formData.id) {
                await api.put(`/api/panduan/${formData.id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast({ title: "Berhasil", description: "Panduan berhasil diperbarui" });
            } else {
                await api.post('/api/panduan', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast({ title: "Berhasil", description: "Panduan baru berhasil ditambahkan" });
            }
            setIsDialogOpen(false);
            fetchGuides();
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Gagal",
                description: error.response?.data?.message || "Terjadi kesalahan sistem"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Apakah Anda yakin ingin menghapus panduan ini?')) return;
        try {
            await api.delete(`/api/panduan/${id}`);
            toast({ title: "Berhasil", description: "Panduan berhasil dihapus" });
            fetchGuides();
        } catch (error) {
            toast({ variant: "destructive", title: "Gagal", description: "Gagal menghapus panduan" });
        }
    };

    const getFullUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        return `http://localhost:5000${path}`;
    };

    const filteredGuides = guides.filter(g =>
        (g.judul && g.judul.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (g.kategori && g.kategori.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 leading-tight">Manajemen Panduan</h1>
                    <p className="text-sm text-muted-foreground mt-1">Kelola panduan dan ketentuan untuk mahasiswa & mitra.</p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 rounded-xl h-11 px-6 font-bold flex items-center gap-2">
                    <Plus size={18} />
                    Tambah Panduan
                </Button>
            </div>

            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
                <CardHeader className="bg-white border-b border-slate-50 p-6">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Cari judul atau kategori..."
                            className="pl-10 bg-slate-50 border-none focus-visible:ring-primary/20 rounded-xl"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="hover:bg-transparent border-none">
                                <TableHead className="w-12 text-center font-bold text-slate-500 uppercase tracking-wider text-[10px]">No</TableHead>
                                <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Judul & Deskripsi</TableHead>
                                <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Kategori</TableHead>
                                <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Status</TableHead>
                                <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">File</TableHead>
                                <TableHead className="w-28 text-right font-bold text-slate-500 uppercase tracking-wider text-[10px]">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-64 text-center">
                                        <div className="flex flex-col items-center gap-2 text-slate-400">
                                            <Loader2 className="animate-spin" size={32} />
                                            <span className="text-sm font-medium">Memuat data...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredGuides.length > 0 ? (
                                filteredGuides.map((g, idx) => (
                                    <TableRow key={g.id} className="hover:bg-slate-50/50 transition-colors border-slate-50">
                                        <TableCell className="text-center text-slate-400 font-medium text-xs">{idx + 1}</TableCell>
                                        <TableCell>
                                            <div className="max-w-md">
                                                <div className="font-bold text-slate-900 group-hover:text-primary transition-colors">{g.judul}</div>
                                                <div className="text-xs text-slate-500 mt-0.5 line-clamp-1 italic">{g.deskripsi || '-'}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${g.kategori === 'MAHASISWA' ? 'bg-blue-50 text-blue-600' :
                                                g.kategori === 'MITRA' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                {g.kategori}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {g.isActive ? (
                                                <div className="flex items-center gap-1.5 text-green-600 font-bold text-[10px] uppercase tracking-wider">
                                                    <CheckCircle2 size={12} /> Aktif
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                                                    <XCircle size={12} /> Nonaktif
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {g.fileUrl ? (
                                                <a href={getFullUrl(g.fileUrl)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-primary hover:underline font-bold text-xs group">
                                                    <FileText size={14} className="group-hover:scale-110 transition-transform" />
                                                    PANDUAN.PDF
                                                </a>
                                            ) : (
                                                <span className="text-slate-300 text-[10px] font-medium tracking-widest uppercase italic">X NO FILE</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(g)} className="h-8 w-8 rounded-lg text-slate-600 hover:text-primary hover:bg-primary/5">
                                                    <Edit2 size={14} />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(g.id)} className="h-8 w-8 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50">
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-64 text-center">
                                        <div className="flex flex-col items-center gap-2 text-slate-300">
                                            <Search size={40} className="mb-2" />
                                            <span className="text-sm font-semibold">Data panduan tidak ditemukan</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px] border-none shadow-2xl rounded-[1.5rem] overflow-hidden p-0">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader className="bg-slate-900 text-white p-8 space-y-2">
                            <DialogTitle className="text-2xl font-black">{formData.id ? 'Edit Panduan' : 'Tambah Panduan Baru'}</DialogTitle>
                            <DialogDescription className="text-slate-400 font-medium">
                                Masukkan detail panduan dan unggah dokumen pendukung (opsional).
                            </DialogDescription>
                        </DialogHeader>

                        <div className="p-8 space-y-5 bg-white">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Judul Panduan</label>
                                <Input
                                    className="bg-slate-50 border-none h-12 focus-visible:ring-primary/20 rounded-xl font-medium"
                                    value={formData.judul}
                                    onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                                    required
                                    placeholder="Contoh: Panduan Pendaftaran Magang 2024"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Kategori</label>
                                <Select value={formData.kategori} onValueChange={(val) => setFormData({ ...formData, kategori: val })}>
                                    <SelectTrigger className="bg-slate-50 border-none h-12 focus:ring-primary/20 rounded-xl font-medium">
                                        <SelectValue placeholder="Pilih Kategori" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-none shadow-xl">
                                        <SelectItem value="MAHASISWA">MAHASISWA</SelectItem>
                                        <SelectItem value="DOSEN">DOSEN</SelectItem>
                                        <SelectItem value="MITRA">MITRA / INSTANSI</SelectItem>
                                        <SelectItem value="UMUM">UMUM</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Deskripsi Ringkas</label>
                                <Textarea
                                    className="bg-slate-50 border-none min-h-[100px] focus-visible:ring-primary/20 rounded-xl font-medium p-4"
                                    value={formData.deskripsi}
                                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                                    placeholder="Berikan penjelasan singkat mengenai isi panduan ini..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status Publikasi</label>
                                    <Select value={formData.isActive} onValueChange={(val) => setFormData({ ...formData, isActive: val })}>
                                        <SelectTrigger className="bg-slate-50 border-none h-12 focus:ring-primary/20 rounded-xl font-medium">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-none shadow-xl">
                                            <SelectItem value="true">PUBLISH / AKTIF</SelectItem>
                                            <SelectItem value="false">DRAFT / NONAKTIF</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">File Dokumen</label>
                                    <div className="relative group">
                                        <Input
                                            type="file"
                                            className="hidden"
                                            id="guide-file"
                                            onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                                        />
                                        <label
                                            htmlFor="guide-file"
                                            className={`flex items-center justify-center gap-2 h-12 px-4 rounded-xl text-xs font-bold cursor-pointer transition-all border-2 border-dashed ${formData.file ? 'bg-green-50 border-green-200 text-green-700' :
                                                formData.existingFileUrl ? 'bg-blue-50 border-blue-100 text-blue-600' :
                                                    'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                                                }`}
                                        >
                                            {formData.file ? (
                                                <><CheckCircle2 size={16} />{formData.file.name.substring(0, 15)}...</>
                                            ) : (
                                                <><Upload size={16} />{formData.existingFileUrl ? 'Ganti File' : 'Unggah File'}</>
                                            )}
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="bg-slate-50 p-8 pt-6">
                            <Button type="button" variant="ghost" className="rounded-xl font-black uppercase tracking-widest text-[10px] text-slate-400 hover:bg-white" onClick={() => setIsDialogOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={isSubmitting} className="bg-slate-900 hover:bg-slate-800 text-white min-w-[140px] h-12 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-slate-200">
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="animate-spin mr-2" size={16} />
                                        Menyimpan...
                                    </>
                                ) : (
                                    formData.id ? 'Simpan Perubahan' : 'Terbitkan Panduan'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
