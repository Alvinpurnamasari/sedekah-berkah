
import React, { useMemo, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    Search,
    MapPin,
    Heart,
    ArrowRight,
    Megaphone,
    SlidersHorizontal,
    HandHeart,
} from 'lucide-react';
import PensedekahLayout from '../../../Components/PensedekahLayout';

const rupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

const statusLabel = (status) => {
    const labels = {
        published: 'Dipublikasikan',
        active: 'Berlangsung',
    };

    return labels[status] || status;
};

export default function Index({ campaigns = [] }) {
    const [keyword, setKeyword] = useState('');
    const [program, setProgram] = useState('semua');
    const [target, setTarget] = useState('semua');
    const [status, setStatus] = useState('semua');

    const categories = useMemo(
        () => [
            ...new Set(
                campaigns
                    .map(item => item.category_name)
                    .filter(Boolean)
            ),
        ],
        [campaigns]
    );

    const targets = useMemo(
        () => [
            ...new Set(
                campaigns.flatMap(item => item.beneficiary_names || [])
            ),
        ],
        [campaigns]
    );

    const filteredCampaigns = campaigns.filter(item => {
        const search = keyword.toLowerCase();

        const matchKeyword =
            item.title?.toLowerCase().includes(search) ||
            item.description?.toLowerCase().includes(search) ||
            item.location?.toLowerCase().includes(search);

        const matchProgram =
            program === 'semua' ||
            item.category_name === program;

        const matchTarget =
            target === 'semua' ||
            (item.beneficiary_names || []).includes(target);

        const matchStatus =
            status === 'semua' || item.status === status;

        return (
            matchKeyword &&
            matchProgram &&
            matchTarget &&
            matchStatus
        );
    });

    function resetFilters() {
        setKeyword('');
        setProgram('semua');
        setTarget('semua');
        setStatus('semua');
    }

    return (
        <PensedekahLayout title="Program">
            <Head title="Program & Kampanye" />

            <div style={{
                maxWidth: 1200,
                margin: '0 auto',
            }}>

                {/* Heading */}
                <div style={{ marginBottom: 25 }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        marginBottom: 8,
                    }}>
                        <Megaphone size={24} color="#176b45" />

                        <h2 style={{
                            color: '#176b45',
                            margin: 0,
                            fontSize: 22,
                        }}>
                            Program & Kampanye
                        </h2>
                    </div>

                    <p style={{
                        color: '#64748b',
                        margin: 0,
                        lineHeight: 1.7,
                    }}>
                        Temukan berbagai program kebaikan dan pilih
                        kampanye yang ingin kamu dukung melalui
                        Sedekah Berkah.
                    </p>
                </div>

                {/* Filter */}
                <div style={{
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: 14,
                    padding: 20,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
                    gap: 16,
                    marginBottom: 20,
                }}>

                    <div>
                        <label style={labelStyle}>
                            Cari kampanye
                        </label>

                        <div style={{
                            ...inputWrapperStyle,
                        }}>
                            <Search size={18} color="#64748b" />

                            <input
                                type="search"
                                placeholder="Nama atau lokasi kampanye..."
                                value={keyword}
                                onChange={e => setKeyword(e.target.value)}
                                style={searchInputStyle}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={labelStyle}>
                            Program
                        </label>

                        <select
                            value={program}
                            onChange={e => setProgram(e.target.value)}
                            style={selectStyle}
                        >
                            <option value="semua">Semua program</option>

                            {categories.map(item => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={labelStyle}>
                            Target penerima
                        </label>

                        <select
                            value={target}
                            onChange={e => setTarget(e.target.value)}
                            style={selectStyle}
                        >
                            <option value="semua">Semua target</option>

                            {targets.map(item => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={labelStyle}>
                            Status
                        </label>

                        <select
                            value={status}
                            onChange={e => setStatus(e.target.value)}
                            style={selectStyle}
                        >
                            <option value="semua">Semua status</option>
                            <option value="published">Dipublikasikan</option>
                            <option value="active">Berlangsung</option>
                        </select>
                    </div>
                </div>

                {/* Jumlah hasil */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    flexWrap: 'wrap',
                    marginBottom: 18,
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        color: '#64748b',
                        fontSize: 14,
                    }}>
                        <SlidersHorizontal size={17} />

                        <span>
                            {filteredCampaigns.length} kampanye ditemukan
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={resetFilters}
                        style={resetButtonStyle}
                    >
                        Reset filter
                    </button>
                </div>

                {/* Daftar kampanye */}
                {filteredCampaigns.length > 0 ? (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns:
                            'repeat(auto-fit, minmax(min(100%, 290px), 1fr))',
                        gap: 20,
                    }}>
                        {filteredCampaigns.map(item => {
                            const collected = Number(
                                item.collected_amount || 0
                            );

                            const goal = Number(
                                item.target_amount || 0
                            );

                            const percentage = goal > 0
                                ? Math.min((collected / goal) * 100, 100)
                                : 0;

                            return (
                                <article
                                    key={item.id}
                                    style={{
                                        background: '#fff',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: 15,
                                        overflow: 'hidden',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        minWidth: 0,
                                    }}
                                >
                                    {/* Ilustrasi */}
                                    <div style={{
                                        height: 145,
                                        background: 'linear-gradient(135deg, #e8f5ed, #d5eee0)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        position: 'relative',
                                    }}>
                                        <HandHeart
                                            size={58}
                                            color="#176b45"
                                            strokeWidth={1.5}
                                        />

                                        <span style={{
                                            position: 'absolute',
                                            left: 14,
                                            bottom: 13,
                                            background: '#fff',
                                            color: '#176b45',
                                            padding: '6px 11px',
                                            borderRadius: 20,
                                            fontSize: 11,
                                            fontWeight: 700,
                                        }}>
                                            {item.category_name || 'Program Sedekah'}
                                        </span>
                                    </div>

                                    {/* Konten */}
                                    <div style={{
                                        padding: 20,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        flex: 1,
                                    }}>
                                        <div style={{ marginBottom: 10 }}>
                                            <span style={{
                                                display: 'inline-block',
                                                background: '#e8f5ed',
                                                color: '#176b45',
                                                padding: '5px 10px',
                                                borderRadius: 20,
                                                fontSize: 11,
                                                fontWeight: 700,
                                            }}>
                                                {statusLabel(item.status)}
                                            </span>
                                        </div>

                                        <h3 style={{
                                            color: '#1e293b',
                                            fontSize: 18,
                                            lineHeight: 1.4,
                                            margin: '0 0 10px',
                                        }}>
                                            {item.title}
                                        </h3>

                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 6,
                                            color: '#64748b',
                                            fontSize: 13,
                                            marginBottom: 12,
                                        }}>
                                            <MapPin size={16} />
                                            <span>
                                                {item.location || 'Lokasi belum ditentukan'}
                                            </span>
                                        </div>

                                        <p style={{
                                            color: '#64748b',
                                            fontSize: 13,
                                            lineHeight: 1.65,
                                            margin: '0 0 18px',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            minHeight: 63,
                                        }}>
                                            {item.description || 'Belum ada deskripsi kampanye.'}
                                        </p>

                                        {/* Dana */}
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'baseline',
                                            gap: 8,
                                            flexWrap: 'wrap',
                                            marginBottom: 9,
                                        }}>
                                            <strong style={{
                                                color: '#176b45',
                                                fontSize: 16,
                                            }}>
                                                {rupiah(collected)}
                                            </strong>

                                            <span style={{
                                                color: '#94a3b8',
                                                fontSize: 11,
                                            }}>
                                                dari {rupiah(goal)}
                                            </span>
                                        </div>

                                        {/* Progress */}
                                        <div style={{
                                            height: 8,
                                            background: '#e5e7eb',
                                            borderRadius: 20,
                                            overflow: 'hidden',
                                            marginBottom: 10,
                                        }}>
                                            <div style={{
                                                width: `${percentage}%`,
                                                height: '100%',
                                                background: '#198754',
                                                borderRadius: 20,
                                            }} />
                                        </div>

                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            gap: 8,
                                            flexWrap: 'wrap',
                                            color: '#64748b',
                                            fontSize: 11,
                                            marginBottom: 20,
                                        }}>
                                            <span>
                                                {Math.round(percentage)}% tercapai
                                            </span>

                                            <span>
                                                {Number(item.donation_count || 0).toLocaleString('id-ID')} donasi
                                            </span>
                                        </div>

                                        <div style={{
                                            color: '#64748b',
                                            fontSize: 12,
                                            marginBottom: 18,
                                        }}>
                                            <Heart size={15} style={{
                                                display: 'inline',
                                                verticalAlign: 'middle',
                                                marginRight: 5,
                                                color: '#176b45',
                                            }} />

                                            Target {Number(
                                                item.target_beneficiaries || 0
                                            ).toLocaleString('id-ID')} penerima manfaat
                                        </div>

                                        {/* Tombol */}
                                        <div style={{
                                            display: 'flex',
                                            gap: 9,
                                            marginTop: 'auto',
                                        }}>
                                            <Link
                                                href={`/program/${item.slug}`}
                                                style={{
                                                    ...detailButtonStyle,
                                                }}
                                            >
                                                Lihat Detail
                                            </Link>

                                            <Link
                                                href={`/checkout/${item.slug}`}
                                                style={{
                                                    ...donateButtonStyle,
                                                }}
                                            >
                                                <Heart size={16} />
                                                Sedekah
                                                <ArrowRight size={15} />
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div style={{
                        background: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: 15,
                        padding: '55px 20px',
                        textAlign: 'center',
                    }}>
                        <div style={{
                            width: 65,
                            height: 65,
                            borderRadius: 18,
                            background: '#e8f5ed',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 18px',
                        }}>
                            <Search size={30} color="#176b45" />
                        </div>

                        <h3 style={{
                            color: '#1e293b',
                            margin: '0 0 10px',
                        }}>
                            Belum Ada Kampanye Ditemukan
                        </h3>

                        <p style={{
                            color: '#64748b',
                            maxWidth: 430,
                            margin: '0 auto 18px',
                            lineHeight: 1.7,
                            fontSize: 14,
                        }}>
                            Belum ada program yang sesuai dengan pencarian
                            atau filter yang kamu pilih.
                        </p>

                        <button
                            type="button"
                            onClick={resetFilters}
                            style={resetButtonStyle}
                        >
                            Reset pencarian
                        </button>
                    </div>
                )}
            </div>
        </PensedekahLayout>
    );
}

