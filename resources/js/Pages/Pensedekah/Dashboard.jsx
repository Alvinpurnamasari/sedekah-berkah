import React from 'react';
import { Head, Link, router } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <>
            <Head title="Akun Pensedekah" />
            <main style={{
                minHeight: '100vh', padding: 30, background: '#f3f7f2',
                fontFamily: 'Arial, sans-serif'
            }}>
                <h1 style={{ color: '#176b45' }}>Dashboard Pensedekah</h1>
                <p>Selamat datang di akun Sedekah Berkah.</p>
                <p>Di sini nantinya Anda dapat melihat riwayat donasi, status pembayaran,
                    dan laporan penyaluran sedekah.</p>
                <Link href="/">Kembali ke Beranda</Link>
                <br /><br />
                <button onClick={() => router.post('/logout')}>Keluar</button>
            </main>
        </>
    );
}