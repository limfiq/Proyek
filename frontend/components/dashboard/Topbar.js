'use client';

import { Search, Bell, Menu, LayoutDashboard, User, LogOut, KeyRound, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { sidebarLinks } from '@/components/dashboard/Sidebar';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Topbar() {
    const pathname = usePathname();
    const [role, setRole] = useState(null);

    useEffect(() => {
        setRole(localStorage.getItem('role'));
    }, []);

    return (
        <header className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-10">
            <div className="flex items-center gap-4 flex-1">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-64 border-r bg-primary text-white">
                        <div className="p-6 flex items-center gap-3 border-b border-white/10">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <img src="/logo.png" alt="Logo" className="h-6 w-auto object-contain" />
                            </div>
                            <h1 className="text-2xl font-bold tracking-wider">siMagang</h1>
                        </div>
                        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                            {role && sidebarLinks.filter(link => link.roles.includes(role?.toUpperCase())).map((link) => {
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
                    </SheetContent>
                </Sheet>

                <div className="hidden md:flex items-center gap-2 text-gray-400 bg-gray-50 px-3 py-2 rounded-lg w-full max-w-md focus-within:ring-1 ring-primary/20 transition-all">
                    <span className="text-sm italic text-gray-500 truncate">
                        "Kesuksesan dimulai dari langkah kecil yang kamu ambil hari ini."
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="relative text-gray-500 hover:text-primary hover:bg-primary/5">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full bg-primary/10 border border-primary/20 p-0 hover:bg-primary/20 transition-colors">
                            <span className="text-primary font-bold text-lg">{role ? role[0] : 'U'}</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">User Account</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {role}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard/profile" className="cursor-pointer">
                                <KeyRound className="mr-2 h-4 w-4" />
                                <span>Ganti Password</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-red-600 focus:text-red-600 cursor-pointer"
                            onClick={() => {
                                localStorage.clear();
                                window.location.href = '/login';
                            }}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
