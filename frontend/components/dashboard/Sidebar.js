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

    if (!role) return null;

    const filteredLinks = sidebarLinks.filter(link => link.roles.includes(role?.toUpperCase()));
    const dashboardLink = filteredLinks.find(link => link.href === '/dashboard');
    const categorizedLinks = filteredLinks.filter(link => link.href !== '/dashboard');

    const categories = ['MASTER', 'KEMAHASISWAAN', 'KEGIATAN'];
    const groupedLinks = categories.map(cat => ({
        name: cat,
        links: categorizedLinks.filter(link => link.category === cat)
    })).filter(group => group.links.length > 0);

    return (
        <div className="w-64 bg-primary text-white border-r h-screen hidden md:flex flex-col shadow-xl z-20">
            <div className="p-6 flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                    <img src="/logo.png" alt="Logo" className="h-6 w-auto object-contain" />
                </div>
                <h1 className="text-2xl font-bold tracking-wider">siMagang</h1>
            </div>

            <nav className="flex-1 px-4 space-y-4 overflow-y-auto pb-4">
                {dashboardLink && (
                    <Link
                        key={dashboardLink.href}
                        href={dashboardLink.href}
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                            pathname === dashboardLink.href
                                ? "bg-[#F5A623] text-[#020617] shadow-md font-bold"
                                : "text-white/80 hover:bg-white/10 hover:text-white"
                        )}
                    >
                        <dashboardLink.icon className="h-5 w-5" />
                        {dashboardLink.label}
                    </Link>
                )}

                {groupedLinks.map((group) => (
                    <div key={group.name} className="space-y-1">
                        <div className="px-4 py-1">
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">{group.name}</p>
                        </div>
                        {group.links.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                                        isActive
                                            ? "bg-[#F5A623] text-[#020617] shadow-md font-bold"
                                            : "text-white/80 hover:bg-white/10 hover:text-white"
                                    )}
                                >
                                    <Icon className="h-5 w-5" />
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>


        </div>
    );
}

export const sidebarLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['MAHASISWA', 'DOSEN', 'INSTANSI', 'ADMIN', 'SUPERADMIN', 'ADMINPRODI', 'ADMINKEMAHASISWAAN'], category: null },
    // Mahasiswa
    { href: '/dashboard/pendaftaran', label: 'Pendaftaran', icon: FileText, roles: ['MAHASISWA'], category: 'KEGIATAN' },
    { href: '/dashboard/mahasiswa/lowongan', label: 'Info Lowongan', icon: Building2, roles: ['MAHASISWA'], category: 'KEGIATAN' },
    { href: '/dashboard/laporan', label: 'Laporan', icon: BookOpen, roles: ['MAHASISWA'], category: 'KEGIATAN' },
    // Dosen
    { href: '/dashboard/bimbingan', label: 'Bimbingan', icon: Users, roles: ['DOSEN'], category: 'KEGIATAN' },
    { href: '/dashboard/sidang', label: 'Sidang', icon: GraduationCap, roles: ['DOSEN'], category: 'KEGIATAN' },
    { href: '/dashboard/sppd', label: 'SPPD', icon: FileText, roles: ['DOSEN'], category: 'KEGIATAN' },
    // Instansi
    { href: '/dashboard/peserta', label: 'Peserta PKL', icon: Users, roles: ['INSTANSI'], category: 'KEGIATAN' },
    // Admin (Shared Logic for SUPERADMIN, ADMINPRODI)
    { href: '/dashboard/master/periode', label: 'Periode', icon: Calendar, roles: ['ADMIN', 'SUPERADMIN', 'ADMINPRODI'], category: 'MASTER' },
    { href: '/dashboard/master/prodi', label: 'Data Prodi', icon: GraduationCap, roles: ['ADMIN', 'SUPERADMIN', 'ADMINPRODI'], category: 'MASTER' },
    { href: '/dashboard/master/instansi', label: 'Data Instansi', icon: Building2, roles: ['ADMIN', 'SUPERADMIN', 'ADMINPRODI', 'ADMINKEMAHASISWAAN'], category: 'MASTER' },
    // Kemahasiswaan
    { href: '/dashboard/kemahasiswaan/lomba', label: 'Info Lomba', icon: Award, roles: ['ADMIN', 'SUPERADMIN', 'ADMINPRODI', 'ADMINKEMAHASISWAAN'], category: 'KEMAHASISWAAN' },
    { href: '/dashboard/kemahasiswaan/kegiatan', label: 'Info Kegiatan', icon: Calendar, roles: ['ADMIN', 'SUPERADMIN', 'ADMINPRODI', 'ADMINKEMAHASISWAAN'], category: 'KEMAHASISWAAN' },
    { href: '/dashboard/kemahasiswaan/loker', label: 'Info Loker', icon: Building2, roles: ['ADMIN', 'SUPERADMIN', 'ADMINPRODI', 'ADMINKEMAHASISWAAN', 'INSTANSI'], category: 'KEMAHASISWAAN' },

    { href: '/dashboard/master/users', label: 'Users', icon: Users, roles: ['ADMIN', 'SUPERADMIN', 'ADMINPRODI'], category: 'MASTER' },
    { href: '/dashboard/master/kriteria', label: 'Kriteria Nilai', icon: Award, roles: ['ADMIN', 'SUPERADMIN', 'ADMINPRODI'], category: 'MASTER' },
    { href: '/dashboard/admin/validasi', label: 'Pendaftaran Magang', icon: FileText, roles: ['ADMIN', 'SUPERADMIN', 'ADMINPRODI'], category: 'KEGIATAN' },
    { href: '/dashboard/admin/jadwal', label: 'Jadwal Kegiatan', icon: Calendar, roles: ['ADMIN', 'SUPERADMIN', 'ADMINPRODI'], category: 'KEGIATAN' },
    { href: '/dashboard/admin/sidang', label: 'Jadwal Sidang', icon: Calendar, roles: ['ADMIN', 'SUPERADMIN', 'ADMINPRODI'], category: 'KEGIATAN' },
    { href: '/dashboard/admin/rekap', label: 'Rekap Nilai', icon: BookOpen, roles: ['ADMIN', 'SUPERADMIN', 'ADMINPRODI'], category: 'KEGIATAN' },
    { href: '/dashboard/admin/laporan', label: 'Rekap Laporan', icon: BookOpen, roles: ['ADMIN', 'SUPERADMIN', 'ADMINPRODI'], category: 'KEGIATAN' },
];
