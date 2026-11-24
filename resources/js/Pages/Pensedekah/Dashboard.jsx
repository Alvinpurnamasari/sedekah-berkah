
import React from 'react';
import { Link } from '@inertiajs/react';
import {
    Heart,
    History,
    FileText,
    ArrowRight,
    Wallet,
    CheckCircle,
    Clock,
    HandHeart,
    Images,
    MapPinned,
    Megaphone,
    PackageCheck,
} from 'lucide-react';

import PensedekahLayout from '@/Components/PensedekahLayout';

const formatRupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value) || 0);

const formatDate = (value) => {
    if (!value) return '-';

    return new Date(value).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
};

const paymentStatus = {
    pending: {
        label: 'Menunggu Pembayaran',
        color: '#d97706',
        background: '#fef3c7',
    },
    paid: {
        label: 'Berhasil',
        color: '#15803d',
        background: '#dcfce7',
    },
    failed: {
        label: 'Gagal',
        color: '#dc2626',
        background: '#fee2e2',
    },
    expired: {
        label: 'Kedaluwarsa',
        color: '#64748b',
        background: '#e2e8f0',
    },
};

const quickLinks = [
    {
        title: 'Riwayat Donasi',
        description: 'Lihat daftar donasi dan status pembayaran Anda.',
        label: 'Lihat Riwayat',
        url: '/akun/donasi',
        icon: History,
    },
    {
        title: 'Laporan Penyaluran',
        description: 'Lihat laporan kegiatan dan penggunaan dana.',
        label: 'Lihat Laporan',
        url: '/akun/penyaluran',
        icon: FileText,
    },
    {
        title: 'Dokumentasi',
        description: 'Lihat foto dan video kegiatan penyaluran.',
        label: 'Lihat Dokumentasi',
        url: '/akun/dokumentasi',
        icon: Images,
    },
    {
        title: 'Tracking Penyaluran',
        description: 'Pantau tahapan perkembangan penyaluran.',
        label: 'Lihat Tracking',
        url: '/akun/tracking',
        icon: MapPinned,
    },
];

