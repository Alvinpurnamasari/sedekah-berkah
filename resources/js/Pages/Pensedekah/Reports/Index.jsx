
import React from 'react';
import { Head } from '@inertiajs/react';
import {
    FileText,
    Wallet,
    Users,
    MapPin,
    CalendarDays,
    Image as ImageIcon,
    ReceiptText,
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

function ExpenseList({ expenses }) {
    if (!expenses?.length) {
        return (
            <p style={{ color: '#64748b', fontSize: 13 }}>
                Belum ada rincian pengeluaran.
            </p>
        );
    }

    return (
        <div style={{ overflowX: 'auto' }}>
            <table
                style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    minWidth: 400,
                    fontSize: 13,
                }}
            >
                <thead>
                    <tr style={{ background: '#f5f8f6', textAlign: 'left' }}>
                        <th style={{ padding: 12 }}>Kategori</th>
                        <th style={{ padding: 12 }}>Keterangan</th>
                        <th style={{ padding: 12 }}>Nominal</th>
                    </tr>
                </thead>

                <tbody>
                    {expenses.map((expense) => (
                        <tr
                            key={expense.id}
                            style={{ borderBottom: '1px solid #edf1ee' }}
                        >
                            <td style={{ padding: 12 }}>
                                {expense.expense_category}
                            </td>
                            <td style={{ padding: 12 }}>
                                {expense.description || '-'}
                            </td>
                            <td
                                style={{
                                    padding: 12,
                                    fontWeight: 600,
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {rupiah(expense.amount)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function SummaryCard({ icon: Icon, label, value }) {
    return (
        <div
            style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 14,
                padding: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 15,
                minWidth: 0,
            }}
        >
            <div
                style={{
                    width: 46,
                    height: 46,
                    borderRadius: 12,
                    background: '#e8f5ed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                }}
            >
                <Icon size={22} color="#176b45" />
            </div>

            <div style={{ minWidth: 0 }}>
                <p
                    style={{
                        margin: '0 0 6px',
                        color: '#64748b',
                        fontSize: 13,
                    }}
                >
                    {label}
                </p>

                <h3
                    style={{
                        margin: 0,
                        color: '#176b45',
                        fontSize: 20,
                        overflowWrap: 'anywhere',
                    }}
                >
                    {value}
                </h3>
            </div>
        </div>
    );
}

function DocumentGallery({ documents }) {
    if (!documents?.length) {
        return (
            <p style={{ color: '#64748b', fontSize: 13 }}>
                Belum ada dokumentasi kegiatan.
            </p>
        );
    }

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: 12,
            }}
        >
            {documents.map((document) => {
                const fileUrl = `/storage/${document.file_path}`;
                const isVideo = document.file_type === 'video';

                return (
                    <div
                        key={document.id}
                        style={{
                            minWidth: 0,
                            border: '1px solid #e5e7eb',
                            borderRadius: 10,
                            overflow: 'hidden',
                            background: '#fff',
                        }}
                    >
                        {isVideo ? (
                            <video
                                src={fileUrl}
                                controls
                                preload="metadata"
                                playsInline
                                aria-label={
                                    document.caption || 'Video dokumentasi'
                                }
                                style={{
                                    display: 'block',
                                    width: '100%',
                                    height: 135,
                                    objectFit: 'cover',
                                    background: '#0f172a',
                                }}
                            />
                        ) : (
                            <a
                                href={fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                style={{ display: 'block' }}
                            >
                                <img
                                    src={fileUrl}
                                    alt={
                                        document.caption ||
                                        'Foto dokumentasi penyaluran'
                                    }
                                    loading="lazy"
                                    style={{
                                        display: 'block',
                                        width: '100%',
                                        height: 135,
                                        objectFit: 'cover',
                                    }}
                                />
                            </a>
                        )}

                        <div style={{ padding: 10 }}>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 5,
                                    marginBottom: 5,
                                    color: '#176b45',
                                    fontSize: 11,
                                    fontWeight: 700,
                                }}
                            >
                                {isVideo ? (
                                    <Video size={14} />
                                ) : (
                                    <ImageIcon size={14} />
                                )}

                                {isVideo ? 'VIDEO' : 'FOTO'}
                            </div>

                            <p
                                style={{
                                    margin: 0,
                                    color: '#334155',
                                    fontSize: 12,
                                    lineHeight: 1.5,
                                    overflowWrap: 'anywhere',
                                }}
                            >
                                {document.caption || 'Dokumentasi kegiatan'}
                            </p>

                            {document.document_date && (
                                <small
                                    style={{
                                        display: 'block',
                                        color: '#64748b',
                                        fontSize: 11,
                                        marginTop: 6,
                                    }}
                                >
                                    {dateFormat(document.document_date)}
                                </small>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default function Index({ reports = [], summary = {} }) {
    return (
        <PensedekahLayout title="Laporan Penyaluran">
            <Head title="Laporan Penyaluran" />

            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                <div style={{ marginBottom: 24 }}>
                    <h2
                        style={{
                            color: '#176b45',
                            margin: '0 0 8px',
                        }}
                    >
                        Laporan Penyaluran
                    </h2>

                    <p
                        style={{
                            color: '#64748b',
                            margin: 0,
                            lineHeight: 1.6,
                        }}
                    >
                        Lihat laporan penggunaan dana dan dokumentasi
                        kegiatan penyaluran Sedekah Berkah yang telah
                        disetujui dan dipublikasikan.
                    </p>
                </div>

                {/* Ringkasan */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns:
                            'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: 16,
                        marginBottom: 28,
                    }}
                >
                    <SummaryCard
                        icon={FileText}
                        label="Jumlah Laporan"
                        value={`${Number(
                            summary.totalReports || 0
                        ).toLocaleString('id-ID')} laporan`}
                    />

                    <SummaryCard
                        icon={Wallet}
                        label="Total Dana Disalurkan"
                        value={rupiah(summary.totalCost)}
                    />

                    <SummaryCard
                        icon={Users}
                        label="Penerima Manfaat"
                        value={`${Number(
                            summary.totalBeneficiaries || 0
                        ).toLocaleString('id-ID')} orang`}
                    />
                </div>

                {/* Daftar laporan */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        marginBottom: 18,
                    }}
                >
                    <FileText color="#176b45" size={22} />
                    <h3 style={{ margin: 0, color: '#176b45' }}>
                        Dokumentasi Kegiatan
                    </h3>
                </div>

                {reports.length > 0 ? (
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns:
                                'repeat(auto-fit, minmax(290px, 1fr))',
                            gap: 20,
                        }}
                    >
                        {reports.map((report) => (
                            <article
                                key={report.id}
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
                                            background: '#dcfce7',
                                            color: '#166534',
                                            padding: '5px 10px',
                                            borderRadius: 20,
                                            fontSize: 11,
                                            fontWeight: 700,
                                            marginBottom: 12,
                                        }}
                                    >
                                        Selesai dan Dipublikasikan
                                    </span>

                                    <h3
                                        style={{
                                            color: '#176b45',
                                            margin: '0 0 8px',
                                            fontSize: 18,
                                        }}
                                    >
                                        {report.title}
                                    </h3>

                                    <p
                                        style={{
                                            color: '#64748b',
                                            fontSize: 13,
                                            margin: '0 0 18px',
                                        }}
                                    >
                                        {report.campaign_title || 'Program'}
                                    </p>

                                    <div
                                        style={{
                                            display: 'grid',
                                            gap: 12,
                                            marginBottom: 20,
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                gap: 10,
                                                alignItems: 'center',
                                                color: '#475569',
                                                fontSize: 13,
                                            }}
                                        >
                                            <CalendarDays
                                                size={17}
                                                color="#176b45"
                                            />
                                            {dateFormat(
                                                report.distribution_date
                                            )}
                                        </div>

                                        <div
                                            style={{
                                                display: 'flex',
                                                gap: 10,
                                                alignItems: 'center',
                                                color: '#475569',
                                                fontSize: 13,
                                            }}
                                        >
                                            <MapPin
                                                size={17}
                                                color="#176b45"
                                            />
                                            {report.location || '-'}
                                        </div>

                                        <div
                                            style={{
                                                display: 'flex',
                                                gap: 10,
                                                alignItems: 'center',
                                                color: '#475569',
                                                fontSize: 13,
                                            }}
                                        >
                                            <Users
                                                size={17}
                                                color="#176b45"
                                            />
                                            {Number(
                                                report.actual_quantity || 0
                                            ).toLocaleString('id-ID')}{' '}
                                            penerima manfaat
                                        </div>
                                    </div>

                                    {/* Total biaya */}
                                    <div
                                        style={{
                                            background: '#f0fdf4',
                                            borderRadius: 10,
                                            padding: 15,
                                            marginBottom: 22,
                                        }}
                                    >
                                        <small style={{ color: '#64748b' }}>
                                            Biaya Utama Penyaluran
                                        </small>

                                        <h3
                                            style={{
                                                color: '#176b45',
                                                margin: '5px 0 0',
                                            }}
                                        >
                                            {rupiah(report.total_cost)}
                                        </h3>
                                    </div>

                                    {/* Rincian pengeluaran */}
                                    <div style={{ marginBottom: 22 }}>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8,
                                                marginBottom: 12,
                                            }}
                                        >
                                            <ReceiptText
                                                size={18}
                                                color="#176b45"
                                            />

                                            <h4
                                                style={{
                                                    margin: 0,
                                                    color: '#334155',
                                                }}
                                            >
                                                Rincian Pengeluaran
                                            </h4>
                                        </div>

                                        <ExpenseList
                                            expenses={report.expenses}
                                        />
                                    </div>

                                    {/* Dokumentasi foto dan video */}
                                    <div>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8,
                                                marginBottom: 12,
                                            }}
                                        >
                                            <ImageIcon
                                                size={18}
                                                color="#176b45"
                                            />

                                            <h4
                                                style={{
                                                    margin: 0,
                                                    color: '#334155',
                                                }}
                                            >
                                                Dokumentasi Kegiatan
                                            </h4>
                                        </div>

                                        <DocumentGallery
                                            documents={report.documents}
                                        />
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div
                        style={{
                            background: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: 14,
                            padding: 40,
                            textAlign: 'center',
                        }}
                    >
                        <FileText
                            size={42}
                            color="#94a3b8"
                            style={{ marginBottom: 12 }}
                        />

                        <h3 style={{ color: '#334155' }}>
                            Belum Ada Laporan Penyaluran
                        </h3>

                        <p
                            style={{
                                color: '#64748b',
                                maxWidth: 450,
                                margin: '0 auto',
                                lineHeight: 1.6,
                            }}
                        >
                            Laporan penyaluran yang telah selesai,
                            disetujui, dan dipublikasikan oleh Superadmin
                            akan ditampilkan di halaman ini.
                        </p>
                    </div>
                )}
            </div>
        </PensedekahLayout>
    );
}
