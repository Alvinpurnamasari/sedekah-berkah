import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import PublicLayout from '../../Components/PublicLayout';
import '../../../css/program.css';

const rupiah = (angka) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(angka || 0);

const tanggal = (nilai) => {
    if (!nilai) return '-';

    return new Date(nilai).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};

export default function Campaign({ campaign }) {
    const [selectedTarget, setSelectedTarget] = useState(
        campaign.beneficiary_targets?.[0]?.id || ''
    );

    const collected = Number(campaign.collected_amount || 0);
    const target = Number(campaign.target_amount || 0);
    const progress = target > 0
        ? Math.min((collected / target) * 100, 100)
        : 0;

    const targets = campaign.beneficiary_targets || [];

    return (
        <PublicLayout>
            <Head title={campaign.title} />

            <main className="campaign-detail">
                <div className="campaign-container">

                    <Link href="/program" className="campaign-back">
                        ← Semua program
                    </Link>

                    <div className="campaign-layout">

                        <section className="campaign-main">

                            <div className="campaign-image">
                                <span>♥</span>
                            </div>

                            <div className="campaign-tags">
                                <span>{campaign.category?.name || 'Program Sedekah'}</span>
                                <span>Berlangsung</span>
                                <span>{campaign.location || 'Yogyakarta'}</span>
                            </div>

                            <h1>{campaign.title}</h1>

                            <p className="campaign-description">
                                {campaign.description}
                            </p>

                            <section className="campaign-section">
                                <h2>Target penerima manfaat</h2>

                                <p>
                                    Kelompok yang akan menerima penyaluran
                                    kampanye ini.
                                </p>

                                <div className="target-grid">
                                    {targets.length > 0 ? (
                                        targets.map((item) => (
                                            <button
                                                type="button"
                                                key={item.id}
                                                className={`target-item ${
                                                    selectedTarget === item.id
                                                        ? 'selected'
                                                        : ''
                                                }`}
                                                onClick={() => setSelectedTarget(item.id)}
                                            >
                                                <strong>{item.name}</strong>
                                                <span>
                                                    {item.description || 'Penerima manfaat program ini.'}
                                                </span>
                                            </button>
                                        ))
                                    ) : (
                                        <p>
                                            Target penerima manfaat belum tersedia.
                                        </p>
                                    )}
                                </div>
                            </section>

                            <section className="campaign-section">
                                <h2>Dokumentasi</h2>
                                <p>
                                    Dokumentasi kegiatan akan ditampilkan
                                    setelah tersedia.
                                </p>
                            </section>

                            <section className="campaign-section">
                                <h2>Update kegiatan</h2>
                                <p>Belum ada update kegiatan.</p>
                            </section>

                        </section>

                        <aside className="campaign-sidebar">
                            <div className="campaign-summary">
                                <span className="summary-label">DANA TERKUMPUL</span>

                                <h2>{rupiah(collected)}</h2>

                                <p>dari target {rupiah(target)}</p>

                                <div className="progress-track">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>

                                <div className="summary-row">
                                    <span>Pencapaian</span>
                                    <strong>{progress.toFixed(1)}%</strong>
                                </div>

                                <div className="summary-row">
                                    <span>Donatur</span>
                                    <strong>
                                        {campaign.donor_count || 0} orang
                                    </strong>
                                </div>

                                <div className="summary-row">
                                    <span>Target penerima</span>
                                    <strong>
                                        {campaign.target_beneficiaries || 0} orang
                                    </strong>
                                </div>

                                <div className="summary-row">
                                    <span>Periode</span>
                                    <strong>
                                        {tanggal(campaign.start_date)}
                                        {' s.d. '}
                                        {tanggal(campaign.end_date)}
                                    </strong>
                                </div>

                                <label className="target-label">
                                    Pilih target penerima
                                </label>

                                <select
                                    value={selectedTarget}
                                    onChange={(e) => setSelectedTarget(e.target.value)}
                                >
                                    {targets.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.name}
                                        </option>
                                    ))}
                                </select>

                                <Link
                                    href={`/checkout/${campaign.slug}?target=${selectedTarget}`}
                                    className="campaign-donate"
                                >
                                    Sedekah Sekarang
                                </Link>

                                <small>
                                    Target pilihan dapat diubah kembali saat checkout.
                                </small>
                            </div>
                        </aside>

                    </div>
                </div>
            </main>
        </PublicLayout>
    );
}