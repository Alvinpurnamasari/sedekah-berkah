
import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import SuperadminLayout from '../../../Components/SuperadminLayout';
import {
    Landmark, Search, Plus, Pencil, Trash2,
    ChevronLeft, ChevronRight, Power, CreditCard
} from 'lucide-react';
import '../../../../css/superadmin-campaigns.css';

export default function DonationAccountIndex({
    accounts,
    filters = {},
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');

    function applyFilters(e) {
        e.preventDefault();

        router.get('/superadmin/rekening-donasi', {
            search,
            status,
        }, {
            preserveState: true,
            replace: true,
        });
    }

    function deleteAccount(account) {
        if (!window.confirm(
            `Yakin ingin menghapus rekening ${account.bank_name} atas nama ${account.account_holder}?`
        )) {
            return;
        }

        router.delete(`/superadmin/rekening-donasi/${account.id}`);
    }

    function toggleStatus(account) {
        const action = account.is_active ? 'menonaktifkan' : 'mengaktifkan';

        if (!window.confirm(
            `Yakin ingin ${action} rekening ${account.bank_name}?`
        )) {
            return;
        }

        router.patch(`/superadmin/rekening-donasi/${account.id}/status`);
    }

    return (
        <SuperadminLayout
            title="Rekening Donasi"
            activeMenu="donation-accounts"
        >
            <Head title="Rekening Donasi - Sedekah Berkah" />

            <div className="sc-page">
                <section className="sc-intro">
                    <div>
                        <span className="sc-eyebrow">
                            PENGELOLAAN KEUANGAN
                        </span>

                        <h2>Rekening Donasi</h2>

                        <p>
                            Kelola rekening bank yang digunakan sebagai
                            tujuan transfer donasi.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="sc-primary"
                        onClick={() => router.visit(
                            '/superadmin/rekening-donasi/tambah'
                        )}
                    >
                        <Plus size={18} />
                        Tambah Rekening
                    </button>
                </section>

                <section className="sc-summary">
                    <div className="sc-summary-icon">
                        <Landmark size={23} />
                    </div>

                    <div>
                        <small>Total rekening ditemukan</small>
                        <h3>
                            {Number(accounts.total || 0).toLocaleString('id-ID')}
                        </h3>
                    </div>
                </section>

                <section className="sc-panel">
                    <form
                        className="sc-filters"
                        onSubmit={applyFilters}
                    >
                        <div className="sc-search">
                            <Search size={18} />

                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Cari bank, nomor rekening, atau pemilik..."
                            />
                        </div>

                        <select
                            value={status}
                            onChange={e => setStatus(e.target.value)}
                        >
                            <option value="">Semua status</option>
                            <option value="active">Aktif</option>
                            <option value="inactive">Nonaktif</option>
                        </select>

                        <button
                            type="submit"
                            className="sc-filter-button"
                        >
                            Cari
                        </button>
                    </form>

                    <div className="sc-table-wrap">
                        <table className="sc-table">
                            <thead>
                                <tr>
                                    <th>Bank</th>
                                    <th>Nomor Rekening</th>
                                    <th>Atas Nama</th>
                                    <th>Keterangan</th>
                                    <th>Status</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>

                            <tbody>
                                {accounts.data.length > 0 ? (
                                    accounts.data.map(account => (
                                        <tr key={account.id}>
                                            <td>
                                                <div className="sc-campaign-name">
                                                    <strong>
                                                        {account.bank_name}
                                                    </strong>
                                                </div>
                                            </td>

                                            <td>
                                                <span className="sc-beneficiary-count">
                                                    <CreditCard size={14} />
                                                    {account.account_number}
                                                </span>
                                            </td>

                                            <td>{account.account_holder}</td>

                                            <td>
                                                {account.description || '-'}
                                            </td>

                                            <td>
                                                <span className={`sc-status ${
                                                    account.is_active
                                                        ? 'sc-status-active'
                                                        : 'sc-status-inactive'
                                                }`}>
                                                    {account.is_active
                                                        ? 'Aktif'
                                                        : 'Nonaktif'
                                                    }
                                                </span>
                                            </td>

                                            <td>
                                                <div className="sc-actions">
                                                    <button
                                                        type="button"
                                                        title="Edit rekening"
                                                        onClick={() => router.visit(
                                                            `/superadmin/rekening-donasi/${account.id}/edit`
                                                        )}
                                                    >
                                                        <Pencil size={16} />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        title={account.is_active
                                                            ? 'Nonaktifkan rekening'
                                                            : 'Aktifkan rekening'
                                                        }
                                                        onClick={() => toggleStatus(account)}
                                                    >
                                                        <Power size={16} />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        title="Hapus rekening"
                                                        onClick={() => deleteAccount(account)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6">
                                            <div className="sc-empty">
                                                <Landmark size={34} />

                                                <strong>
                                                    Belum ada rekening donasi
                                                </strong>

                                                <span>
                                                    Silakan tambahkan rekening
                                                    untuk menerima transfer donasi.
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="sc-pagination">
                        <span>
                            Menampilkan {accounts.from || 0}–{accounts.to || 0}
                            {' '}dari {accounts.total || 0} rekening
                        </span>

                        <div>
                            {accounts.links?.map((link, index) => (
                                <button
                                    key={index}
                                    disabled={!link.url || link.active}
                                    className={link.active ? 'active' : ''}
                                    onClick={() => link.url && router.visit(link.url)}
                                >
                                    {index === 0
                                        ? <ChevronLeft size={16} />
                                        : index === accounts.links.length - 1
                                            ? <ChevronRight size={16} />
                                            : <span
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label
                                                }}
                                            />
                                    }
                                </button>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </SuperadminLayout>
    );
}
