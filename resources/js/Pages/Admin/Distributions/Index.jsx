
import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    LayoutDashboard, Megaphone, Users, Receipt, HandHeart,
    Images, Wallet, FileText, Menu, X, Bell, LogOut,
    ShieldCheck, ClipboardList, Search, MapPin,
    CalendarDays, Eye, AlertCircle,
} from 'lucide-react';
import '../../../../css/admin.css';

const adminMenus = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, url: '/admin' },
    { id: 'campaigns', label: 'Manajemen Program', icon: Megaphone },
    { id: 'beneficiaries', label: 'Target Penerima', icon: Users },
    { id: 'transactions', label: 'Transaksi', icon: Receipt },
    { id: 'distribution', label: 'Penyaluran Dana', icon: HandHeart, url: '/admin/penyaluran' },
    { id: 'documentation', label: 'Dokumentasi', icon: Images },
    { id: 'expenses', label: 'Pengeluaran', icon: Wallet, url: '/admin/pengeluaran' },
    { id: 'reports', label: 'Laporan Kegiatan', icon: FileText },
];

const formatRupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

const activityStatus = {
    planned: { label: 'Direncanakan', className: 'planned' },
    ongoing: { label: 'Berlangsung', className: 'ongoing' },
    completed: { label: 'Selesai', className: 'completed' },
};

const reportStatus = {
    draft: { label: 'Draft', className: 'draft' },
    pending: { label: 'Menunggu pemeriksaan', className: 'pending' },
    approved: { label: 'Disetujui', className: 'approved' },
    revision: { label: 'Perlu revisi', className: 'revision' },
};

