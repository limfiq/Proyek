'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';

export default function ProfilePage() {
    const [form, setForm] = useState({
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (form.newPassword !== form.confirmNewPassword) {
            setError('Konfirmasi password baru tidak cocok.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/api/auth/change-password', {
                oldPassword: form.oldPassword,
                newPassword: form.newPassword
            });
            setMessage('Password berhasil diubah!');
            setForm({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal mengubah password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <Card>
                <CardHeader>
                    <CardTitle>Ganti Password</CardTitle>
                </CardHeader>
                <CardContent>
                    {message && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">{message}</div>}
                    {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Password Lama</label>
                            <Input
                                type="password"
                                value={form.oldPassword}
                                onChange={e => setForm({ ...form, oldPassword: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Password Baru</label>
                            <Input
                                type="password"
                                value={form.newPassword}
                                onChange={e => setForm({ ...form, newPassword: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Konfirmasi Password Baru</label>
                            <Input
                                type="password"
                                value={form.confirmNewPassword}
                                onChange={e => setForm({ ...form, confirmNewPassword: e.target.value })}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Menyimpan...' : 'Ganti Password'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
