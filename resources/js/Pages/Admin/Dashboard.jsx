
import React from 'react';
import {
    Head,
} from '@inertiajs/react';
import {
    Megaphone,
    Wallet,
    HandHeart,
    Receipt,
    FileText,
    ClipboardList,
    Clock3,
    ArrowUpRight,
    Users,
    MapPin,
} from 'lucide-react';

import AdminLayout from '../../Components/AdminLayout';

const formatRupiah = (value) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value || 0));
};

const activityLabels = {
    user_created: 'Membuat pengguna',
    user_updated: 'Mengubah data pengguna',
    user_status_changed: 'Mengubah status pengguna',
    user_password_reset: 'Mereset password pengguna',
    expense_approved: 'Pengeluaran disetujui',
    expense_rejected: 'Pengeluaran ditolak',
    distribution_published: 'Laporan penyaluran dipublikasikan',
    distribution_unpublished: 'Publikasi laporan dibatalkan',
    distribution_report_submitted: 'Mengajukan laporan penyaluran',
    distribution_report_approved: 'Laporan penyaluran disetujui',
    distribution_report_revision_requested: 'Meminta revisi laporan',
};

const getActivityLabel = (action) => {
    return activityLabels[action] || action
        ?.replaceAll('_', ' ')
        ?.replace(/\b\w/g, letter => letter.toUpperCase()) || 'Aktivitas';
};

const formatActivityDate = (date) => {
    if (!date) return '-';

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(date));
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
        note: 'Donasi pokok dan dukungan operasional',
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
    {
        label: 'Donasi berhasil',
        value: summary.successfulDonations ?? 0,
        note: 'Transaksi berstatus paid',
        icon: Receipt,
        color: 'green',
    },
    {
        label: 'Laporan menunggu persetujuan',
        value: summary.pendingReports ?? 0,
        note: 'Menunggu pemeriksaan Superadmin',
        icon: FileText,
        color: 'blue',
    },
    {
        label: 'Pengeluaran menunggu persetujuan',
        value: summary.pendingExpenses ?? 0,
        note: 'Menunggu keputusan Superadmin',
        icon: ClipboardList,
        color: 'orange',
    },
];

export default function Dashboard({
    summary = {},
    recentActivities = [],
}) {
    return (
        <AdminLayout
            title="Dashboard Operasional"
            activeMenu="dashboard"
        >
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
                    <ClipboardList size={38} />
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
                            <article
                                className="ad-stat-card"
                                key={card.label}
                            >
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

                    {recentActivities.length > 0 ? (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                        }}>
                            {recentActivities.map((activity, index) => (
                                <div
                                    key={`${activity.action}-${activity.created_at}-${index}`}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        gap: '16px',
                                        padding: '12px 0',
                                        borderBottom: '1px solid #e5eee9',
                                    }}
                                >
                                    <div>
                                        <strong style={{
                                            display: 'block',
                                            fontSize: '13px',
                                        }}>
                                            {getActivityLabel(activity.action)}
                                        </strong>

                                        <span style={{
                                            fontSize: '12px',
                                            color: '#789087',
                                        }}>
                                            {activity.user_name || 'Sistem'}
                                            {activity.entity_type
                                                ? ` • ${activity.entity_type}`
                                                : ''}
                                        </span>
                                    </div>

                                    <small style={{
                                        color: '#789087',
                                        fontSize: '11px',
                                        textAlign: 'right',
                                        flexShrink: 0,
                                    }}>
                                        {formatActivityDate(activity.created_at)}
                                    </small>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="ad-empty">
                            <ClipboardList size={34} />
                            <strong>Belum ada aktivitas</strong>
                            <span>
                                Aktivitas akan tampil setelah modul operasional digunakan.
                            </span>
                        </div>
                    )}
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
                <ClipboardList size={21} />
                <div>
                    <strong>Batas kewenangan Admin</strong>
                    <p>
                        Admin bertugas mengelola kegiatan operasional dan
                        mengajukan persetujuan. Persetujuan keuangan dan
                        pengaturan sistem tetap menjadi kewenangan Superadmin.
                    </p>
                </div>
            </section>
        </AdminLayout>
    );
}
