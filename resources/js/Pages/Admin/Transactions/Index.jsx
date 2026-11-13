
import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '../../../Components/AdminLayout';
import {
    Search,
    RefreshCw,
    Receipt,
    CheckCircle,
    Clock,
    XCircle,
    AlertCircle,
    Eye,
} from 'lucide-react';
import '../../../../css/superadmin-transactions.css';

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

export default function TransactionIndex({
    summary,
    transactions,
    filters,
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');

    function applyFilter(e) {
        e.preventDefault();

        router.get('/admin/transaksi', {
            search,
            status,
            start_date: startDate,
            end_date: endDate,
        }, {
            preserveState: true,
            replace: true,
        });
    }

    function resetFilter() {
        setSearch('');
        setStatus('');
        setStartDate('');
        setEndDate('');

        router.get('/admin/transaksi');
    }

    const cards = [
        {
            label: 'Total Transaksi',
            value: summary.total,
            icon: Receipt,
            color: 'blue',
        },
        {
            label: 'Berhasil',
            value: summary.paid,
            icon: CheckCircle,
            color: 'green',
        },
        {
            label: 'Menunggu',
            value: summary.pending,
            icon: Clock,
            color: 'yellow',
        },
        {
            label: 'Gagal',
            value: summary.failed,
            icon: XCircle,
            color: 'red',
        },
        {
            label: 'Kedaluwarsa',
            value: summary.expired,
            icon: AlertCircle,
            color: 'purple',
        },
    ];

    return (
        <AdminLayout activeMenu="transactions">
            <Head title="Transaksi Donasi" />

            <div className="st-page">
                <div className="st-heading">
                    <div>
                        <span className="st-eyebrow">
                            PENGELOLAAN TRANSAKSI
                        </span>
                        <h1>Transaksi Donasi</h1>
                        <p>
                            Pantau transaksi donasi dan status pembayaran.
                        </p>
                    </div>
                </div>

                <section className="st-card-grid">
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
                                    <small>Transaksi tercatat</small>
                                </div>
                            </article>
                        );
                    })}
                </section>

                <section className="st-panel">
                    <div className="st-panel-heading">
                        <div>
                            <h2>Daftar Transaksi Donasi</h2>
                            <p>
                                Cari dan periksa detail transaksi donasi.
                            </p>
                        </div>
                        <span>{transactions.total} transaksi</span>
                    </div>

                    <form className="st-filter" onSubmit={applyFilter}>
                        <div className="st-search">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Cari kode, donatur, email, program..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="">Semua status</option>
                            <option value="pending">Menunggu</option>
                            <option value="paid">Berhasil</option>
                            <option value="failed">Gagal</option>
                            <option value="expired">Kedaluwarsa</option>
                        </select>

                        <label>
                            <span>Dari tanggal</span>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </label>

                        <label>
                            <span>Sampai tanggal</span>
                            <input
                                type="date"
                                value={endDate}
                                min={startDate || undefined}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </label>

                        <button type="submit" className="st-search-button">
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
                        <table className="st-table">
                            <thead>
                                <tr>
                                    <th>Kode Donasi</th>
                                    <th>Donatur</th>
                                    <th>Program</th>
                                    <th>Nominal Donasi</th>
                                    <th>Dukungan Operasional</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Tanggal</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>

                            <tbody>
                                {transactions.data.length > 0 ? (
                                    transactions.data.map((item) => {
                                        const total =
                                            Number(item.donation_amount || 0) +
                                            Number(item.operational_support || 0);

                                        return (
                                            <tr key={item.id}>
                                                <td>
                                                    <strong>{item.donation_code}</strong>
                                                </td>

                                                <td>
                                                    {item.is_anonymous
                                                        ? 'Hamba Allah'
                                                        : item.donor_name}
                                                </td>

                                                <td>{item.campaign_title}</td>

                                                <td>{rupiah(item.donation_amount)}</td>

                                                <td>{rupiah(item.operational_support)}</td>

                                                <td>
                                                    <strong>{rupiah(total)}</strong>
                                                </td>

                                                <td>
                                                    <div style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'flex-start',
                                                        gap: 6,
                                                    }}>
                                                        <span className={`st-status ${item.payment_status}`}>
                                                            {statusLabels[item.payment_status] || item.payment_status}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td>{dateFormat(item.created_at)}</td>

                                                <td>
                                                    <button
                                                        type="button"
                                                        className="st-detail-button"
                                                        onClick={() =>
                                                            router.visit(`/admin/transaksi/${item.id}`)
                                                        }
                                                        title="Lihat detail"
                                                    >
                                                        <Eye size={17} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="9" className="st-empty">
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
                                    onClick={() => link.url && router.visit(link.url)}
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
            </div>
        </AdminLayout>
    );
}