export default function Dashboard({
    summary = {},
    distributionSummary = {},
    recentDonations = [],
}) {
    const statistics = [
        {
            label: 'Total Transaksi',
            value: summary.totalDonations ?? 0,
            icon: Heart,
        },
        {
            label: 'Total Dana Berhasil',
            value: formatRupiah(summary.totalAmount ?? 0),
            icon: Wallet,
        },
        {
            label: 'Donasi Berhasil',
            value: summary.successfulDonations ?? 0,
            icon: CheckCircle,
        },
        {
            label: 'Menunggu Pembayaran',
            value: summary.pendingDonations ?? 0,
            icon: Clock,
        },
    ];

    return (
        <PensedekahLayout
            title="Dashboard"
            activeMenu="dashboard"
        >
            {/* Sambutan */}
            <div className="pd-welcome">
                <div>
                    <h2>Selamat Datang di Sedekah Berkah</h2>
                    <p>
                        Pantau riwayat donasi dan perkembangan
                        penyaluran kebaikan Anda.
                    </p>
                </div>

                <div className="pd-welcome-icon">
                    <Heart size={34} />
                </div>
            </div>

            {/* Statistik Donasi */}
            <div className="pd-dashboard-stats">
                {statistics.map((item, index) => {
                    const Icon = item.icon;

                    return (
                        <div className="pd-stat-card" key={index}>
                            <div className="pd-stat-icon">
                                <Icon size={22} />
                            </div>

                            <p>{item.label}</p>
                            <h3>{item.value}</h3>
                        </div>
                    );
                })}
            </div>

            {/* Program yang Didukung */}
            <div className="pd-supported-program">
                <div className="pd-supported-icon">
                    <HandHeart size={24} />
                </div>

                <div>
                    <p>Program yang Pernah Didukung</p>
                    <h3>{summary.totalCampaigns ?? 0} Program</h3>
                </div>

                <Link
                    href="/akun/program"
                    style={{
                        marginLeft: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        color: '#176b45',
                        fontSize: 13,
                        fontWeight: 600,
                        textDecoration: 'none',
                    }}
                >
                    Lihat Program <ArrowRight size={16} />
                </Link>
            </div>

            {/* Akses Cepat */}
            <section style={{ marginTop: 28 }}>
                <div className="pd-section-heading">
                    <div>
                        <h3>Akses Cepat</h3>
                        <p>
                            Akses informasi donasi dan penyaluran Anda.
                        </p>
                    </div>
                </div>

                <div className="pd-dashboard-grid">
                    {quickLinks.map((item) => {
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.url}
                                href={item.url}
                                className="pd-dashboard-card"
                                style={{
                                    textDecoration: 'none',
                                    color: 'inherit',
                                }}
                            >
                                <div className="pd-dashboard-card-icon">
                                    <Icon size={24} />
                                </div>

                                <h3>{item.title}</h3>

                                <p>{item.description}</p>

                                <span>
                                    {item.label}
                                    <ArrowRight size={16} />
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </section>

            {/* Status Penyaluran */}
            <section style={{ marginTop: 28 }}>
                <div className="pd-section-heading">
                    <div>
                        <h3>Status Penyaluran</h3>
                        <p>
                            Perkembangan kegiatan penyaluran dari program yang
                            pernah Anda dukung.
                        </p>
                    </div>

                    <Link href="/akun/tracking">
                        Lihat Tracking <ArrowRight size={16} />
                    </Link>
                </div>

                <div className="pd-dashboard-stats">
                    {[
                        {
                            label: 'Persiapan Penyaluran',
                            value: distributionSummary.preparation ?? 0,
                            icon: Clock,
                        },
                        {
                            label: 'Sedang Berlangsung',
                            value: distributionSummary.ongoing ?? 0,
                            icon: PackageCheck,
                        },
                        {
                            label: 'Selesai Dipublikasikan',
                            value: distributionSummary.completed ?? 0,
                            icon: CheckCircle,
                        },
                    ].map((item, index) => {
                        const Icon = item.icon;

                        return (
                            <div className="pd-stat-card" key={index}>
                                <div className="pd-stat-icon">
                                    <Icon size={22} />
                                </div>

                                <p>{item.label}</p>
                                <h3>{item.value} Kegiatan</h3>
                            </div>
                        );
                    })}
                </div>
            </section>


            {/* Donasi Terbaru */}
            <section className="pd-recent-section">
                <div className="pd-section-heading">
                    <div>
                        <h3>Donasi Terbaru</h3>
                        <p>Riwayat donasi terakhir Anda.</p>
                    </div>

                    <Link href="/akun/donasi">
                        Lihat Semua <ArrowRight size={16} />
                    </Link>
                </div>

                {recentDonations.length === 0 ? (
                    <div className="pd-recent-empty">
                        <History size={32} />
                        <p>Belum ada donasi.</p>
                        <span>
                            Donasi yang Anda lakukan akan muncul di sini.
                        </span>
                    </div>
                ) : (
                    <div className="pd-recent-list">
                        {recentDonations.map((donation) => {
                            const status =
                                paymentStatus[donation.payment_status] || {
                                    label: donation.payment_status,
                                    color: '#64748b',
                                    background: '#e2e8f0',
                                };

                            const total =
                                Number(donation.donation_amount || 0) +
                                Number(donation.operational_support || 0);

                            return (
                                <div
                                    className="pd-recent-item"
                                    key={donation.id}
                                >
                                    <div className="pd-recent-info">
                                        <strong>
                                            {donation.campaign_title || 'Donasi'}
                                        </strong>

                                        <small>
                                            {donation.donation_code} {' • '}
                                            {formatDate(donation.created_at)}
                                        </small>
                                    </div>

                                    <div className="pd-recent-value">
                                        <strong>
                                            {formatRupiah(total)}
                                        </strong>

                                        <span
                                            style={{
                                                color: status.color,
                                                background: status.background,
                                            }}
                                        >
                                            {status.label}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </PensedekahLayout>
    );
}
