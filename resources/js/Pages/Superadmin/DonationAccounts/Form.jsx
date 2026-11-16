import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import SuperadminLayout from '../../../Components/SuperadminLayout';
import { ArrowLeft, Landmark, Save } from 'lucide-react';
import '../../../../css/superadmin-campaigns.css';

export default function DonationAccountForm({ account = null }) {
    const isEdit = Boolean(account);

    const { data, setData, post, put, processing, errors } = useForm({
        bank_name: account?.bank_name || '',
        account_number: account?.account_number || '',
        account_holder: account?.account_holder || '',
        description: account?.description || '',
        is_active: account ? Boolean(account.is_active) : true,
    });

    function handleSubmit(e) {
        e.preventDefault();

        if (isEdit) {
            put(`/superadmin/rekening-donasi/${account.id}`);
        } else {
            post('/superadmin/rekening-donasi');
        }
    }

    return (
        <SuperadminLayout
            title={isEdit ? 'Edit Rekening Donasi' : 'Tambah Rekening Donasi'}
            activeMenu="donation-accounts"
        >
            <Head
                title={`${isEdit ? 'Edit' : 'Tambah'} Rekening Donasi - Sedekah Berkah`}
            />

            <div className="sc-page">
                <section className="sc-intro">
                    <div>
                        <span className="sc-eyebrow">
                            PENGELOLAAN KEUANGAN
                        </span>

                        <h2>
                            {isEdit ? 'Edit Rekening Donasi' : 'Tambah Rekening Donasi'}
                        </h2>

                        <p>
                            {isEdit
                                ? 'Perbarui informasi rekening tujuan transfer donasi.'
                                : 'Tambahkan rekening bank sebagai tujuan transfer donasi.'
                            }
                        </p>
                    </div>

                    <Link
                        href="/superadmin/rekening-donasi"
                        className="sc-secondary"
                    >
                        <ArrowLeft size={17} />
                        Kembali
                    </Link>
                </section>

                <section className="sc-panel sc-form-panel">
                    <div className="sc-form-heading">
                        <div className="sc-form-icon">
                            <Landmark size={22} />
                        </div>

                        <div>
                            <h3>Informasi Rekening</h3>
                            <p>Lengkapi data rekening bank di bawah ini.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="sc-form-grid">
                            <div className="sc-field">
                                <label htmlFor="bank_name">
                                    Nama Bank <span>*</span>
                                </label>

                                <input
                                    id="bank_name"
                                    type="text"
                                    value={data.bank_name}
                                    onChange={e => setData('bank_name', e.target.value)}
                                    placeholder="Contoh: Bank BRI"
                                    required
                                />

                                {errors.bank_name && (
                                    <small className="sc-error">
                                        {errors.bank_name}
                                    </small>
                                )}
                            </div>

                            <div className="sc-field">
                                <label htmlFor="account_number">
                                    Nomor Rekening <span>*</span>
                                </label>

                                <input
                                    id="account_number"
                                    type="text"
                                    inputMode="numeric"
                                    value={data.account_number}
                                    onChange={e => setData('account_number', e.target.value)}
                                    placeholder="Masukkan nomor rekening"
                                    required
                                />

                                {errors.account_number && (
                                    <small className="sc-error">
                                        {errors.account_number}
                                    </small>
                                )}
                            </div>

                            <div className="sc-field sc-full">
                                <label htmlFor="account_holder">
                                    Nama Pemilik Rekening <span>*</span>
                                </label>

                                <input
                                    id="account_holder"
                                    type="text"
                                    value={data.account_holder}
                                    onChange={e => setData('account_holder', e.target.value)}
                                    placeholder="Contoh: Yayasan Sedekah Berkah"
                                    required
                                />

                                {errors.account_holder && (
                                    <small className="sc-error">
                                        {errors.account_holder}
                                    </small>
                                )}
                            </div>

                            <div className="sc-field sc-full">
                                <label htmlFor="description">
                                    Keterangan
                                </label>

                                <textarea
                                    id="description"
                                    rows="4"
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    placeholder="Keterangan tambahan yang akan ditampilkan kepada publik (opsional)"
                                />

                                {errors.description && (
                                    <small className="sc-error">
                                        {errors.description}
                                    </small>
                                )}
                            </div>

                            <div className="sc-field sc-full">
                                <label>Status Rekening</label>

                                <label className="sc-account-status">
                                    <input
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={e => setData('is_active', e.target.checked)}
                                    />

                                    <span>
                                        Rekening aktif dan ditampilkan kepada publik
                                    </span>
                                </label>

                                {errors.is_active && (
                                    <small className="sc-error">
                                        {errors.is_active}
                                    </small>
                                )}
                            </div>
                        </div>

                        <div className="sc-form-footer">
                            <Link
                                href="/superadmin/rekening-donasi"
                                className="sc-secondary"
                            >
                                Batal
                            </Link>

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
                                        : 'Simpan Rekening'
                                }
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </SuperadminLayout>
    );
}
