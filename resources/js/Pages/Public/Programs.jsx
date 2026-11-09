import React, { useMemo, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    Search, MapPin, Heart, ArrowRight,
    Megaphone, SlidersHorizontal, HandHeart
} from 'lucide-react';
import '../../../css/program.css';
import PublicLayout from '../../Components/PublicLayout';

const formatRupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

const statusLabel = (status) => {
    const labels = {
        active: 'Berlangsung',
        ongoing: 'Berlangsung',
        pending: 'Menunggu persetujuan',
        completed: 'Selesai',
        paused: 'Ditunda',
    };

    return labels[status] || status;
};

export default function Programs({ campaigns = [] }) {
    const [keyword, setKeyword] = useState('');
    const [program, setProgram] = useState('semua');
    const [target, setTarget] = useState('semua');
    const [status, setStatus] = useState('semua');

    const categories = useMemo(
        () => [...new Set(campaigns.map(item => item.category_name).filter(Boolean))],
        [campaigns]
    );

    const targets = useMemo(
        () => [...new Set(campaigns.flatMap(item => item.beneficiary_names || []))],
        [campaigns]
    );

    const filteredCampaigns = campaigns.filter(item => {
        const search = keyword.toLowerCase();

        const matchKeyword =
            item.title?.toLowerCase().includes(search) ||
            item.description?.toLowerCase().includes(search) ||
            item.location?.toLowerCase().includes(search);

        const matchProgram =
            program === 'semua' || item.category_name === program;

        const matchTarget =
            target === 'semua' ||
            (item.beneficiary_names || []).includes(target);

        const matchStatus =
            status === 'semua' || item.status === status;

        return matchKeyword && matchProgram && matchTarget && matchStatus;
    });

    return (
        <PublicLayout>
            <Head title="Program & Kampanye - Sedekah Berkah" />
    
            <main className="program-page">
                <section className="program-heading">
                    <div className="program-heading-icon">
                        <Megaphone size={25} />
                    </div>

                    <div>
                        <h1>Program & Kampanye</h1>
                        <p>
                            Temukan kampanye kebaikan dan tentukan sendiri
                            siapa yang ingin kamu bantu.
                        </p>
                    </div>
                </section>

                <section className="program-filter">
                    <div className="filter-search">
                        <label htmlFor="campaign-search">Cari kampanye</label>
                        <div className="search-input">
                            <Search size={19} />
                            <input
                                id="campaign-search"
                                type="search"
                                placeholder="Contoh: nasi kotak, Malioboro..."
                                value={keyword}
                                onChange={e => setKeyword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="program-filter">Program</label>
                        <select
                            id="program-filter"
                            value={program}
                            onChange={e => setProgram(e.target.value)}
                        >
                            <option value="semua">Semua program</option>
                            {categories.map(item => (
                                <option key={item} value={item}>{item}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="target-filter">Target penerima</label>
                        <select
                            id="target-filter"
                            value={target}
                            onChange={e => setTarget(e.target.value)}
                        >
                            <option value="semua">Semua target</option>
                            {targets.map(item => (
                                <option key={item} value={item}>{item}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="status-filter">Status</label>
                        <select
                            id="status-filter"
                            value={status}
                            onChange={e => setStatus(e.target.value)}
                        >
                            <option value="semua">Semua status</option>
                            <option value="active">Berlangsung</option>
                            <option value="ongoing">Berlangsung</option>
                            <option value="pending">Menunggu persetujuan</option>
                            <option value="completed">Selesai</option>
                            <option value="paused">Ditunda</option>
                        </select>
                    </div>
                </section>

                <div className="program-result">
                    <span>
                        <SlidersHorizontal size={16} />
                        {filteredCampaigns.length} kampanye ditemukan
                    </span>
                    <button
                        type="button"
                        onClick={() => {
                            setKeyword('');
                            setProgram('semua');
                            setTarget('semua');
                            setStatus('semua');
                        }}
                    >
                        Reset filter
                    </button>
                </div>

                {filteredCampaigns.length > 0 ? (
                    <section className="campaign-grid">
                        {filteredCampaigns.map(item => {
                            const collected = Number(item.collected_amount || 0);
                            const goal = Number(item.target_amount || 0);
                            const percentage = goal > 0
                                ? Math.min((collected / goal) * 100, 100)
                                : 0;

                            return (
                                <article className="campaign-card" key={item.id}>
                                    <div className="campaign-image">
                                        <div className="campaign-image-symbol">
                                            <HandHeart size={48} />
                                        </div>
                                        <span className="campaign-category">
                                            {item.category_name || 'Program Sedekah'}
                                        </span>
                                    </div>

                                    <div className="campaign-content">
                                        <div className="campaign-card-status">
                                            <span className={`status-dot status-${item.status}`}>
                                                {statusLabel(item.status)}
                                            </span>
                                        </div>

                                        <h2>{item.title}</h2>

                                        <p className="campaign-location">
                                            <MapPin size={17} />
                                            {item.location || 'Yogyakarta'}
                                        </p>

                                        <p className="campaign-description">
                                            {item.description}
                                        </p>

                                        <div className="campaign-money">
                                            <strong>{formatRupiah(collected)}</strong>
                                            <span>dari {formatRupiah(goal)}</span>
                                        </div>

                                        <div className="campaign-progress">
                                            <div style={{ width: `${percentage}%` }} />
                                        </div>

                                        <div className="campaign-meta">
                                            <span>{Math.round(percentage)}% tercapai</span>
                                            <span>{item.donation_count || 0} donasi</span>
                                            <span>
                                                Target {item.target_beneficiaries || 0} penerima
                                            </span>
                                        </div>

                                        <div className="campaign-actions">
                                            <Link
                                                href={`/program/${item.slug}`}
                                                className="campaign-detail-button"
                                            >
                                                Lihat Detail
                                            </Link>

                                            <Link
                                                href={`/checkout/${item.slug}`}
                                                className="campaign-donate-button"
                                            >
                                                <Heart size={17} />
                                                Sedekah
                                                <ArrowRight size={16} />
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </section>
                ) : (
                    <div className="program-empty">
                        <div><Search size={32} /></div>
                        <h2>Belum ada kampanye ditemukan</h2>
                        <p>
                            Coba ubah kata pencarian atau filter yang kamu pilih.
                        </p>
                    </div>
                )}
            </main>
        </PublicLayout>
    );
}
