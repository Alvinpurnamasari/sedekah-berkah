
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
    LogOut,
    ShieldCheck,
    Menu,
    X,
    Bell,
    ClipboardList,
} from 'lucide-react';

import '../../css/admin.css';

const adminMenus = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        url: '/admin',
    },
    {
        id: 'campaigns',
        label: 'Manajemen Program',
        icon: Megaphone,
        url: '/admin/program',
    },
    {
        id: 'beneficiaries',
        label: 'Target Penerima',
        icon: Users,
        url: '/admin/target-penerima',
    },
    {
        label: 'Transaksi',
        icon: Receipt,
        url: '/admin/transaksi',
    },
    {
        id: 'distribution',
        label: 'Penyaluran Dana',
        icon: HandHeart,
        url: '/admin/penyaluran',
    },
    {
        id: 'documentation',
        label: 'Dokumentasi',
        icon: Images,
    },
    {
        id: 'expenses',
        label: 'Pengeluaran',
        icon: Wallet,
        url: '/admin/pengeluaran',
    },
    {
        id: 'reports',
        label: 'Laporan Kegiatan',
        icon: FileText,
    },
];

export default function AdminLayout({
    title,
    activeMenu,
    children = null,
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    function navigate(item) {
        if (item.url) {
            router.visit(item.url);
            setSidebarOpen(false);
        }
    }

    function logout() {
        router.post('/logout');
    }

    return (
        <>
            <Head title={`${title} - Sedekah Berkah`} />

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
                            aria-label="Tutup sidebar"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="ad-role">
                        <ShieldCheck size={17} />
                        ADMIN OPERASIONAL
                    </div>

                    <div className="ad-menu-title">
                        MENU OPERASIONAL
                    </div>

                    <nav className="ad-navigation">
                        {adminMenus.map(item => {
                            const Icon = item.icon;
                            const active = activeMenu === item.id;

                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    className={`ad-menu-item ${
                                        active ? 'active' : ''
                                    } ${!item.url ? 'upcoming' : 'ad-menu-link'}`}
                                    onClick={() => navigate(item)}
                                    title={!item.url
                                        ? 'Modul akan diaktifkan pada tahap berikutnya'
                                        : item.label}
                                >
                                    <Icon size={19} />
                                    <span>{item.label}</span>

                                    {active && (
                                        <span className="ad-active-dot" />
                                    )}

                                    {!item.url && (
                                        <span className="ad-coming">
                                            Segera
                                        </span>
                                    )}
                                </button>
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

                        <button
                            className="ad-logout"
                            onClick={logout}
                        >
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
                                    Admin / {title}
                                </div>

                                <h1>{title}</h1>
                            </div>
                        </div>

                        <div className="ad-header-right">
                            <span className="ad-admin-status">
                                <span />
                                Area Admin
                            </span>

                            <button
                                className="ad-notification"
                                title="Notifikasi"
                                type="button"
                            >
                                <Bell size={19} />
                            </button>

                            <div className="ad-avatar">AD</div>
                        </div>
                    </header>

                    <main className="ad-content">
                        {children}
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
