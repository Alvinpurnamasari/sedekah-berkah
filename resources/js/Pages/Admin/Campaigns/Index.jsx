import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '../../../Components/AdminLayout';
import {
    Megaphone,
    Search,
    Plus,
    Pencil,
    Eye,
    ChevronLeft,
    ChevronRight,
    MapPin,
    Users,
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
    flash = {},
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');

    function applyFilters(e) {
        e.preventDefault();

        router.get('/admin/program', {
            search,
            status,
        }, {
            preserveState: true,
            replace: true,
        });
    }
    const [showSuccess, setShowSuccess] = useState(Boolean(flash.success));

    useEffect(() => {
        if (!flash.success) return;
    
        setShowSuccess(true);
    
        const timer = setTimeout(() => {
            setShowSuccess(false);
        }, 4000);
    
        return () => clearTimeout(timer);
    }, [flash.success]);

    return (
        <AdminLayout
            title="Manajemen Program"
            activeMenu="campaigns"
        >
            <div className="sc-page">
               
                {showSuccess && flash.success && (
                <div
                    style={{
                        padding: '14px 18px',
                        marginBottom: '20px',
                        borderRadius: '10px',
                        background: '#dcfce7',
                        color: '#166534',
                        border: '1px solid #86efac',
                        transition: 'opacity 0.3s ease',
                    }}
                >
                    ✓ {flash.success}
                </div>
            )}
                <section className="sc-intro">
                    <div>
                        <span className="sc-eyebrow">
                            PENGELOLAAN KAMPANYE
                        </span>
                        <h2>Manajemen Program</h2>
                        <p>
                            Lihat program sedekah, target dana,
                            dan penerima manfaat.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="sc-primary"
                        onClick={() => router.visit('/admin/program/tambah')}
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
                        <h3>
                            {Number(campaigns.total || 0).toLocaleString('id-ID')}
                        </h3>
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
                                <option key={value} value={value}>
                                    {label}
                                </option>
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
                                                    {Number(
                                                        campaign.target_beneficiaries || 0
                                                    ).toLocaleString('id-ID')}
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
                                                        type="button"
                                                        title="Detail program"
                                                        onClick={() => router.visit(
                                                            `/admin/program/${campaign.id}`
                                                        )}
                                                    >
                                                        <Eye size={16} />
                                                    </button>

                                                    {campaign.status === 'draft' && (
                                                        <button
                                                            type="button"
                                                            title="Edit program Draft"
                                                            onClick={() => router.visit(
                                                                `/admin/program/${campaign.id}/edit`
                                                            )}
                                                        >
                                                            <Pencil size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7">
                                            <div className="sc-empty">
                                                <Megaphone size={34} />
                                                <strong>
                                                    Belum ada program ditemukan
                                                </strong>
                                                <span>
                                                    Silakan tambah program atau ubah filter pencarian.
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
                                            : <span
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                            />
                                    }
                                </button>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </AdminLayout>
    );
}
