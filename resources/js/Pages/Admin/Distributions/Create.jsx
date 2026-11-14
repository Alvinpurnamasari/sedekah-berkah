
import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Components/AdminLayout';
import { ArrowLeft, Save, Wallet } from 'lucide-react';
import '../../../../css/admin.css';

const formatRupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

export default function Create({ campaigns = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        campaign_id: '',
        title: '',
        distribution_date: '',
        location: '',
        planned_quantity: '',
        requested_budget: '',
    });

    function submit(e) {
        e.preventDefault();

        post('/admin/penyaluran', {
            preserveScroll: true,
        });
    }

    return (
        <AdminLayout
            title="Tambah Rencana Penyaluran"
            activeMenu="distribution"
        >
            <Head title="Tambah Rencana Penyaluran - Admin" />

            <div className="ad-content">
                <section className="ad-welcome">
                    <div>
                        <span className="ad-eyebrow">KEGIATAN LAPANGAN</span>
                        <h2>Tambah Rencana Penyaluran</h2>
                        <p>
                            Buat rencana kegiatan dan ajukan anggaran kepada
                            Superadmin untuk diperiksa.
                        </p>
                    </div>

                    <Wallet size={38} />
                </section>

                <section className="ad-section">
                    <div className="ad-section-heading">
                        <div>
                            <h3>Informasi kegiatan dan anggaran</h3>
                            <p>
                                Pastikan informasi dan nominal anggaran sudah
                                benar sebelum disimpan.
                            </p>
                        </div>

                        <Link
                            href="/admin/penyaluran"
                            className="ad-detail-link"
                        >
                            <ArrowLeft size={16} />
                            Kembali
                        </Link>
                    </div>

                    <div className="ad-panel">
                        <form onSubmit={submit}>
                            <div className="ad-form-grid">
                                <div className="ad-form-group">
                                    <label>Program</label>
                                    <select
                                        value={data.campaign_id}
                                        onChange={(e) =>
                                            setData('campaign_id', e.target.value)
                                        }
                                        required
                                    >
                                        <option value="">Pilih program</option>
                                        {campaigns.map((campaign) => (
                                            <option
                                                key={campaign.id}
                                                value={campaign.id}
                                            >
                                                {campaign.title}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.campaign_id && (
                                        <small className="ad-error">
                                            {errors.campaign_id}
                                        </small>
                                    )}
                                </div>

                                <div className="ad-form-group">
                                    <label>Nama kegiatan</label>
                                    <input
                                        type="text"
                                        value={data.title}
                                        onChange={(e) =>
                                            setData('title', e.target.value)
                                        }
                                        placeholder="Contoh: Penyaluran Jumat Berkah"
                                        required
                                    />
                                    {errors.title && (
                                        <small className="ad-error">
                                            {errors.title}
                                        </small>
                                    )}
                                </div>

                                <div className="ad-form-group">
                                    <label>Tanggal penyaluran</label>
                                    <input
                                        type="date"
                                        value={data.distribution_date}
                                        onChange={(e) =>
                                            setData('distribution_date', e.target.value)
                                        }
                                        required
                                    />
                                    {errors.distribution_date && (
                                        <small className="ad-error">
                                            {errors.distribution_date}
                                        </small>
                                    )}
                                </div>

                                <div className="ad-form-group">
                                    <label>Lokasi penyaluran</label>
                                    <input
                                        type="text"
                                        value={data.location}
                                        onChange={(e) =>
                                            setData('location', e.target.value)
                                        }
                                        placeholder="Contoh: Yogyakarta"
                                        required
                                    />
                                    {errors.location && (
                                        <small className="ad-error">
                                            {errors.location}
                                        </small>
                                    )}
                                </div>

                                <div className="ad-form-group">
                                    <label>Target jumlah penerima</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={data.planned_quantity}
                                        onChange={(e) =>
                                            setData('planned_quantity', e.target.value)
                                        }
                                        placeholder="Contoh: 100"
                                        required
                                    />
                                    {errors.planned_quantity && (
                                        <small className="ad-error">
                                            {errors.planned_quantity}
                                        </small>
                                    )}
                                </div>

                                <div className="ad-form-group">
                                    <label>Anggaran yang diajukan (Rp)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={data.requested_budget}
                                        onChange={(e) =>
                                            setData('requested_budget', e.target.value)
                                        }
                                        placeholder="Contoh: 2500000"
                                        required
                                    />
                                    {errors.requested_budget && (
                                        <small className="ad-error">
                                            {errors.requested_budget}
                                        </small>
                                    )}
                                    {data.requested_budget && (
                                        <small>
                                            {formatRupiah(data.requested_budget)}
                                        </small>
                                    )}
                                </div>
                            </div>

                            <div className="ad-notice">
                                <Wallet size={20} />
                                <div>
                                    <strong>Informasi persetujuan anggaran</strong>
                                    <p>
                                        Rencana akan disimpan sebagai draft.
                                        Anggaran belum dapat digunakan sebelum
                                        diperiksa dan disetujui Superadmin.
                                    </p>
                                </div>
                            </div>

                            <div className="ad-form-actions">
                                <Link
                                    href="/admin/penyaluran"
                                    className="ad-detail-link"
                                >
                                    Batal
                                </Link>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="ad-primary-button"
                                >
                                    <Save size={17} />
                                    {processing ? 'Menyimpan...' : 'Simpan Rencana'}
                                </button>
                            </div>
                        </form>
                    </div>
                </section>
            </div>
        </AdminLayout>
    );
}
