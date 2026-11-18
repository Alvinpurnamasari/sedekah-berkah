
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
const proofStatusLabels = {
    pending: 'Menunggu pemeriksaan',
    approved: 'Disetujui',
    rejected: 'Ditolak',
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
  
        const gatewayAmount = payment?.gross_amount != null
        ? Number(payment.gross_amount)
        : null;

    const amountMatches = gatewayAmount !== null
        && total === gatewayAmount;

    const statusMatches = payment?.status != null
        && transaction.payment_status === payment.status;

    let reconciliationStatus = 'incomplete';
    let reconciliationNote = 'Data transaksi pembayaran belum tersedia.';

    if (payment) {
        if (amountMatches && statusMatches) {
            reconciliationStatus = 'matched';
            reconciliationNote = 'Nominal dan status pembayaran sesuai.';
        } else {
            reconciliationStatus = 'review';
            reconciliationNote = 'Terdapat perbedaan nominal atau status pembayaran.';
        }
    }

    const reconciliationLabels = {
        matched: 'Cocok',
        review: 'Perlu diperiksa',
        incomplete: 'Belum lengkap',
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

                {/* BUKTI TRANSFER */}
                <section className="st-panel" style={{ marginTop: 24 }}>
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
                                Bukti Transfer
                            </h2>
                            <p>
                                Bukti pembayaran yang diunggah oleh donatur.
                            </p>
                        </div>

                        <span className={`st-status ${transaction.proof_status === 'approved' ? 'paid' : transaction.proof_status === 'rejected' ? 'failed' : 'pending'}`}>
                            {proofStatusLabels[transaction.proof_status] || 'Belum tersedia'}
                        </span>
                    </div>

                    <div className="st-detail-list">
                        <div>
                            <span>Bank tujuan</span>
                            <strong>{transaction.bank_name || '-'}</strong>
                        </div>

                        <div>
                            <span>Nomor rekening</span>
                            <strong>{transaction.bank_account_number || '-'}</strong>
                        </div>

                        <div>
                            <span>Nama pemilik rekening</span>
                            <strong>{transaction.bank_account_holder || '-'}</strong>
                        </div>

                        <div>
                            <span>Waktu unggah bukti</span>
                            <strong>{dateFormat(transaction.proof_uploaded_at)}</strong>
                        </div>

                        <div>
                            <span>Waktu verifikasi</span>
                            <strong>{dateFormat(transaction.verified_at)}</strong>
                        </div>

                        <div>
                            <span>Diperiksa oleh</span>
                            <strong>{transaction.verifier_name || '-'}</strong>
                        </div>

                        {transaction.verification_note && (
                            <div className="st-message">
                                <span>Catatan pemeriksaan</span>
                                <strong>{transaction.verification_note}</strong>
                            </div>
                        )}
                    </div>

                    <div style={{ padding: '20px 25px' }}>
                        {transaction.transfer_proof ? (
                            <div>
                                <p style={{ marginBottom: 12, fontWeight: 600 }}>
                                    Gambar bukti transfer
                                </p>

                                <a
                                    href={`/superadmin/transaksi/${transaction.id}/bukti`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <img
                                        src={`/superadmin/transaksi/${transaction.id}/bukti`}
                                        alt="Bukti transfer donatur"
                                        style={{
                                            display: 'block',
                                            width: '100%',
                                            maxWidth: 520,
                                            maxHeight: 500,
                                            objectFit: 'contain',
                                            borderRadius: 12,
                                            border: '1px solid #e5e7eb',
                                            cursor: 'pointer',
                                        }}
                                    />
                                </a>

                                <small style={{ display: 'block', marginTop: 10, color: '#64748b' }}>
                                    Klik gambar untuk melihat ukuran penuh.
                                </small>
                            </div>
                        ) : (
                            <div className="st-empty">
                                Donatur belum mengunggah bukti transfer.
                            </div>
                        )}
                    </div>
                    {transaction.transfer_proof &&
                transaction.payment_status === 'pending' &&
                transaction.proof_status === 'pending' && (
                    <div
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 12,
                            padding: '0 25px 24px',
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => {
                                const confirmed = window.confirm(
                                    'Apakah Anda yakin ingin menyetujui bukti transfer ini? Transaksi akan ditandai berhasil dan jurnal keuangan akan dibuat.'
                                );

                                if (confirmed) {
                                    router.post(
                                        `/superadmin/transaksi/${transaction.id}/setujui-bukti`,
                                        {},
                                        {
                                            preserveScroll: true,
                                        }
                                    );
                                }
                            }}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '11px 18px',
                                border: 'none',
                                borderRadius: 8,
                                background: '#16a34a',
                                color: '#fff',
                                fontWeight: 600,
                                cursor: 'pointer',
                            }}
                        >
                            <CheckCircle size={17} />
                            Setujui Bukti
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                const reason = window.prompt(
                                    'Masukkan alasan penolakan bukti transfer:'
                                );

                                if (reason === null) return;

                                if (!reason.trim()) {
                                    window.alert(
                                        'Alasan penolakan wajib diisi.'
                                    );
                                    return;
                                }

                                router.post(
                                    `/superadmin/transaksi/${transaction.id}/tolak-bukti`,
                                    {
                                        reason: reason.trim(),
                                    },
                                    {
                                        preserveScroll: true,
                                    }
                                );
                            }}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '11px 18px',
                                border: 'none',
                                borderRadius: 8,
                                background: '#dc2626',
                                color: '#fff',
                                fontWeight: 600,
                                cursor: 'pointer',
                            }}
                        >
                            <XCircle size={17} />
                            Tolak Bukti
                        </button>
                    </div>
                )}
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

                <section className="st-panel" style={{ marginTop: 24 }}>
                    <div className="st-panel-heading">
                        <div>
                            <h2>
                                <CheckCircle
                                    size={20}
                                    style={{
                                        marginRight: 8,
                                        verticalAlign: 'middle',
                                    }}
                                />
                                Hasil Rekonsiliasi
                            </h2>
                            <p>
                                Perbandingan data donasi dengan transaksi pembayaran.
                            </p>
                        </div>

                        <span
                            className={`st-status ${
                                reconciliationStatus === 'matched'
                                    ? 'paid'
                                    : reconciliationStatus === 'review'
                                        ? 'failed'
                                        : 'pending'
                            }`}
                        >
                            {reconciliationLabels[reconciliationStatus]}
                        </span>
                    </div>

                    <div className="st-detail-list">
                        <div>
                            <span>Total donasi dan dukungan</span>
                            <strong>{rupiah(total)}</strong>
                        </div>

                        <div>
                            <span>Nominal transaksi pembayaran</span>
                            <strong>
                                {gatewayAmount !== null
                                    ? rupiah(gatewayAmount)
                                    : 'Belum tersedia'}
                            </strong>
                        </div>

                        <div>
                            <span>Selisih nominal</span>
                            <strong>
                                {gatewayAmount !== null
                                    ? rupiah(Math.abs(total - gatewayAmount))
                                    : '-'}
                            </strong>
                        </div>

                        <div>
                            <span>Kesesuaian status</span>
                            <strong>
                                {payment
                                    ? statusMatches
                                        ? 'Sesuai'
                                        : 'Berbeda'
                                    : 'Belum tersedia'}
                            </strong>
                        </div>

                        <div className="st-message">
                            <span>Keterangan pemeriksaan</span>
                            <strong>{reconciliationNote}</strong>
                        </div>
                    </div>
                </section>

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
