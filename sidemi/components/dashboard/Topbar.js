'use client';

import { Search, Bell, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Topbar() {
    return (
        <header className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-10">
            <div className="flex items-center gap-4 flex-1">
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                </Button>
                <div className="hidden md:flex items-center gap-2 text-gray-400 bg-gray-50 px-3 py-2 rounded-lg w-full max-w-md focus-within:ring-1 ring-primary/20 transition-all">
                    <Search className="h-4 w-4" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-transparent border-none outline-none text-sm w-full text-foreground placeholder:text-gray-400"
                    />
                </div>
            </div>

            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="relative text-gray-500 hover:text-primary hover:bg-primary/5">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                </Button>
                <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20" />
            </div>
        </header>
    );
}