const labelStyle = {
    display: 'block',
    color: '#475569',
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 8,
};

const inputWrapperStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 9,
    border: '1px solid #dbe3dd',
    borderRadius: 9,
    padding: '0 11px',
    minHeight: 43,
};

const searchInputStyle = {
    width: '100%',
    minWidth: 0,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    color: '#334155',
    fontSize: 13,
};

const selectStyle = {
    width: '100%',
    minHeight: 43,
    padding: '0 11px',
    border: '1px solid #dbe3dd',
    borderRadius: 9,
    background: '#fff',
    color: '#334155',
    fontSize: 13,
    outline: 'none',
};

const resetButtonStyle = {
    border: 'none',
    background: 'transparent',
    color: '#176b45',
    fontWeight: 600,
    fontSize: 13,
    cursor: 'pointer',
    padding: '7px 4px',
};

const detailButtonStyle = {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '11px 8px',
    border: '1px solid #176b45',
    borderRadius: 9,
    color: '#176b45',
    textDecoration: 'none',
    fontSize: 12,
    fontWeight: 700,
    textAlign: 'center',
};

const donateButtonStyle = {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    padding: '11px 8px',
    background: '#176b45',
    border: '1px solid #176b45',
    borderRadius: 9,
    color: '#fff',
    textDecoration: 'none',
    fontSize: 12,
    fontWeight: 700,
};
