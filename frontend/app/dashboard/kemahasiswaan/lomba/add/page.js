'use strict';
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function AddLombaPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        judul: '',
        deskripsi: '',
        penyelenggara: '',
        tanggalMulai: '',
        tanggalSelesai: '',
        linkPendaftaran: '',
        posterUrl: '', // Optional: file upload logic needed later
        status: 'OPEN'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.post('/api/lomba', formData);
            router.push('/dashboard/kemahasiswaan/lomba');
        } catch (error) {
            console.error('Failed to create lomba:', error);
            alert('Gagal menyimpan data');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/kemahasiswaan/lomba" className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-800">Tambah Lomba Baru</h1>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Judul Lomba</label>
                        <input
                            type="text"
                            name="judul"
                            required
                            value={formData.judul}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Contoh: Hackathon Nasional 2024"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Penyelenggara</label>
                        <input
                            type="text"
                            name="penyelenggara"
                            required
                            value={formData.penyelenggara}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
                            <input
                                type="date"
                                name="tanggalMulai"
                                value={formData.tanggalMulai}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Selesai</label>
                            <input
                                type="date"
                                name="tanggalSelesai"
                                value={formData.tanggalSelesai}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Link Pendaftaran</label>
                        <input
                            type="url"
                            name="linkPendaftaran"
                            value={formData.linkPendaftaran}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="https://..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="OPEN">Open</option>
                            <option value="CLOSED">Closed</option>
                            <option value="UPCOMING">Upcoming</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                        <textarea
                            name="deskripsi"
                            rows="4"
                            value={formData.deskripsi}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        ></textarea>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                        >
                            {isLoading ? 'Menyimpan...' : <><Save className="w-4 h-4" /> Simpan Data</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
