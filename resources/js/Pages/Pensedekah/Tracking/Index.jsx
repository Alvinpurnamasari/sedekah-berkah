
import React from 'react';
import { Head } from '@inertiajs/react';
import {
    MapPin,
    CalendarDays,
    Users,
    Heart,
    Wallet,
    Clock,
    CheckCircle2,
    Circle,
    PackageCheck,
    Image as ImageIcon,
    Video,
} from 'lucide-react';
import PensedekahLayout from '../../../Components/PensedekahLayout';

const rupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value || 0);

const dateFormat = (value) => {
    if (!value) return '-';

    return new Date(value).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};

function Stage({ completed, active, title, description }) {
    const color = completed || active ? '#176b45' : '#94a3b8';

    return (
        <div style={{ display: 'flex', gap: 12, position: 'relative' }}>
            <div
                style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: completed || active ? '#e8f5ed' : '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color,
                }}
            >
                {completed ? (
                    <CheckCircle2 size={19} />
                ) : active ? (
                    <Clock size={18} />
                ) : (
                    <Circle size={18} />
                )}
            </div>

            <div style={{ paddingBottom: 20 }}>
                <strong style={{ color, fontSize: 14 }}>{title}</strong>
                <p
                    style={{
                        margin: '4px 0 0',
                        fontSize: 12,
                        color: '#64748b',
                        lineHeight: 1.5,
                    }}
                >
                    {description}
                </p>
            </div>
        </div>
    );
}

function DocumentGallery({ documents = [] }) {
    if (!documents.length) return null;

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: 12,
            }}
        >
            {documents.map((document) => {
                const url = `/storage/${document.file_path}`;
                const isVideo = document.file_type === 'video';

                return (
                    <div
                        key={document.id}
                        style={{
                            border: '1px solid #e5e7eb',
                            borderRadius: 10,
                            overflow: 'hidden',
                        }}
                    >
                        {isVideo ? (
                            <video
                                src={url}
                                controls
                                preload="metadata"
                                style={{
                                    width: '100%',
                                    height: 130,
                                    objectFit: 'cover',
                                    background: '#0f172a',
                                }}
                            />
                        ) : (
                            <a href={url} target="_blank" rel="noreferrer">
                                <img
                                    src={url}
                                    alt={document.caption || 'Dokumentasi'}
                                    loading="lazy"
                                    style={{
                                        width: '100%',
                                        height: 130,
                                        objectFit: 'cover',
                                        display: 'block',
                                    }}
                                />
                            </a>
                        )}

                        <div style={{ padding: 9 }}>
                            <div
                                style={{
                                    display: 'flex',
                                    gap: 5,
                                    alignItems: 'center',
                                    color: '#176b45',
                                    fontSize: 11,
                                    fontWeight: 700,
                                }}
                            >
                                {isVideo ? (
                                    <Video size={13} />
                                ) : (
                                    <ImageIcon size={13} />
                                )}
                                {isVideo ? 'VIDEO' : 'FOTO'}
                            </div>

                            <p
                                style={{
                                    margin: '5px 0 0',
                                    fontSize: 12,
                                    color: '#475569',
                                }}
                            >
                                {document.caption || 'Dokumentasi kegiatan'}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function DistributionCard({ distribution }) {
    const completed = distribution.status === 'completed';
    const ongoing = distribution.status === 'ongoing';
    const planned = distribution.status === 'planned';

    // Tahapan mengikuti status kegiatan penyaluran.
    const preparationDone = ongoing || completed;
    const preparationActive = planned;
    const distributionDone = completed;
    const distributionActive = ongoing;

    const stages = [
        {
            title: 'Pembayaran berhasil',
            description:
                'Terdapat donasi berhasil yang tercatat dari program ini.',
            done: true,
        },
        {
            title: 'Dana masuk program',
            description:
                'Donasi tercatat pada program yang kamu dukung.',
            done: true,
        },
        {
            title: 'Persiapan penyaluran',
            description: planned
                ? 'Anggaran telah disetujui dan kegiatan sedang menunggu pelaksanaan.'
                : 'Persiapan kegiatan penyaluran telah selesai.',
            done: preparationDone,
            active: preparationActive,
        },
        {
            title: 'Penyaluran',
            description: completed
                ? 'Kegiatan selesai dan laporan telah dipublikasikan.'
                : ongoing
                    ? 'Kegiatan penyaluran sedang berlangsung.'
                    : 'Menunggu kegiatan penyaluran dimulai.',
            done: distributionDone,
            active: distributionActive,
        },
    ];

    const badgeLabel = completed
        ? 'Selesai dan dipublikasikan'
        : ongoing
            ? 'Sedang berlangsung'
            : 'Persiapan penyaluran';

    return (
        <article
            style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 14,
                overflow: 'hidden',
            }}
        >
            <div style={{ padding: 22 }}>
                <span
                    style={{
                        display: 'inline-block',
                        padding: '6px 11px',
                        borderRadius: 20,
                        background: completed
                            ? '#dcfce7'
                            : ongoing
                                ? '#dbeafe'
                                : '#fef3c7',
                        color: completed
                            ? '#166534'
                            : ongoing
                                ? '#1d4ed8'
                                : '#92400e',
                        fontSize: 11,
                        fontWeight: 700,
                    }}
                >
                    {badgeLabel}
                </span>

                <h3
                    style={{
                        color: '#176b45',
                        fontSize: 18,
                        margin: '13px 0 5px',
                    }}
                >
                    {distribution.title}
                </h3>

                <p
                    style={{
                        color: '#64748b',
                        fontSize: 13,
                        margin: '0 0 18px',
                    }}
                >
                    Program: {distribution.campaign_title}
                </p>

                <div
                    style={{
                        display: 'grid',
                        gap: 12,
                        marginBottom: 22,
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            gap: 9,
                            color: '#475569',
                            fontSize: 13,
                        }}
                    >
                        <CalendarDays size={17} color="#176b45" />
                        {dateFormat(distribution.distribution_date)}
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            gap: 9,
                            color: '#475569',
                            fontSize: 13,
                        }}
                    >
                        <MapPin size={17} color="#176b45" />
                        {distribution.location || '-'}
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            gap: 9,
                            color: '#475569',
                            fontSize: 13,
                        }}
                    >
                        <Users size={17} color="#176b45" />
                        {Number(
                            completed
                                ? distribution.actual_quantity
                                : distribution.planned_quantity || 0
                        ).toLocaleString('id-ID')}{' '}
                        {completed ? 'penerima manfaat' : 'target penerima'}
                    </div>
                </div>

                <div
                    style={{
                        background: '#f8faf9',
                        borderRadius: 12,
                        padding: 16,
                    }}
                >
                    <h4
                        style={{
                            color: '#176b45',
                            fontSize: 14,
                            margin: '0 0 16px',
                        }}
                    >
                        Tahapan Penyaluran
                    </h4>

                    {stages.map((stage, index) => (
                        <Stage
                            key={index}
                            completed={stage.done}
                            active={stage.active}
                            title={stage.title}
                            description={stage.description}
                        />
                    ))}
                </div>

                {completed && distribution.documents?.length > 0 && (
                    <div style={{ marginTop: 22 }}>
                        <h4
                            style={{
                                color: '#176b45',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                margin: '0 0 12px',
                            }}
                        >
                            <ImageIcon size={18} />
                            Dokumentasi Penyaluran
                        </h4>

                        <DocumentGallery
                            documents={distribution.documents}
                        />
                    </div>
                )}
            </div>
        </article>
    );
}

