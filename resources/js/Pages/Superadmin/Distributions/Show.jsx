import React from 'react';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import SuperadminLayout from '../../../Components/SuperadminLayout';
import {
    ArrowLeft,
    HandHeart,
    CalendarDays,
    MapPin,
    Users,
    Wallet,
    ClipboardList,
    ReceiptText,
    Image,
    Upload,
} from 'lucide-react';

const rupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value || 0);

const statusLabels = {
    planned: 'Direncanakan',
    ongoing: 'Berlangsung',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
};

const reportLabels = {
    draft: 'Draft',
    pending: 'Menunggu pemeriksaan',
    approved: 'Disetujui',
    revision: 'Perlu perbaikan',
};

const expenseLabels = {
    pending: 'Menunggu persetujuan',
    approved: 'Disetujui',
    rejected: 'Ditolak',
};

export default function Show({
    distribution,
    expenses,
    expenseSummary,
    documents,
}) {
    const { flash } = usePage().props;
    const isSimulated = Boolean(distribution.is_simulated);
    const isPublished = Boolean(distribution.is_published);     
    const {
        data,
        setData,
        post,
        processing,
        errors,
    } = useForm({
        actual_quantity: distribution.actual_quantity || 0,
        total_cost: distribution.total_cost || 0,
        status: distribution.status === 'completed'
            ? 'completed'
            : 'ongoing',
    });
    
    const submitRealization = (event) => {
        event.preventDefault();
    
        post(`/superadmin/penyaluran/${distribution.id}/realisasi`);
    };
    const {
        data: documentData,
        setData: setDocumentData,
        post: postDocument,
        processing: uploadingDocument,
        errors: documentErrors,
        reset: resetDocument,
    } = useForm({
        photo: null,
        caption: '',
        document_date: '',
    });
    
    const submitDocument = (event) => {
        event.preventDefault();
    
        postDocument(
            `/superadmin/penyaluran/${distribution.id}/dokumentasi`,
            {
                forceFormData: true,
                onSuccess: () => resetDocument(),
            }
        );
    };
    const {
        data: revisionData,
        setData: setRevisionData,
        post: postRevision,
        processing: submittingRevision,
        errors: revisionErrors,
        reset: resetRevision,
    } = useForm({
        revision_note: '',
    });

    const submitRevision = (event) => {
        event.preventDefault();

        if (!window.confirm('Kembalikan laporan ini kepada Admin untuk diperbaiki?')) {
            return;
        }

        postRevision(
            `/superadmin/penyaluran/${distribution.id}/minta-revisi`,
            {
                onSuccess: () => resetRevision(),
            }
        );
    };

    const approveReport = () => {
        if (!window.confirm('Setujui laporan penyaluran ini?')) {
            return;
        }

        router.post(
            `/superadmin/penyaluran/${distribution.id}/setujui-laporan`
        );
    };

    const publishReport = () => {
        if (!window.confirm('Publikasikan laporan ini ke halaman transparansi publik?')) {
            return;
        }

        router.post(
            `/superadmin/penyaluran/${distribution.id}/publikasikan`
        );
    };

    const unpublishReport = () => {
        if (!window.confirm('Sembunyikan laporan ini dari halaman transparansi publik?')) {
            return;
        }

        router.post(
            `/superadmin/penyaluran/${distribution.id}/sembunyikan`
        );
    };

    const info = [
        {
            label: 'Program',
            value: distribution.campaign_title || '-',
            icon: HandHeart,
        },
        {
            label: 'Tanggal Penyaluran',
            value: distribution.distribution_date || '-',
            icon: CalendarDays,
        },
        {
            label: 'Lokasi',
            value: distribution.location || '-',
            icon: MapPin,
        },
        {
            label: 'Target Penerima',
            value: `${distribution.planned_quantity || 0} orang`,
            icon: Users,
        },
        {
            label: 'Realisasi Penerima',
            value: `${distribution.actual_quantity || 0} orang`,
            icon: Users,
        },
        {
            label: 'Total Biaya Kegiatan',
            value: rupiah(distribution.total_cost),
            icon: Wallet,
        },
    ];

    return (
        <SuperadminLayout
            title="Detail Penyaluran"
            activeMenu="distribution"
        >
            <Head title={`Detail ${distribution.title}`} />
            {flash?.success && (
            <div
                role="alert"
                style={{
                    background: '#e8f7ee',
                    border: '1px solid #b7e4c7',
                    color: '#176b42',
                    padding: '14px 18px',
                    borderRadius: 10,
                    marginBottom: 20,
                    fontWeight: 600,
                }}
            >
                ✓ {flash.success}
            </div>
        )}

            <div style={{ marginBottom: 24 }}>
                <Link
                    href="/superadmin/penyaluran"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        color: '#16734f',
                        textDecoration: 'none',
                    }}
                >
                    <ArrowLeft size={18} />
                    Kembali ke Penyaluran Dana
                </Link>

                <h2 style={{ fontSize: 25, marginBottom: 6 }}>
                    Detail Penyaluran
                </h2>

                <p style={{ color: '#82958c', margin: 0 }}>
                    Informasi rencana dan realisasi kegiatan penyaluran.
                </p>
            </div>

            <div style={{
                background: 'white',
                border: '1px solid #e5eee9',
                borderRadius: 14,
                padding: 24,
                marginBottom: 20,
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 16,
                    flexWrap: 'wrap',
                }}>
                    <div>
                        <HandHeart size={25} color="#16734f" />
                        <h2 style={{ margin: '10px 0 6px' }}>
                            {distribution.title}
                        </h2>
                        <p style={{ margin: 0, color: '#82958c' }}>
                            {distribution.campaign_title || 'Program tidak tersedia'}
                        </p>
                    </div> 
                    <div style={{
                        display: 'flex',
                        gap: 8,
                        flexWrap: 'wrap',
                        alignItems: 'center',
                    }}>
                        {isSimulated && (
                            <span style={{
                                padding: '8px 12px',
                                background: '#fff1f2',
                                color: '#be123c',
                                border: '1px solid #fecdd3',
                                borderRadius: 8,
                                fontSize: 13,
                                fontWeight: 700,
                            }}>
                                DATA SIMULASI
                            </span>
                        )}

                        <span style={{
                            padding: '8px 12px',
                            background: '#e8f4ed',
                            color: '#16734f',
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 600,
                        }}>
                            {statusLabels[distribution.status] || distribution.status}
                        </span>

                        <span style={{
                            padding: '8px 12px',
                            background: '#fff5df',
                            color: '#946200',
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 600,
                        }}>
                            {reportLabels[distribution.report_status] || distribution.report_status}
                        </span>

                        {distribution.status === 'planned' &&
                        distribution.report_status === 'draft' && (
                            <Link
                                href={`/superadmin/penyaluran/${distribution.id}/edit`}
                                style={{
                                    padding: '9px 14px',
                                    borderRadius: 8,
                                    background: '#e8f4ed',
                                    color: '#16734f',
                                    textDecoration: 'none',
                                    fontWeight: 600,
                                }}
                            >
                                Edit Rencana
                            </Link>
                        )}
                    </div>
                    
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: 24,
                    marginTop: 32,
                }}>
                    {info.map((item) => {
                        const Icon = item.icon;

                        return (
                            <div key={item.label}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    color: '#82958c',
                                    fontSize: 13,
                                    marginBottom: 8,
                                }}>
                                    <Icon size={17} />
                                    {item.label}
                                </div>

                                <strong>{item.value}</strong>
                            </div>
                        );
                    })}
                </div>
            

            </div>
            {distribution.report_status === 'pending' && (
                <div style={{
                    background: 'white',
                    border: '1px solid #e5eee9',
                    borderRadius: 14,
                    padding: 24,
                    marginBottom: 20,
                }}>
                    <h3 style={{ marginTop: 0 }}>
                        Pemeriksaan Laporan Penyaluran
                    </h3>

                    <p style={{ color: '#82958c' }}>
                        Laporan ini menunggu keputusan Superadmin.
                    </p>

                    <p>
                        Dokumentasi tersedia: {documents.length} foto
                    </p>

                    <button
                        type="button"
                        onClick={approveReport}
                        style={{
                            padding: '12px 20px',
                            background: '#16734f',
                            color: 'white',
                            border: 'none',
                            borderRadius: 8,
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        Setujui Laporan
                    </button>

                    <hr style={{
                        border: 0,
                        borderTop: '1px solid #e5eee9',
                        margin: '24px 0',
                    }} />

                    <h4>Minta Perbaikan Laporan</h4>

                    <form onSubmit={submitRevision}>
                        <textarea
                            value={revisionData.revision_note}
                            onChange={(e) =>
                                setRevisionData('revision_note', e.target.value)
                            }
                            required
                            minLength={5}
                            maxLength={2000}
                            rows={4}
                            placeholder="Tuliskan alasan laporan perlu diperbaiki..."
                            style={{
                                width: '100%',
                                padding: 12,
                                border: '1px solid #dce7e1',
                                borderRadius: 8,
                                boxSizing: 'border-box',
                            }}
                        />

                        {revisionErrors.revision_note && (
                            <p style={{ color: '#dc2626' }}>
                                {revisionErrors.revision_note}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={submittingRevision}
                            style={{
                                marginTop: 12,
                                padding: '12px 20px',
                                background: '#b45309',
                                color: 'white',
                                border: 'none',
                                borderRadius: 8,
                                fontWeight: 600,
                                cursor: 'pointer',
                            }}
                        >
                            {submittingRevision
                                ? 'Mengirim...'
                                : 'Kirim Permintaan Revisi'}
                        </button>
                    </form>
                </div>
            )}

            {distribution.report_status === 'revision' &&
                distribution.report_revision_note && (
                    <div style={{
                        background: '#fff7ed',
                        border: '1px solid #fed7aa',
                        borderRadius: 12,
                        padding: 18,
                        marginBottom: 20,
                    }}>
                        <strong>Catatan Revisi Sebelumnya</strong>
                        <p style={{ whiteSpace: 'pre-wrap' }}>
                            {distribution.report_revision_note}
                        </p>
                    </div>
                )}

            

{distribution.report_status === 'approved' && (
    <div style={{
        background: isSimulated ? '#fff7ed' : '#e8f7ee',
        border: `1px solid ${isSimulated ? '#fed7aa' : '#b7e4c7'}`,
        color: isSimulated ? '#9a3412' : '#176b42',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
    }}>
        <strong>✓ Laporan telah disetujui Superadmin.</strong>

        {isSimulated && (
            <p style={{ marginBottom: 12 }}>
                <strong>DATA SIMULASI</strong>
                <br />
                Data ini hanya untuk pengujian sistem dan tidak boleh
                dipublikasikan sebagai laporan kegiatan nyata.
            </p>
        )}

        <p style={{ marginBottom: 12 }}>
            Status publikasi:{' '}
            <strong>
                {isPublished
                    ? 'Sudah dipublikasikan'
                    : 'Belum dipublikasikan'}
            </strong>
        </p>

        {isPublished ? (
            <button
                type="button"
                onClick={unpublishReport}
                style={{
                    padding: '11px 18px',
                    background: '#b91c1c',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    fontWeight: 600,
                    cursor: 'pointer',
                }}
            >
                Sembunyikan dari Publik
            </button>
        ) : isSimulated ? (
            <p style={{
                marginBottom: 0,
                fontSize: 13,
                fontWeight: 600,
            }}>
                Publikasi dinonaktifkan untuk data simulasi.
            </p>
        ) : (
            <div>
                <p style={{ marginTop: 0, fontSize: 13 }}>
                    Pastikan isi laporan dan dokumentasi sudah benar
                    sebelum ditampilkan kepada masyarakat.
                </p>

                <button
                    type="button"
                    onClick={publishReport}
                    disabled={
                        distribution.status !== 'completed' ||
                        documents.length === 0
                    }
                    style={{
                        padding: '11px 18px',
                        background:
                            distribution.status === 'completed' &&
                            documents.length > 0
                                ? '#16734f'
                                : '#9ca3af',
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        fontWeight: 600,
                        cursor:
                            distribution.status === 'completed' &&
                            documents.length > 0
                                ? 'pointer'
                                : 'not-allowed',
                    }}
                >
                    Publikasikan Laporan
                </button>

                {(distribution.status !== 'completed' ||
                    documents.length === 0) && (
                    <p style={{
                        fontSize: 12,
                        marginBottom: 0,
                    }}>
                        {!documents.length
                            ? 'Tambahkan dokumentasi terlebih dahulu.'
                            : 'Penyaluran harus berstatus selesai.'}
                    </p>
                )}
            </div>
        )}
    </div>
)}


            {['planned', 'ongoing'].includes(distribution.status) && (
                <div style={{
                    background: 'white',
                    border: '1px solid #e5eee9',
                    borderRadius: 14,
                     padding: 24,
                    marginBottom: 20,
                }}>
                    <h3 style={{ marginTop: 0 }}>
                        Realisasi Penyaluran
                    </h3>

                    <p style={{ color: '#82958c', marginTop: 0 }}>
                        Catat hasil pelaksanaan kegiatan setelah penyaluran dilakukan.
                    </p>

                    <form onSubmit={submitRealization}>
                        <div style={{ marginBottom: 18 }}>
                            <label style={{
                                display: 'block',
                                fontWeight: 600,
                                marginBottom: 8,
                            }}>
                                Jumlah Penerima Aktual
                            </label>

                            <input
                                type="number"
                                min="0"
                                value={data.actual_quantity}
                                onChange={(e) =>
                                    setData('actual_quantity', e.target.value)
                                }
                                style={{
                                    width: '100%',
                                    padding: 12,
                                    border: '1px solid #dce7e1',
                                    borderRadius: 8,
                                    boxSizing: 'border-box',
                                }}
                            />

                            {errors.actual_quantity && (
                                <p style={{ color: '#dc2626', fontSize: 13 }}>
                                    {errors.actual_quantity}
                                </p>
                            )}
                        </div>

                        <div style={{ marginBottom: 18 }}>
                            <label style={{
                                display: 'block',
                                fontWeight: 600,
                                marginBottom: 8,
                            }}>
                                Total Biaya Aktual (Rp)
                            </label>

                            <input
                                type="number"
                                min="0"
                                value={data.total_cost}
                                onChange={(e) =>
                                    setData('total_cost', e.target.value)
                                }
                                style={{
                                    width: '100%',
                                    padding: 12,
                                    border: '1px solid #dce7e1',
                                    borderRadius: 8,
                                    boxSizing: 'border-box',
                                }}
                            />

                            {errors.total_cost && (
                                <p style={{ color: '#dc2626', fontSize: 13 }}>
                                    {errors.total_cost}
                                </p>
                            )}
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <label style={{
                                display: 'block',
                                fontWeight: 600,
                                marginBottom: 8,
                            }}>
                                Status Pelaksanaan
                            </label>

                            <select
                                value={data.status}
                                onChange={(e) =>
                                    setData('status', e.target.value)
                                }
                                style={{
                                    width: '100%',
                                    padding: 12,
                                    border: '1px solid #dce7e1',
                                    borderRadius: 8,
                                    background: 'white',
                                }}
                            >
                                <option value="ongoing">Sedang Berlangsung</option>
                                <option value="completed">Selesai</option>
                            </select>

                            {errors.status && (
                                <p style={{ color: '#dc2626', fontSize: 13 }}>
                                    {errors.status}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            style={{
                                padding: '12px 20px',
                                background: processing ? '#8ab9a2' : '#16734f',
                                color: 'white',
                                border: 'none',
                                borderRadius: 8,
                                fontWeight: 600,
                                cursor: processing ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {processing ? 'Menyimpan...' : 'Simpan Realisasi'}
                        </button>
                    </form>
                </div>
            )}

<div style={{
    background: 'white',
    border: '1px solid #e5eee9',
    borderRadius: 14,
    padding: 24,
    marginBottom: 20,
}}>
    <h3 style={{ marginTop: 0 }}>
        <Image
            size={20}
            style={{ verticalAlign: 'middle', marginRight: 8 }}
        />
        Dokumentasi Kegiatan
    </h3>

    <p style={{ color: '#82958c', marginTop: 0 }}>
        Unggah foto sebagai bukti pelaksanaan kegiatan penyaluran.
    </p>

    <form onSubmit={submitDocument}>
        <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>
                Foto Kegiatan *
            </label>

            <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) =>
                    setDocumentData('photo', e.target.files[0] || null)
                }
                required
            />

            {documentErrors.photo && (
                <p style={{ color: '#dc2626', fontSize: 13 }}>
                    {documentErrors.photo}
                </p>
            )}
            <p style={{ color: '#82958c', fontSize: 12 }}>
                Format JPG, PNG, atau WEBP. Maksimal 5 MB.
            </p>
        </div>

        <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>
                Keterangan Foto
            </label>

            <input
                type="text"
                value={documentData.caption}
                onChange={(e) => setDocumentData('caption', e.target.value)}
                placeholder="Contoh: Pembagian paket makanan kepada penerima"
                style={{
                    width: '100%',
                    padding: 12,
                    border: '1px solid #dce7e1',
                    borderRadius: 8,
                    boxSizing: 'border-box',
                }}
            />

            {documentErrors.caption && (
                <p style={{ color: '#dc2626', fontSize: 13 }}>
                    {documentErrors.caption}
                </p>
            )}
        </div>

        <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>
                Tanggal Dokumentasi
            </label>

            <input
                type="date"
                value={documentData.document_date}
                onChange={(e) => setDocumentData('document_date', e.target.value)}
                style={{
                    padding: 12,
                    border: '1px solid #dce7e1',
                    borderRadius: 8,
                }}
            />

            {documentErrors.document_date && (
                <p style={{ color: '#dc2626', fontSize: 13 }}>
                    {documentErrors.document_date}
                </p>
            )}
        </div>

        <button
            type="submit"
            disabled={uploadingDocument}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 20px',
                background: uploadingDocument ? '#8ab9a2' : '#16734f',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                cursor: uploadingDocument ? 'not-allowed' : 'pointer',
            }}
        >
            <Upload size={17} />
            {uploadingDocument ? 'Mengunggah...' : 'Upload Dokumentasi'}
        </button>
    </form>

    <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 16,
        marginTop: 28,
    }}>
        {documents.length > 0 ? (
            documents.map((document) => (
                <div
                    key={document.id}
                    style={{
                        border: '1px solid #e5eee9',
                        borderRadius: 10,
                        overflow: 'hidden',
                    }}
                >
                    <a
                        href={`/storage/${document.file_path}`}
                        target="_blank"
                        rel="noreferrer"
                    >
                        <img
                            src={`/storage/${document.file_path}`}
                            alt={document.caption || 'Dokumentasi penyaluran'}
                            style={{
                                width: '100%',
                                height: 180,
                                objectFit: 'cover',
                                display: 'block',
                            }}
                        />
                    </a>

                    <div style={{ padding: 12 }}>
                        <strong style={{ fontSize: 14 }}>
                            {document.caption || 'Dokumentasi kegiatan'}
                        </strong>

                        <p style={{
                            color: '#82958c',
                            fontSize: 12,
                            marginBottom: 0,
                        }}>
                            {document.document_date || 'Tanggal tidak dicantumkan'}
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                const confirmed = window.confirm(
                                    'Apakah kamu yakin ingin menghapus dokumentasi ini? Foto yang dihapus tidak dapat dikembalikan.'
                                );

                                if (confirmed) {
                                    router.delete(
                                        `/superadmin/penyaluran/${distribution.id}/dokumentasi/${document.id}`,
                                        {
                                            preserveScroll: true,
                                        }
                                    );
                                }
                            }}
                            style={{
                                marginTop: 12,
                                padding: '8px 12px',
                                background: '#fee2e2',
                                color: '#b91c1c',
                                border: 'none',
                                borderRadius: 7,
                                fontWeight: 600,
                                cursor: 'pointer',
                                width: '100%',
                            }}
                        >
                            Hapus Dokumentasi
                        </button>
                    </div>
                </div>
            ))
        ) : (
            <p style={{
                color: '#82958c',
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: 20,
            }}>
                Belum ada dokumentasi foto untuk kegiatan ini.
            </p>
        )}
    </div>
