
import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import SuperadminLayout from '../../../Components/SuperadminLayout';
import {
    Search,
    RefreshCw,
    Receipt,
    CheckCircle,
    AlertTriangle,
    AlertCircle,
} from 'lucide-react';
import '../../../../css/superadmin-transactions.css';

const rupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

const statusLabels = {
    paid: 'Berhasil',
    pending: 'Menunggu',
    failed: 'Gagal',
    expired: 'Kedaluwarsa',
};

const resultLabels = {
    matched: 'Cocok',
    review: 'Perlu diperiksa',
    incomplete: 'Belum lengkap',
};

const resultColors = {
    matched: 'paid',
    review: 'failed',
    incomplete: 'pending',
};

export default function ReconciliationIndex({
    summary,
    transactions,
    filters,
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [result, setResult] = useState(filters.result || '');

    function applyFilter(e) {
        e.preventDefault();
    
        router.get(
            '/superadmin/rekonsiliasi',
            {
                search,
                result,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    }
    function resetFilter() {
        setSearch('');
        setResult('');
    
        router.get('/superadmin/rekonsiliasi');
    }

    const cards = [
        {
            label: 'Total Transaksi',
            value: summary.total,
            icon: Receipt,
            color: 'blue',
            description: 'Transaksi non-simulasi',
        },
        {
            label: 'Cocok',
            value: summary.matched,
            icon: CheckCircle,
            color: 'green',
            description: 'Nominal dan status sesuai',
        },
        {
            label: 'Perlu Diperiksa',
            value: summary.review,
            icon: AlertTriangle,
            color: 'red',
            description: 'Ada perbedaan data',
        },
        {
            label: 'Belum Lengkap',
            value: summary.incomplete,
            icon: AlertCircle,
            color: 'yellow',
            description: 'Data pembayaran belum tersedia',
        },
    ];

    return (
        <SuperadminLayout activeMenu="reconciliation">
            <Head title="Rekonsiliasi Transaksi" />

            <div className="st-page">
                <div className="st-heading">
                    <div>
                        <span className="st-eyebrow">
                            PEMERIKSAAN KEUANGAN
                        </span>

                        <h1>Rekonsiliasi Transaksi</h1>

                        <p>
                            Periksa kesesuaian data donasi dengan transaksi
                            pembayaran.
                        </p>
                    </div>
                </div>

                <section className="st-card-grid reconciliation-card-grid">
                    {cards.map((card) => {
                        const Icon = card.icon;

                        return (
                            <article
                                className="st-summary-card"
                                key={card.label}
                            >
                                <div className={`st-card-icon ${card.color}`}>
                                    <Icon size={22} />
                                </div>

                                <div className="st-card-content">
                                    <span>{card.label}</span>
                                    <strong>{card.value}</strong>
                                    <small>{card.description}</small>
                                </div>
                            </article>
                        );
                    })}
                </section>

                <section className="st-panel">
                    <div className="st-panel-heading">
                        <div>
                            <h2>Hasil Pemeriksaan Transaksi</h2>
                            <p>
                                Perbandingan data donasi dan data pembayaran.
                            </p>
                        </div>

                        <span>{transactions.total} transaksi</span>
                    </div>

                    <form
                        className="st-filter reconciliation-filter"
                        onSubmit={applyFilter}
                    >
                        <div className="st-search">
                            <Search size={18} />

                            <input
                                type="text"
                                placeholder="Cari kode donasi, donatur, atau order ID..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <select
                            value={result}
                            onChange={(e) => setResult(e.target.value)}
                        >
                            <option value="">Semua hasil</option>
                            <option value="matched">Cocok</option>
                            <option value="review">Perlu diperiksa</option>
                            <option value="incomplete">Belum lengkap</option>
                        </select>

                        <button
                            type="submit"
                            className="st-search-button"
                        >
                            <Search size={16} />
                            Cari
                        </button>

                        <button
                            type="button"
                            className="st-reset-button"
                            onClick={resetFilter}
                        >
                            <RefreshCw size={16} />
                            Reset
                        </button>
                    </form>

                    <div className="st-table-wrap">
                        <table className="st-table reconciliation-table">
                            <thead>
                                <tr>
                                    <th>Kode Donasi</th>
                                    <th>Donatur</th>
                                    <th>Program</th>
                                    <th>Total Donasi</th>
                                    <th>Nominal Transaksi</th>
                                    <th>Status Donasi</th>
                                    <th>Status Gateway</th>
                                    <th>Hasil Pemeriksaan</th>
                                    <th>Keterangan</th>
                                </tr>
                            </thead>

                            <tbody>
                                {transactions.data.length > 0 ? (
                                    transactions.data.map((item) => (
                                        <tr key={item.id}>
                                            <td>
                                                <strong>
                                                    {item.donation_code}
                                                </strong>
                                            </td>

                                            <td>{item.donor_name}</td>

                                            <td>
                                                {item.campaign_title || '-'}
                                            </td>

                                            <td>
                                                {rupiah(item.donation_total)}
                                            </td>

                                            <td>
                                                {item.gateway_amount !== null
                                                    ? rupiah(item.gateway_amount)
                                                    : '-'}
                                            </td>

                                            <td>
                                                <span
                                                    className={`st-status ${item.payment_status}`}
                                                >
                                                    {statusLabels[item.payment_status] ||
                                                        item.payment_status}
                                                </span>
                                            </td>

                                            <td>
                                                {item.gateway_status ? (
                                                    <span
                                                        className={`st-status ${item.gateway_status}`}
                                                    >
                                                        {statusLabels[item.gateway_status] ||
                                                            item.gateway_status}
                                                    </span>
                                                ) : (
                                                    '-'
                                                )}
                                            </td>

                                            <td>
                                                <span
                                                    className={`st-status ${resultColors[item.reconciliation_status]}`}
                                                >
                                                    {resultLabels[item.reconciliation_status]}
                                                </span>
                                            </td>

                                            <td className="reconciliation-note">
                                                {item.reconciliation_note}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="9"
                                            className="st-empty"
                                        >
                                            Belum ada transaksi yang sesuai.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="st-pagination">
                        <span>
                            Menampilkan {transactions.from || 0}–
                            {transactions.to || 0} dari {transactions.total}
                        </span>

                        <div>
                            {transactions.links.map((link, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    disabled={!link.url}
                                    className={link.active ? 'active' : ''}
                                    onClick={() =>
                                        link.url && router.visit(link.url)
                                    }
                                >
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="reconciliation-information">
                    <strong>Catatan pemeriksaan</strong>
                    <p>
                        Pemeriksaan ini membandingkan data internal donasi
                        dengan data transaksi pembayaran. Karena gateway
                        pembayaran belum terintegrasi, hasil ini belum
                        merupakan rekonsiliasi terhadap laporan eksternal
                        Midtrans atau mutasi rekening.
                    </p>
                </div>
            </div>
        </SuperadminLayout>
    );
}
