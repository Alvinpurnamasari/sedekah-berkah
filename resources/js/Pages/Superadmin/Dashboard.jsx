import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    LayoutDashboard, Users, Megaphone, Wallet,
    Receipt, HandHeart, ClipboardList, ChartNoAxesCombined,
    History, Settings, LogOut, Menu, X, Bell,
    ArrowUpRight, ShieldCheck
} from 'lucide-react';
import '../../../css/superadmin.css';

const menus = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Manajemen Pengguna', icon: Users },
    { id: 'programs', label: 'Manajemen Program', icon: Megaphone },
    { id: 'finance', label: 'Manajemen Keuangan', icon: Wallet },
    { id: 'transactions', label: 'Manajemen Transaksi', icon: Receipt },
    { id: 'distribution', label: 'Penyaluran Dana', icon: HandHeart },
    { id: 'expenses', label: 'Pengeluaran & Persetujuan', icon: ClipboardList },
    { id: 'reports', label: 'Laporan & Transparansi', icon: ChartNoAxesCombined },
    { id: 'audit', label: 'Audit Log', icon: History },
    { id: 'settings', label: 'Pengaturan Sistem', icon: Settings },
];

const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(angka || 0);
};

const descriptions = {
    users: 'Kelola akun Superadmin, Admin, tim lapangan, dan pensedekah.',
    programs: 'Kelola kategori, kampanye, target dana, dan penerima manfaat.',
    finance: 'Pantau dana masuk, dana keluar, saldo, dan rekonsiliasi.',
    transactions: 'Pantau seluruh transaksi dan status pembayaran donasi.',
    distribution: 'Kelola rencana, persetujuan, dan bukti penyaluran dana.',
    expenses: 'Periksa dan setujui pengajuan biaya operasional.',
    reports: 'Lihat laporan donasi, penyaluran, dan pengeluaran.',
    audit: 'Pantau riwayat aktivitas dan perubahan data sistem.',
    settings: 'Atur identitas lembaga, keamanan, dan konfigurasi aplikasi.',
};

export default function Dashboard({ stats = {} }) {
    const [activeMenu, setActiveMenu] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const activeItem = menus.find(item => item.id === activeMenu);

    function logout() {
        router.post('/logout');
    }

    return (
        <>
            <Head title="Dashboard Superadmin - Sedekah Berkah" />

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
                                    className={`sa-menu-item ${
                                        activeMenu === item.id ? 'active' : ''
                                    }`}
                                    onClick={() => {
                                        if (item.id === 'users') {
                                            router.visit('/superadmin/pengguna');
                                            return;
                                        }
                                    
                                        if (item.id === 'programs') {
                                            router.visit('/superadmin/program');
                                            return;
                                        }
                                    
                                        setActiveMenu(item.id);
                                        setSidebarOpen(false);
                                    }}
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
                            >
                                <Menu size={22} />
                            </button>

                            <div>
                                <div className="sa-breadcrumb">
                                    Superadmin / {activeItem.label}
                                </div>
                                <h1>{activeItem.label}</h1>
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
                        {activeMenu === 'dashboard' ? (
                            <>
                                <section className="sa-welcome">
                                    <div>
                                        <span className="sa-eyebrow">
                                            PUSAT KENDALI SISTEM
                                        </span>
                                        <h2>Selamat datang, Superadmin!</h2>
                                        <p>
                                            Pantau dan kendalikan seluruh aktivitas
                                            Sedekah Berkah dari satu tempat.
                                        </p>
                                    </div>
                                    <div className="sa-welcome-icon">
                                        <ShieldCheck size={43} />
                                    </div>
                                </section>

                                <div className="sa-section-heading">
                                <div>
                                        <h2>Ringkasan sistem</h2>
                                        <p>Statistik aktivitas Sedekah Berkah dari database.</p>
                                    </div>
                                </div>

                                <section className="sa-stat-grid">
                                    {[
                                        [
                                            'Total dana masuk',
                                            formatRupiah(stats.totalDanaMasuk),
                                            Wallet,
                                            'sa-green',
                                        ],
                                        [
                                            'Dana disalurkan',
                                            formatRupiah(stats.danaDisalurkan),
                                            HandHeart,
                                            'sa-blue',
                                        ],
                                        [
                                            'Dana belum disalurkan',
                                            formatRupiah(stats.danaBelumDisalurkan),
                                            Receipt,
                                            'sa-orange',
                                        ],
                                        [
                                            'Total donatur',
                                            (stats.totalDonatur || 0).toLocaleString('id-ID'),
                                            Users,
                                            'sa-purple',
                                        ],
                                        [
                                            'Transaksi berhasil',
                                            (stats.transaksiBerhasil || 0).toLocaleString('id-ID'),
                                            ClipboardList,
                                            'sa-teal',
                                        ],
                                        [
                                            'Menunggu persetujuan',
                                            (stats.menungguPersetujuan || 0).toLocaleString('id-ID'),
                                            History,
                                            'sa-red',
                                        ],
                                    ].map(([label, value, Icon, color]) => (
                                        <article className="sa-stat-card" key={label}>
                                            <div className={`sa-stat-icon ${color}`}>
                                                <Icon size={21} />
                                            </div>

                                            <p>{label}</p>
                                            <h3>{value}</h3>
                                            <small>Data dari database</small>
                                        </article>
                                    ))}
                                </section>

                                <section className="sa-bottom-grid">
                                    <div className="sa-panel">
                                        <div className="sa-panel-heading">
                                            <div>
                                                <h3>Aktivitas terbaru</h3>
                                                <p>Riwayat aktivitas sistem</p>
                                            </div>
                                            <History size={20} />
                                        </div>
                                        <div className="sa-empty">
                                            <ClipboardList size={30} />
                                            <strong>Belum ada aktivitas</strong>
                                            <span>Aktivitas sistem akan tampil di sini.</span>
                                        </div>
                                    </div>

                                    <div className="sa-panel">
                                        <div className="sa-panel-heading">
                                            <div>
                                                <h3>Akses cepat</h3>
                                                <p>Menu pengelolaan utama</p>
                                            </div>
                                            <ArrowUpRight size={20} />
                                        </div>

                                        <div className="sa-quick-links">
                                            {['users', 'programs', 'finance', 'reports'].map(id => {
                                                const item = menus.find(menu => menu.id === id);
                                                const Icon = item.icon;

                                                return (
                                                    <button
                                                        key={id}
                                                        onClick={() => {
                                                            if (id === 'users') {
                                                                router.visit('/superadmin/pengguna');
                                                                return;
                                                            }
                                                        
                                                            if (id === 'programs') {
                                                                router.visit('/superadmin/program');
                                                                return;
                                                            }
                                                        
                                                            setActiveMenu(id);
                                                        }}
                                                    >
                                                        <Icon size={19} />
                                                        {item.label}
                                                        <ArrowUpRight size={16} />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </section>
                            </>
                        ) : (
                            <section className="sa-module-placeholder">
                                <div className="sa-module-icon">
                                    {React.createElement(activeItem.icon, { size: 34 })}
                                </div>
                                <span className="sa-eyebrow">MODUL SUPERADMIN</span>
                                <h2>{activeItem.label}</h2>
                                <p>{descriptions[activeMenu]}</p>
                                <div className="sa-coming-soon">
                                    <Settings size={18} />
                                    Modul ini akan kita bangun dan hubungkan
                                    ke database secara bertahap.
                                </div>
                                <button
                                    className="sa-back-dashboard"
                                    onClick={() => setActiveMenu('dashboard')}
                                >
                                    Kembali ke Dashboard
                                </button>
                            </section>
                        )}
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
