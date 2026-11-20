import React from 'react';
import { Head, router } from '@inertiajs/react';
import {
    CreditCard,
    Receipt,
    Wallet,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';

import SuperadminLayout from '../../../Components/SuperadminLayout';
import '../../../../css/superadmin-finance.css';

const rupiah = (value) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value || 0));
};

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

const providerLabel = (provider) => {
    const labels = {
        midtrans: 'Midtrans',
        manual_bank_transfer: 'Transfer Bank Manual',
    };

    return labels[provider] || provider || '-';
};

export default function Index({
    summary = {},
    providerSummary = [],
    transactions = {},
}) {
    const transactionData = transactions.data || [];
    const paginationLinks = transactions.links || [];

    const cards = [
        {
            title: 'Total Biaya Payment Gateway',
            value: rupiah(summary.total_gateway_fee),
            description: 'Akumulasi biaya dari transaksi berhasil',
            icon: Wallet,
        },
        {
            title: 'Transaksi Berhasil',
            value: Number(summary.total_transactions || 0).toLocaleString('id-ID'),
            description: 'Transaksi pembayaran nyata',
            icon: Receipt,
        },
        {
            title: 'Total Pembayaran',
            value: rupiah(summary.total_payment),
            description: 'Total nilai pembayaran berhasil',
            icon: CreditCard,
        },
    ];

    return (
        <SuperadminLayout
            title="Biaya Payment Gateway"
            activeMenu="gateway-fees"
        >
            <Head title="Biaya Payment Gateway" />

            <div className="sf-page">
                <div className="sf-page-heading">
                    <div>
                        <h2>Biaya Payment Gateway</h2>
                        <p>
                            Pantau biaya layanan pembayaran dari transaksi
                            donasi yang berhasil.
                        </p>
                    </div>
                </div>

                {/* Ringkasan */}
                <div className="sf-card-grid">
                    {cards.map((card, index) => {
                        const Icon = card.icon;

                        return (
                            <div className="sf-summary-card" key={index}>
                                <div className="sf-card-icon">
                                    <Icon size={22} />
                                </div>

                                <div className="sf-card-content">
                                    <span>{card.title}</span>
                                    <strong>{card.value}</strong>
                                    <small>{card.description}</small>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Informasi */}
                <div className="sf-panel">
                    <div className="sf-panel-heading">
                        <div>
                            <h3>Informasi Perhitungan</h3>
                            <p>
                                Data hanya menghitung transaksi berhasil
                                dari donasi nyata, bukan transaksi simulasi.
                            </p>
                        </div>
                    </div>

                    <div style={{ padding: '18px 20px' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 12,
                        }}>
                            <TrendingUp size={20} />
                            <div>
                                <strong>Dasar pencatatan biaya</strong>
                                <p style={{ marginTop: 6 }}>
                                    Biaya gateway mengikuti nilai yang tercatat
                                    pada transaksi pembayaran. Transaksi yang
                                    masih pending dan transaksi simulasi tidak
                                    dimasukkan dalam perhitungan.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ringkasan Provider */}
                <div className="sf-panel">
                    <div className="sf-panel-heading">
                        <div>
                            <h3>Ringkasan Penyedia Pembayaran</h3>
                            <p>
                                Perbandingan pembayaran dan biaya berdasarkan
                                penyedia layanan.
                            </p>
                        </div>
                    </div>

                    <div className="sf-table-wrap">
                        <table className="sf-table">
                            <thead>
                                <tr>
                                    <th>Penyedia</th>
                                    <th>Jumlah Transaksi</th>
                                    <th>Total Pembayaran</th>
                                    <th>Total Biaya Gateway</th>
                                </tr>
                            </thead>

                            <tbody>
                                {providerSummary.length > 0 ? (
                                    providerSummary.map((item, index) => (
                                        <tr key={index}>
                                            <td>
                                                <strong>
                                                    {providerLabel(item.provider)}
                                                </strong>
                                            </td>
                                            <td>
                                                {Number(item.total_transactions || 0)
                                                    .toLocaleString('id-ID')}
                                            </td>
                                            <td>{rupiah(item.total_payment)}</td>
                                            <td>
                                                <strong>
                                                    {rupiah(item.total_gateway_fee)}
                                                </strong>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="sf-empty">
                                            Belum ada data biaya payment gateway.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Riwayat Transaksi */}
                <div className="sf-panel">
                    <div className="sf-panel-heading">
                        <div>
                            <h3>Riwayat Transaksi Pembayaran</h3>
                            <p>
                                Daftar transaksi berhasil beserta biaya
                                payment gateway yang tercatat.
                            </p>
                        </div>
                    </div>

                    <div className="sf-table-wrap">
                        <table className="sf-table">
                            <thead>
                                <tr>
                                    <th>Kode Donasi</th>
                                    <th>Donatur</th>
                                    <th>Program</th>
                                    <th>Penyedia</th>
                                    <th>Metode Pembayaran</th>
                                    <th>Total Pembayaran</th>
                                    <th>Biaya Gateway</th>
                                    <th>Tanggal Pembayaran</th>
                                </tr>
                            </thead>

                            <tbody>
                                {transactionData.length > 0 ? (
                                    transactionData.map((item) => (
                                        <tr key={item.id}>
                                            <td>
                                                <strong>
                                                    {item.donation_code || '-'}
                                                </strong>
                                            </td>
                                            <td>{item.donor_name || 'Anonim'}</td>
                                            <td>{item.campaign_title || '-'}</td>
                                            <td>
                                                {providerLabel(item.provider)}
                                            </td>
                                            <td>
                                                {item.payment_method || '-'}
                                            </td>
                                            <td>{rupiah(item.gross_amount)}</td>
                                            <td>
                                                <strong>
                                                    {rupiah(item.gateway_fee)}
                                                </strong>
                                            </td>
                                            <td>{formatDate(item.paid_at)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="sf-empty">
                                            Belum ada transaksi pembayaran
                                            berhasil yang tercatat.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {Number(transactions.last_page || 1) > 1 && (
                        <div className="sf-pagination">
                            {paginationLinks.map((link, index) => {
                                let label = link.label;

                                if (label.includes('previous')) {
                                    label = '«';
                                } else if (label.includes('next')) {
                                    label = '»';
                                }

                                return (
                                    <button
                                        key={index}
                                        type="button"
                                        disabled={!link.url || link.active}
                                        className={link.active ? 'active' : ''}
                                        onClick={() => {
                                            if (link.url) {
                                                router.visit(link.url, {
                                                    preserveScroll: true,
                                                    preserveState: true,
                                                });
                                            }
                                        }}
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </SuperadminLayout>
    );
}