
import React from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { UserRound, LockKeyhole, Save } from 'lucide-react';
import PensedekahLayout from '../../../Components/PensedekahLayout';

export default function Edit({ user }) {
    const { flash, errors } = usePage().props;

    const profileForm = useForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    function submitProfile(e) {
        e.preventDefault();
        profileForm.put('/akun/profil');
    }

    function submitPassword(e) {
        e.preventDefault();

        passwordForm.put('/akun/profil/password', {
            onSuccess: () => passwordForm.reset(),
        });
    }

    const inputStyle = {
        width: '100%',
        padding: '12px 14px',
        border: '1px solid #dbe3df',
        borderRadius: 9,
        fontSize: 14,
        outline: 'none',
        boxSizing: 'border-box',
    };

    const labelStyle = {
        display: 'block',
        marginBottom: 7,
        color: '#334155',
        fontSize: 14,
        fontWeight: 600,
    };

    const cardStyle = {
        background: '#fff',
        padding: 24,
        borderRadius: 14,
        border: '1px solid #e5e7eb',
        marginBottom: 22,
    };

    const buttonStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '12px 20px',
        background: '#176b45',
        color: '#fff',
        border: 0,
        borderRadius: 9,
        fontWeight: 600,
        cursor: 'pointer',
    };

    function ErrorText({ message }) {
        return message ? (
            <small style={{ color: '#dc2626', display: 'block', marginTop: 6 }}>
                {message}
            </small>
        ) : null;
    }

    return (
        <PensedekahLayout title="Profil Saya">
            <Head title="Profil Saya" />

            <div style={{ maxWidth: 850, margin: '0 auto' }}>
                <div style={{ marginBottom: 24 }}>
                    <h2 style={{ color: '#176b45', marginBottom: 7 }}>
                        Pengaturan Profil
                    </h2>
                    <p style={{ color: '#64748b', margin: 0 }}>
                        Kelola informasi akun dan keamanan Anda.
                    </p>
                </div>

                {flash?.success && (
                    <div style={{
                        background: '#dcfce7',
                        color: '#166534',
                        padding: 14,
                        borderRadius: 9,
                        marginBottom: 20,
                    }}>
                        {flash.success}
                    </div>
                )}

                {/* Informasi Profil */}
                <section style={cardStyle}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        marginBottom: 24,
                    }}>
                        <UserRound color="#176b45" size={24} />
                        <div>
                            <h3 style={{ margin: 0, color: '#176b45' }}>
                                Informasi Pribadi
                            </h3>
                            <small style={{ color: '#64748b' }}>
                                Perbarui informasi akun Anda.
                            </small>
                        </div>
                    </div>

                    <form onSubmit={submitProfile}>
                        <div style={{ marginBottom: 18 }}>
                            <label style={labelStyle}>Nama Lengkap</label>
                            <input
                                style={inputStyle}
                                value={profileForm.data.name}
                                onChange={e => profileForm.setData('name', e.target.value)}
                                required
                            />
                            <ErrorText message={profileForm.errors.name} />
                        </div>

                        <div style={{ marginBottom: 18 }}>
                            <label style={labelStyle}>Email</label>
                            <input
                                type="email"
                                style={inputStyle}
                                value={profileForm.data.email}
                                onChange={e => profileForm.setData('email', e.target.value)}
                                required
                            />
                            <ErrorText message={profileForm.errors.email} />
                        </div>

                        <div style={{ marginBottom: 22 }}>
                            <label style={labelStyle}>Nomor Telepon</label>
                            <input
                                type="tel"
                                style={inputStyle}
                                value={profileForm.data.phone}
                                onChange={e => profileForm.setData('phone', e.target.value)}
                                placeholder="Masukkan nomor telepon"
                            />
                            <ErrorText message={profileForm.errors.phone} />
                        </div>

                        <button
                            type="submit"
                            style={buttonStyle}
                            disabled={profileForm.processing}
                        >
                            <Save size={17} />
                            {profileForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </form>
                </section>

                {/* Keamanan Akun */}
                <section style={cardStyle}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        marginBottom: 24,
                    }}>
                        <LockKeyhole color="#176b45" size={24} />
                        <div>
                            <h3 style={{ margin: 0, color: '#176b45' }}>
                                Keamanan Akun
                            </h3>
                            <small style={{ color: '#64748b' }}>
                                Ubah password untuk menjaga keamanan akun.
                            </small>
                        </div>
                    </div>

                    <form onSubmit={submitPassword}>
                        {[
                            {
                                key: 'current_password',
                                label: 'Password Saat Ini',
                            },
                            {
                                key: 'password',
                                label: 'Password Baru',
                            },
                            {
                                key: 'password_confirmation',
                                label: 'Konfirmasi Password Baru',
                            },
                        ].map(field => (
                            <div key={field.key} style={{ marginBottom: 18 }}>
                                <label style={labelStyle}>{field.label}</label>
                                <input
                                    type="password"
                                    style={inputStyle}
                                    value={passwordForm.data[field.key]}
                                    onChange={e => passwordForm.setData(field.key, e.target.value)}
                                    required
                                />
                                <ErrorText message={passwordForm.errors[field.key]} />
                            </div>
                        ))}

                        <button
                            type="submit"
                            style={buttonStyle}
                            disabled={passwordForm.processing}
                        >
                            <LockKeyhole size={17} />
                            {passwordForm.processing ? 'Memproses...' : 'Ubah Password'}
                        </button>
                    </form>
                </section>
            </div>
        </PensedekahLayout>
    );
}