export default function Index({ distributions, filters = {} }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const rows = distributions?.data || [];

    function logout() {
        router.post('/logout');
    }

    function search(value) {
        router.get(
            '/admin/penyaluran',
            { ...filters, search: value },
            { preserveState: true, replace: true }
        );
    }

    function filterStatus(value) {
        router.get(
            '/admin/penyaluran',
            { ...filters, status: value },
            { preserveState: true, replace: true }
        );
    }

    return (
        <>
            <Head title="Penyaluran Dana - Admin" />

            <div className="ad-app">
                {sidebarOpen && (
                    <button
                        className="ad-overlay"
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Tutup menu"
                    />
                )}

                <aside className={`ad-sidebar ${sidebarOpen ? 'show' : ''}`}>
                    <div className="ad-brand">
                        <div className="ad-brand-icon">♥</div>
                        <div>
                            <strong>Sedekah Berkah</strong>
                            <small>Administration</small>
                        </div>
                        <button
                            className="ad-close"
                            onClick={() => setSidebarOpen(false)}
                            aria-label="Tutup menu"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="ad-role">
                        <ShieldCheck size={17} />
                        ADMIN OPERASIONAL
                    </div>

                    <div className="ad-menu-title">MENU OPERASIONAL</div>

                    <nav className="ad-navigation">
                        {adminMenus.map(item => {
                            const Icon = item.icon;
                            const active = item.id === 'distribution';

                            return item.url ? (
                                <button
                                    key={item.id}
                                    type="button"
                                    className={`ad-menu-item ${active ? 'active' : 'upcoming'} ad-menu-link`}
                                    onClick={() => {
                                        router.visit(item.url);
                                        setSidebarOpen(false);
                                    }}
                                >
                                    <Icon size={19} />
                                    <span>{item.label}</span>
                                    {active && <span className="ad-active-dot" />}
                                    {!active && <span className="ad-coming">Buka</span>}
                                </button>
                            ) : (
                                <div
                                    key={item.id}
                                    className="ad-menu-item upcoming"
                                    title="Modul akan diaktifkan pada tahap berikutnya"
                                >
                                    <Icon size={19} />
                                    <span>{item.label}</span>
                                    <span className="ad-coming">Segera</span>
                                </div>
                            );
                        })}
                    </nav>

                    <div className="ad-sidebar-bottom">
                        <div className="ad-sidebar-note">
                            <ClipboardList size={20} />
                            <div>
                                <strong>Area operasional</strong>
                                <small>Kelola kegiatan dan laporan</small>
                            </div>
                        </div>

                        <button className="ad-logout" onClick={logout}>
                            <LogOut size={18} />
                            Keluar
                        </button>
                    </div>
                </aside>

                <div className="ad-main">
                    <header className="ad-header">
                        <div className="ad-header-left">
                            <button
                                className="ad-mobile-menu"
                                onClick={() => setSidebarOpen(true)}
                                aria-label="Buka menu"
                            >
                                <Menu size={22} />
                            </button>
                            <div>
                                <div className="ad-breadcrumb">
                                    Admin / Penyaluran Dana
                                </div>
                                <h1>Penyaluran Dana</h1>
                            </div>
                        </div>

                        <div className="ad-header-right">
                            <span className="ad-admin-status">
                                <span />
                                Area Admin
                            </span>
                            <button className="ad-notification" title="Notifikasi">
                                <Bell size={19} />
                            </button>
                            <div className="ad-avatar">AD</div>
                        </div>
                    </header>

                    <main className="ad-content">
                        <section className="ad-welcome">
                            <div>
                                <span className="ad-eyebrow">
                                    KEGIATAN LAPANGAN
                                </span>
                                <h2>Daftar Penyaluran Bantuan</h2>
                                <p>
                                    Lihat kegiatan dari Superadmin, catat realisasi,
                                    unggah dokumentasi, dan ajukan laporan kegiatan.
                                </p>
                            </div>
                            <div className="ad-welcome-icon">
                                <HandHeart size={38} />
                            </div>
                        </section>

                        <section className="ad-section">
                            <div className="ad-section-heading">
                                <div>
                                    <h3>Daftar kegiatan</h3>
                                    <p>
                                        Pilih kegiatan untuk melihat detail dan
                                        mengisi laporan realisasi.
                                    </p>
                                </div>
                            </div>

                            <div className="ad-panel">
                                <div className="ad-distribution-filters">
                                    <div className="ad-search-box">
                                        <Search size={18} />
                                        <input
                                            type="search"
                                            defaultValue={filters.search || ''}
                                            placeholder="Cari kegiatan, program, lokasi..."
                                            onChange={(e) => search(e.target.value)}
                                        />
                                    </div>

                                    <select
                                        value={filters.status || ''}
                                        onChange={(e) => filterStatus(e.target.value)}
                                    >
                                        <option value="">Semua status kegiatan</option>
                                        <option value="planned">Direncanakan</option>
                                        <option value="ongoing">Berlangsung</option>
                                        <option value="completed">Selesai</option>
                                    </select>
                                </div>

                                <div className="ad-distribution-list">
                                    {rows.length === 0 ? (
                                        <div className="ad-empty">
                                            <ClipboardList size={34} />
                                            <strong>Belum ada kegiatan penyaluran</strong>
                                            <span>
                                                Kegiatan yang dibuat Superadmin akan
                                                tampil di halaman ini.
                                            </span>
                                        </div>
                                    ) : (
                                        rows.map((item) => {
                                            const activity =
                                                activityStatus[item.status] ||
                                                activityStatus.planned;

                                            const report =
                                                reportStatus[item.report_status] ||
                                                reportStatus.draft;

                                            return (
                                                <article
                                                    className="ad-distribution-card"
                                                    key={item.id}
                                                >
                                                    <div className="ad-distribution-card-top">
                                                        <div>
                                                            <span className="ad-eyebrow">
                                                                {item.campaign_title || 'Program'}
                                                            </span>
                                                            <h3>{item.title}</h3>
                                                        </div>
                                                        <span className={`ad-status ${activity.className}`}>
                                                            {activity.label}
                                                        </span>
                                                    </div>

                                                    <div className="ad-distribution-meta">
                                                        <span>
                                                            <MapPin size={16} />
                                                            {item.location}
                                                        </span>
                                                        <span>
                                                            <CalendarDays size={16} />
                                                            {item.distribution_date || '-'}
                                                        </span>
                                                        <span>
                                                            <Users size={16} />
                                                            Target: {item.planned_quantity} penerima
                                                        </span>
                                                        <span>
                                                            <Wallet size={16} />
                                                            Realisasi: {formatRupiah(item.total_cost)}
                                                        </span>
                                                    </div>

                                                    <div className="ad-distribution-card-bottom">
                                                        <span className={`ad-status ${report.className}`}>
                                                            <ClipboardList size={14} />
                                                            Laporan: {report.label}
                                                        </span>

                                                        <Link
                                                            href={`/admin/penyaluran/${item.id}`}
                                                            className="ad-detail-link"
                                                        >
                                                            <Eye size={16} />
                                                            Lihat detail
                                                        </Link>
                                                    </div>
                                                </article>
                                            );
                                        })
                                    )}
                                </div>

                                {distributions?.links && (
                                    <div className="ad-pagination">
                                        {distributions.links.map((link, index) => (
                                            <button
                                                key={index}
                                                disabled={!link.url}
                                                className={link.active ? 'active' : ''}
                                                onClick={() =>
                                                    link.url && router.visit(link.url)
                                                }
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="ad-notice">
                            <AlertCircle size={21} />
                            <div>
                                <strong>Alur pelaporan</strong>
                                <p>
                                    Admin mengisi realisasi dan dokumentasi kegiatan.
                                    Setelah selesai, laporan diajukan kepada Superadmin
                                    untuk diperiksa dan disetujui.
                                </p>
                            </div>
                        </section>
                    </main>

                    <footer className="ad-footer">
                        © {new Date().getFullYear()} Sedekah Berkah
                        <span>Admin Operational Panel</span>
                    </footer>
                </div>
            </div>
        </>
    );
}
