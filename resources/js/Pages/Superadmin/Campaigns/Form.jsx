import React from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import SuperadminLayout from '../../../Components/SuperadminLayout';
import { ArrowLeft, Save, Megaphone } from 'lucide-react';
import '../../../../css/superadmin-campaigns.css';

export default function CampaignForm({
    campaign,
    categories = [],
    beneficiaryTargets = [],
}) {
    const editing = Boolean(campaign);

    const form = useForm({
        category_id: campaign?.category_id || '',
        title: campaign?.title || '',
        description: campaign?.description || '',
        target_amount: campaign?.target_amount || '',
        target_beneficiaries: campaign?.target_beneficiaries || '',
        start_date: campaign?.start_date?.substring(0, 10) || '',
        end_date: campaign?.end_date?.substring(0, 10) || '',
        location: campaign?.location || 'Yogyakarta',
        beneficiary_targets: campaign?.beneficiary_targets?.map(item => item.id) || [],
    });

    function toggleTarget(id) {
        const current = form.data.beneficiary_targets;

        form.setData(
            'beneficiary_targets',
            current.includes(id)
                ? current.filter(item => item !== id)
                : [...current, id]
        );
    }

    function submit(e) {
        e.preventDefault();
    
        if (editing) {
            const url = `/superadmin/program/${campaign.id}`;
    
            console.log('URL EDIT:', url);
    
            router.post(url, {
                ...form.data,
                _method: 'put',
            }, {
                onSuccess: () => {
                    alert('Program berhasil diperbarui.');
                },
                onError: (errors) => {
                    console.log('ERROR VALIDASI:', errors);
                },
            });
    
        } else {
            form.post('/superadmin/program', {
                onSuccess: () => {
                    alert('Program berhasil ditambahkan.');
                },
                onError: (errors) => {
                    console.log('ERROR VALIDASI:', errors);
                },
            });
        }
    }
    return (
        <SuperadminLayout
            title={editing ? 'Edit Program' : 'Tambah Program'}
            activeMenu="programs"
        >
            <Head title={`${editing ? 'Edit' : 'Tambah'} Program - Sedekah Berkah`} />

            <div className="sc-page">
                <section className="sc-intro">
                    <div>
                        <span className="sc-eyebrow">PENGELOLAAN KAMPANYE</span>
                        <h2>{editing ? 'Edit Program' : 'Tambah Program Baru'}</h2>
                        <p>
                            Lengkapi informasi program dan target penerima manfaat.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="sc-secondary"
                        onClick={() => router.visit('/superadmin/program')}
                    >
                        <ArrowLeft size={17} />
                        Kembali
                    </button>
                </section>

                <form className="sc-form-panel" onSubmit={submit}>
                    <div className="sc-form-heading">
                        <div className="sc-form-icon">
                            <Megaphone size={22} />
                        </div>
                        <div>
                            <h3>Informasi Program</h3>
                            <p>Informasi utama kampanye sedekah.</p>
                        </div>
                    </div>

                    <div className="sc-form-grid">
                        <div className="sc-field">
                            <label>Kategori Program *</label>
                            <select
                                value={form.data.category_id}
                                onChange={e => form.setData('category_id', e.target.value)}
                            >
                                <option value="">Pilih kategori</option>
                                {categories.map(item => (
                                    <option key={item.id} value={item.id}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                            {form.errors.category_id && <small className="sc-error">{form.errors.category_id}</small>}
                        </div>

                        <div className="sc-field">
                            <label>Judul Program *</label>
                            <input
                                value={form.data.title}
                                onChange={e => form.setData('title', e.target.value)}
                                placeholder="Contoh: Jumat Berkah Berbagi Makanan"
                            />
                            {form.errors.title && <small className="sc-error">{form.errors.title}</small>}
                        </div>

                        <div className="sc-field sc-full">
                            <label>Deskripsi Program *</label>
                            <textarea
                                rows="5"
                                value={form.data.description}
                                onChange={e => form.setData('description', e.target.value)}
                                placeholder="Jelaskan tujuan, kegiatan, dan manfaat program..."
                            />
                            {form.errors.description && <small className="sc-error">{form.errors.description}</small>}
                        </div>

                        <div className="sc-field">
                            <label>Target Dana (Rupiah) *</label>
                            <input
                                type="number"
                                min="5000"
                                value={form.data.target_amount}
                                onChange={e => form.setData('target_amount', e.target.value)}
                                placeholder="5000000"
                            />
                            {form.errors.target_amount && <small className="sc-error">{form.errors.target_amount}</small>}
                        </div>

                        <div className="sc-field">
                            <label>Target Jumlah Penerima *</label>
                            <input
                                type="number"
                                min="1"
                                value={form.data.target_beneficiaries}
                                onChange={e => form.setData('target_beneficiaries', e.target.value)}
                                placeholder="100"
                            />
                            {form.errors.target_beneficiaries && <small className="sc-error">{form.errors.target_beneficiaries}</small>}
                        </div>

                        <div className="sc-field">
                            <label>Tanggal Mulai *</label>
                            <input
                                type="date"
                                value={form.data.start_date}
                                onChange={e => form.setData('start_date', e.target.value)}
                            />
                            {form.errors.start_date && <small className="sc-error">{form.errors.start_date}</small>}
                        </div>

                        <div className="sc-field">
                            <label>Tanggal Selesai *</label>
                            <input
                                type="date"
                                value={form.data.end_date}
                                onChange={e => form.setData('end_date', e.target.value)}
                            />
                            {form.errors.end_date && <small className="sc-error">{form.errors.end_date}</small>}
                        </div>

                        <div className="sc-field">
                            <label>Lokasi Program *</label>
                            <input
                                value={form.data.location}
                                onChange={e => form.setData('location', e.target.value)}
                                placeholder="Yogyakarta"
                            />
                            {form.errors.location && <small className="sc-error">{form.errors.location}</small>}
                        </div>
                    </div>

                    <div className="sc-target-section">
                        <h3>Target Penerima Manfaat *</h3>
                        <p>Pilih satu atau lebih kelompok penerima untuk program ini.</p>

                        <div className="sc-target-grid">
                            {beneficiaryTargets.map(target => (
                                <label className="sc-target-option" key={target.id}>
                                    <input
                                        type="checkbox"
                                        checked={form.data.beneficiary_targets.includes(target.id)}
                                        onChange={() => toggleTarget(target.id)}
                                    />
                                    <span>
                                        <strong>{target.name}</strong>
                                        {target.description && (
                                            <small>{target.description}</small>
                                        )}
                                    </span>
                                </label>
                            ))}
                        </div>

                        {beneficiaryTargets.length === 0 && (
                            <p className="sc-no-target">
                                Belum ada target penerima aktif. Tambahkan target penerima terlebih dahulu.
                            </p>
                        )}

                        {form.errors.beneficiary_targets && (
                            <small className="sc-error">{form.errors.beneficiary_targets}</small>
                        )}

                        {form.errors['beneficiary_targets.0'] && (
                            <small className="sc-error">{form.errors['beneficiary_targets.0']}</small>
                        )}
                    </div>

                    <div className="sc-form-footer">
                        <button
                            type="button"
                            className="sc-secondary"
                            onClick={() => router.visit('/superadmin/program')}
                        >
                            Batal
                        </button>

                        <button
                            type="submit"
                            className="sc-primary"
                            disabled={form.processing}
                        >
                            <Save size={17} />
                            {form.processing
                                ? 'Menyimpan...'
                                : editing ? 'Simpan Perubahan' : 'Simpan Program'
                            }
                        </button>
                    </div>
                </form>
            </div>
        </SuperadminLayout>
    );
}
