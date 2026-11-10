
import React from 'react';
import { Head, router } from '@inertiajs/react';
import SuperadminLayout from '../../../Components/SuperadminLayout';
import {
    ArrowLeft,
    Receipt,
    CreditCard,
    MessageSquare,
    History,
    CheckCircle,
    Clock,
    XCircle,
    AlertCircle,
} from 'lucide-react';

const rupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

const dateFormat = (value) => {
    if (!value) return '-';

    return new Date(value).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const statusLabels = {
    paid: 'Berhasil',
    pending: 'Menunggu',
    failed: 'Gagal',
    expired: 'Kedaluwarsa',
};

const statusIcons = {
    paid: CheckCircle,
    pending: Clock,
    failed: XCircle,
    expired: AlertCircle,
};

export default function TransactionShow({
    transaction,
    payment,
    history,
}) {
    const total =
        Number(transaction.donation_amount || 0) +
        Number(transaction.operational_support || 0);

        const simulateStatus = (status) => {
            if (!window.confirm(
                'Apakah kamu yakin ingin mengubah status transaksi ini melalui simulasi? Ini bukan pembayaran sungguhan.'
            )) {
                return;
            }
        
            router.post(
                `/superadmin/transaksi/${transaction.id}/simulasi-status`,
                { status }
            );
        };

    return (
        <SuperadminLayout activeMenu="transactions">
            <Head title={`Detail ${transaction.donation_code}`} />

            <div className="st-page">
                <div className="st-heading">
                    <div>
                        <span className="st-eyebrow">
                            PENGELOLAAN TRANSAKSI
                        </span>
                        <h1>Detail Transaksi</h1>
                        <p>Informasi lengkap transaksi donasi.</p>
                    </div>

                    <button
                        type="button"
                        className="st-reset-button"
                        onClick={() =>
                            router.visit('/superadmin/transaksi')
                        }
                    >
                        <ArrowLeft size={17} />
                        Kembali
                    </button>
                </div>

                {/* INFORMASI DONASI */}
                <section className="st-panel">
                    <div className="st-panel-heading">
                        <div>
                            <h2>
                                <Receipt
                                    size={20}
                                    style={{
                                        marginRight: 8,
                                        verticalAlign: 'middle',
                                    }}
                                />
                                {transaction.donation_code}
                            </h2>
                            <p>
                                Dibuat pada {dateFormat(transaction.donation_date)}
                            </p>
                        </div>

                             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                                <span className={`st-status ${transaction.payment_status}`}>
                                    {statusLabels[transaction.payment_status] ||
                                        transaction.payment_status}
                                </span>

                                {transaction.is_simulated && (
                                    <span style={{
                                        background: '#fff1cc',
                                        color: '#946200',
                                        padding: '5px 10px',
                                        borderRadius: 6,
                                        fontSize: 11,
                                        fontWeight: 700,
                                        letterSpacing: '0.5px',
                                    }}>
                                        SIMULASI — BUKAN PEMBAYARAN NYATA
                                    </span>
                                )}
                            </div>
                    </div>

                    <div className="st-detail-list">
                        <div>
                            <span>Nama donatur</span>
                            <strong>
                                {transaction.is_anonymous
                                    ? 'Hamba Allah'
                                    : transaction.donor_name}
                            </strong>
                        </div>

                        <div>
                            <span>Email</span>
                            <strong>{transaction.donor_email || '-'}</strong>
                        </div>

                        <div>
                            <span>Nomor telepon</span>
                            <strong>{transaction.donor_phone || '-'}</strong>
                        </div>

                        <div>
                            <span>Program</span>
                            <strong>{transaction.campaign_title}</strong>
                        </div>

                        <div>
                            <span>Target penerima</span>
                            <strong>{transaction.beneficiary_name || '-'}</strong>
                        </div>

                        <div>
                            <span>Nominal donasi</span>
                            <strong>{rupiah(transaction.donation_amount)}</strong>
                        </div>

                        <div>
                            <span>Dukungan operasional</span>
                            <strong>{rupiah(transaction.operational_support)}</strong>
                        </div>

                        <div>
                            <span>Total donasi dan dukungan</span>
                            <strong>{rupiah(total)}</strong>
                        </div>

                        <div className="st-message">
                            <span>
                                <MessageSquare
                                    size={16}
                                    style={{
                                        marginRight: 6,
                                        verticalAlign: 'middle',
                                    }}
                                />
                                Pesan donatur
                            </span>
                            <strong>{transaction.message || '-'}</strong>
                        </div>
                    </div>
                </section>

                {/* INFORMASI PEMBAYARAN */}
                <section className="st-panel" style={{ marginTop: 24 }}>
                    <div className="st-panel-heading">
                        <div>
                            <h2>
                                <CreditCard
                                    size={20}
                                    style={{
                                        marginRight: 8,
                                        verticalAlign: 'middle',
                                    }}
                                />
                                Informasi Pembayaran
                            </h2>
                            <p>
                                Informasi transaksi dari penyedia pembayaran.
                            </p>
                        </div>
                    </div>

                    <div className="st-detail-list">
                        <div>
                            <span>Penyedia pembayaran</span>
                            <strong>{payment?.provider || 'Belum tersedia'}</strong>
                        </div>

                        <div>
                            <span>Order ID</span>
                            <strong>{payment?.order_id || '-'}</strong>
                        </div>

                        <div>
                            <span>ID transaksi gateway</span>
                            <strong>{payment?.transaction_id || '-'}</strong>
                        </div>

                        <div>
                            <span>Metode pembayaran</span>
                            <strong>{payment?.payment_method || '-'}</strong>
                        </div>

                        <div>
                            <span>Nominal dari gateway</span>
                            <strong>
                                {payment?.gross_amount != null
                                    ? rupiah(payment.gross_amount)
                                    : '-'}
                            </strong>
                        </div>

                        <div>
                            <span>Biaya gateway</span>
                            <strong>
                                {payment?.gateway_fee != null
                                    ? rupiah(payment.gateway_fee)
                                    : '-'}
                            </strong>
                        </div>

                        <div>
                            <span>Status transaksi gateway</span>
                            <strong>{payment?.status || 'Belum tersedia'}</strong>
                        </div>

                        <div>
                            <span>Waktu pembayaran berhasil</span>
                            <strong>{dateFormat(payment?.paid_at)}</strong>
                        </div>
                    </div>
                </section>

                {/* RIWAYAT STATUS */}
                {/* SIMULASI STATUS TRANSAKSI */}
{transaction.payment_status === 'pending' && (
    <section className="st-panel" style={{ marginTop: 24 }}>
        <div className="st-panel-heading">
            <div>
                <h2>Simulasi Status Transaksi</h2>
                <p>
                    Khusus pengujian lokal. Tidak memproses pembayaran sungguhan.
                </p>
            </div>
        </div>

        <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            padding: '0 25px 24px'
        }}>
            <button
                type="button"
                onClick={() => simulateStatus('paid')}
                style={{ background: '#16845c', color: 'white', padding: '12px 18px', border: 0, borderRadius: 8, cursor: 'pointer' }}
            >
                Tandai Berhasil (Simulasi)
            </button>

            <button
                type="button"
                onClick={() => simulateStatus('failed')}
                style={{ background: '#dc4444', color: 'white', padding: '12px 18px', border: 0, borderRadius: 8, cursor: 'pointer' }}
            >
                Tandai Gagal (Simulasi)
            </button>

            <button
                type="button"
                onClick={() => simulateStatus('expired')}
                style={{ background: '#8b6b32', color: 'white', padding: '12px 18px', border: 0, borderRadius: 8, cursor: 'pointer' }}
            >
                Tandai Kedaluwarsa (Simulasi)
            </button>
        </div>
    </section>
)}
                <section className="st-panel" style={{ marginTop: 24 }}>
                    <div className="st-panel-heading">
                        <div>
                            <h2>
                                <History
                                    size={20}
                                    style={{
                                        marginRight: 8,
                                        verticalAlign: 'middle',
                                    }}
                                />
                                Riwayat Status Pembayaran
                            </h2>
                            <p>
                                Catatan perubahan status yang diterima sistem.
                            </p>
                        </div>

                        <span>{history.length} perubahan</span>
                    </div>

                    <div style={{ padding: '20px 25px' }}>
                        {history.length > 0 ? (
                            <div className="st-history-list">
                                {history.map((item) => {
                                    const Icon =
                                        statusIcons[item.new_status] ||
                                        Clock;

                                    return (
                                        <div
                                            className="st-history-item"
                                            key={item.id}
                                        >
                                            <div className="st-history-icon">
                                                <Icon size={19} />
                                            </div>

                                            <div className="st-history-content">
                                                <strong>
                                                    {item.old_status
                                                        ? `${statusLabels[item.old_status] || item.old_status} → `
                                                        : 'Status awal → '}
                                                    {statusLabels[item.new_status] ||
                                                        item.new_status}
                                                </strong>

                                                <span>
                                                    {dateFormat(item.created_at)}
                                                </span>

                                                <small>
                                                    Sumber: {item.provider_status || 'Tidak tersedia'}
                                                </small>

                                                {item.payment_method && (
                                                    <small>
                                                        Metode: {item.payment_method}
                                                    </small>
                                                )}

                                                {item.transaction_id && (
                                                    <small>
                                                        ID transaksi: {item.transaction_id}
                                                    </small>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="st-empty">
                                Belum ada riwayat perubahan status pembayaran.
                                Riwayat akan tercatat setelah sistem menerima
                                perubahan status yang valid dari webhook.
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </SuperadminLayout>
    );
}
