import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import SuperadminLayout from '../../../Components/SuperadminLayout';
import {
    Megaphone, Search, Plus, Pencil, Eye,
    ChevronLeft, ChevronRight, MapPin, Users, Trash2
} from 'lucide-react';
import '../../../../css/superadmin-campaigns.css';

const rupiah = (value) => new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
}).format(Number(value || 0));

const statusLabel = {
    draft: 'Draft',
    active: 'Aktif',
    published: 'Published',
};

export default function CampaignIndex({
    campaigns,
    filters = {},
    statuses = {},
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');

    function applyFilters(e) {
        e.preventDefault();

        router.get('/superadmin/program', {
            search,
            status,
        }, {
            preserveState: true,
            replace: true,
        });
    }

    function deleteCampaign(campaign) {
        console.log('DATA PROGRAM:', campaign);
        console.log('ID PROGRAM:', campaign.id);
    
        if (!campaign.id) {
            alert('ID program tidak ditemukan. Program tidak dapat dihapus.');
            return;
        }
    
        const url = `/superadmin/program/${campaign.id}`;
    
        console.log('URL HAPUS:', url);
    
        if (!window.confirm(
            `Yakin ingin menghapus program "${campaign.title}"?`
        )) {
            return;
        }
    
        router.delete(url);
    }

    return (
        <SuperadminLayout
            title="Manajemen Program"
            activeMenu="programs"
        >
            <Head title="Manajemen Program - Sedekah Berkah" />

            <div className="sc-page">
                <section className="sc-intro">
                    <div>
                        <span className="sc-eyebrow">PENGELOLAAN KAMPANYE</span>
                        <h2>Manajemen Program</h2>
                        <p>
                            Kelola seluruh program sedekah dan target penerima manfaat.
                        </p>
                    </div>

                    <button
                        className="sc-primary"
                        onClick={() => router.visit('/superadmin/program/tambah')}
                    >
                        <Plus size={18} />
                        Tambah Program
                    </button>
                </section>

                <section className="sc-summary">
                    <div className="sc-summary-icon">
                        <Megaphone size={23} />
                    </div>
                    <div>
                        <small>Total program ditemukan</small>
                        <h3>{Number(campaigns.total || 0).toLocaleString('id-ID')}</h3>
                    </div>
                </section>

                <section className="sc-panel">
                    <form className="sc-filters" onSubmit={applyFilters}>
                        <div className="sc-search">
                            <Search size={18} />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Cari nama program atau lokasi..."
                            />
                        </div>

                        <select
                            value={status}
                            onChange={e => setStatus(e.target.value)}
                        >
                            <option value="">Semua status</option>
                            {Object.entries(statuses).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>

                        <button type="submit" className="sc-filter-button">
                            Cari
                        </button>
                    </form>

                    <div className="sc-table-wrap">
                        <table className="sc-table">
                            <thead>
                                <tr>
                                    <th>Program</th>
                                    <th>Kategori</th>
                                    <th>Target Dana</th>
                                    <th>Dana Terkumpul</th>
                                    <th>Penerima</th>
                                    <th>Status</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>

                            <tbody>
                                {campaigns.data.length > 0 ? (
                                    campaigns.data.map(campaign => (
                                        <tr key={campaign.id}>
                                            <td>
                                                <div className="sc-campaign-name">
                                                    <strong>{campaign.title}</strong>
                                                    <small>
                                                        <MapPin size={12} />
                                                        {campaign.location || '-'}
                                                    </small>
                                                </div>
                                            </td>

                                            <td>{campaign.category?.name || '-'}</td>

                                            <td>{rupiah(campaign.target_amount)}</td>

                                            <td>{rupiah(campaign.collected_amount)}</td>

                                            <td>
                                                <span className="sc-beneficiary-count">
                                                    <Users size={14} />
                                                    {Number(campaign.target_beneficiaries || 0).toLocaleString('id-ID')}
                                                </span>
                                            </td>

                                            <td>
                                                <span className={`sc-status sc-status-${campaign.status}`}>
                                                    {statusLabel[campaign.status] || campaign.status}
                                                </span>
                                            </td>

                                            <td>
                                                <div className="sc-actions">
                                                    <button
                                                        title="Lihat program publik"
                                                        onClick={() => router.visit(`/program/${campaign.slug}`)}
                                                        disabled={campaign.status === 'draft'}
                                                    >
                                                        <Eye size={16} />
                                                    </button>

                                                    <button
                                                        title="Edit program"
                                                        onClick={() => router.visit(`/superadmin/program/${campaign.id}/edit`)}
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        title="Hapus program"
                                                        onClick={() => deleteCampaign(campaign)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7">
                                            <div className="sc-empty">
                                                <Megaphone size={34} />
                                                <strong>Belum ada program ditemukan</strong>
                                                <span>Silakan tambah program atau ubah filter pencarian.</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="sc-pagination">
                        <span>
                            Menampilkan {campaigns.from || 0}–{campaigns.to || 0}
                            {' '}dari {campaigns.total || 0} program
                        </span>

                        <div>
                            {campaigns.links?.map((link, index) => (
                                <button
                                    key={index}
                                    disabled={!link.url || link.active}
                                    className={link.active ? 'active' : ''}
                                    onClick={() => link.url && router.visit(link.url)}
                                >
                                    {index === 0
                                        ? <ChevronLeft size={16} />
                                        : index === campaigns.links.length - 1
                                            ? <ChevronRight size={16} />
                                            : <span dangerouslySetInnerHTML={{ __html: link.label }} />
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
