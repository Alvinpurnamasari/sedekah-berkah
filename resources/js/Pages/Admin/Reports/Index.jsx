
import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Components/AdminLayout';
import {
    FileText,
    Search,
    CalendarDays,
    MapPin,
    Wallet,
    Users,
    Clock3,
    CheckCircle2,
    AlertCircle,
    Eye,
    RefreshCw,
    ClipboardList,
} from 'lucide-react';

const rupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

const statusInfo = {
    draft: {
        label: 'Draft',
        className: 'draft',
        icon: FileText,
    },
    pending: {
        label: 'Menunggu Verifikasi',
        className: 'pending',
        icon: Clock3,
    },
    revision: {
        label: 'Perlu Revisi',
        className: 'revision',
        icon: AlertCircle,
    },
    approved: {
        label: 'Disetujui',
        className: 'approved',
        icon: CheckCircle2,
    },
};

export default function Index({ reports, summary, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [reportStatus, setReportStatus] = useState(
        filters.report_status || ''
    );

    const applyFilters = (e) => {
        e.preventDefault();

        router.get(
            '/admin/laporan-kegiatan',
            {
                search,
                report_status: reportStatus,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const resetFilters = () => {
        setSearch('');
        setReportStatus('');

        router.get(
            '/admin/laporan-kegiatan',
            {},
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    return (
        <AdminLayout activeMenu="reports">
            <Head title="Laporan Kegiatan" />

            <div className="ad-report-page">
                <section className="ad-report-hero">
                    <div>
                        <span className="ad-report-eyebrow">
                            PELAPORAN KEGIATAN LAPANGAN
                        </span>
                        <h1>Laporan Kegiatan</h1>
                        <p>
                            Pantau laporan penyaluran dan proses verifikasi
                            kegiatan Sedekah Berkah.
                        </p>
                    </div>

                    <div className="ad-report-hero-icon">
                        <ClipboardList size={42} />
                    </div>
                </section>

                <section className="ad-report-summary">
                    <article>
                        <div className="ad-report-summary-icon">
                            <FileText size={22} />
                        </div>
                        <div>
                            <span>Total laporan</span>
                            <strong>{summary.total}</strong>
                        </div>
                    </article>

                    <article>
                        <div className="ad-report-summary-icon">
                            <Clock3 size={22} />
                        </div>
                        <div>
                            <span>Menunggu verifikasi</span>
                            <strong>{summary.pending}</strong>
                        </div>
                    </article>

                    <article>
                        <div className="ad-report-summary-icon">
                            <AlertCircle size={22} />
                        </div>
                        <div>
                            <span>Perlu revisi</span>
                            <strong>{summary.revision}</strong>
                        </div>
                    </article>

                    <article>
                        <div className="ad-report-summary-icon">
                            <CheckCircle2 size={22} />
                        </div>
                        <div>
                            <span>Disetujui</span>
                            <strong>{summary.approved}</strong>
                        </div>
                    </article>
                </section>

                <section className="ad-report-panel">
                    <div className="ad-report-panel-heading">
                        <div>
                            <h2>Filter laporan</h2>
                            <p>
                                Cari kegiatan berdasarkan nama, program,
                                lokasi, atau status laporan.
                            </p>
                        </div>
                        <Search size={25} />
                    </div>

                    <form
                        className="ad-report-filter-form"
                        onSubmit={applyFilters}
                    >
                        <div className="ad-report-field">
                            <label htmlFor="report-search">
                                Pencarian
                            </label>
                            <input
                                id="report-search"
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nama kegiatan, program, atau lokasi..."
                            />
                        </div>

                        <div className="ad-report-field">
                            <label htmlFor="report-status">
                                Status laporan
                            </label>
                            <select
                                id="report-status"
                                value={reportStatus}
                                onChange={(e) =>
                                    setReportStatus(e.target.value)
                                }
                            >
                                <option value="">Semua status</option>
                                <option value="draft">Draft</option>
                                <option value="pending">
                                    Menunggu Verifikasi
                                </option>
                                <option value="revision">Perlu Revisi</option>
                                <option value="approved">Disetujui</option>
                            </select>
                        </div>

                        <div className="ad-report-filter-actions">
                            <button type="submit">
                                <Search size={17} />
                                Terapkan Filter
                            </button>

                            <button
                                type="button"
                                className="ad-report-reset"
                                onClick={resetFilters}
                            >
                                <RefreshCw size={16} />
                                Reset
                            </button>
                        </div>
                    </form>
                </section>

                <section className="ad-report-panel">
                    <div className="ad-report-list-heading">
                        <div>
                            <h2>Daftar laporan kegiatan</h2>
                            <p>
                                {reports.total} laporan ditemukan
                            </p>
                        </div>
                        <FileText size={25} />
                    </div>

                    {reports.data.length === 0 ? (
                        <div className="ad-report-empty">
                            <FileText size={42} />
                            <h3>Belum ada laporan kegiatan</h3>
                            <p>
                                Laporan penyaluran akan muncul di sini
                                setelah kegiatan tercatat dalam sistem.
                            </p>
                        </div>
                    ) : (
                        <div className="ad-report-list">
                            {reports.data.map((report) => {
                                const status =
                                    statusInfo[report.report_status] ||
                                    statusInfo.draft;

                                const StatusIcon = status.icon;

                                return (
                                    <article
                                        className="ad-report-card"
                                        key={report.id}
                                    >
                                        <div className="ad-report-card-top">
                                            <div>
                                                <span className="ad-report-campaign">
                                                    {report.campaign_title ||
                                                        'Program tidak tersedia'}
                                                </span>
                                                <h3>{report.title}</h3>
                                            </div>

                                            <span
                                                className={`ad-report-status ${status.className}`}
                                            >
                                                <StatusIcon size={15} />
                                                {status.label}
                                            </span>
                                        </div>

                                        <div className="ad-report-meta">
                                            <span>
                                                <CalendarDays size={16} />
                                                {report.distribution_date
                                                    ? new Date(
                                                          `${report.distribution_date}T00:00:00`
                                                      ).toLocaleDateString(
                                                          'id-ID',
                                                          {
                                                              day: 'numeric',
                                                              month: 'long',
                                                              year: 'numeric',
                                                          }
                                                      )
                                                    : '-'}
                                            </span>

                                            <span>
                                                <MapPin size={16} />
                                                {report.location || '-'}
                                            </span>

                                            <span>
                                                <Users size={16} />
                                                {report.actual_quantity ?? 0}
                                                {' / '}
                                                {report.planned_quantity ?? 0}
                                                {' penerima'}
                                            </span>

                                            <span>
                                                <Wallet size={16} />
                                                {rupiah(report.total_cost)}
                                            </span>
                                        </div>

                                        {report.report_status === 'revision' &&
                                            report.report_revision_note && (
                                                <div className="ad-report-revision-note">
                                                    <strong>Catatan revisi:</strong>
                                                    <p>
                                                        {report.report_revision_note}
                                                    </p>
                                                </div>
                                            )}

                                        <div className="ad-report-card-footer">
                                            <span>
                                                Status kegiatan:{' '}
                                                {report.status === 'completed'
                                                    ? 'Selesai'
                                                    : report.status === 'ongoing'
                                                      ? 'Berlangsung'
                                                      : 'Terjadwal'}
                                            </span>

                                            <Link
                                                href={`/admin/penyaluran/${report.id}`}
                                            >
                                                <Eye size={17} />
                                                Lihat kegiatan
                                            </Link>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}

                    {reports.links && reports.links.length > 3 && (
                        <div className="ad-report-pagination">
                            {reports.links.map((link, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    disabled={!link.url || link.active}
                                    className={link.active ? 'active' : ''}
                                    onClick={() =>
                                        link.url &&
                                        router.visit(link.url, {
                                            preserveScroll: true,
                                            preserveState: true,
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
