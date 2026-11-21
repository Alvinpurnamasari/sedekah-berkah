
import React from 'react';
import { Link } from '@inertiajs/react';
import PensedekahLayout from '../../../Components/PensedekahLayout';

const formatRupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value) || 0);

const formatDate = (value) => {
    if (!value) return '-';

    return new Date(value).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const paymentLabels = {
    pending: 'Menunggu Pembayaran',
    paid: 'Berhasil Dibayar',
    failed: 'Pembayaran Gagal',
    expired: 'Kedaluwarsa',
};

const proofLabels = {
    pending: 'Menunggu Verifikasi',
    approved: 'Bukti Transfer Diterima',
    rejected: 'Bukti Transfer Ditolak',
};

function StatusBadge({ status, type = 'payment' }) {
    const labels = type === 'proof' ? proofLabels : paymentLabels;
    const label = labels[status] || status || 'Belum tersedia';

    const colors = {
        paid: { background: '#dcfce7', color: '#166534' },
        approved: { background: '#dcfce7', color: '#166534' },
        pending: { background: '#fef3c7', color: '#92400e' },
        rejected: { background: '#fee2e2', color: '#991b1b' },
        failed: { background: '#fee2e2', color: '#991b1b' },
        expired: { background: '#e2e8f0', color: '#475569' },
    };

    const style = colors[status] || {
        background: '#e2e8f0',
        color: '#475569',
    };

    return (
        <span style={{
            display: 'inline-block',
            padding: '7px 12px',
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 600,
            background: style.background,
            color: style.color,
        }}>
            {label}
        </span>
    );
}

function DetailRow({ label, value }) {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 20,
            padding: '13px 0',
            borderBottom: '1px solid #e5e7eb',
        }}>
            <span style={{ color: '#64748b', fontSize: 14 }}>
                {label}
            </span>

            <strong style={{
                color: '#1e293b',
                textAlign: 'right',
                overflowWrap: 'anywhere',
                fontSize: 14,
            }}>
                {value || '-'}
            </strong>
        </div>
    );
}

