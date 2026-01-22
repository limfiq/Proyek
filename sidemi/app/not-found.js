'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-900 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                vocab={{ duration: 0.5 }}
                className="text-center space-y-6 max-w-md"
            >
                <div className="flex justify-center">
                    <div className="h-24 w-24 bg-blue-100 rounded-full flex items-center justify-center shadow-inner">
                        <FileQuestion className="h-12 w-12 text-blue-600" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-4xl font-extrabold text-gray-900">404</h1>
                    <h2 className="text-2xl font-semibold text-gray-700">Halaman Tidak Ditemukan</h2>
                    <p className="text-gray-500">
                        Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.
                    </p>
                </div>

                <div className="pt-4">
                    <Link href="/">
                        <Button className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Kembali ke Beranda
                        </Button>
                    </Link>
                </div>
            </motion.div>

            <footer className="absolute bottom-8 text-xs text-gray-400">
                &copy; {new Date().getFullYear()} SiMagang - Sistem Informasi Manajemen Magang
            </footer>
        </div>
    );
}
