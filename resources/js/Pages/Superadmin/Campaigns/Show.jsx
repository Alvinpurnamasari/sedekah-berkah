
import React from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import SuperadminLayout from '../../../Components/SuperadminLayout';
import {
    ArrowLeft,
    Pencil,
    MapPin,
    Users,
    Wallet,
    CalendarDays,
    Tag,
    Heart,
    CheckCircle,
    XCircle,
    Ban,
} from 'lucide-react';

export default function Show({ campaign }) {
    const { flash } = usePage().props;

    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
    } = useForm({
        rejection_reason: '',
    });

    const rupiah = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(Number(value || 0));
    };

    const formatDate = (date) => {
        if (!date) return '-';

        return new Date(date).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    const statusLabels = {
        draft: 'Draft',
        pending_approval: 'Menunggu Persetujuan',
        published: 'Published',
        rejected: 'Ditolak',
        inactive: 'Nonaktif',
        active: 'Aktif',
    };

    const collected = Number(campaign.collected_amount || 0);
    const target = Number(campaign.target_amount || 0);

    const percentage = target > 0
        ? Math.min((collected / target) * 100, 100)
        : 0;

    const isPending = campaign.status === 'pending_approval';
    const isPublished = campaign.status === 'published';

    const approveCampaign = () => {
        if (!window.confirm(
            'Setujui dan publikasikan program ini? Program akan langsung dapat menerima donasi.'
        )) {
            return;
        }

        router.post(
            `/superadmin/program/${campaign.id}/setujui`
        );
    };

    const rejectCampaign = (event) => {
        event.preventDefault();

        if (!window.confirm(
            'Apakah kamu yakin ingin menolak pengajuan program ini?'
        )) {
            return;
        }

        post(
            `/superadmin/program/${campaign.id}/tolak`,
            {
                onSuccess: () => reset(),
            }
        );
    };

    const deactivateCampaign = () => {
        if (!window.confirm(
            'Nonaktifkan program ini? Program tidak akan ditampilkan sebagai program publik.'
        )) {
            return;
        }

        router.post(
            `/superadmin/program/${campaign.id}/nonaktifkan`
        );
    };

    return (
        <SuperadminLayout
            title="Detail Program"
            activeMenu="programs"
        >
            <Head title={`Detail ${campaign.title}`} />

            <div className="sc-page">

                {flash?.success && (
                    <div className="mb-5 rounded-lg border border-green-300 bg-green-50 p-4 text-green-800">
                        {flash.success}
                    </div>
                )}

                {flash?.error && (
                    <div className="mb-5 rounded-lg border border-red-300 bg-red-50 p-4 text-red-800">
                        {flash.error}
                    </div>
                )}

                <div className="sc-intro">
                    <div>
                        <span className="sc-eyebrow">
                            DETAIL PROGRAM
                        </span>

                        <h2>{campaign.title}</h2>

                        <p>
                            Informasi lengkap dan perkembangan program sedekah.
                        </p>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                        <button
                            type="button"
                            className="sc-filter-button"
                            onClick={() =>
                                router.visit('/superadmin/program')
                            }
                        >
                            <ArrowLeft size={16} />
                            Kembali
                        </button>

                        {!isPending && (
                            <button
                                type="button"
                                className="sc-primary"
                                onClick={() =>
                                    router.visit(
                                        `/superadmin/program/${campaign.id}/edit`
                                    )
                                }
                            >
                                <Pencil size={16} />
                                Edit Program
                            </button>
                        )}
                    </div>
                </div>

                {/* PANEL KEPUTUSAN SUPERADMIN */}
                {isPending && (
                    <div className="bg-white rounded-xl border border-amber-300 p-5 mb-5">
                        <div className="flex items-center gap-2 mb-3 text-amber-700">
                            <CheckCircle size={22} />
                            <h3 className="font-semibold text-lg">
                                Pemeriksaan Pengajuan Program
                            </h3>
                        </div>

                        <p className="text-gray-600 mb-5">
                            Program ini telah diajukan oleh Admin dan sedang
                            menunggu keputusan Superadmin.
                            Periksa informasi program sebelum mengambil keputusan.
                        </p>

                        <div className="flex flex-wrap gap-3 mb-6">
                            <button
                                type="button"
                                disabled={processing}
                                onClick={approveCampaign}
                                className="px-5 py-3 rounded-lg bg-green-700 text-white font-semibold hover:bg-green-800 disabled:opacity-50"
                            >
                                <CheckCircle size={17} className="inline mr-2" />
                                Setujui & Publikasikan
                            </button>
                        </div>

                        <div className="border-t pt-5">
                            <h4 className="font-semibold text-red-700 mb-2">
                                Tolak Pengajuan
                            </h4>

                            <p className="text-sm text-gray-500 mb-3">
                                Jika program belum layak dipublikasikan,
                                tuliskan alasan penolakan agar Admin dapat
                                memperbaikinya.
                            </p>

                            <form onSubmit={rejectCampaign}>
                                <textarea
                                    value={data.rejection_reason}
                                    onChange={(event) =>
                                        setData(
                                            'rejection_reason',
                                            event.target.value
                                        )
                                    }
                                    rows="4"
                                    maxLength="2000"
                                    placeholder="Tuliskan alasan penolakan minimal 5 karakter..."
                                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-red-500 focus:outline-none"
                                    required
                                />

                                {errors.rejection_reason && (
                                    <p className="text-sm text-red-600 mt-2">
                                        {errors.rejection_reason}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={processing || data.rejection_reason.trim().length < 5}
                                    className="mt-3 px-5 py-3 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50"
                                >
                                    <XCircle size={17} className="inline mr-2" />
                                    Tolak Pengajuan
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* NONAKTIFKAN PROGRAM */}
                {isPublished && (
                    <div className="bg-white rounded-xl border p-5 mb-5">
                        <h3 className="font-semibold mb-2">
                            Pengelolaan Publikasi
                        </h3>

                        <p className="text-sm text-gray-600 mb-4">
                            Program ini sudah dipublikasikan dan dapat menerima donasi.
                            Superadmin dapat menonaktifkannya jika diperlukan.
                        </p>

                        <button
                            type="button"
                            onClick={deactivateCampaign}
                            className="px-5 py-3 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700"
                        >
                            <Ban size={17} className="inline mr-2" />
                            Nonaktifkan Program
                        </button>
                    </div>
                )}

                {/* STATUS DITOLAK */}
                {campaign.status === 'rejected' && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-5">
                        <h3 className="font-semibold text-red-800 mb-2">
                            Pengajuan Ditolak
                        </h3>

                        <p className="text-sm text-red-700">
                            {campaign.rejection_reason || 'Tidak ada alasan penolakan.'}
                        </p>
                    </div>
                )}

                {/* RINGKASAN DANA */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                    <div className="bg-white rounded-xl border p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <Wallet className="text-green-700" />
                            <span>Dana Terkumpul</span>
                        </div>

                        <h2 className="text-2xl font-bold text-green-800">
                            {rupiah(collected)}
                        </h2>

                        <p className="text-sm text-gray-500 mt-2">
                            Target dana: {rupiah(target)}
                        </p>

                        <div className="w-full bg-gray-100 rounded-full h-3 mt-4">
                            <div
                                className="bg-green-600 h-3 rounded-full"
                                style={{ width: `${percentage}%` }}
                            />
                        </div>

                        <p className="text-sm mt-2">
                            Pencapaian: {percentage.toFixed(1)}%
                        </p>
                    </div>

                    <div className="bg-white rounded-xl border p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <Users className="text-green-700" />
                            <span>Target Penerima Manfaat</span>
                        </div>

                        <h2 className="text-2xl font-bold">
                            {Number(
                                campaign.target_beneficiaries || 0
                            ).toLocaleString('id-ID')}
                            {' '}orang
                        </h2>

                        <p className="text-sm text-gray-500 mt-2">
                            {campaign.donor_count || 0} transaksi donasi berhasil
                        </p>
                    </div>
                </div>

                {/* INFORMASI PROGRAM */}
                <div className="bg-white rounded-xl border p-5 mb-5">
                    <h3 className="font-semibold text-lg mb-5">
                        Informasi Program
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">
                                Nama Program
                            </p>
                            <p className="font-medium">
                                {campaign.title}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500 mb-1">
                                Kategori
                            </p>
                            <p className="font-medium flex gap-2 items-center">
                                <Tag size={16} />
                                {campaign.category?.name || '-'}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500 mb-1">
                                Lokasi
                            </p>
                            <p className="font-medium flex gap-2 items-center">
                                <MapPin size={16} />
                                {campaign.location || '-'}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500 mb-1">
                                Status Program
                            </p>
                            <span className="font-medium">
                                {statusLabels[campaign.status] || campaign.status}
                            </span>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500 mb-1">
                                Tanggal Mulai
                            </p>
                            <p className="font-medium flex gap-2 items-center">
                                <CalendarDays size={16} />
                                {formatDate(campaign.start_date)}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500 mb-1">
                                Tanggal Selesai
                            </p>
                            <p className="font-medium flex gap-2 items-center">
                                <CalendarDays size={16} />
                                {formatDate(campaign.end_date)}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <p className="text-sm text-gray-500 mb-2">
                            Deskripsi Program
                        </p>

                        <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                            {campaign.description || '-'}
                        </p>
                    </div>
                </div>

                {/* TARGET PENERIMA MANFAAT */}
                <div className="bg-white rounded-xl border p-5">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <Heart size={19} className="text-green-700" />
                        Target Penerima Manfaat
                    </h3>

                    {campaign.beneficiary_targets?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {campaign.beneficiary_targets.map((item) => (
                                <span
                                    key={item.id}
                                    className="px-4 py-2 rounded-full bg-green-50 text-green-800 text-sm"
                                >
                                    {item.name}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">
                            Belum ada target penerima manfaat.
                        </p>
                    )}
                </div>

            </div>
        </SuperadminLayout>
    );
}
