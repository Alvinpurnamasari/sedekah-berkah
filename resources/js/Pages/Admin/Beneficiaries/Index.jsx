
import React, { useEffect, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import AdminLayout from '../../../Components/AdminLayout';
import {
    Users,
    Search,
    Plus,
    Pencil,
    Power,
    X,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import '../../../../css/superadmin-campaigns.css';

export default function BeneficiaryIndex({
    targets,
    filters = {},
    summary = {},
}) {
    const { flash = {} } = usePage().props;
    const [showSuccess, setShowSuccess] = useState(Boolean(flash.success));

    useEffect(() => {
        if (!flash.success) {
            setShowSuccess(false);
            return;
        }
    
        setShowSuccess(true);
    
        const timer = setTimeout(() => {
            setShowSuccess(false);
        }, 5000);
    
        return () => clearTimeout(timer);
    }, [flash.success]);
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [processing, setProcessing] = useState(false);

    function applyFilters(e) {
        e.preventDefault();

        router.get('/admin/target-penerima', {
            search,
            status,
        }, {
            preserveState: true,
            replace: true,
        });
    }

    function openCreate() {
        setEditing(null);
        setName('');
        setDescription('');
        setShowForm(true);
    }

    function openEdit(target) {
        setEditing(target);
        setName(target.name);
        setDescription(target.description || '');
        setShowForm(true);
    }

    function submitForm(e) {
        e.preventDefault();

        setProcessing(true);

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                setShowForm(false);
                setEditing(null);
                setName('');
                setDescription('');
            },
            onFinish: () => setProcessing(false),
        };

        if (editing) {
            router.put(
                `/admin/target-penerima/${editing.id}`,
                { name, description },
                options
            );
        } else {
            router.post(
                '/admin/target-penerima',
                { name, description },
                options
            );
        }
    }

    function toggleStatus(target) {
        const action = target.is_active ? 'menonaktifkan' : 'mengaktifkan';

        if (!window.confirm(`Yakin ingin ${action} target "${target.name}"?`)) {
            return;
        }

        router.patch(`/admin/target-penerima/${target.id}/status`, {}, {
            preserveScroll: true,
        });
    }

    return (
        <AdminLayout
            title="Target Penerima Manfaat"
            activeMenu="beneficiaries"
        >
            <div className="sc-page">
                {showSuccess && (
                    <div style={{
                        padding: '14px 18px',
                        marginBottom: 20,
                        borderRadius: 9,
                        background: '#dcfce7',
                        border: '1px solid #86efac',
                        color: '#166534',
                    }}>
                        ✓ {flash.success}
                    </div>
                )}

                <section className="sc-intro">
                    <div>
                        <span className="sc-eyebrow">
                            DATA PENERIMA MANFAAT
                        </span>
                        <h2>Target Penerima Manfaat</h2>
                        <p>
                            Kelola kelompok penerima manfaat program Sedekah Berkah.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="sc-primary"
                        onClick={openCreate}
                    >
                        <Plus size={18} />
                        Tambah Target
                    </button>
                </section>

                <section className="sc-summary" style={{ gap: 30 }}>
                    <div className="sc-summary-icon">
                        <Users size={23} />
                    </div>
                    <div>
                        <small>Total target penerima</small>
                        <h3>{summary.total || 0}</h3>
                    </div>
                    <div>
                        <small>Aktif</small>
                        <h3>{summary.active || 0}</h3>
                    </div>
                    <div>
                        <small>Nonaktif</small>
                        <h3>{summary.inactive || 0}</h3>
                    </div>
                </section>

                <section className="sc-panel">
                    <form className="sc-filters" onSubmit={applyFilters}>
                        <div className="sc-search">
                            <Search size={18} />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Cari nama atau deskripsi target..."
                            />
                        </div>

                        <select
                            value={status}
                            onChange={e => setStatus(e.target.value)}
                        >
                            <option value="">Semua status</option>
                            <option value="active">Aktif</option>
                            <option value="inactive">Nonaktif</option>
                        </select>

                        <button type="submit" className="sc-filter-button">
                            Cari
                        </button>
                    </form>

                    <div className="sc-table-wrap">
                        <table className="sc-table">
                            <thead>
                                <tr>
                                    <th>Nama Target</th>
                                    <th>Deskripsi</th>
                                    <th>Digunakan Program</th>
                                    <th>Status</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>

                            <tbody>
                                {targets.data.length > 0 ? (
                                    targets.data.map(target => (
                                        <tr key={target.id}>
                                            <td>
                                                <strong>{target.name}</strong>
                                            </td>

                                            <td>{target.description || '-'}</td>

                                            <td>
                                                {target.campaigns_count || 0} program
                                            </td>

                                            <td>
                                                <span className={`sc-status ${
                                                    target.is_active
                                                        ? 'sc-status-active'
                                                        : 'sc-status-draft'
                                                }`}>
                                                    {target.is_active ? 'Aktif' : 'Nonaktif'}
                                                </span>
                                            </td>

                                            <td>
                                                <div className="sc-actions">
                                                    <button
                                                        type="button"
                                                        title="Edit target"
                                                        onClick={() => openEdit(target)}
                                                    >
                                                        <Pencil size={16} />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        title={target.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                                        onClick={() => toggleStatus(target)}
                                                    >
                                                        <Power size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5">
                                            <div className="sc-empty">
                                                <Users size={34} />
                                                <strong>Belum ada target ditemukan</strong>
                                                <span>
                                                    Tambahkan target penerima manfaat untuk memulai.
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="sc-pagination">
                        <span>
                            Menampilkan {targets.from || 0}–{targets.to || 0}
                            {' '}dari {targets.total || 0} target
                        </span>

                        <div>
                            {targets.links?.map((link, index) => (
                                <button
                                    key={index}
                                    disabled={!link.url || link.active}
                                    className={link.active ? 'active' : ''}
                                    onClick={() => link.url && router.visit(link.url)}
                                >
                                    {index === 0
                                        ? <ChevronLeft size={16} />
                                        : index === targets.links.length - 1
                                            ? <ChevronRight size={16} />
                                            : <span dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }} />
                                    }
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {showForm && (
                    <div style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 1000,
                        background: 'rgba(15, 23, 42, 0.55)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 20,
                    }}>
                        <div style={{
                            background: '#fff',
                            borderRadius: 14,
                            padding: 26,
                            width: '100%',
                            maxWidth: 560,
                            maxHeight: '90vh',
                            overflowY: 'auto',
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: 22,
                            }}>
                                <h2 style={{ margin: 0 }}>
                                    {editing ? 'Edit Target Penerima' : 'Tambah Target Penerima'}
                                </h2>

                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={submitForm}>
                                <label style={{ display: 'block', marginBottom: 8 }}>
                                    Nama Target *
                                </label>

                                <input
                                    required
                                    maxLength={255}
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Contoh: Anak Yatim"
                                    style={{
                                        width: '100%',
                                        padding: 12,
                                        border: '1px solid #d1d5db',
                                        borderRadius: 8,
                                        marginBottom: 18,
                                    }}
                                />

                                <label style={{ display: 'block', marginBottom: 8 }}>
                                    Deskripsi
                                </label>

                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    maxLength={2000}
                                    rows={4}
                                    placeholder="Jelaskan kelompok penerima manfaat..."
                                    style={{
                                        width: '100%',
                                        padding: 12,
                                        border: '1px solid #d1d5db',
                                        borderRadius: 8,
                                        marginBottom: 22,
                                    }}
                                />

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    gap: 10,
                                }}>
                                    <button
                                        type="button"
                                        className="sc-filter-button"
                                        onClick={() => setShowForm(false)}
                                    >
                                        Batal
                                    </button>

                                    <button
                                        type="submit"
                                        className="sc-primary"
                                        disabled={processing}
                                    >
                                        {processing ? 'Menyimpan...' : 'Simpan Target'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
