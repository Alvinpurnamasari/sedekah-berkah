
import React from 'react';
import { Head } from '@inertiajs/react';
import SuperadminLayout from '../../../Components/SuperadminLayout';
import {
    Wallet,
    TrendingUp,
    HandCoins,
    Receipt,
    Clock,
    CircleDollarSign,
    Users,
    ArrowDownRight,
    ArrowUpRight,
} from 'lucide-react';
import '../../../../css/superadmin-finance.css';

const rupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

const dateFormat = (value) => {
    if (!value) return '-';

    return new Date(value).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

const statusLabel = {
    paid: 'Berhasil',
    pending: 'Menunggu',
    expired: 'Kedaluwarsa',
    failed: 'Gagal',
    approved: 'Disetujui',
    rejected: 'Ditolak',
};

export default function FinanceIndex({
    summary,
    campaignFinance,
    recentDonations,
    recentExpenses,
}) {
    const cards = [
        {
            label: 'Total Donasi',
            value: rupiah(summary.donation_total),
            icon: HandCoins,
            description: 'Donasi yang sudah dibayar',
            color: 'green',
        },
        {
            label: 'Dukungan Operasional',
            value: rupiah(summary.operational_total),
            icon: TrendingUp,
            description: 'Dana operasional terkumpul',
            color: 'blue',
        },
        {
            label: 'Total Pemasukan',
            value: rupiah(summary.total_income),
            icon: Wallet,
            description: 'Donasi + dukungan operasional',
            color: 'purple',
        },
        {
            label: 'Pengeluaran Disetujui',
            value: rupiah(summary.approved_expense),
            icon: Receipt,
            description: 'Pengeluaran yang telah disetujui',
            color: 'orange',
        },
        {
            label: 'Menunggu Persetujuan',
            value: rupiah(summary.pending_expense),
            icon: Clock,
            description: 'Pengajuan pengeluaran tertunda',
            color: 'yellow',
        },
        {
            label: 'Saldo Tersedia',
            value: rupiah(summary.available_balance),
            icon: CircleDollarSign,
            description: 'Pemasukan dikurangi pengeluaran disetujui',
            color: 'dark',
        },
    ];

    return (
        <SuperadminLayout activeMenu="finance">
            <Head title="Manajemen Keuangan" />

            <div className="sf-page">
                <div className="sf-heading">
                    <div>
                        <span className="sf-eyebrow">PENGELOLAAN KEUANGAN</span>
                        <h1>Manajemen Keuangan</h1>
                        <p>
                            Pantau pemasukan, pengeluaran, dan saldo seluruh
                            program Sedekah Berkah.
                        </p>
                    </div>
                </div>

                <section className="sf-card-grid">
                    {cards.map((card) => {
                        const Icon = card.icon;

                        return (
                            <article className="sf-summary-card" key={card.label}>
                                <div className={`sf-card-icon ${card.color}`}>
                                    <Icon size={22} />
                                </div>

                                <div className="sf-card-content">
                                    <span>{card.label}</span>
                                    <strong>{card.value}</strong>
                                    <small>{card.description}</small>
                                </div>
                            </article>
                        );
                    })}
                </section>

                <section className="sf-panel">
                    <div className="sf-panel-heading">
                        <div>
                            <h2>Ringkasan Keuangan Program</h2>
                            <p>Pemasukan berdasarkan program sedekah.</p>
                        </div>
                    </div>
                    <div className="sf-table-wrap">
                        <table className="sf-table">
                            <thead>
                                <tr>
                                    <th>Nama Program</th>
                                    <th>Total Donasi</th>
                                    <th>Dukungan Operasional</th>
                                    <th>Jumlah Donatur</th>
                                </tr>
                            </thead>

                            <tbody>
                                {campaignFinance.length > 0 ? (
                                    campaignFinance.map((item) => (
                                        <tr key={item.id}>
                                            <td>
                                                <strong>{item.title}</strong>
                                            </td>
                                            <td>{rupiah(item.donation_total)}</td>
                                            <td>{rupiah(item.operational_total)}</td>
                                            <td>
                                                <span className="sf-donor-count">
                                                    <Users size={15} />
                                                    {item.donor_count}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="sf-empty">
                                            Belum ada data program.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="sf-panel">
                    <div className="sf-panel-heading">
                        <div>
                            <h2>Donasi Terbaru</h2>
                            <p>Delapan transaksi donasi terakhir.</p>
                        </div>
                    </div>

                    <div className="sf-table-wrap">
                        <table className="sf-table">
                            <thead>
                                <tr>
                                    <th>Kode Donasi</th>
                                    <th>Nama Pensedekah</th>
                                    <th>Program</th>
                                    <th>Nominal Donasi</th>
                                    <th>Dukungan Operasional</th>
                                    <th>Total Masuk</th>
                                    <th>Status</th>
                                    <th>Tanggal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentDonations.length > 0 ? (
                                    recentDonations.map((item) => {
                                        const donation = Number(item.donation_amount || 0);
                                        const operational = Number(item.operational_support || 0);
                                        const total = donation + operational;

                                        return (
                                            <tr key={item.id}>
                                                <td>
                                                    <strong>{item.donation_code}</strong>
                                                </td>
                                                <td>{item.donor_name}</td>
                                                <td>{item.campaign_title}</td>
                                                <td>{rupiah(donation)}</td>
                                                <td>{rupiah(operational)}</td>
                                                <td>
                                                    <strong>{rupiah(total)}</strong>
                                                </td>
                                                <td>
                                                    <span className={`sf-status ${item.payment_status}`}>
                                                        {statusLabel[item.payment_status] || item.payment_status}
                                                    </span>
                                                </td>
                                                <td>{dateFormat(item.created_at)}</td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="sf-empty">
                                            Belum ada transaksi donasi.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="sf-panel">
                    <div className="sf-panel-heading">
                        <div>
                            <h2>Pengeluaran Terbaru</h2>
                            <p>Pengajuan dan pengeluaran yang tercatat di sistem.</p>
                        </div>
                    </div>

                    <div className="sf-table-wrap">
                        <table className="sf-table">
                            <thead>
                                <tr>
                                    <th>Kategori</th>
                                    <th>Keterangan</th>
                                    <th>Program</th>
                                    <th>Nominal</th>
                                    <th>Status Persetujuan</th>
                                    <th>Tanggal</th>
                                </tr>
                            </thead>

                            <tbody>
                                {recentExpenses.length > 0 ? (
                                    recentExpenses.map((item) => (
                                        <tr key={item.id}>
                                            <td>{item.expense_category}</td>
                                            <td>{item.description}</td>
                                            <td>{item.campaign_title || 'Umum'}</td>
                                            <td>{rupiah(item.amount)}</td>
                                            <td>
                                                <span className={`sf-status ${item.approval_status}`}>
                                                    {statusLabel[item.approval_status] || item.approval_status}
                                                </span>
                                            </td>
                                            <td>{dateFormat(item.created_at)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="sf-empty">
                                            Belum ada data pengeluaran.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                <div className="sf-note">
                    <ArrowUpRight size={17} />
                    <span>
                        Pemasukan dihitung dari donasi berstatus berhasil.
                        Saldo tersedia belum memperhitungkan pengeluaran yang
                        masih menunggu persetujuan.
                    </span>
                    <ArrowDownRight size={17} />
                </div>
            </div>
        </SuperadminLayout>
    );
}
