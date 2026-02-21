'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
        }
    }, []);

    return (
        <nav className="fixed w-full bg-white z-50 border-b border-gray-100 shadow-sm top-0 left-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="flex items-center gap-3">
                            <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
                            <div className="flex flex-col">
                                <span className="text-xl font-bold text-primary tracking-tight leading-none">SIMagang Pintar</span>
                                <span className="text-xs text-gray-500 font-medium">Magang Portal</span>
                            </div>
                        </Link>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium">
                        <Link href="/" className="text-gray-600 hover:text-primary transition-colors">Beranda</Link>
                        <Link href="/lowongan" className="text-gray-600 hover:text-primary transition-colors">Lowongan Magang</Link>
                        <Link href="/#perusahaan" className="text-gray-600 hover:text-primary transition-colors">Mitra Perusahaan</Link>
                        <Link href="/#panduan" className="text-gray-600 hover:text-primary transition-colors">Panduan</Link>
                    </div>
                    <div className="flex items-center gap-4">
                        {isLoggedIn ? (
                            <Link href="/dashboard">
                                <Button className="bg-primary hover:bg-blue-700 text-white rounded-full px-6">
                                    Dashboard
                                </Button>
                            </Link>
                        ) : (
                            <>
                                <Link href="/login" className="text-primary hover:underline font-medium text-sm hidden sm:block">
                                    Masuk
                                </Link>
                                <Link href="/login">
                                    <Button className="bg-primary hover:bg-blue-700 text-white rounded-full px-6 shadow-md shadow-blue-200">
                                        Daftar Sekarang
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
