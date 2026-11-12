
import React from 'react';
import { useForm, router } from '@inertiajs/react';
import AdminLayout from '../../../Components/AdminLayout';
import { ArrowLeft, Save, Megaphone } from 'lucide-react';
import '../../../../css/superadmin-campaigns.css';

const rupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

export default function CampaignForm({
    campaign = null,
    categories = [],
    beneficiaryTargets = [],
}) {
    const isEdit = Boolean(campaign);

    const { data, setData, post, put, processing, errors } = useForm({
        category_id: campaign?.category_id || '',
        title: campaign?.title || '',
        description: campaign?.description || '',
        target_amount: campaign?.target_amount || '',
        target_beneficiaries: campaign?.target_beneficiaries || 1,
        start_date: campaign?.start_date
            ? campaign.start_date.substring(0, 10)
            : '',
        end_date: campaign?.end_date
            ? campaign.end_date.substring(0, 10)
            : '',
        location: campaign?.location || 'Yogyakarta',
        beneficiary_targets: campaign?.beneficiary_targets?.map(
            (item) => String(item.id)
        ) || [],
    });

    function handleSubmit(e) {
        e.preventDefault();

        if (isEdit) {
            put(`/admin/program/${campaign.id}`);
        } else {
            post('/admin/program');
        }
    }

    function toggleTarget(id) {
        const value = String(id);

        const selected = data.beneficiary_targets.includes(value)
            ? data.beneficiary_targets.filter((item) => item !== value)
            : [...data.beneficiary_targets, value];

        setData('beneficiary_targets', selected);
    }

    return (
        <AdminLayout
            title={isEdit ? 'Edit Program' : 'Tambah Program'}
            activeMenu="campaigns"
        >
            <div className="sc-page">
                <section className="sc-intro">
                    <div>
                        <span className="sc-eyebrow">
                            PENGELOLAAN KAMPANYE
                        </span>
                        <h2>{isEdit ? 'Edit Program' : 'Tambah Program'}</h2>
                        <p>
                            Lengkapi informasi program sedekah dan target
                            penerima manfaat.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="sc-filter-button"
                        onClick={() => router.visit('/admin/program')}
                    >
                        <ArrowLeft size={17} />
                        Kembali
                    </button>
                </section>

                <form onSubmit={handleSubmit} className="sc-panel">
    <div style={{ padding: 24 }}>

        {Object.keys(errors).length > 0 && (
            <div className="mb-5 rounded-lg border border-red-300 bg-red-50 p-4">
                <strong className="text-red-700">
                    Program belum berhasil disimpan.
                </strong>

                <ul className="mt-2 list-disc pl-5 text-red-600">
                    {Object.entries(errors).map(([field, message]) => (
                        <li key={field}>
                            {field}: {message}
                        </li>
                    ))}
                </ul>
            </div>
        )}
                        <h3>Informasi Program</h3>
                        <p>Masukkan informasi dasar program.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
                            <div>
                                <label className="block mb-2">Kategori Program *</label>
                                <select
                                    className="w-full border rounded-lg p-3"
                                    value={data.category_id}
                                    onChange={(e) => setData('category_id', e.target.value)}
                                    required
                                >
                                    <option value="">Pilih kategori</option>
                                    {categories.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.category_id && (
                                    <small className="text-red-600">{errors.category_id}</small>
                                )}
                            </div>

                            <div>
                                <label className="block mb-2">Nama Program *</label>
                                <input
                                    className="w-full border rounded-lg p-3"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Contoh: Jumat Berkah"
                                    required
                                />
                                {errors.title && (
                                    <small className="text-red-600">{errors.title}</small>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block mb-2">Deskripsi Program *</label>
                                <textarea
                                    className="w-full border rounded-lg p-3"
                                    rows="5"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Jelaskan tujuan dan kegiatan program..."
                                    required
                                />
                                {errors.description && (
                                    <small className="text-red-600">{errors.description}</small>
                                )}
                            </div>

                            <div>
                                <label className="block mb-2">Target Dana (Rp) *</label>
                                <input
                                    type="number"
                                    min="5000"
                                    className="w-full border rounded-lg p-3"
                                    value={data.target_amount}
                                    onChange={(e) => setData('target_amount', e.target.value)}
                                    placeholder="5000000"
                                    required
                                />
                                {data.target_amount && (
                                    <small>{rupiah(data.target_amount)}</small>
                                )}
                                {errors.target_amount && (
                                    <small className="block text-red-600">{errors.target_amount}</small>
                                )}
                            </div>

                            <div>
                                <label className="block mb-2">Target Penerima Manfaat *</label>
                                <input
                                    type="number"
                                    min="1"
                                    className="w-full border rounded-lg p-3"
                                    value={data.target_beneficiaries}
                                    onChange={(e) => setData('target_beneficiaries', e.target.value)}
                                    required
                                />
                                {errors.target_beneficiaries && (
                                    <small className="text-red-600">{errors.target_beneficiaries}</small>
                                )}
                            </div>

                            <div>
                                <label className="block mb-2">Tanggal Mulai</label>
                                <input
                                    type="date"
                                    className="w-full border rounded-lg p-3"
                                    value={data.start_date}
                                    onChange={(e) => setData('start_date', e.target.value)}
                                />
                                {errors.start_date && (
                                    <small className="text-red-600">{errors.start_date}</small>
                                )}
                            </div>

                            <div>
                                <label className="block mb-2">Tanggal Berakhir</label>
                                <input
                                    type="date"
                                    className="w-full border rounded-lg p-3"
                                    value={data.end_date}
                                    onChange={(e) => setData('end_date', e.target.value)}
                                />
                                {errors.end_date && (
                                    <small className="text-red-600">{errors.end_date}</small>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block mb-2">Lokasi Kegiatan *</label>
                                <input
                                    className="w-full border rounded-lg p-3"
                                    value={data.location}
                                    onChange={(e) => setData('location', e.target.value)}
                                    required
                                />
                                {errors.location && (
                                    <small className="text-red-600">{errors.location}</small>
                                )}
                            </div>
                        </div>

                        <hr className="my-8" />

                        <h3>Target Penerima Manfaat</h3>
                        <p>Pilih satu atau beberapa kelompok penerima manfaat.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5">
                            {beneficiaryTargets.map((item) => (
                                <label
                                    key={item.id}
                                    className="flex items-center gap-3 border rounded-lg p-4 cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={data.beneficiary_targets.includes(String(item.id))}
                                        onChange={() => toggleTarget(item.id)}
                                    />
                                    <span>{item.name}</span>
                                </label>
                            ))}
                        </div>

                        {errors.beneficiary_targets && (
                            <small className="block text-red-600 mt-2">
                                {errors.beneficiary_targets}
                            </small>
                        )}

                        <div className="mt-8 rounded-lg bg-amber-50 border border-amber-200 p-4">
                            <strong>Status program: Draft</strong>
                            <p className="mt-1">
                                Program yang dibuat Admin akan disimpan sebagai
                                Draft dan menunggu pemeriksaan Superadmin.
                            </p>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                type="button"
                                className="sc-filter-button"
                                onClick={() => router.visit('/admin/program')}
                            >
                                Batal
                            </button>

                            <button
                                type="submit"
                                className="sc-primary"
                                disabled={processing}
                            >
                                <Save size={17} />
                                {processing
                                    ? 'Menyimpan...'
                                    : isEdit
                                        ? 'Simpan Perubahan'
                                        : 'Simpan Program Draft'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
