
import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Components/AdminLayout';
import {
    Images,
    Image as ImageIcon,
    Video,
    Search,
    Eye,
    CalendarDays,
    MapPin,
    FolderOpen,
    X,
} from 'lucide-react';
import '../../../../css/admin.css';

const SummaryCard = ({ icon: Icon, label, value }) => (
    <div className="ad-doc-summary-card">
        <div className="ad-doc-summary-icon">
            <Icon size={23} />
        </div>
        <div>
            <span>{label}</span>
            <strong>{value ?? 0}</strong>
        </div>
    </div>
);

export default function Index({
    documents,
    campaigns = [],
    distributions = [],
    summary = {},
    filters = {},
}) {
    function updateFilter(key, value) {
        router.get(
            '/admin/dokumentasi',
            {
                ...filters,
                [key]: value,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    }

    function resetFilters() {
        router.get('/admin/dokumentasi');
    }

    return (
        <AdminLayout
            title="Dokumentasi Kegiatan"
            activeMenu="documentation"
        >
            <Head title="Dokumentasi Kegiatan" />

            <div className="ad-doc-page">
                <section className="ad-welcome">
                    <div>
                        <span className="ad-eyebrow">
                            ARSIP KEGIATAN LAPANGAN
                        </span>
                        <h2>Dokumentasi Kegiatan</h2>
                        <p>
                            Galeri foto dan video seluruh kegiatan
                            penyaluran Sedekah Berkah.
                        </p>
                    </div>
                    <div className="ad-welcome-icon">
                        <Images size={38} />
                    </div>
                </section>

                <section className="ad-doc-summary">
                    <SummaryCard
                        icon={FolderOpen}
                        label="Total dokumentasi"
                        value={summary.total}
                    />
                    <SummaryCard
                        icon={ImageIcon}
                        label="Foto"
                        value={summary.photos}
                    />
                    <SummaryCard
                        icon={Video}
                        label="Video"
                        value={summary.videos}
                    />
                </section>

                <section className="ad-panel ad-doc-filter">
                    <div className="ad-doc-filter-heading">
                        <div>
                            <h3>Filter dokumentasi</h3>
                            <p>
                                Cari dokumentasi berdasarkan program,
                                kegiatan, atau jenis media.
                            </p>
                        </div>
                        <Search size={23} />
                    </div>

                    <div className="ad-doc-filter-grid">
                        <div className="ad-dist-field">
                            <label>Pencarian</label>
                            <input
                                type="text"
                                placeholder="Cari keterangan atau lokasi..."
                                value={filters.search || ''}
                                onChange={e =>
                                    updateFilter('search', e.target.value)
                                }
                            />
                        </div>

                        <div className="ad-dist-field">
                            <label>Jenis media</label>
                            <select
                                value={filters.file_type || ''}
                                onChange={e =>
                                    updateFilter('file_type', e.target.value)
                                }
                            >
                                <option value="">Semua media</option>
                                <option value="photo">Foto</option>
                                <option value="video">Video</option>
                            </select>
                        </div>

                        <div className="ad-dist-field">
                            <label>Program</label>
                            <select
                                value={filters.campaign_id || ''}
                                onChange={e =>
                                    updateFilter('campaign_id', e.target.value)
                                }
                            >
                                <option value="">Semua program</option>
                                {campaigns.map(campaign => (
                                    <option
                                        key={campaign.id}
                                        value={campaign.id}
                                    >
                                        {campaign.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="ad-dist-field">
                            <label>Kegiatan penyaluran</label>
                            <select
                                value={filters.distribution_id || ''}
                                onChange={e =>
                                    updateFilter(
                                        'distribution_id',
                                        e.target.value
                                    )
                                }
                            >
                                <option value="">Semua kegiatan</option>
                                {distributions.map(distribution => (
                                    <option
                                        key={distribution.id}
                                        value={distribution.id}
                                    >
                                        {distribution.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="ad-doc-reset"
                        onClick={resetFilters}
                    >
                        <X size={16} />
                        Reset filter
                    </button>
                </section>

                <section className="ad-panel ad-doc-gallery-panel">
                    <div className="ad-doc-gallery-heading">
                        <div>
                            <h3>Galeri dokumentasi</h3>
                            <p>
                                {documents.total || 0} dokumentasi ditemukan
                            </p>
                        </div>
                        <Images size={24} />
                    </div>

                    {documents.data?.length > 0 ? (
                        <div className="ad-doc-gallery">
                            {documents.data.map(document => (
                                <article
                                    className="ad-doc-card"
                                    key={document.id}
                                >
                                    <div className="ad-doc-media">
                                        {document.file_type === 'video' ? (
                                            <video
                                                src={`/storage/${document.file_path}`}
                                                controls
                                                preload="metadata"
                                            />
                                        ) : (
                                            <a
                                                href={`/storage/${document.file_path}`}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                <img
                                                    src={`/storage/${document.file_path}`}
                                                    alt={
                                                        document.caption ||
                                                        'Dokumentasi kegiatan'
                                                    }
                                                    loading="lazy"
                                                />
                                            </a>
                                        )}

                                        <span className="ad-doc-type">
                                            {document.file_type === 'video' ? (
                                                <Video size={14} />
                                            ) : (
                                                <ImageIcon size={14} />
                                            )}
                                            {document.file_type === 'video'
                                                ? 'VIDEO'
                                                : 'FOTO'}
                                        </span>
                                    </div>

                                    <div className="ad-doc-card-body">
                                        <strong>
                                            {document.caption ||
                                                'Dokumentasi kegiatan'}
                                        </strong>

                                        <span>
                                            <CalendarDays size={14} />
                                            {document.document_date || '-'}
                                        </span>

                                        <span>
                                            <FolderOpen size={14} />
                                            {document.campaign_title}
                                        </span>

                                        <span>
                                            <MapPin size={14} />
                                            {document.location || '-'}
                                        </span>

                                        <Link
                                            href={`/admin/penyaluran/${document.distribution_id}`}
                                            className="ad-doc-detail-link"
                                        >
                                            <Eye size={16} />
                                            Lihat kegiatan
                                        </Link>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="ad-doc-empty">
                            <Images size={42} />
                            <strong>Belum ada dokumentasi</strong>
                            <span>
                                Dokumentasi foto dan video dari kegiatan
                                penyaluran akan tampil di sini.
                            </span>
                        </div>
                    )}

                    {documents.links?.length > 3 && (
                        <div className="ad-doc-pagination">
                            {documents.links.map((link, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    disabled={!link.url || link.active}
                                    className={link.active ? 'active' : ''}
                                    onClick={() =>
                                        link.url && router.visit(link.url, {
                                            preserveScroll: true,
                                        })
                                    }
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </AdminLayout>
    );
}
