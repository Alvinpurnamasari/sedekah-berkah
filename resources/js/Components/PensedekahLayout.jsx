
import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Heart,
    FileText,
    UserRound,
    LogOut,
    Menu,
    X,
    HeartHandshake,
    ShieldCheck,
    Megaphone,
    MapPinned,
    Images,
} from 'lucide-react';

import '../../css/pensedekah.css';

const menus = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        url: '/akun',
    },
    {
        id: 'donations',
        label: 'Riwayat Donasi',
        icon: Heart,
        url: '/akun/donasi',
    },
    {
        id: 'programs',
        label: 'Program',
        icon: Megaphone,
        url: '/akun/program',
    },
    {
        id: 'reports',
        label: 'Laporan Penyaluran',
        icon: FileText,
        url: '/akun/penyaluran',
    },
    {
        id: 'documentation',
        label: 'Dokumentasi',
        icon: Images,
        url: '/akun/dokumentasi',
    },
    {
        id: 'tracking',
        label: 'Tracking Penyaluran',
        icon: MapPinned,
        url: '/akun/tracking',
    },
    {
        id: 'profile',
        label: 'Profil Saya',
        icon: UserRound,
        url: '/akun/profil',
    },
];

export default function PensedekahLayout({
    title,
    activeMenu,
    children,
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { auth } = usePage().props;
    const currentUrl = usePage().url;
    const user = auth?.user;

    const currentPath = currentUrl.split('?')[0];

    const detectedActiveMenu =
        currentPath === '/akun'
            ? 'dashboard'
            : currentPath.startsWith('/akun/donasi')
                ? 'donations'
                : currentPath.startsWith('/akun/program')
                    ? 'programs'
                    : currentPath.startsWith('/akun/tracking')
                        ? 'tracking'
                        : currentPath.startsWith('/akun/dokumentasi')
                            ? 'documentation'
                            : currentPath.startsWith('/akun/penyaluran')
                                ? 'reports'
                                : currentPath.startsWith('/akun/profil')
                                    ? 'profile'
                                    : null;

    const initials = (user?.name || 'Pensedekah')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(word => word[0])
        .join('')
        .toUpperCase();

    function navigate(item) {
        if (!item.url) return;

        router.visit(item.url);
        setSidebarOpen(false);
    }

    function logout() {
        router.post('/logout');
    }

    return (
        <>
            <Head title={`${title} - Sedekah Berkah`} />

            <div className="pd-app">
                {sidebarOpen && (
                    <button
                        className="pd-overlay"
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Tutup menu"
                    />
                )}

                <aside className={`pd-sidebar ${sidebarOpen ? 'show' : ''}`}>
                    <div className="pd-brand">
                        <div className="pd-brand-icon">
                            <HeartHandshake size={25} />
                        </div>

                        <div className="pd-brand-text">
                            <strong>Sedekah Berkah</strong>
                            <small>Platform Kebaikan</small>
                        </div>

                        <button
                            className="pd-close"
                            onClick={() => setSidebarOpen(false)}
                            aria-label="Tutup sidebar"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="pd-role">
                        <ShieldCheck size={17} />
                        AKUN PENSEDEKAH
                    </div>

                    <div className="pd-menu-title">MENU UTAMA</div>

                    <nav className="pd-navigation">
                        {menus.map(item => {
                            const Icon = item.icon;
                            const active =
                                (activeMenu || detectedActiveMenu) === item.id;

                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    className={`pd-menu-item ${
                                        active ? 'active' : ''
                                    } ${!item.url ? 'disabled' : ''}`}
                                    onClick={() => navigate(item)}
                                    disabled={!item.url}
                                >
                                    <Icon size={20} />
                                    <span>{item.label}</span>

                                    {!item.url && (
                                        <small className="pd-coming">
                                            Segera
                                        </small>
                                    )}
                                </button>
                            );
                        })}
                    </nav>

                    <div className="pd-sidebar-bottom">
                        <div className="pd-sidebar-note">
                            <HeartHandshake size={23} />
                            <div>
                                <strong>Terus Berbuat Baik</strong>
                                <small>Setiap kebaikan berarti</small>
                            </div>
                        </div>

                        <button
                            className="pd-logout"
                            onClick={logout}
                            type="button"
                        >
                            <LogOut size={19} />
                            Keluar
                        </button>
                    </div>
                </aside>

                <div className="pd-main">
                    <header className="pd-header">
                        <div className="pd-header-left">
                            <button
                                className="pd-mobile-menu"
                                onClick={() => setSidebarOpen(true)}
                                aria-label="Buka menu"
                            >
                                <Menu size={22} />
                            </button>

                            <div>
                                <div className="pd-breadcrumb">
                                    Pensedekah / {title}
                                </div>
                                <h1>{title}</h1>
                            </div>
                        </div>

                        <div className="pd-header-right">
                            <div className="pd-user-info">
                                <strong>{user?.name || 'Pensedekah'}</strong>
                                <small>{user?.email || ''}</small>
                            </div>

                            <div className="pd-avatar">
                                {initials}
                            </div>
                        </div>
                    </header>

                    <main className="pd-content">
                        {children}
                    </main>

                    <footer className="pd-footer">
                        <span>
                            © {new Date().getFullYear()} Sedekah Berkah
                        </span>
                        <span>Bersama Menebar Kebaikan</span>
                    </footer>
                </div>
            </div>
        </>
    );
}
