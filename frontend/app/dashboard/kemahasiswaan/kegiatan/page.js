'use strict';
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Trash2, Edit } from 'lucide-react';
import api from '@/lib/api';

export default function KegiatanPage() {
    const [kegiatanList, setKegiatanList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchKegiatan();
    }, []);

    const fetchKegiatan = async () => {
        try {
            const res = await api.get('/api/kegiatan');
            setKegiatanList(res.data);
        } catch (error) {
            console.error('Failed to fetch kegiatan:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure?')) {
            try {
                await api.delete(`/api/kegiatan/${id}`);
                fetchKegiatan();
            } catch (error) {
                console.error('Failed to delete kegiatan:', error);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Info Kegiatan Kemahasiswaan</h1>
                <Link href="/dashboard/kemahasiswaan/kegiatan/add" className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90">
                    <Plus className="w-4 h-4" /> Tambah Kegiatan
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 font-semibold text-gray-600">Judul Kegiatan</th>
                            <th className="p-4 font-semibold text-gray-600">Lokasi</th>
                            <th className="p-4 font-semibold text-gray-600">Tanggal</th>
                            <th className="p-4 font-semibold text-gray-600">Status</th>
                            <th className="p-4 font-semibold text-gray-600 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {isLoading ? (
                            <tr><td colSpan="5" className="p-4 text-center">Loading...</td></tr>
                        ) : kegiatanList.length === 0 ? (
                            <tr><td colSpan="5" className="p-4 text-center text-gray-500">Belum ada data kegiatan</td></tr>
                        ) : (
                            kegiatanList.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50/50">
                                    <td className="p-4 font-medium text-gray-800">{item.judul}</td>
                                    <td className="p-4 text-gray-600">{item.lokasi}</td>
                                    <td className="p-4 text-gray-600 text-sm">
                                        {new Date(item.tanggal).toLocaleDateString('id-ID', {
                                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                        })}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'UPCOMING' ? 'bg-blue-100 text-blue-700' :
                                                item.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 p-2">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
