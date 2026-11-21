
import React from 'react';
import { Link } from '@inertiajs/react';
import PensedekahLayout from '../../../Components/PensedekahLayout';

const formatRupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value) || 0);

const statusLabels = {
    pending: 'Menunggu Pembayaran',
    paid: 'Berhasil',
    failed: 'Gagal',
    expired: 'Kedaluwarsa',
};

const statusColors = {
    pending: '#d97706',
    paid: '#15803d',
    failed: '#dc2626',
    expired: '#64748b',
};

export default function Index({ summary, donations }) {
    const summaryCards = [
        {
            label: 'Total Donasi',
            value: summary.totalDonations,
        },
        {
            label: 'Total Dana Berhasil',
            value: formatRupiah(summary.totalAmount),
        },
        {
            label: 'Donasi Berhasil',
            value: summary.successfulDonations,
        },
        {
            label: 'Menunggu Pembayaran',
            value: summary.pendingDonations,
        },
    ];

    return (
        <PensedekahLayout title="Riwayat Donasi">
            <div style={{
                maxWidth: 1200,
                margin: '0 auto',
            }}>
                <div style={{ marginBottom: 24 }}>
                    <h2 style={{
                        color: '#176b45',
                        fontSize: 24,
                        fontWeight: 700,
                        marginBottom: 8,
                    }}>
                        Riwayat Donasi
                    </h2>

                    <p style={{
                        color: '#64748b',
                        margin: 0,
                    }}>
                        Daftar donasi yang telah Anda lakukan melalui akun ini.
                    </p>
                </div>

                {/* Ringkasan Donasi */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 16,
                    marginBottom: 25,
                }}>
                    {summaryCards.map((item, index) => (
                        <div
                            key={index}
                            style={{
                                background: '#fff',
                                padding: 22,
                                borderRadius: 14,
                                border: '1px solid #e5e7eb',
                            }}
                        >
                            <p style={{
                                color: '#64748b',
                                margin: '0 0 10px',
                                fontSize: 14,
                            }}>
                                {item.label}
                            </p>

                            <h3 style={{
                                color: '#176b45',
                                margin: 0,
                                fontSize: 22,
                                fontWeight: 700,
                            }}>
                                {item.value}
                            </h3>
                        </div>
                    ))}
                </div>

                {/* Tabel Riwayat Donasi */}
                <section style={{
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: 14,
                    padding: 22,
                    overflow: 'hidden',
                }}>
                    <div style={{ marginBottom: 20 }}>
                        <h3 style={{
                            color: '#176b45',
                            margin: '0 0 6px',
                            fontSize: 18,
                        }}>
                            Daftar Donasi
                        </h3>

                        <p style={{
                            color: '#64748b',
                            margin: 0,
                            fontSize: 14,
                        }}>
                            Informasi donasi dan status pembayaran Anda.
                        </p>
                    </div>

                    {donations.data.length === 0 ? (
                        <div style={{
                            padding: 40,
                            textAlign: 'center',
                            color: '#64748b',
                        }}>
                            <p>Belum ada riwayat donasi.</p>

                            <Link
                                href="/"
                                style={{
                                    color: '#176b45',
                                    fontWeight: 600,
                                    textDecoration: 'none',
                                }}
                            >
                                Mulai Berdonasi
                            </Link>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                minWidth: 750,
                            }}>
                                <thead>
                                    <tr style={{
                                        background: '#f0f7f2',
                                        textAlign: 'left',
                                    }}>
                                        {[
                                            'Kode Donasi',
                                            'Program',
                                            'Nominal',
                                            'Tanggal',
                                            'Status',
                                            'Detail',
                                        ].map((heading) => (
                                            <th
                                                key={heading}
                                                style={{
                                                    padding: 14,
                                                    color: '#176b45',
                                                    fontSize: 13,
                                                    fontWeight: 700,
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {heading}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {donations.data.map((donation) => (
                                        <tr
                                            key={donation.id}
                                            style={{
                                                borderBottom: '1px solid #e5e7eb',
                                            }}
                                        >
                                            <td style={{
                                                padding: 14,
                                                fontSize: 13,
                                                fontWeight: 600,
                                                color: '#334155',
                                            }}>
                                                {donation.donation_code}
                                            </td>

                                            <td style={{
                                                padding: 14,
                                                fontSize: 13,
                                                color: '#334155',
                                            }}>
                                                {donation.campaign_title || '-'}
                                            </td>

                                            <td style={{
                                                padding: 14,
                                                fontSize: 13,
                                                fontWeight: 600,
                                                color: '#334155',
                                                whiteSpace: 'nowrap',
                                            }}>
                                                {formatRupiah(
                                                    Number(donation.donation_amount) +
                                                    Number(donation.operational_support)
                                                )}
                                            </td>

                                            <td style={{
                                                padding: 14,
                                                fontSize: 13,
                                                color: '#64748b',
                                                whiteSpace: 'nowrap',
                                            }}>
                                                {new Date(donation.created_at).toLocaleDateString('id-ID')}
                                            </td>

                                            <td style={{ padding: 14 }}>
                                                <span style={{
                                                    display: 'inline-block',
                                                    padding: '6px 10px',
                                                    borderRadius: 20,
                                                    background: `${statusColors[donation.payment_status] || '#64748b'}15`,
                                                    color: statusColors[donation.payment_status] || '#64748b',
                                                    fontSize: 12,
                                                    fontWeight: 700,
                                                    whiteSpace: 'nowrap',
                                                }}>
                                                    {statusLabels[donation.payment_status] || donation.payment_status}
                                                </span>
                                            </td>

                                            <td style={{ padding: 14 }}>
                                                <Link
                                                    href={`/akun/donasi/${encodeURIComponent(donation.donation_code)}`}
                                                    style={{
                                                        color: '#176b45',
                                                        fontWeight: 700,
                                                        fontSize: 13,
                                                        textDecoration: 'none',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    Lihat Detail →
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {donations.links.length > 3 && (
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 8,
                            marginTop: 22,
                        }}>
                            {donations.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    preserveScroll
                                    style={{
                                        padding: '8px 13px',
                                        borderRadius: 7,
                                        border: '1px solid #e5e7eb',
                                        background: link.active ? '#176b45' : '#fff',
                                        color: link.active ? '#fff' : '#334155',
                                        textDecoration: 'none',
                                        opacity: link.url ? 1 : 0.5,
                                        fontSize: 13,
                                    }}
                                >
                                    <span dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }} />
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </PensedekahLayout>
    );
}