export default function Show({ donation }) {
    const total =
        Number(donation.donation_amount || 0) +
        Number(donation.operational_support || 0);

    return (
        <PensedekahLayout title="Detail Donasi">
            <div style={{
                maxWidth: 950,
                margin: '0 auto',
            }}>
                <div style={{ marginBottom: 24 }}>
                    <Link
                        href="/akun/donasi"
                        style={{
                            color: '#176b45',
                            textDecoration: 'none',
                            fontWeight: 600,
                            fontSize: 14,
                        }}
                    >
                        ← Kembali ke Riwayat Donasi
                    </Link>

                    <h2 style={{
                        color: '#176b45',
                        fontSize: 24,
                        fontWeight: 700,
                        margin: '20px 0 8px',
                    }}>
                        Detail Donasi
                    </h2>

                    <p style={{
                        color: '#64748b',
                        margin: 0,
                    }}>
                        Informasi lengkap transaksi donasi Anda.
                    </p>
                </div>

                {/* Ringkasan Transaksi */}
                <section style={{
                    background: '#fff',
                    padding: 24,
                    borderRadius: 14,
                    marginBottom: 20,
                    border: '1px solid #e5e7eb',
                }}>
                    <p style={{
                        color: '#64748b',
                        margin: '0 0 8px',
                        fontSize: 14,
                    }}>
                        Kode Donasi
                    </p>

                    <h3 style={{
                        color: '#176b45',
                        margin: '0 0 18px',
                        fontSize: 21,
                        overflowWrap: 'anywhere',
                    }}>
                        {donation.donation_code}
                    </h3>

                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 10,
                    }}>
                        <StatusBadge status={donation.payment_status} />

                        {donation.proof_status && (
                            <StatusBadge
                                status={donation.proof_status}
                                type="proof"
                            />
                        )}
                    </div>

                    <div style={{
                        background: '#f0f7f2',
                        borderRadius: 10,
                        padding: 20,
                        marginTop: 22,
                    }}>
                        <p style={{
                            color: '#64748b',
                            margin: '0 0 6px',
                            fontSize: 14,
                        }}>
                            Total Donasi
                        </p>

                        <h2 style={{
                            color: '#176b45',
                            fontSize: 28,
                            margin: 0,
                        }}>
                            {formatRupiah(total)}
                        </h2>
                    </div>
                </section>

                {/* Informasi Donasi */}
                <section style={{
                    background: '#fff',
                    padding: 24,
                    borderRadius: 14,
                    marginBottom: 20,
                    border: '1px solid #e5e7eb',
                }}>
                    <h3 style={{
                        color: '#176b45',
                        margin: '0 0 12px',
                    }}>
                        Informasi Donasi
                    </h3>

                    <DetailRow
                        label="Program"
                        value={donation.campaign_title}
                    />

                    <DetailRow
                        label="Tanggal Donasi"
                        value={formatDate(donation.created_at)}
                    />

                    <DetailRow
                        label="Nominal Donasi"
                        value={formatRupiah(donation.donation_amount)}
                    />

                    <DetailRow
                        label="Dukungan Operasional"
                        value={formatRupiah(donation.operational_support)}
                    />

                    <DetailRow
                        label="Total"
                        value={formatRupiah(total)}
                    />

                    <DetailRow
                        label="Pembayaran Berhasil Pada"
                        value={formatDate(donation.paid_at)}
                    />
                </section>

                {/* Informasi Pembayaran */}
                <section style={{
                    background: '#fff',
                    padding: 24,
                    borderRadius: 14,
                    marginBottom: 20,
                    border: '1px solid #e5e7eb',
                }}>
                    <h3 style={{
                        color: '#176b45',
                        margin: '0 0 12px',
                    }}>
                        Informasi Pembayaran
                    </h3>

                    <DetailRow
                        label="Penyedia Pembayaran"
                        value={donation.provider}
                    />

                    <DetailRow
                        label="Nomor Pesanan"
                        value={donation.order_id}
                    />

                    <DetailRow
                        label="Metode Pembayaran"
                        value={donation.payment_method}
                    />

                    <DetailRow
                        label="Jumlah Transaksi"
                        value={
                            donation.gross_amount !== null
                                ? formatRupiah(donation.gross_amount)
                                : '-'
                        }
                    />

                    <DetailRow
                        label="Biaya Gateway"
                        value={
                            donation.gateway_fee !== null
                                ? formatRupiah(donation.gateway_fee)
                                : '-'
                        }
                    />
                </section>

                {/* Verifikasi Bukti Transfer */}
                <section style={{
                    background: '#fff',
                    padding: 24,
                    borderRadius: 14,
                    marginBottom: 20,
                    border: '1px solid #e5e7eb',
                }}>
                    <h3 style={{
                        color: '#176b45',
                        margin: '0 0 12px',
                    }}>
                        Verifikasi Bukti Transfer
                    </h3>

                    <DetailRow
                        label="Status Bukti Transfer"
                        value={
                            donation.proof_status
                                ? (
                                    <StatusBadge
                                        status={donation.proof_status}
                                        type="proof"
                                    />
                                )
                                : 'Belum ada bukti transfer'
                        }
                    />

                    <DetailRow
                        label="Tanggal Upload"
                        value={formatDate(donation.proof_uploaded_at)}
                    />

                    <DetailRow
                        label="Tanggal Verifikasi"
                        value={formatDate(donation.verified_at)}
                    />

                    {donation.verification_note && (
                        <div style={{ paddingTop: 15 }}>
                            <p style={{
                                color: '#64748b',
                                marginBottom: 6,
                                fontSize: 14,
                            }}>
                                Catatan Verifikasi
                            </p>

                            <p style={{
                                color: '#334155',
                                margin: 0,
                                lineHeight: 1.6,
                            }}>
                                {donation.verification_note}
                            </p>
                        </div>
                    )}
                </section>

                {donation.payment_status === 'pending' && (
                    <div style={{
                        background: '#fffbeb',
                        color: '#92400e',
                        padding: 18,
                        borderRadius: 10,
                        marginBottom: 20,
                        lineHeight: 1.6,
                    }}>
                        Pembayaran donasi ini masih menunggu penyelesaian
                        atau verifikasi. Silakan periksa kembali status
                        pembayaran Anda.
                    </div>
                )}

                <div style={{
                    textAlign: 'center',
                    padding: '10px 0 30px',
                }}>
                    <Link
                        href="/akun/donasi"
                        style={{
                            display: 'inline-block',
                            padding: '12px 22px',
                            background: '#176b45',
                            color: '#fff',
                            borderRadius: 8,
                            textDecoration: 'none',
                            fontWeight: 600,
                        }}
                    >
                        ← Kembali ke Riwayat Donasi
                    </Link>
                </div>
            </div>
        </PensedekahLayout>
    );
}
