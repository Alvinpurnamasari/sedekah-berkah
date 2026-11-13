import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '../../../Components/AdminLayout';
import {
    ArrowLeft,
    Pencil,
    MapPin,
    Users,
    CalendarDays,
    Target,
    Wallet,
    Megaphone,
    Send,
} from 'lucide-react';
import '../../../../css/superadmin-campaigns.css';

const rupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

const formatDate = (value) => {
    if (!value) return '-';

    return new Date(`${String(value).substring(0, 10)}T00:00:00`)
        .toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
};

const statusLabel = {
    draft: 'Draft',
    pending_approval: 'Menunggu Persetujuan',
    published: 'Published',
    active: 'Aktif',
    rejected: 'Ditolak',
};

export default function CampaignShow({ campaign, flash = {} }) {
    const [showSuccess, setShowSuccess] = useState(Boolean(flash.success));

    useEffect(() => {
        if (!flash.success) return;

        setShowSuccess(true);

        const timer = setTimeout(() => {
            setShowSuccess(false);
        }, 4000);

        return () => clearTimeout(timer);
    }, [flash.success]);
    const collected = Number(campaign.collected_amount || 0);
    const target = Number(campaign.target_amount || 0);
    const progress = target > 0
        ? Math.min((collected / target) * 100, 100)
        : 0;

        const canEdit = ['draft', 'rejected'].includes(campaign.status);

    const canSubmitApproval = ['draft', 'rejected'].includes(campaign.status);

    const submitForApproval = () => {
        if (!window.confirm(
            'Ajukan program ini kepada Superadmin untuk diperiksa dan dipublikasikan?'
        )) {
            return;
        }

        router.post(
            `/admin/program/${campaign.id}/ajukan-persetujuan`
        );
    };

    return (
        <AdminLayout
            title="Detail Program"
            activeMenu="campaigns"
        >
            <div className="sc-page">
            {showSuccess && flash.success && (
                <div
                    style={{
                        padding: '14px 18px',
                        marginBottom: '20px',
                        borderRadius: '10px',
                        background: '#dcfce7',
                        color: '#166534',
                        border: '1px solid #86efac',
                    }}
                >
                    ✓ {flash.success}
                </div>
            )}
                <section className="sc-intro">
                    <div>
                        <span className="sc-eyebrow">
                            PENGELOLAAN KAMPANYE
                        </span>
                        <h2>Detail Program</h2>
                        <p>
                            Informasi lengkap program dan perkembangan
                            pengumpulan dana.
                        </p>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                        <button
                            type="button"
                            className="sc-filter-button"
                            onClick={() => router.visit('/admin/program')}
                        >
                            <ArrowLeft size={17} />
                            Kembali
                        </button>

                        {canEdit && (
                            <button
                                type="button"
                                className="sc-primary"
                                onClick={() => router.visit(
                                    `/admin/program/${campaign.id}/edit`
                                )}
                            >
                                <Pencil size={17} />
                                Edit Program
                            </button>
                        )}

                        {canSubmitApproval && (
                            <button
                                type="button"
                                className="sc-primary"
                                onClick={submitForApproval}
                            >
                                <Send size={17} />
                                Ajukan Persetujuan
                            </button>
                        )}
                    </div>
                </section>

                <section className="sc-panel" style={{ padding: 24 }}>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                            <span className="sc-eyebrow">
                                {campaign.category?.name || 'Program Sedekah'}
                            </span>
                            <h2 className="text-2xl font-semibold mt-2">
                                {campaign.title}
                            </h2>
                            <p className="flex items-center gap-2 mt-3 text-gray-500">
                                <MapPin size={16} />
                                {campaign.location || '-'}
                            </p>
                        </div>

                        <span className={`sc-status sc-status-${campaign.status}`}>
                            {statusLabel[campaign.status] || campaign.status}
                        </span>
                    </div>

                    <hr className="my-6" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="rounded-xl border p-5">
                            <Wallet className="text-green-700 mb-3" size={24} />
                            <small className="text-gray-500">Dana Terkumpul</small>
                            <h3 className="text-xl font-semibold mt-1">
                                {rupiah(collected)}
                            </h3>
                        </div>

                        <div className="rounded-xl border p-5">
                            <Target className="text-blue-600 mb-3" size={24} />
                            <small className="text-gray-500">Target Dana</small>
                            <h3 className="text-xl font-semibold mt-1">
                                {rupiah(target)}
                            </h3>
                        </div>

                        <div className="rounded-xl border p-5">
                            <Users className="text-orange-600 mb-3" size={24} />
                            <small className="text-gray-500">Target Penerima Manfaat</small>
                            <h3 className="text-xl font-semibold mt-1">
                                {Number(campaign.target_beneficiaries || 0).toLocaleString('id-ID')}
                                {' '}orang
                            </h3>
                        </div>
                    </div>

                    <div className="mt-6">
                        <div className="flex justify-between mb-2">
                            <strong>Progres Pengumpulan Dana</strong>
                            <strong>{progress.toFixed(1)}%</strong>
                        </div>

                        <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-green-600"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    <hr className="my-7" />

                    <h3 className="font-semibold text-lg mb-4">
                        <Megaphone size={19} className="inline mr-2" />
                        Deskripsi Program
                    </h3>

                    <p className="text-gray-600 whitespace-pre-line leading-7">
                        {campaign.description || 'Belum ada deskripsi program.'}
                    </p>

                    <hr className="my-7" />

                    <h3 className="font-semibold text-lg mb-4">
                        Informasi Pelaksanaan
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <small className="text-gray-500 flex items-center gap-2">
                                <CalendarDays size={15} />
                                Tanggal Mulai
                            </small>
                            <p className="font-medium mt-1">
                                {formatDate(campaign.start_date)}
                            </p>
                        </div>

                        <div>
                            <small className="text-gray-500 flex items-center gap-2">
                                <CalendarDays size={15} />
                                Tanggal Berakhir
                            </small>
                            <p className="font-medium mt-1">
                                {formatDate(campaign.end_date)}
                            </p>
                        </div>
                    </div>

                    <hr className="my-7" />

                    <h3 className="font-semibold text-lg mb-4">
                        Target Penerima Manfaat
                    </h3>

                    <div className="flex flex-wrap gap-2">
                        {campaign.beneficiary_targets?.length > 0 ? (
                            campaign.beneficiary_targets.map((item) => (
                                <span
                                    key={item.id}
                                    className="rounded-full border px-4 py-2 text-sm"
                                >
                                    {item.name}
                                </span>
                            ))
                        ) : (
                            <span className="text-gray-500">
                                Belum ada target penerima manfaat.
                            </span>
                        )}
                    </div>

                    <div className="mt-8 rounded-lg bg-amber-50 border border-amber-200 p-4">
                        <strong>Status Pengelolaan Program</strong>
                        <p className="mt-1 text-sm">
                            {campaign.status === 'draft'
                                ? 'Program masih berupa Draft. Silakan periksa kembali lalu ajukan kepada Superadmin.'
                                : campaign.status === 'pending_approval'
                                ? 'Program sedang menunggu pemeriksaan dan persetujuan Superadmin.'
                                : campaign.status === 'rejected'
                                ? `Program ditolak oleh Superadmin. Alasan: ${campaign.rejection_reason || 'Tidak ada keterangan.'} Silakan perbaiki dan ajukan kembali.`
                                : campaign.status === 'published'
                                ? 'Program telah disetujui dan dipublikasikan. Program dapat menerima donasi.'
                                : 'Program sedang tidak aktif.'}
                        </p>
                    </div>
                </section>
            </div>
        </AdminLayout>
    );
}