export default function Index({
    campaigns = [],
    distributions = [],
}) {
    const totalDonation = campaigns.reduce(
        (total, campaign) =>
            total + Number(campaign.total_donation || 0),
        0
    );

    return (
        <PensedekahLayout title="Tracking Penyaluran">
            <Head title="Tracking Penyaluran" />

            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                <div style={{ marginBottom: 24 }}>
                    <h2 style={{ color: '#176b45', margin: '0 0 8px' }}>
                        Tracking Penyaluran
                    </h2>

                    <p
                        style={{
                            color: '#64748b',
                            margin: 0,
                            lineHeight: 1.6,
                        }}
                    >
                        Pantau perkembangan penyaluran dari program yang
                        pernah kamu dukung melalui Sedekah Berkah.
                    </p>
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns:
                            'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: 16,
                        marginBottom: 28,
                    }}
                >
                    <div
                        style={{
                            background: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: 14,
                            padding: 20,
                        }}
                    >
                        <Heart color="#176b45" size={23} />
                        <p style={{ color: '#64748b', fontSize: 13 }}>
                            Program Didukung
                        </p>
                        <h3 style={{ color: '#176b45', margin: 0 }}>
                            {campaigns.length} program
                        </h3>
                    </div>

                    <div
                        style={{
                            background: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: 14,
                            padding: 20,
                        }}
                    >
                        <Wallet color="#176b45" size={23} />
                        <p style={{ color: '#64748b', fontSize: 13 }}>
                            Total Sedekah Berhasil
                        </p>
                        <h3 style={{ color: '#176b45', margin: 0 }}>
                            {rupiah(totalDonation)}
                        </h3>
                    </div>

                    <div
                        style={{
                            background: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: 14,
                            padding: 20,
                        }}
                    >
                        <PackageCheck color="#176b45" size={23} />
                        <p style={{ color: '#64748b', fontSize: 13 }}>
                            Kegiatan Penyaluran
                        </p>
                        <h3 style={{ color: '#176b45', margin: 0 }}>
                            {distributions.length} kegiatan
                        </h3>
                    </div>
                </div>

                <h3
                    style={{
                        color: '#176b45',
                        marginBottom: 18,
                    }}
                >
                    Perkembangan Penyaluran
                </h3>

                {distributions.length > 0 ? (
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns:
                                'repeat(auto-fit, minmax(290px, 1fr))',
                            gap: 20,
                        }}
                    >
                        {distributions.map((distribution) => (
                            <DistributionCard
                                key={distribution.id}
                                distribution={distribution}
                            />
                        ))}
                    </div>
                ) : (
                    <div
                        style={{
                            background: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: 16,
                            padding: '40px 24px',
                            textAlign: 'center',
                        }}
                    >
                        <PackageCheck
                            size={42}
                            color="#176b45"
                            style={{
                                display: 'block',
                                margin: '0 auto 12px',
                            }}
                        />
                        <h3
                            style={{
                                color: '#1e293b',
                                margin: '0 0 10px',
                            }}
                        >
                            Belum Ada Kegiatan Penyaluran
                        </h3>

                        <p
                            style={{
                                color: '#64748b',
                                maxWidth: 480,
                                margin: '0 auto',
                                lineHeight: 1.7,
                                fontSize: 14,
                            }}
                        >
                            Kegiatan penyaluran akan muncul di sini setelah
                            kamu memiliki donasi berhasil pada suatu program
                            dan program tersebut memiliki kegiatan dengan
                            anggaran yang disetujui atau laporan yang telah
                            dipublikasikan.
                        </p>
                    </div>
                )}
            </div>
        </PensedekahLayout>
    );
}
