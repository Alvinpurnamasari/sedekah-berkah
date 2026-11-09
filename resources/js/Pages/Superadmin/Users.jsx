import React, { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import SuperadminLayout from '../../Components/SuperadminLayout';

import {
    Users, Search, Plus, Pencil, ShieldCheck,
    UserCheck, UserX, X, KeyRound, ChevronLeft,
    ChevronRight
} from 'lucide-react';

import '../../../css/superadmin-users.css';

const formatDate = (date) => {
    if (!date) return '-';

    return new Date(date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

export default function UsersPage({ users, filters = {}, roles = [] }) {
    const [modal, setModal] = useState(null);
    const [search, setSearch] = useState(filters.search || '');
    const [role, setRole] = useState(filters.role || '');
    const [status, setStatus] = useState(filters.status || '');

    const form = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        role_id: '',
    });

    const filteredCount = users.total || 0;

    function applyFilters(e) {
        e.preventDefault();

        router.get('/superadmin/pengguna', {
            search,
            role,
            status,
        }, {
            preserveState: true,
            replace: true,
        });
    }

    function openCreate() {
        form.reset();
        form.clearErrors();
        setModal({ type: 'create' });
    }

    function openEdit(user) {
        form.clearErrors();
        form.setData({
            name: user.name,
            email: user.email || '',
            phone: user.phone || '',
            role_id: user.role_id,
            password: '',
            password_confirmation: '',
        });

        setModal({ type: 'edit', user });
    }

    function openPassword(user) {
        form.reset();
        form.clearErrors();
        setModal({ type: 'password', user });
    }

    
function submitForm(e) {
    e.preventDefault();

    if (modal?.type === 'create') {
        form.post('/superadmin/pengguna', {
            onSuccess: () => setModal(null),
        });
        return;
    }

    if (modal?.type === 'edit') {
        const userId = modal?.user?.id;

        if (!userId) {
            alert('ID pengguna tidak ditemukan. Silakan tutup dan buka kembali formulir Edit.');
            return;
        }

        const url = `/superadmin/pengguna/${userId}`;

console.log('=== DEBUG EDIT PENGGUNA ===');
console.log('MODAL TYPE:', modal.type);
console.log('USER ID:', userId);
console.log('URL TUJUAN:', url);
console.log('DATA FORM:', form.data);

if (!userId || !url.includes(userId)) {
    alert('ID pengguna tidak valid. Perubahan dibatalkan.');
    return;
}

router.put(url, form.data, {
    onSuccess: () => setModal(null),
    onError: (errors) => console.error('Gagal memperbarui pengguna:', errors),
});
return;
    }

    if (modal?.type === 'password') {
        const userId = modal?.user?.id;

        if (!userId) {
            alert('ID pengguna tidak ditemukan.');
            return;
        }

        router.put(`/superadmin/pengguna/${userId}/password`, form.data, {
            onSuccess: () => setModal(null),
        });
    }
}

function toggleStatus(user) {
    console.log('DATA USER UNTUK UBAH STATUS:', user);
    console.log('ID USER:', user?.id);

    const action = user.status === 'active'
        ? 'menonaktifkan'
        : 'mengaktifkan';

    if (!confirm(`Yakin ingin ${action} akun ${user.name}?`)) {
        return;
    }

    const url = `/superadmin/pengguna/${user.id}/status`;

console.log('URL PATCH YANG AKAN DIKIRIM:', url);

router.patch(url, {}, {
    onSuccess: () => {
        console.log('Status pengguna berhasil diperbarui.');
    },
    onError: (errors) => {
        console.error('Gagal memperbarui status:', errors);
    },
});
}
    return (
        <SuperadminLayout
            title="Manajemen Pengguna"
            activeMenu="users"
        >
            <div className="su-page">
                <section className="su-intro">
                    <div>
                        <span className="su-eyebrow">PENGELOLAAN AKUN</span>
                        <h2>Manajemen Pengguna</h2>
                        <p>
                            Kelola akun Admin dan Pensedekah dalam
                            sistem Sedekah Berkah.
                        </p>
                    </div>

                    <button className="su-primary" onClick={openCreate}>
                        <Plus size={18} />
                        Tambah Pengguna
                    </button>
                </section>

                <section className="su-summary">
                    <div className="su-summary-icon">
                        <Users size={23} />
                    </div>
                    <div>
                        <small>Total pengguna ditemukan</small>
                        <h3>{filteredCount.toLocaleString('id-ID')}</h3>
                    </div>
                </section>

                <section className="su-panel">
                    <form className="su-filters" onSubmit={applyFilters}>
                        <div className="su-search">
                            <Search size={18} />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Cari nama, email, atau telepon..."
                            />
                        </div>

                        <select
                            value={role}
                            onChange={e => setRole(e.target.value)}
                        >
                            <option value="">Semua role</option>
                            {roles.map(item => (
                                <option key={item.id} value={item.name}>
                                    {item.name}
                                </option>
                            ))}
                        </select>

                        <select
                            value={status}
                            onChange={e => setStatus(e.target.value)}
                        >
                            <option value="">Semua status</option>
                            <option value="active">Aktif</option>
                            <option value="inactive">Tidak aktif</option>
                        </select>

                        <button className="su-filter-button" type="submit">
                            Cari
                        </button>
                    </form>

                    <div className="su-table-wrap">
                        <table className="su-table">
                            <thead>
                                <tr>
                                    <th>Pengguna</th>
                                    <th>Kontak</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Terdaftar</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>

                            <tbody>
                                {users.data.length > 0 ? (
                                    users.data.map(user => (
                                        <tr key={user.id}>
                                            <td>
                                                <div className="su-user">
                                                    <div className="su-avatar">
                                                        {user.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <strong>{user.name}</strong>
                                                </div>
                                            </td>

                                            <td>
                                                <div>{user.email || '-'}</div>
                                                <small>{user.phone || '-'}</small>
                                            </td>

                                            <td>
                                                <span className={`su-role su-role-${user.role?.name}`}>
                                                    {user.role?.name || '-'}
                                                </span>
                                            </td>

                                            <td>
                                                <span className={`su-status ${user.status === 'active' ? 'active' : 'inactive'}`}>
                                                    {user.status === 'active' ? 'Aktif' : 'Tidak aktif'}
                                                </span>
                                            </td>

                                            <td>{formatDate(user.created_at)}</td>

                                            <td>
                                                <div className="su-actions">
                                                    <button
                                                        title="Edit pengguna"
                                                        onClick={() => openEdit(user)}
                                                    >
                                                        <Pencil size={16} />
                                                    </button>

                                                    <button
                                                        title="Atur ulang password"
                                                        onClick={() => openPassword(user)}
                                                    >
                                                        <KeyRound size={16} />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        title="Ubah status"
                                                        onClick={() => toggleStatus(user)}
                                                    >
                                                        {user.status === 'active'
                                                            ? <UserX size={16} />
                                                            : <UserCheck size={16} />
                                                        }
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6">
                                            <div className="su-empty">
                                                <Users size={32} />
                                                <strong>Pengguna tidak ditemukan</strong>
                                                <span>Coba ubah kata kunci atau filter.</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="su-pagination">
                        <span>
                            Menampilkan {users.from || 0}–{users.to || 0}
                            {' '}dari {users.total} pengguna
                        </span>

                        <div>
                            {users.links?.map((link, index) => (
                                <button
                                    key={index}
                                    disabled={!link.url || link.active}
                                    className={link.active ? 'active' : ''}
                                    onClick={() => link.url && router.visit(link.url)}
                                >
                                    {index === 0
                                        ? <ChevronLeft size={16} />
                                        : index === users.links.length - 1
                                            ? <ChevronRight size={16} />
                                            : <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                    }
                                </button>
                            ))}
                        </div>
                    </div>
                </section>
            </div>

            {modal && (
                <div className="su-modal-overlay" onClick={() => setModal(null)}>
                    <section
                        className="su-modal"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="su-modal-heading">
                            <div>
                                <span className="su-eyebrow">MANAJEMEN PENGGUNA</span>
                                <h2>
                                    {modal.type === 'create'
                                        ? 'Tambah Pengguna'
                                        : modal.type === 'edit'
                                            ? 'Edit Pengguna'
                                            : 'Atur Ulang Password'
                                    }
                                </h2>
                            </div>

                            <button onClick={() => setModal(null)}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={submitForm}>
                            {modal.type !== 'password' ? (
                                <>
                                    <label>Nama lengkap</label>
                                    <input
                                        value={form.data.name}
                                        onChange={e => form.setData('name', e.target.value)}
                                    />
                                    {form.errors.name && <small className="su-error">{form.errors.name}</small>}

                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={form.data.email}
                                        onChange={e => form.setData('email', e.target.value)}
                                    />
                                    {form.errors.email && <small className="su-error">{form.errors.email}</small>}

                                    <label>Nomor telepon</label>
                                    <input
                                        value={form.data.phone}
                                        onChange={e => form.setData('phone', e.target.value)}
                                    />

                                    <label>Role pengguna</label>
                                    <select
                                        value={form.data.role_id}
                                        onChange={e => form.setData('role_id', e.target.value)}
                                    >
                                        <option value="">Pilih role</option>
                                        {roles.map(item => (
                                            <option key={item.id} value={item.id}>
                                                {item.name}
                                            </option>
                                        ))}
                                    </select>
                                    {form.errors.role_id && <small className="su-error">{form.errors.role_id}</small>}
                                </>
                            ) : null}

                            {modal.type !== 'edit' && (
                                <>
                                    <label>
                                        {modal.type === 'password'
                                            ? 'Password baru'
                                            : 'Password'
                                        }
                                    </label>
                                    <input
                                        type="password"
                                        value={form.data.password}
                                        onChange={e => form.setData('password', e.target.value)}
                                    />
                                    {form.errors.password && <small className="su-error">{form.errors.password}</small>}

                                    <label>Konfirmasi password</label>
                                    <input
                                        type="password"
                                        value={form.data.password_confirmation}
                                        onChange={e => form.setData('password_confirmation', e.target.value)}
                                    />
                                </>
                            )}

                            <div className="su-modal-actions">
                                <button
                                    type="button"
                                    className="su-cancel"
                                    onClick={() => setModal(null)}
                                >
                                    Batal
                                </button>

                                <button
                                    type="submit"
                                    className="su-primary"
                                    disabled={form.processing}
                                >
                                    {form.processing ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}
        </SuperadminLayout>
    );
}