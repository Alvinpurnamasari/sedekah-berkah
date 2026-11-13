
import React from 'react';
import { Head, router, Link } from '@inertiajs/react';
import SuperadminLayout from '../../../Components/SuperadminLayout';
import {
    HandHeart,
    Wallet,
    Users,
    ClipboardCheck,
    Search,
    Plus,
    Eye
} from 'lucide-react';

const rupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value || 0);

const statusLabels = {
    planned: 'Direncanakan',
    ongoing: 'Berlangsung',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
};

export default function Index({
    summary,
    distributions,
    filters
}) {
    const search = (event) => {
        event.preventDefault();

        const form = new FormData(event.currentTarget);

        router.get('/superadmin/penyaluran', {
            search: form.get('search'),
            status: form.get('status'),
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const cards = [
        {
            label: 'Total Kegiatan',
            value: summary.totalActivities,
            icon: HandHeart,
        },
        {
            label: 'Dana Disalurkan',
            value: rupiah(summary.totalDistributed),
            icon: Wallet,
        },
        {
            label: 'Penerima Manfaat',
            value: summary.totalRecipients,
            icon: Users,
        },
        {
            label: 'Laporan Menunggu',
            value: summary.pendingReports,
            icon: ClipboardCheck,
        },
    ];

    return (
        <SuperadminLayout
            title="Penyaluran Dana"
            activeMenu="distribution"
        >
            <Head title="Penyaluran Dana" />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: 23 }}>Daftar Penyaluran Dana</h2>
                    <p style={{ color: '#82958c', marginTop: 8 }}>
                        Kelola rencana, pelaksanaan, dan laporan penyaluran.
                    </p>
                </div>        
                <button
                    type="button"
                    onClick={() => router.visit('/superadmin/penyaluran/tambah')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '12px 18px',
                        border: 0,
                        borderRadius: 9,
                        background: '#16734f',
                        color: 'white',
                        opacity: 1,
                        cursor: 'pointer',
                    }}
                >
                    <Plus size={18} />
                    Tambah Penyaluran
                </button>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
                gap: 16,
                marginBottom: 24,
            }}>
                {cards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <div key={card.label} style={{
                            background: 'white',
                            border: '1px solid #e5eee9',
                            borderRadius: 14,
                            padding: 20,
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#82958c', fontSize: 13 }}>
                                    {card.label}
                                </span>
                                <Icon size={20} color="#16734f" />
                            </div>

                            <h3 style={{ margin: '16px 0 0', fontSize: 23 }}>
                                {card.value}
                            </h3>
                        </div>
                    );
                })}
            </div>

            <div style={{
                background: 'white',
                border: '1px solid #e5eee9',
                borderRadius: 14,
                padding: 20,
            }}>
                <form onSubmit={search} style={{
                    display: 'flex',
                    gap: 12,
                    flexWrap: 'wrap',
                    marginBottom: 20,
                }}>
                    <input
                        name="search"
                        defaultValue={filters.search || ''}
                        placeholder="Cari kegiatan, program, lokasi..."
                        style={{
                            flex: '1 1 240px',
                            padding: 12,
                            border: '1px solid #dce7e1',
                            borderRadius: 8,
                        }}
                    />

                    <select
                        name="status"
                        defaultValue={filters.status || ''}
                        style={{
                            padding: 12,
                            border: '1px solid #dce7e1',
                            borderRadius: 8,
                        }}
                    >
                        <option value="">Semua Status</option>
                        <option value="planned">Direncanakan</option>
                        <option value="ongoing">Berlangsung</option>
                        <option value="completed">Selesai</option>
                        <option value="cancelled">Dibatalkan</option>
                    </select>

                    <button type="submit" style={{
                        padding: '12px 20px',
                        background: '#e4f3eb',
                        color: '#16734f',
                        border: 0,
                        borderRadius: 8,
                        cursor: 'pointer',
                    }}>
                        <Search size={16} style={{ verticalAlign: 'middle' }} /> Cari
                    </button>
                </form>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        minWidth: 750,
                    }}>
                        <thead>
                            <tr style={{ background: '#f5f8f6', textAlign: 'left' }}>
                                {[
                                    'KEGIATAN',
                                    'PROGRAM',
                                    'LOKASI',
                                    'TANGGAL',
                                    'PENERIMA',
                                    'TOTAL BIAYA',
                                    'STATUS',
                                    'AKSI',
                                ].map((heading) => (
                                    <th key={heading} style={{
                                        padding: 14,
                                        fontSize: 12,
                                        color: '#71877b',
                                    }}>
                                        {heading}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {distributions.data.length > 0 ? (
                                distributions.data.map((item) => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #edf1ee' }}>
                                       <td style={{ padding: 14, fontWeight: 600 }}>
                                            <div>{item.title}</div>
                                        </td>
                                        <td style={{ padding: 14 }}>
                                            {item.campaign_title || '-'}
                                        </td>
                                        <td style={{ padding: 14 }}>
                                            {item.location || '-'}
                                        </td>
                                        <td style={{ padding: 14 }}>
                                            {item.distribution_date || '-'}
                                        </td>
                                        <td style={{ padding: 14 }}>
                                            {item.actual_quantity || 0} / {item.planned_quantity || 0}
                                        </td>
                                        <td style={{ padding: 14 }}>
                                            {rupiah(item.total_cost)}
                                        </td>
                                        <td style={{ padding: 14 }}>
                                            {statusLabels[item.status] || item.status}
                                        </td>
                                        <td style={{ padding: 14 }}>
                                            <Link
                                                href={`/superadmin/penyaluran/${item.id}`}
                                                style={{
                                                    color: '#16734f',
                                                    textDecoration: 'none',
                                                    fontWeight: 600,
                                                }}
                                            >
                                                Lihat Detail
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" style={{
                                        textAlign: 'center',
                                        padding: 50,
                                        color: '#82958c',
                                    }}>
                                        <HandHeart size={32} style={{ marginBottom: 10 }} />
                                        <div>Belum ada kegiatan penyaluran dana.</div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 12,
                    flexWrap: 'wrap',
                    marginTop: 20,
                    color: '#82958c',
                    fontSize: 13,
                }}>
                    <span>
                        Menampilkan {distributions.from || 0}–{distributions.to || 0} dari {distributions.total} kegiatan
                    </span>

                    <div style={{ display: 'flex', gap: 8 }}>
                        {distributions.links.map((link, index) => (
                            <button
                                key={index}
                                disabled={!link.url}
                                onClick={() => link.url && router.visit(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                style={{
                                    padding: '8px 12px',
                                    border: '1px solid #e1eae4',
                                    borderRadius: 7,
                                    background: link.active ? '#16734f' : 'white',
                                    color: link.active ? 'white' : '#52675c',
                                    cursor: link.url ? 'pointer' : 'default',
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </SuperadminLayout>
    );
}
