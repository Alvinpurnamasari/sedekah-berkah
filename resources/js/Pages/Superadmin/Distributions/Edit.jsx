
import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import SuperadminLayout from '../../../Components/SuperadminLayout';
import { ArrowLeft, Save } from 'lucide-react';

export default function Edit({ distribution, campaigns }) {
    const { data, setData, put, processing, errors } = useForm({
        campaign_id: distribution.campaign_id || '',
        title: distribution.title || '',
        distribution_date: distribution.distribution_date || '',
        location: distribution.location || '',
        planned_quantity: distribution.planned_quantity || 1,
    });

    const submit = (event) => {
        event.preventDefault();
        put(`/superadmin/penyaluran/${distribution.id}`);
    };

    const fieldStyle = {
        width: '100%',
        padding: 12,
        border: '1px solid #dce7e1',
        borderRadius: 8,
        marginTop: 7,
        boxSizing: 'border-box',
    };

    const labelStyle = {
        display: 'block',
        fontWeight: 600,
        color: '#40594b',
        marginBottom: 16,
    };

    return (
        <SuperadminLayout title="Edit Penyaluran" activeMenu="distribution">
            <Head title="Edit Rencana Penyaluran" />

            <div style={{ maxWidth: 850, margin: '0 auto' }}>
                <Link
                    href={`/superadmin/penyaluran/${distribution.id}`}
                    style={{
                        display: 'inline-flex',
                        gap: 8,
                        alignItems: 'center',
                        color: '#16734f',
                        textDecoration: 'none',
                        marginBottom: 20,
                    }}
                >
                    <ArrowLeft size={18} />
                    Kembali ke Detail
                </Link>

                <div style={{
                    background: 'white',
                    border: '1px solid #e5eee9',
                    borderRadius: 14,
                    padding: 28,
                }}>
                    <h2 style={{ marginTop: 0 }}>Edit Rencana Penyaluran</h2>

                    <p style={{ color: '#82958c' }}>
                        Perbarui informasi rencana kegiatan penyaluran.
                    </p>

                    <form onSubmit={submit}>
                        <label style={labelStyle}>
                            Program Donasi *
                            <select
                                value={data.campaign_id}
                                onChange={e => setData('campaign_id', e.target.value)}
                                style={fieldStyle}
                            >
                                <option value="">Pilih program</option>
                                {campaigns.map(campaign => (
                                    <option key={campaign.id} value={campaign.id}>
                                        {campaign.title}
                                    </option>
                                ))}
                            </select>
                            {errors.campaign_id && <small style={{ color: 'red' }}>{errors.campaign_id}</small>}
                        </label>

                        <label style={labelStyle}>
                            Nama Kegiatan *
                            <input
                                value={data.title}
                                onChange={e => setData('title', e.target.value)}
                                style={fieldStyle}
                            />
                            {errors.title && <small style={{ color: 'red' }}>{errors.title}</small>}
                        </label>

                        <label style={labelStyle}>
                            Tanggal Penyaluran *
                            <input
                                type="date"
                                value={data.distribution_date}
                                onChange={e => setData('distribution_date', e.target.value)}
                                style={fieldStyle}
                            />
                            {errors.distribution_date && <small style={{ color: 'red' }}>{errors.distribution_date}</small>}
                        </label>

                        <label style={labelStyle}>
                            Lokasi Penyaluran *
                            <input
                                value={data.location}
                                onChange={e => setData('location', e.target.value)}
                                style={fieldStyle}
                            />
                            {errors.location && <small style={{ color: 'red' }}>{errors.location}</small>}
                        </label>

                        <label style={labelStyle}>
                            Target Jumlah Penerima *
                            <input
                                type="number"
                                min="1"
                                value={data.planned_quantity}
                                onChange={e => setData('planned_quantity', e.target.value)}
                                style={fieldStyle}
                            />
                            {errors.planned_quantity && <small style={{ color: 'red' }}>{errors.planned_quantity}</small>}
                        </label>

                        <div style={{
                            background: '#f3f7f4',
                            padding: 16,
                            borderRadius: 9,
                            marginBottom: 22,
                            color: '#64786d',
                            fontSize: 13,
                        }}>
                            Realisasi penerima, biaya aktual, dan status laporan tidak diubah melalui formulir ini.
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                            <Link
                                href={`/superadmin/penyaluran/${distribution.id}`}
                                style={{
                                    padding: '12px 18px',
                                    border: '1px solid #dce7e1',
                                    borderRadius: 8,
                                    textDecoration: 'none',
                                    color: '#52675c',
                                }}
                            >
                                Batal
                            </Link>

                            <button
                                type="submit"
                                disabled={processing}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '12px 20px',
                                    border: 0,
                                    borderRadius: 8,
                                    background: '#16734f',
                                    color: 'white',
                                    cursor: 'pointer',
                                }}
                            >
                                <Save size={17} />
                                {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </SuperadminLayout>
    );
}
