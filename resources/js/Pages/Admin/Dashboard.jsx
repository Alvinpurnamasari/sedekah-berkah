import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    LayoutDashboard,
    Megaphone,
    Users,
    Receipt,
    HandHeart,
    Images,
    Wallet,
    FileText,
    Menu,
    X,
    Bell,
    LogOut,
    ShieldCheck,
    ArrowUpRight,
    Clock3,
    ClipboardList,
    MapPin,
} from 'lucide-react';
import '../../../css/admin.css';

const adminMenus = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'campaigns', label: 'Manajemen Program', icon: Megaphone },
    { id: 'beneficiaries', label: 'Target Penerima', icon: Users },
    { id: 'transactions', label: 'Transaksi', icon: Receipt },
    { id: 'distribution', label: 'Penyaluran Dana', icon: HandHeart, url: '/admin/penyaluran' },
    { id: 'documentation', label: 'Dokumentasi', icon: Images },
    { id: 'expenses', label: 'Pengeluaran', icon: Wallet, url: '/admin/pengeluaran' },
    { id: 'reports', label: 'Laporan Kegiatan', icon: FileText },
];

const formatRupiah = (value) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value || 0));
};

const summaryCards = (summary = {}) => [
    {
        label: 'Kampanye aktif',
        value: summary.activeCampaigns ?? 0,
        note: 'Program berstatus aktif',
        icon: Megaphone,
        color: 'green',
    },
    {
        label: 'Dana terverifikasi',
        value: formatRupiah(summary.verifiedFunds),
        note: 'Total donasi berstatus paid',
        icon: Wallet,
        color: 'blue',
    },
    {
        label: 'Jadwal penyaluran',
        value: summary.distributionSchedules ?? 0,
        note: 'Penyaluran berstatus planned',
        icon: HandHeart,
        color: 'orange',
    },
];

export default function Dashboard({ summary = {} }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    function logout() {
        router.post('/logout');
    }

    return (
        <>
            <Head title="Dashboard Admin - Sedekah Berkah" />

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
        const active = item.id === 'dashboard';

        return item.url ? (
            <button
                key={item.id}
                type="button"
                className="ad-menu-item upcoming ad-menu-link"
                onClick={() => {
                    router.visit(item.url);
                    setSidebarOpen(false);
                }}
            >
                <Icon size={19} />
                <span>{item.label}</span>
            </button>
        ) : (
            <div
                key={item.id}
                className={`ad-menu-item ${active ? 'active' : 'upcoming'}`}
                title={active
                    ? 'Dashboard aktif'
                    : 'Modul akan diaktifkan pada tahap berikutnya'}
            >
                <Icon size={19} />
                <span>{item.label}</span>
                {active && <span className="ad-active-dot" />}
                {!active && <span className="ad-coming">Segera</span>}
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
                                    Admin / Dashboard
                                </div>
                                <h1>Dashboard Operasional</h1>
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
                                    PUSAT KEGIATAN OPERASIONAL
                                </span>
                                <h2>Selamat datang, Admin!</h2>
                                <p>
                                    Kelola program, penerima manfaat, penyaluran,
                                    dan laporan kegiatan Sedekah Berkah.
                                </p>
                            </div>

                            <div className="ad-welcome-icon">
                                <ShieldCheck size={38} />
                            </div>
                        </section>

                        <section className="ad-section">
                            <div className="ad-section-heading">
                                <div>
                                    <h3>Ringkasan operasional</h3>
                                    <p>
                                        Informasi kegiatan yang menjadi tanggung jawab Admin.
                                    </p>
                                </div>
                            </div>

                            <div className="ad-stats-grid">
                                {summaryCards(summary).map(card => {
                                    const Icon = card.icon;

                                    return (
                                        <article className="ad-stat-card" key={card.label}>
                                            <div className={`ad-stat-icon ${card.color}`}>
                                                <Icon size={22} />
                                            </div>
                                            <span>{card.label}</span>
                                            <strong>{card.value}</strong>
                                            <small>{card.note}</small>
                                        </article>
                                    );
                                })}
                            </div>
                        </section>

                        <div className="ad-lower-grid">
                            <section className="ad-panel">
                                <div className="ad-panel-heading">
                                    <div>
                                        <h3>Aktivitas terbaru</h3>
                                        <p>Riwayat pekerjaan operasional</p>
                                    </div>
                                    <Clock3 size={20} />
                                </div>

                                <div className="ad-empty">
                                    <ClipboardList size={34} />
                                    <strong>Belum ada aktivitas</strong>
                                    <span>
                                        Aktivitas akan tampil setelah modul operasional digunakan.
                                    </span>
                                </div>
                            </section>

                            <section className="ad-panel">
                                <div className="ad-panel-heading">
                                    <div>
                                        <h3>Akses pekerjaan</h3>
                                        <p>Ruang lingkup tugas Admin</p>
                                    </div>
                                    <ArrowUpRight size={20} />
                                </div>

                                <div className="ad-task-list">
                                    <div className="ad-task-item">
                                        <span className="ad-task-icon green">
                                            <Megaphone size={18} />
                                        </span>
                                        <div>
                                            <strong>Kelola program</strong>
                                            <small>Atur informasi kampanye</small>
                                        </div>
                                    </div>

                                    <div className="ad-task-item">
                                        <span className="ad-task-icon blue">
                                            <Users size={18} />
                                        </span>
                                        <div>
                                            <strong>Target penerima</strong>
                                            <small>Kelola sasaran bantuan</small>
                                        </div>
                                    </div>

                                    <div className="ad-task-item">
                                        <span className="ad-task-icon orange">
                                            <HandHeart size={18} />
                                        </span>
                                        <div>
                                            <strong>Penyaluran bantuan</strong>
                                            <small>Catat kegiatan distribusi</small>
                                        </div>
                                    </div>

                                    <div className="ad-task-item">
                                        <span className="ad-task-icon purple">
                                            <MapPin size={18} />
                                        </span>
                                        <div>
                                            <strong>Laporan kegiatan</strong>
                                            <small>Dokumentasikan hasil lapangan</small>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        <section className="ad-notice">
                            <ShieldCheck size={21} />
                            <div>
                                <strong>Batas kewenangan Admin</strong>
                                <p>
                                    Admin bertugas mengelola kegiatan operasional dan
                                    mengajukan persetujuan. Persetujuan keuangan dan
                                    pengaturan sistem tetap menjadi kewenangan Superadmin.
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
