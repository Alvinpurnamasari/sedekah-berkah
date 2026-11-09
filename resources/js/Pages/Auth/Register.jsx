import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
    });

    function submit(e) {
        e.preventDefault();
        post('/daftar');
    }

    const inputStyle = {
        width: '100%', boxSizing: 'border-box', padding: 12,
        border: '1px solid #d5ded8', borderRadius: 8, marginTop: 6
    };

    return (
        <>
            <Head title="Daftar - Sedekah Berkah" />

            <main style={{
                minHeight: '100vh', display: 'grid', placeItems: 'center',
                background: '#f3f7f2', padding: 20, fontFamily: 'Arial'
            }}>
                <form onSubmit={submit} style={{
                    width: '100%', maxWidth: 440, boxSizing: 'border-box',
                    background: 'white', padding: 30, borderRadius: 18
                }}>
                    <h1 style={{ color: '#176b45' }}>Bergabung dengan Sedekah Berkah</h1>
                    <p>Buat akun untuk melihat riwayat dan perkembangan sedekah Anda.</p>

                    {[
                        ['name', 'Nama lengkap', 'text'],
                        ['email', 'Email', 'email'],
                        ['phone', 'Nomor telepon', 'tel'],
                        ['password', 'Password', 'password'],
                        ['password_confirmation', 'Ulangi password', 'password'],
                    ].map(([key, label, type]) => (
                        <div key={key} style={{ marginBottom: 14 }}>
                            <label>{label}</label>
                            <input
                                style={inputStyle}
                                type={type}
                                value={data[key]}
                                onChange={e => setData(key, e.target.value)}
                                required={key !== 'phone'}
                            />
                            {errors[key] && (
                                <p style={{ color: '#dc2626', fontSize: 13 }}>{errors[key]}</p>
                            )}
                        </div>
                    ))}

                    <button disabled={processing} style={{
                        width: '100%', padding: 14, border: 0, borderRadius: 8,
                        background: '#176b45', color: 'white', fontWeight: 'bold'
                    }}>
                        {processing ? 'Memproses...' : 'Buat Akun'}
                    </button>

                    <p>Sudah punya akun? <Link href="/login">Masuk</Link></p>
                    <Link href="/">Kembali ke Beranda</Link>
                </form>
            </main>
        </>
    );
}