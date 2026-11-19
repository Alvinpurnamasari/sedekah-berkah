
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

export default function AllocationIndex({ summary = [], total_balance = 0 }) {
    return (
        <SuperadminLayout activeMenu="allocation">
            <Head title="Alokasi Dana" />

            <div className="sf-page">
                <div className="sf-heading">
                    <div>
                        <span className="sf-eyebrow">PENGELOLAAN KEUANGAN</span>
                        <h1>Alokasi Dana</h1>
                        <p>
                            Pantau saldo dana program, operasional, dan sponsor
                            berdasarkan pencatatan jurnal keuangan.
                        </p>
                    </div>
                </div>

                <section className="sf-card-grid">
                    {summary.map((group) => {
                        const Icon = icons[group.key] || Wallet;

                        return (
                            <article className="sf-summary-card" key={group.key}>
                                <div className={`sf-card-icon ${colors[group.key] || 'blue'}`}>
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
                            <span>Total Saldo Dana</span>
                            <strong>{rupiah(total_balance)}</strong>
                            <small>Gabungan seluruh kelompok dana</small>
                        </div>
                    </article>
                </section>

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
                                <table className="sf-table">
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
                                                    Belum ada akun pada kelompok dana ini.
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
                        Saldo dihitung dari jurnal berstatus posted.
                        Jurnal draft tidak diperhitungkan. Jurnal pembalik
                        tetap dihitung bersama jurnal asal sehingga dampaknya
                        saling meniadakan. Saldo ini merupakan saldo buku,
                        bukan otomatis berarti seluruh dana bebas dialokasikan.
                    </span>
                </div>
            </div>
        </SuperadminLayout>
    );
}
