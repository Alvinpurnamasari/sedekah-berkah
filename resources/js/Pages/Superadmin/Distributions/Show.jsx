
import React from 'react';
import { Head, Link } from '@inertiajs/react';
import SuperadminLayout from '../../../Components/SuperadminLayout';
import {
    ArrowLeft,
    HandHeart,
    CalendarDays,
    MapPin,
    Users,
    Wallet,
    ClipboardList,
    ReceiptText,
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

const reportLabels = {
    draft: 'Draft',
    pending: 'Menunggu pemeriksaan',
    approved: 'Disetujui',
    revision: 'Perlu perbaikan',
};

const expenseLabels = {
    pending: 'Menunggu persetujuan',
    approved: 'Disetujui',
    rejected: 'Ditolak',
};

export default function Show({
    distribution,
    expenses,
    expenseSummary,
}) {
    const info = [
        {
            label: 'Program',
            value: distribution.campaign_title || '-',
            icon: HandHeart,
        },
        {
            label: 'Tanggal Penyaluran',
            value: distribution.distribution_date || '-',
            icon: CalendarDays,
        },
        {
            label: 'Lokasi',
            value: distribution.location || '-',
            icon: MapPin,
        },
        {
            label: 'Target Penerima',
            value: `${distribution.planned_quantity || 0} orang`,
            icon: Users,
        },
        {
            label: 'Realisasi Penerima',
            value: `${distribution.actual_quantity || 0} orang`,
            icon: Users,
        },
        {
            label: 'Total Biaya Kegiatan',
            value: rupiah(distribution.total_cost),
            icon: Wallet,
        },
    ];

    return (
        <SuperadminLayout
            title="Detail Penyaluran"
            activeMenu="distribution"
        >
            <Head title={`Detail ${distribution.title}`} />

            <div style={{ marginBottom: 24 }}>
                <Link
                    href="/superadmin/penyaluran"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        color: '#16734f',
                        textDecoration: 'none',
                    }}
                >
                    <ArrowLeft size={18} />
                    Kembali ke Penyaluran Dana
                </Link>

                <h2 style={{ fontSize: 25, marginBottom: 6 }}>
                    Detail Penyaluran
                </h2>

                <p style={{ color: '#82958c', margin: 0 }}>
                    Informasi rencana dan realisasi kegiatan penyaluran.
                </p>
            </div>

            <div style={{
                background: 'white',
                border: '1px solid #e5eee9',
                borderRadius: 14,
                padding: 24,
                marginBottom: 20,
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 16,
                    flexWrap: 'wrap',
                }}>
                    <div>
                        <HandHeart size={25} color="#16734f" />
                        <h2 style={{ margin: '10px 0 6px' }}>
                            {distribution.title}
                        </h2>
                        <p style={{ margin: 0, color: '#82958c' }}>
                            {distribution.campaign_title || 'Program tidak tersedia'}
                        </p>
                    </div> 
                    <div style={{
                        display: 'flex',
                        gap: 8,
                        flexWrap: 'wrap',
                        alignItems: 'center',
                    }}>
                        <span style={{
                            padding: '8px 12px',
                            background: '#e8f4ed',
                            color: '#16734f',
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 600,
                        }}>
                            {statusLabels[distribution.status] || distribution.status}
                        </span>

                        <span style={{
                            padding: '8px 12px',
                            background: '#fff5df',
                            color: '#946200',
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 600,
                        }}>
                            {reportLabels[distribution.report_status] || distribution.report_status}
                        </span>

                        {distribution.status === 'planned' &&
                        distribution.report_status === 'draft' && (
                            <Link
                                href={`/superadmin/penyaluran/${distribution.id}/edit`}
                                style={{
                                    padding: '9px 14px',
                                    borderRadius: 8,
                                    background: '#e8f4ed',
                                    color: '#16734f',
                                    textDecoration: 'none',
                                    fontWeight: 600,
                                }}
                            >
                                Edit Rencana
                            </Link>
                        )}
                    </div>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: 24,
                    marginTop: 32,
                }}>
                    {info.map((item) => {
                        const Icon = item.icon;

                        return (
                            <div key={item.label}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    color: '#82958c',
                                    fontSize: 13,
                                    marginBottom: 8,
                                }}>
                                    <Icon size={17} />
                                    {item.label}
                                </div>

                                <strong>{item.value}</strong>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div style={{
                background: 'white',
                border: '1px solid #e5eee9',
                borderRadius: 14,
                padding: 24,
                marginBottom: 20,
            }}>
                <h3 style={{ marginTop: 0 }}>
                    <ReceiptText
                        size={19}
                        style={{ verticalAlign: 'middle', marginRight: 8 }}
                    />
                    Ringkasan Pengeluaran
                </h3>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: 16,
                }}>
                    <div>
                        <span style={{ color: '#82958c', fontSize: 13 }}>
                            Total pengeluaran tercatat
                        </span>
                        <h3>{rupiah(expenseSummary.total)}</h3>
                    </div>

                    <div>
                        <span style={{ color: '#82958c', fontSize: 13 }}>
                            Disetujui
                        </span>
                        <h3>{rupiah(expenseSummary.approved)}</h3>
                    </div>

                    <div>
                        <span style={{ color: '#82958c', fontSize: 13 }}>
                            Menunggu persetujuan
                        </span>
                        <h3>{rupiah(expenseSummary.pending)}</h3>
                    </div>
                </div>

                <p style={{
                    color: '#82958c',
                    fontSize: 12,
                    marginBottom: 0,
                }}>
                    Ringkasan ini berasal dari tabel pengeluaran yang terhubung
                    langsung dengan kegiatan ini. Bukan penambahan biaya otomatis.
                </p>
            </div>

            <div style={{
                background: 'white',
                border: '1px solid #e5eee9',
                borderRadius: 14,
                padding: 24,
            }}>
                <h3 style={{ marginTop: 0 }}>
                    <ClipboardList
                        size={19}
                        style={{ verticalAlign: 'middle', marginRight: 8 }}
                    />
                    Daftar Pengeluaran Terkait
                </h3>

                {expenses.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            minWidth: 600,
                        }}>
                            <thead>
                                <tr style={{
                                    background: '#f5f8f6',
                                    textAlign: 'left',
                                }}>
                                    {['KATEGORI', 'KETERANGAN', 'NOMINAL', 'STATUS'].map((heading) => (
                                        <th key={heading} style={{
                                            padding: 13,
                                            fontSize: 12,
                                            color: '#71877b',
                                        }}>
                                            {heading}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {expenses.map((expense) => (
                                    <tr key={expense.id} style={{
                                        borderBottom: '1px solid #edf1ee',
                                    }}>
                                        <td style={{ padding: 13 }}>
                                            {expense.expense_category}
                                        </td>
                                        <td style={{ padding: 13 }}>
                                            {expense.description}
                                        </td>
                                        <td style={{ padding: 13 }}>
                                            {rupiah(expense.amount)}
                                        </td>
                                        <td style={{ padding: 13 }}>
                                            {expenseLabels[expense.approval_status] || expense.approval_status}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p style={{
                        textAlign: 'center',
                        padding: 30,
                        color: '#82958c',
                    }}>
                        Belum ada pengeluaran yang terhubung dengan kegiatan ini.
                    </p>
                )}
            </div>
        </SuperadminLayout>
    );
}
