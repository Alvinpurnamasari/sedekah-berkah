
import React from 'react';
import { Head } from '@inertiajs/react';
import SuperadminLayout from '../../../Components/SuperadminLayout';
import {
    Wallet,
    HandCoins,
    Building2,
    HeartHandshake,
    CircleDollarSign,
    Info,
    TrendingUp,
    TrendingDown,
    Landmark,
    PiggyBank,
    AlertTriangle,
    Link2Off,
    BadgeCheck,
} from 'lucide-react';
import '../../../../css/superadmin-finance.css';

const rupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

const icons = {
    program: HandCoins,
    operational: Building2,
    sponsor: HeartHandshake,
};

const colors = {
    program: 'green',
    operational: 'blue',
    sponsor: 'purple',
};

export default function AllocationIndex({
    summary = [],
    total_balance = 0,
    campaigns = [],
    allocation_totals = {},
}) {
    const totals = [
        {
            label: 'Dana Masuk Program',
            value: allocation_totals.program_received,
            icon: TrendingUp,
            color: 'green',
            description: 'Donasi riil yang berhasil dibayar',
        },
        {
            label: 'Pengeluaran Program',
            value: allocation_totals.program_expenses,
            icon: TrendingDown,
            color: 'blue',
            description: 'Pengeluaran riil yang sudah dibayar',
        },
        {
            label: 'Saldo Dana Program',
            value: allocation_totals.program_remaining,
            icon: Wallet,
            color: 'dark',
            description: 'Dana masuk dikurangi pengeluaran',
        },
        {
            label: 'Dukungan Operasional',
            value: allocation_totals.operational_support,
            icon: Building2,
            color: 'purple',
            description: 'Dukungan operasional dari donatur',
        },
        {
            label: 'Anggaran Disetujui',
            value: allocation_totals.allocated_budget,
            icon: BadgeCheck,
            color: 'blue',
            description: 'Total anggaran penyaluran yang disetujui',
        },
        {
            label: 'Dana Belum Dialokasikan',
            value: allocation_totals.unallocated_funds,
            icon: PiggyBank,
            color: 'green',
            description: 'Dana masuk dikurangi anggaran disetujui',
        },
        {
            label: 'Kekurangan Dana',
            value: allocation_totals.funding_shortfall,
            icon: AlertTriangle,
            color: 'purple',
            description: 'Anggaran disetujui yang belum didukung dana masuk',
        },
        {
            label: 'Anggaran Belum Terhubung',
            value: allocation_totals.unmapped_approved_budget,
            icon: Link2Off,
            color: 'dark',
            description: 'Anggaran yang belum terhubung ke akun program',
        },
    ];

    return (
        <SuperadminLayout activeMenu="allocation">
            <Head title="Alokasi Dana" />

            <div className="sf-page">
                <div className="sf-heading">
                    <div>
                        <span className="sf-eyebrow">
                            PENGELOLAAN KEUANGAN
                        </span>
                        <h1>Alokasi Dana</h1>
                        <p>
                            Pantau dana masuk, pengeluaran, anggaran
                            penyaluran, dan dana yang belum dialokasikan.
                        </p>
                    </div>
                </div>

                {/* Ringkasan dana dan alokasi */}
                <section className="sf-card-grid">
                    {totals.map((item) => {
                        const Icon = item.icon;

                        return (
                            <article
                                className="sf-summary-card"
                                key={item.label}
                            >
                                <div className={`sf-card-icon ${item.color}`}>
                                    <Icon size={22} />
                                </div>

                                <div className="sf-card-content">
                                    <span>{item.label}</span>
                                    <strong>{rupiah(item.value)}</strong>
                                    <small>{item.description}</small>
                                </div>
                            </article>
                        );
                    })}
                </section>

                {/* Rincian dana setiap kampanye */}
                <section className="sf-panel sf-allocation-panel">
                    <div className="sf-panel-heading">
                        <div>
                            <h2>
                                <HandCoins
                                    size={19}
                                    style={{
                                        display: 'inline',
                                        verticalAlign: 'middle',
                                        marginRight: 8,
                                    }}
                                />
                                Alokasi Dana Per Program
                            </h2>
                            <p>
                                Rincian dana masuk, anggaran disetujui,
                                pengeluaran, dan sisa dana setiap program.
                            </p>
                        </div>
                    </div>

                    <div className="sf-table-wrap">
                    <table className="sf-table sf-allocation-table">
                            <thead>
                                <tr>
                                    <th>Nama Program</th>
                                    <th>Kategori</th>
                                    <th>Akun</th>
                                    <th>Dana Masuk</th>
                                    <th>Anggaran Disetujui</th>
                                    <th>Pengeluaran</th>
                                    <th>Saldo Dana</th>
                                    <th>Belum Dialokasikan</th>
                                    <th>Kekurangan Dana</th>
                                </tr>
                            </thead>

                            <tbody>
                                {campaigns.length > 0 ? (
                                    campaigns.map((campaign) => (
                                        <tr key={campaign.id}>
                                            <td>
                                                <strong>{campaign.title}</strong>
                                                <br />
                                                <small>{campaign.status}</small>
                                            </td>

                                            <td>
                                                {campaign.category_name || '-'}
                                            </td>

                                            <td>
                                                <strong>
                                                    {campaign.account_code}
                                                </strong>
                                                <br />
                                                <small>
                                                    {campaign.account_name}
                                                </small>
                                            </td>

                                            <td>
                                                <strong>
                                                    {rupiah(campaign.total_donations)}
                                                </strong>
                                            </td>

                                            <td>
                                                {rupiah(campaign.allocated_budget)}
                                            </td>

                                            <td>
                                                {rupiah(campaign.total_expenses)}
                                            </td>

                                            <td>
                                                <strong>
                                                    {rupiah(campaign.remaining_balance)}
                                                </strong>
                                            </td>

                                            <td>
                                                <strong>
                                                    {rupiah(campaign.unallocated_balance)}
                                                </strong>
                                            </td>

                                            <td>
                                                <strong>
                                                    {rupiah(campaign.funding_shortfall)}
                                                </strong>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="9" className="sf-empty">
                                            Belum ada kampanye yang terhubung
                                            dengan akun dana program.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Saldo kelompok dana berdasarkan jurnal */}
                <section className="sf-card-grid">
                    {summary.map((group) => {
                        const Icon = icons[group.key] || Wallet;

                        return (
                            <article
                                className="sf-summary-card"
                                key={group.key}
                            >
                                <div
                                    className={`sf-card-icon ${colors[group.key] || 'blue'}`}
                                >
                                    <Icon size={22} />
                                </div>

                                <div className="sf-card-content">
                                    <span>{group.label}</span>
                                    <strong>{rupiah(group.balance)}</strong>
                                    <small>
                                        Saldo berdasarkan jurnal yang diposting
                                    </small>
                                </div>
                            </article>
                        );
                    })}

                    <article className="sf-summary-card">
                        <div className="sf-card-icon dark">
                            <CircleDollarSign size={22} />
                        </div>

                        <div className="sf-card-content">
                            <span>Total Saldo Buku</span>
                            <strong>{rupiah(total_balance)}</strong>
                            <small>Gabungan seluruh kelompok dana</small>
                        </div>
                    </article>
                </section>

                {/* Rincian akun buku besar */}
                {summary.map((group) => {
                    const Icon = icons[group.key] || Wallet;

                    return (
                        <section className="sf-panel" key={group.key}>
                            <div className="sf-panel-heading">
                                <div>
                                    <h2>
                                        <Icon
                                            size={19}
                                            style={{
                                                display: 'inline',
                                                verticalAlign: 'middle',
                                                marginRight: 8,
                                            }}
                                        />
                                        {group.label}
                                    </h2>
                                    <p>
                                        Rincian akun buku besar kelompok dana ini.
                                    </p>
                                </div>

                                <strong>{rupiah(group.balance)}</strong>
                            </div>

                            <div className="sf-table-wrap">
                            <table className="sf-table sf-allocation-table">
                                    <thead>
                                        <tr>
                                            <th>Kode Akun</th>
                                            <th>Nama Akun</th>
                                            <th>Jenis Akun</th>
                                            <th>Saldo</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {group.accounts?.length > 0 ? (
                                            group.accounts.map((account) => (
                                                <tr key={account.id}>
                                                    <td>
                                                        <strong>{account.code}</strong>
                                                    </td>
                                                    <td>{account.name}</td>
                                                    <td>{account.account_type}</td>
                                                    <td>
                                                        <strong>
                                                            {rupiah(account.balance)}
                                                        </strong>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="sf-empty">
                                                    Belum ada akun pada kelompok
                                                    dana ini.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    );
                })}

                <div className="sf-note">
                    <Info size={18} />
                    <span>
                        Dana masuk hanya menghitung donasi riil berstatus paid.
                        Pengeluaran hanya menghitung transaksi riil yang
                        disetujui dan sudah dibayar. Anggaran dialokasikan
                        berdasarkan penyaluran riil dengan status approved.
                        Dana belum dialokasikan dihitung dari dana masuk
                        dikurangi anggaran yang disetujui. Kekurangan dana
                        menunjukkan anggaran yang belum didukung dana masuk.
                        Anggaran yang belum terhubung ke akun program
                        ditampilkan secara terpisah. Transaksi simulasi,
                        pending, dan ditolak tidak diperhitungkan.
                    </span>
                </div>
            </div>
        </SuperadminLayout>
    );
}