</div>

            <div style={{
                background: 'white',
                border: '1px solid #e5eee9',
                borderRadius: 14,
                padding: 24,
                marginBottom: 20,
            }}>
                <h3 style={{ marginTop: 0 }}>
                    <ReceiptText
                        size={19}
                        style={{ verticalAlign: 'middle', marginRight: 8 }}
                    />
                    Ringkasan Pengeluaran
                </h3>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: 16,
                }}>
                    <div>
                        <span style={{ color: '#82958c', fontSize: 13 }}>
                            Total pengeluaran tercatat
                        </span>
                        <h3>{rupiah(expenseSummary.total)}</h3>
                    </div>

                    <div>
                        <span style={{ color: '#82958c', fontSize: 13 }}>
                            Disetujui
                        </span>
                        <h3>{rupiah(expenseSummary.approved)}</h3>
                    </div>

                    <div>
                        <span style={{ color: '#82958c', fontSize: 13 }}>
                            Menunggu persetujuan
                        </span>
                        <h3>{rupiah(expenseSummary.pending)}</h3>
                    </div>
                </div>

                <p style={{
                    color: '#82958c',
                    fontSize: 12,
                    marginBottom: 0,
                }}>
                    Ringkasan ini berasal dari tabel pengeluaran yang terhubung
                    langsung dengan kegiatan ini. Bukan penambahan biaya otomatis.
                </p>
            </div>

            <div style={{
                background: 'white',
                border: '1px solid #e5eee9',
                borderRadius: 14,
                padding: 24,
            }}>
                <h3 style={{ marginTop: 0 }}>
                    <ClipboardList
                        size={19}
                        style={{ verticalAlign: 'middle', marginRight: 8 }}
                    />
                    Daftar Pengeluaran Terkait
                </h3>

                {expenses.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            minWidth: 600,
                        }}>
                            <thead>
                                <tr style={{
                                    background: '#f5f8f6',
                                    textAlign: 'left',
                                }}>
                                    {['KATEGORI', 'KETERANGAN', 'NOMINAL', 'STATUS'].map((heading) => (
                                        <th key={heading} style={{
                                            padding: 13,
                                            fontSize: 12,
                                            color: '#71877b',
                                        }}>
                                            {heading}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {expenses.map((expense) => (
                                    <tr key={expense.id} style={{
                                        borderBottom: '1px solid #edf1ee',
                                    }}>
                                        <td style={{ padding: 13 }}>
                                            {expense.expense_category}
                                        </td>
                                        <td style={{ padding: 13 }}>
                                            {expense.description}
                                        </td>
                                        <td style={{ padding: 13 }}>
                                            {rupiah(expense.amount)}
                                        </td>
                                        <td style={{ padding: 13 }}>
                                            {expenseLabels[expense.approval_status] || expense.approval_status}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p style={{
                        textAlign: 'center',
                        padding: 30,
                        color: '#82958c',
                    }}>
                        Belum ada pengeluaran yang terhubung dengan kegiatan ini.
                    </p>
                )}
            </div>
        </SuperadminLayout>
    );
}
