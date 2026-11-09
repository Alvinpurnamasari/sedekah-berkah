
import React from 'react';
import { Head, router } from '@inertiajs/react';
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
} from 'lucide-react';

export default function Show({ campaign }) {
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
        active: 'Aktif',
        published: 'Published',
    };

    const collected = Number(campaign.collected_amount || 0);
    const target = Number(campaign.target_amount || 0);
    const percentage = target > 0
        ? Math.min((collected / target) * 100, 100)
        : 0;

    return (
        <SuperadminLayout
            title="Detail Program"
            activeMenu="programs"
        >
            <Head title={`Detail ${campaign.title}`} />

            <div className="sc-page">
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
                    </div>
                </div>

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
                                {statusLabels[campaign.status] ||
                                    campaign.status}
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

                <div className="bg-white rounded-xl border p-5">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <Heart size={19} className="text-green-700" />
                        Target Penerima Manfaat
                    </h3>

                    {campaign.beneficiary_targets?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {campaign.beneficiary_targets.map((target) => (
                                <span
                                    key={target.id}
                                    className="px-4 py-2 rounded-full bg-green-50 text-green-800 text-sm"
                                >
                                    {target.name}
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
