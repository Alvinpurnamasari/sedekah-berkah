
import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    HandCoins,
    Users,
    FileText,
    Clock,
    CheckCircle2,
    Eye,
    Filter,
    CalendarDays,
} from 'lucide-react';
import SuperadminLayout from '../../../Components/SuperadminLayout';
import '../../../../css/superadmin-finance.css';

const rupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

const dateFormat = (value) => {
    if (!value) return '-';

    return new Date(value).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

const reportStatus = {
    draft: 'Draft',
    pending: 'Menunggu pemeriksaan',
    approved: 'Disetujui',
    revision: 'Perlu revisi',
    rejected: 'Ditolak',
};

const distributionStatus = {
    planned: 'Direncanakan',
    ongoing: 'Berlangsung',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
};

export default function ReportsIndex({
    summary = {},
    campaigns = [],
    distributions = [],
    filters = {},
}) {
    const [campaignId, setCampaignId] = useState(filters.campaign_id || '');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');

    const cards = [
        {
            label: 'Total Pemasukan Donasi',
            value: rupiah(summary.total_income),
            icon: HandCoins,
            description: 'Donasi riil yang sudah dibayar',
            color: 'green',
        },
        {
            label: 'Total Donasi Berhasil',
            value: Number(summary.total_donations || 0).toLocaleString('id-ID'),
            icon: FileText,
            description: 'Transaksi donasi berhasil',
            color: 'blue',
        },
        {
            label: 'Dana Tersalurkan',
            value: rupiah(summary.total_distributed),
            icon: CheckCircle2,
            description: 'Biaya penyaluran yang selesai',
            color: 'purple',
        },
        {
            label: 'Penerima Manfaat',
            value: Number(summary.total_beneficiaries || 0).toLocaleString('id-ID'),
            icon: Users,
            description: 'Jumlah realisasi penerima manfaat',
            color: 'orange',
        },
        {
            label: 'Laporan Menunggu',
            value: Number(summary.pending_reports || 0).toLocaleString('id-ID'),
            icon: Clock,
            description: 'Menunggu pemeriksaan Superadmin',
            color: 'yellow',
        },
        {
            label: 'Laporan Riil Disetujui',
            value: Number(summary.approved_reports || 0).toLocaleString('id-ID'),
            icon: FileText,
            description: 'Laporan yang telah disetujui',
            color: 'dark',
        },
        {
            label: 'Laporan Simulasi',
            value: Number(summary.simulated_reports || 0).toLocaleString('id-ID'),
            icon: FileText,
            description: 'Data pengujian, tidak termasuk laporan riil',
            color: 'yellow',
        },
    ];

    function applyFilter(event) {
        event.preventDefault();

        router.get(
            '/superadmin/laporan',
            {
                campaign_id: campaignId,
                start_date: startDate,
                end_date: endDate,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    }

    function resetFilter() {
        setCampaignId('');
        setStartDate('');
        setEndDate('');

        router.get('/superadmin/laporan', {}, {
            preserveState: true,
            preserveScroll: true,
        });
    }

    const exportParams = new URLSearchParams();

if (campaignId) exportParams.set('campaign_id', campaignId);
if (startDate) exportParams.set('start_date', startDate);
if (endDate) exportParams.set('end_date', endDate);

const exportQuery = exportParams.toString();
const exportSuffix = exportQuery ? `?${exportQuery}` : '';

    return (
        <SuperadminLayout
            title="Laporan & Transparansi"
            activeMenu="reports"
        >
            <Head title="Laporan & Transparansi" />

            <div className="sf-page">
            <div className="sf-heading">
    <div>
        <span className="sf-eyebrow">
            PELAPORAN DAN TRANSPARANSI
        </span>
        <h1>Laporan & Transparansi</h1>
        <p>
            Pantau pemasukan donasi, realisasi penyaluran,
            penerima manfaat, dan status laporan setiap program.
        </p>
    </div>

    <div className="flex flex-wrap gap-2">
        <a
            href={`/superadmin/laporan/pdf${exportSuffix}`}
            className="rounded-lg bg-red-700 text-white px-4 py-2 hover:bg-red-800"
        >
            Unduh PDF
        </a>

        <a
            href={`/superadmin/laporan/excel${exportSuffix}`}
            className="rounded-lg bg-green-700 text-white px-4 py-2 hover:bg-green-800"
        >
            Ekspor Excel
        </a>
    </div>
</div>

                <section className="sf-card-grid">
                    {cards.map((card) => {
                        const Icon = card.icon;

                        return (
                            <article
                                className="sf-summary-card"
                                key={card.label}
                            >
                                <div className={`sf-card-icon ${card.color}`}>
                                    <Icon size={22} />
                                </div>

                                <div className="sf-card-content">
                                    <span>{card.label}</span>
                                    <strong>{card.value}</strong>
                                    <small>{card.description}</small>
                                </div>
                            </article>
                        );
                    })}
                </section>

                <section className="sf-panel">
                    <div className="sf-panel-heading">
                        <div>
                            <h2>Filter Laporan</h2>
                            <p>
                                Pilih program dan periode untuk menyaring data.
                            </p>
                        </div>
                        <Filter size={20} />
                    </div>

                    <form onSubmit={applyFilter}>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Program
                                </label>
                                <select
                                    value={campaignId}
                                    onChange={(e) => setCampaignId(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                >
                                    <option value="">Semua program</option>
                                    {campaigns.map((campaign) => (
                                        <option
                                            key={campaign.id}
                                            value={campaign.id}
                                        >
                                            {campaign.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Dari tanggal
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Sampai tanggal
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    min={startDate || undefined}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                />
                            </div>

                            <div className="flex items-end gap-2">
                                <button
                                    type="submit"
                                    className="rounded-lg bg-green-700 text-white px-4 py-2 hover:bg-green-800"
                                >
                                    Terapkan
                                </button>

                                <button
                                    type="button"
                                    onClick={resetFilter}
                                    className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    </form>
                </section>

                <section className="sf-panel">
                    <div className="sf-panel-heading">
                        <div>
                            <h2>Daftar Laporan Penyaluran</h2>
                            <p>
                                Pemeriksaan laporan realisasi dan dokumentasi
                                kegiatan dari tim lapangan.
                            </p>
                        </div>
                        <CalendarDays size={20} />
                    </div>

                    <div className="sf-table-wrap">
                        <table className="sf-table">
                            <thead>
                                <tr>
                                    <th>Nama Kegiatan</th>
                                    <th>Program</th>
                                    <th>Tanggal</th>
                                    <th>Lokasi</th>
                                    <th>Realisasi</th>
                                    <th>Status Kegiatan</th>
                                    <th>Status Laporan</th>
                                    <th>Dokumentasi</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>

                            <tbody>
                                {distributions.length > 0 ? (
                                    distributions.map((item) => (
                                        <tr key={item.id}>
                                            <td>
                                                <strong>{item.title}</strong>
                                                {item.is_simulated && (
                                                    <div className="mt-1">
                                                        <span className="sf-status pending">
                                                            DATA SIMULASI
                                                        </span>
                                                    </div>
                                                )}
                                            </td>

                                            <td>
                                                {item.campaign?.title || '-'}
                                            </td>

                                            <td>
                                                {dateFormat(item.distribution_date)}
                                            </td>

                                            <td>{item.location || '-'}</td>

                                            <td>
                                                {Number(item.actual_quantity || 0).toLocaleString('id-ID')}
                                                {' / '}
                                                {Number(item.planned_quantity || 0).toLocaleString('id-ID')}
                                            </td>

                                            <td>
                                                <span className={`sf-status ${item.status}`}>
                                                    {distributionStatus[item.status] || item.status}
                                                </span>
                                            </td>

                                            <td>
                                                <span className={`sf-status ${item.report_status}`}>
                                                    {reportStatus[item.report_status] || item.report_status}
                                                </span>
                                            </td>

                                            <td>
                                                {item.documents?.length || 0} file
                                            </td>

                                            <td>
                                                <Link
                                                    href={`/superadmin/penyaluran/${item.id}`}
                                                    className="inline-flex items-center gap-1 text-green-700 hover:underline font-medium"
                                                >
                                                    <Eye size={16} />
                                                    Detail
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="9" className="sf-empty">
                                            Belum ada laporan penyaluran.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                <div className="sf-note">
                    <CheckCircle2 size={17} />
                    <span>
                        Ringkasan keuangan hanya menghitung transaksi donasi
                        berhasil dan penyaluran riil. Data simulasi tetap
                        ditampilkan pada daftar internal untuk keperluan
                        pengujian, tetapi tidak masuk ke angka keuangan riil.
                        Laporan yang dipublikasikan harus melalui persetujuan
                        Superadmin.
                    </span>
                </div>
            </div>
        </SuperadminLayout>
    );
}
