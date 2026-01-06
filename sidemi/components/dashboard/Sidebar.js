'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    FileText,
    Users,
    Building2,
    Calendar,
    GraduationCap,
    BookOpen,
    Award
} from 'lucide-react';
import { useEffect, useState } from 'react';

export function Sidebar() {
    const pathname = usePathname();
    const [role, setRole] = useState(null);

    useEffect(() => {
        setRole(localStorage.getItem('role'));
    }, []);

    const links = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['MAHASISWA', 'DOSEN', 'INSTANSI', 'ADMIN'] },
        // Mahasiswa
        { href: '/dashboard/pendaftaran', label: 'Pendaftaran', icon: FileText, roles: ['MAHASISWA'] },
        { href: '/dashboard/laporan', label: 'Laporan', icon: BookOpen, roles: ['MAHASISWA'] },
        // Dosen
        { href: '/dashboard/bimbingan', label: 'Bimbingan', icon: Users, roles: ['DOSEN'] },
        { href: '/dashboard/sidang', label: 'Sidang', icon: GraduationCap, roles: ['DOSEN'] },
        // Instansi
        { href: '/dashboard/peserta', label: 'Peserta PKL', icon: Users, roles: ['INSTANSI'] },
        // Admin
        { href: '/dashboard/master/periode', label: 'Periode', icon: Calendar, roles: ['ADMIN'] },
        { href: '/dashboard/master/instansi', label: 'Data Instansi', icon: Building2, roles: ['ADMIN'] },
        { href: '/dashboard/master/users', label: 'Users', icon: Users, roles: ['ADMIN'] },
        { href: '/dashboard/master/kriteria', label: 'Kriteria Nilai', icon: Award, roles: ['ADMIN'] },
        { href: '/dashboard/admin/validasi', label: 'Validasi PKL', icon: FileText, roles: ['ADMIN'] },
        { href: '/dashboard/admin/sidang', label: 'Jadwal Sidang', icon: Calendar, roles: ['ADMIN'] },
        { href: '/dashboard/admin/rekap', label: 'Rekap Nilai', icon: BookOpen, roles: ['ADMIN'] },
    ];

    if (!role) return null;

    return (
        <div className="w-64 bg-primary text-white border-r h-screen hidden md:flex flex-col shadow-xl z-20">
            <div className="p-6 flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                    <LayoutDashboard className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold tracking-wider">SID3MI</h1>
            </div>

            <div className="px-6 py-2">
                <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">Menu</p>
            </div>

            <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                {links.filter(link => link.roles.includes(role)).map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-white/20 text-white shadow-inner"
                                    : "text-white/80 hover:bg-white/10 hover:text-white"
                            )}
                        >
                            <Icon className="h-5 w-5" />
                            {link.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 m-4 rounded-xl bg-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-white text-primary flex items-center justify-center font-bold shadow-md">
                        {role[0]}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-medium truncate">{role}</p>
                        <Link href="/dashboard/profile" className="text-xs text-white/70 hover:text-white hover:underline block mb-1">
                            Ganti Password
                        </Link>
                        <button
                            onClick={() => {
                                localStorage.clear();
                                window.location.href = '/login';
                            }}
                            className="text-xs text-white/70 hover:text-white hover:underline flex items-center gap-1"
                        >
                            Log Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
