import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    function submit(e) {
        e.preventDefault();
        post('/login');
    }

    return (
        <>
            <Head title="Masuk - Sedekah Berkah" />

            <main style={styles.page}>
                <form onSubmit={submit} style={styles.card}>
                    <h1 style={styles.title}>Sedekah Berkah</h1>
                    <p style={styles.subtitle}>Masuk ke akun Anda</p>

                    <label>Email</label>
                    <input
                        style={styles.input}
                        type="email"
                        value={data.email}
                        onChange={e => setData('email', e.target.value)}
                        required
                    />
                    {errors.email && <p style={styles.error}>{errors.email}</p>}

                    <label>Password</label>
                    <input
                        style={styles.input}
                        type="password"
                        value={data.password}
                        onChange={e => setData('password', e.target.value)}
                        required
                    />

                    <label style={styles.remember}>
                        <input
                            type="checkbox"
                            checked={data.remember}
                            onChange={e => setData('remember', e.target.checked)}
                        />
                        Ingat saya
                    </label>

                    <button disabled={processing} style={styles.button}>
                        {processing ? 'Memproses...' : 'Masuk'}
                    </button>

                    <p style={styles.footer}>
                        Belum punya akun? <Link href="/daftar">Daftar di sini</Link>
                    </p>
                    <Link href="/" style={styles.back}>Kembali ke Beranda</Link>
                </form>
            </main>
        </>
    );
}

const styles = {
    page: {
        minHeight: '100vh', display: 'grid', placeItems: 'center',
        background: '#f3f7f2', padding: 20, fontFamily: 'Arial, sans-serif'
    },
    card: {
        width: '100%', maxWidth: 420, background: 'white', padding: 32,
        borderRadius: 18, boxShadow: '0 8px 30px #00000010',
        display: 'flex', flexDirection: 'column', gap: 12
    },
    title: { color: '#176b45', textAlign: 'center', marginBottom: 0 },
    subtitle: { textAlign: 'center', color: '#64748b', marginTop: 0, marginBottom: 20 },
    input: { padding: 13, border: '1px solid #d5ded8', borderRadius: 8, fontSize: 16 },
    remember: { display: 'flex', gap: 8, alignItems: 'center', margin: '8px 0' },
    button: {
        border: 0, padding: 14, borderRadius: 8, background: '#176b45',
        color: 'white', fontWeight: 'bold', cursor: 'pointer'
    },
    error: { color: '#dc2626', margin: 0, fontSize: 13 },
    footer: { textAlign: 'center', fontSize: 14 },
    back: { textAlign: 'center', color: '#176b45', fontSize: 14 }
};