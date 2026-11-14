import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    LayoutDashboard, Users, Megaphone, Wallet,
    Receipt, HandHeart, ClipboardList, ChartNoAxesCombined,
    History, Settings, LogOut, Menu, X, Bell, ShieldCheck,
    ArrowLeftRight
} from 'lucide-react';
import '../../css/superadmin.css';

const menus = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, url: '/superadmin' },
    { id: 'users', label: 'Manajemen Pengguna', icon: Users, url: '/superadmin/pengguna' },
    { id: 'programs', label: 'Manajemen Program', icon: Megaphone, url: '/superadmin/program' },
    { id: 'finance', label: 'Manajemen Keuangan', icon: Wallet, url: '/superadmin/keuangan' },
    { id: 'transactions', label: 'Manajemen Transaksi', icon: Receipt, url: '/superadmin/transaksi' },
    { id: 'reconciliation', label: 'Rekonsiliasi Transaksi', icon: ArrowLeftRight, url: '/superadmin/rekonsiliasi' },
    { id: 'distribution', label: 'Penyaluran Dana', icon: HandHeart, url: '/superadmin/penyaluran' },
    { id: 'expenses', label: 'Pengeluaran & Persetujuan', icon: ClipboardList, url: '/superadmin/pengeluaran' },
    { id: 'reports', label: 'Laporan & Transparansi', icon: ChartNoAxesCombined, url: '/superadmin/laporan' },
    { id: 'audit', label: 'Audit Log', icon: ClipboardList, url: '/superadmin/audit-log' },
    { id: 'settings', label: 'Pengaturan Sistem', icon: Settings },
];

export default function SuperadminLayout({ title, activeMenu, children }) {
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

            <div className="sa-app">
                {sidebarOpen && (
                    <button
                        className="sa-overlay"
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Tutup menu"
                    />
                )}

                <aside className={`sa-sidebar ${sidebarOpen ? 'show' : ''}`}>
                    <div className="sa-brand">
                        <div className="sa-brand-icon">♥</div>
                        <div>
                            <strong>Sedekah Berkah</strong>
                            <small>Administration</small>
                        </div>
                        <button
                            className="sa-close"
                            onClick={() => setSidebarOpen(false)}
                            aria-label="Tutup sidebar"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="sa-role">
                        <ShieldCheck size={17} />
                        SUPERADMIN
                    </div>

                    <div className="sa-menu-title">MENU UTAMA</div>

                    <nav className="sa-navigation">
                        {menus.map(item => {
                            const Icon = item.icon;

                            return (
                                <button
                                    key={item.id}
                                    className={`sa-menu-item ${activeMenu === item.id ? 'active' : ''}`}
                                    onClick={() => navigate(item)}
                                    type="button"
                                >
                                    <Icon size={19} />
                                    <span>{item.label}</span>
                                    {activeMenu === item.id && (
                                        <span className="sa-active-dot" />
                                    )}
                                </button>
                            );
                        })}
                    </nav>

                    <div className="sa-sidebar-bottom">
                        <div className="sa-sidebar-note">
                            <ShieldCheck size={20} />
                            <div>
                                <strong>Akses tertinggi</strong>
                                <small>Pengawasan seluruh sistem</small>
                            </div>
                        </div>

                        <button className="sa-logout" onClick={logout}>
                            <LogOut size={18} />
                            Keluar
                        </button>
                    </div>
                </aside>

                <div className="sa-main">
                    <header className="sa-header">
                        <div className="sa-header-left">
                            <button
                                className="sa-mobile-menu"
                                onClick={() => setSidebarOpen(true)}
                                aria-label="Buka menu"
                            >
                                <Menu size={22} />
                            </button>

                            <div>
                                <div className="sa-breadcrumb">
                                    Superadmin / {title}
                                </div>
                                <h1>{title}</h1>
                            </div>
                        </div>

                        <div className="sa-header-right">
                            <span className="sa-admin-status">
                                <span /> Sistem Admin
                            </span>
                            <button className="sa-notification" title="Notifikasi">
                                <Bell size={19} />
                            </button>
                            <div className="sa-avatar">SA</div>
                        </div>
                    </header>

                    <main className="sa-content">
                        {children}
                    </main>

                    <footer className="sa-footer">
                        © {new Date().getFullYear()} Sedekah Berkah
                        <span>Superadmin Control Panel</span>
                    </footer>
                </div>
            </div>
        </>
    );
}
