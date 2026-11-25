
import React from 'react';
import SuperadminLayout from '../../Components/SuperadminLayout';
import {
    Wallet,
    HandHeart,
    Receipt,
    Users,
    ClipboardList,
    History,
    ArrowUpRight,
    ShieldCheck,
} from 'lucide-react';

const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(angka || 0);
};

export default function Dashboard({ stats = {} }) {
    const statistics = [
        ['Total dana masuk', formatRupiah(stats.totalDanaMasuk), Wallet, 'sa-green'],
        ['Dana disalurkan', formatRupiah(stats.danaDisalurkan), HandHeart, 'sa-blue'],
        ['Dana belum disalurkan', formatRupiah(stats.danaBelumDisalurkan), Receipt, 'sa-orange'],
        ['Total donatur', (stats.totalDonatur || 0).toLocaleString('id-ID'), Users, 'sa-purple'],
        ['Transaksi berhasil', (stats.transaksiBerhasil || 0).toLocaleString('id-ID'), ClipboardList, 'sa-teal'],
        ['Menunggu persetujuan', (stats.menungguPersetujuan || 0).toLocaleString('id-ID'), History, 'sa-red'],
    ];

    const quickLinks = [
        {
            label: 'Manajemen Pengguna',
            url: '/superadmin/pengguna',
            icon: Users,
        },
        {
            label: 'Manajemen Program',
            url: '/superadmin/program',
            icon: Receipt,
        },
        {
            label: 'Manajemen Keuangan',
            url: '/superadmin/keuangan',
            icon: Wallet,
        },
        {
            label: 'Laporan & Transparansi',
            url: '/superadmin/laporan',
            icon: ClipboardList,
        },
    ];

    return (
        <SuperadminLayout
            title="Dashboard"
            activeMenu="dashboard"
        >
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
                    <p>
                        Statistik aktivitas Sedekah Berkah dari database.
                    </p>
                </div>
            </div>

            <section className="sa-stat-grid">
                {statistics.map(([label, value, Icon, color]) => (
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
                {/* Aktivitas terbaru */}
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

                        <span>
                            Aktivitas sistem akan tampil di sini.
                        </span>
                    </div>
                </div>

                {/* Akses cepat */}
                <div className="sa-panel">
                    <div className="sa-panel-heading">
                        <div>
                            <h3>Akses cepat</h3>
                            <p>Menu pengelolaan utama</p>
                        </div>

                        <ArrowUpRight size={20} />
                    </div>

                    <div
                        className="sa-quick-links"
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                            marginTop: '18px',
                        }}
                    >
                        {quickLinks.map((item) => {
                            const Icon = item.icon;

                            return (
                                <a
                                    key={item.url}
                                    href={item.url}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: '12px',
                                        width: '100%',
                                        padding: '13px 15px',
                                        border: '1px solid #e5eee9',
                                        borderRadius: '10px',
                                        background: '#f8fbf9',
                                        color: '#164b39',
                                        textDecoration: 'none',
                                        transition: 'all 0.2s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#eaf7f0';
                                        e.currentTarget.style.borderColor = '#b7dfc9';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = '#f8fbf9';
                                        e.currentTarget.style.borderColor = '#e5eee9';
                                    }}
                                >
                                    <span
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            fontWeight: 500,
                                        }}
                                    >
                                        <Icon size={19} />
                                        {item.label}
                                    </span>

                                    <ArrowUpRight
                                        size={17}
                                        style={{ flexShrink: 0 }}
                                    />
                                </a>
                            );
                        })}
                    </div>
                </div>
            </section>
        </SuperadminLayout>
    );
}
