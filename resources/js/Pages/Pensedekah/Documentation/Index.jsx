
import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import {
    Images,
    Image as ImageIcon,
    Video,
    CalendarDays,
    MapPin,
    FolderOpen,
    PlayCircle,
} from 'lucide-react';

import PensedekahLayout from '../../../Components/PensedekahLayout';

const dateFormat = (value) => {
    if (!value) return '-';

    return new Date(value).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};

function SummaryCard({ icon: Icon, label, value }) {
    return (
        <div
            style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 14,
                padding: 20,
            }}
        >
            <Icon size={24} color="#176b45" />

            <p
                style={{
                    color: '#64748b',
                    fontSize: 13,
                    margin: '12px 0 5px',
                }}
            >
                {label}
            </p>

            <h3
                style={{
                    color: '#176b45',
                    fontSize: 22,
                    margin: 0,
                }}
            >
                {value}
            </h3>
        </div>
    );
}

function DocumentationCard({ document }) {
    const isVideo = document.file_type === 'video';
    const fileUrl = `/storage/${document.file_path}`;

    return (
        <article
            style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 14,
                overflow: 'hidden',
            }}
        >
            <div
                style={{
                    position: 'relative',
                    background: '#f1f5f9',
                    height: 220,
                }}
            >
                {isVideo ? (
                    <video
                        src={fileUrl}
                        controls
                        preload="metadata"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            background: '#0f172a',
                        }}
                    />
                ) : (
                    <a
                        href={fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        title="Lihat foto ukuran penuh"
                    >
                        <img
                            src={fileUrl}
                            alt={document.caption || 'Dokumentasi penyaluran'}
                            loading="lazy"
                            style={{
                                width: '100%',
                                height: 220,
                                objectFit: 'cover',
                                display: 'block',
                            }}
                        />
                    </a>
                )}

                <span
                    style={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '6px 10px',
                        borderRadius: 20,
                        background: '#ffffff',
                        color: '#176b45',
                        fontSize: 11,
                        fontWeight: 700,
                    }}
                >
                    {isVideo ? <Video size={14} /> : <ImageIcon size={14} />}
                    {isVideo ? 'VIDEO' : 'FOTO'}
                </span>
            </div>

            <div style={{ padding: 17 }}>
                <h3
                    style={{
                        color: '#176b45',
                        fontSize: 16,
                        margin: '0 0 7px',
                        lineHeight: 1.5,
                    }}
                >
                    {document.distribution_title}
                </h3>

                <p
                    style={{
                        color: '#64748b',
                        fontSize: 12,
                        margin: '0 0 14px',
                    }}
                >
                    Program: {document.campaign_title || '-'}
                </p>

                {document.caption && (
                    <p
                        style={{
                            color: '#475569',
                            fontSize: 13,
                            lineHeight: 1.6,
                            margin: '0 0 14px',
                        }}
                    >
                        {document.caption}
                    </p>
                )}

                <div
                    style={{
                        display: 'grid',
                        gap: 9,
                        borderTop: '1px solid #f1f5f9',
                        paddingTop: 13,
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            color: '#64748b',
                            fontSize: 12,
                        }}
                    >
                        <CalendarDays size={15} color="#176b45" />
                        {dateFormat(
                            document.document_date ||
                            document.distribution_date
                        )}
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            color: '#64748b',
                            fontSize: 12,
                        }}
                    >
                        <MapPin size={15} color="#176b45" />
                        {document.location || '-'}
                    </div>
                </div>
            </div>
        </article>
    );
}

export default function Index({
    documents = [],
    summary = {},
}) {
    const [filter, setFilter] = useState('all');

    const filteredDocuments = documents.filter((document) => {
        if (filter === 'photo') {
            return document.file_type === 'photo';
        }

        if (filter === 'video') {
            return document.file_type === 'video';
        }

        return true;
    });

    const filters = [
        { id: 'all', label: 'Semua' },
        { id: 'photo', label: 'Foto' },
        { id: 'video', label: 'Video' },
    ];

    return (
        <PensedekahLayout title="Dokumentasi">
            <Head title="Dokumentasi" />

            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                <div style={{ marginBottom: 24 }}>
                    <h2
                        style={{
                            color: '#176b45',
                            margin: '0 0 8px',
                        }}
                    >
                        Dokumentasi Penyaluran
                    </h2>

                    <p
                        style={{
                            color: '#64748b',
                            margin: 0,
                            lineHeight: 1.6,
                        }}
                    >
                        Lihat foto dan video kegiatan penyaluran sedekah
                        sebagai bentuk transparansi dan pertanggungjawaban
                        kepada Pensedekah.
                    </p>
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns:
                            'repeat(auto-fit, minmax(190px, 1fr))',
                        gap: 16,
                        marginBottom: 28,
                    }}
                >
                    <SummaryCard
                        icon={Images}
                        label="Total Dokumentasi"
                        value={summary.totalDocuments || 0}
                    />

                    <SummaryCard
                        icon={ImageIcon}
                        label="Foto"
                        value={summary.totalPhotos || 0}
                    />

                    <SummaryCard
                        icon={Video}
                        label="Video"
                        value={summary.totalVideos || 0}
                    />

                    <SummaryCard
                        icon={FolderOpen}
                        label="Kegiatan"
                        value={summary.totalActivities || 0}
                    />
                </div>

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 14,
                        marginBottom: 20,
                    }}
                >
                    <h3
                        style={{
                            color: '#176b45',
                            margin: 0,
                        }}
                    >
                        Galeri Dokumentasi
                    </h3>

                    <div
                        style={{
                            display: 'flex',
                            gap: 8,
                            flexWrap: 'wrap',
                        }}
                    >
                        {filters.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => setFilter(item.id)}
                                style={{
                                    border: '1px solid',
                                    borderColor:
                                        filter === item.id
                                            ? '#176b45'
                                            : '#e2e8f0',
                                    background:
                                        filter === item.id
                                            ? '#176b45'
                                            : '#fff',
                                    color:
                                        filter === item.id
                                            ? '#fff'
                                            : '#475569',
                                    padding: '8px 16px',
                                    borderRadius: 20,
                                    cursor: 'pointer',
                                    fontSize: 13,
                                    fontWeight: 600,
                                }}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>

                {filteredDocuments.length > 0 ? (
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns:
                                'repeat(auto-fill, minmax(260px, 1fr))',
                            gap: 20,
                        }}
                    >
                        {filteredDocuments.map((document) => (
                            <DocumentationCard
                                key={document.id}
                                document={document}
                            />
                        ))}
                    </div>
                ) : (
                    <div
                        style={{
                            background: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: 16,
                            padding: '42px 24px',
                            textAlign: 'center',
                        }}
                    >
                        <Images
                            size={44}
                            color="#176b45"
                            style={{
                                display: 'block',
                                margin: '0 auto 14px',
                            }}
                        />

                        <h3
                            style={{
                                color: '#1e293b',
                                margin: '0 0 10px',
                            }}
                        >
                            {filter === 'all'
                                ? 'Belum Ada Dokumentasi'
                                : filter === 'photo'
                                    ? 'Belum Ada Dokumentasi Foto'
                                    : 'Belum Ada Dokumentasi Video'}
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
                            Dokumentasi akan ditampilkan setelah kegiatan
                            penyaluran selesai, laporan disetujui, dan
                            dipublikasikan oleh Superadmin.
                        </p>
                    </div>
                )}
            </div>
        </PensedekahLayout>
    );
}
