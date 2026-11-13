
import React from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '../../../Components/AdminLayout';
import {
    ArrowLeft,
    HandHeart,
    CalendarDays,
    MapPin,
    UsersRound,
    Wallet,
    ClipboardList,
    Image as ImageIcon,
    Upload,
    Trash2,
    Send,
    Save,
    AlertCircle,
    CheckCircle2,
    Eye,
    Clock3,
    ShieldCheck,
} from 'lucide-react';
import '../../../../css/admin.css';

const rupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

const activityLabels = {
    planned: 'Direncanakan',
    ongoing: 'Berlangsung',
    completed: 'Selesai',
};

const reportLabels = {
    draft: 'Draft',
    pending: 'Menunggu pemeriksaan Superadmin',
    approved: 'Disetujui',
    revision: 'Perlu revisi',
};

export default function Show({
    distribution,
    expenses = [],
    expenseSummary = {},
    documents = [],
}) {
    const { props } = usePage();

    const realizationForm = useForm({
        actual_quantity: distribution.actual_quantity || 0,
        total_cost: distribution.total_cost || 0,
        status: distribution.status === 'planned'
            ? 'ongoing'
            : distribution.status,
    });

    const documentForm = useForm({
        media: null,
        caption: '',
        document_date: new Date().toISOString().slice(0, 10),
    });

    const canEdit = ['draft', 'revision'].includes(
        distribution.report_status
    );

    const canSubmit =
        distribution.status === 'completed' &&
        canEdit &&
        documents.length > 0;

    const activityLabel =
        activityLabels[distribution.status] || distribution.status;

    const reportLabel =
        reportLabels[distribution.report_status] ||
        distribution.report_status;

    function submitRealization(e) {
        e.preventDefault();

        realizationForm.post(
            `/admin/penyaluran/${distribution.id}/realisasi`,
            { preserveScroll: true }
        );
    }

    function submitDocument(e) {
        e.preventDefault();

        documentForm.post(
            `/admin/penyaluran/${distribution.id}/dokumentasi`,
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => documentForm.reset(),
            }
        );
    }

    function deleteDocument(documentId) {
        if (!window.confirm('Yakin ingin menghapus dokumentasi ini?')) {
            return;
        }

        router.delete(
            `/admin/penyaluran/${distribution.id}/dokumentasi/${documentId}`,
            { preserveScroll: true }
        );
    }

    function submitReport() {
        if (!window.confirm(
            'Ajukan laporan ini kepada Superadmin untuk diperiksa? Setelah diajukan, realisasi dan dokumentasi tidak dapat diubah sampai laporan diminta revisi.'
        )) {
            return;
        }

        router.post(
            `/admin/penyaluran/${distribution.id}/ajukan-laporan`,
            {},
            { preserveScroll: true }
        );
    }

    return (
        <AdminLayout
            title="Detail Penyaluran"
            activeMenu="distribution"
        >
            <Head title={`Detail Penyaluran - ${distribution.title}`} />

            <div className="ad-content">

                <div className="ad-dist-back">
                    <Link href="/admin/penyaluran">
                        <ArrowLeft size={17} />
                        Kembali ke daftar penyaluran
                    </Link>
                </div>

                {props.flash?.success && (
                    <div className="ad-dist-alert success">
                        <CheckCircle2 size={19} />
                        {props.flash.success}
                    </div>
                )}

                <section className="ad-welcome">
                    <div>
                        <span className="ad-eyebrow">
                            DETAIL KEGIATAN LAPANGAN
                        </span>
                        <h2>{distribution.title}</h2>
                        <p>
                            {distribution.campaign_title ||
                                'Program Sedekah Berkah'}
                        </p>
                    </div>

                    <div className="ad-welcome-icon">
                        <HandHeart size={38} />
                    </div>
                </section>

                <section className="ad-dist-info-grid">
                    <div className="ad-dist-info-card">
                        <MapPin size={21} />
                        <span>Lokasi kegiatan</span>
                        <strong>{distribution.location || '-'}</strong>
                    </div>

                    <div className="ad-dist-info-card">
                        <CalendarDays size={21} />
                        <span>Tanggal penyaluran</span>
                        <strong>
                            {distribution.distribution_date || '-'}
                        </strong>
                    </div>

                    <div className="ad-dist-info-card">
                        <UsersRound size={21} />
                        <span>Target penerima</span>
                        <strong>
                            {distribution.planned_quantity || 0} orang
                        </strong>
                    </div>

                    <div className="ad-dist-info-card">
                        <Wallet size={21} />
                        <span>Target biaya / realisasi</span>
                        <strong>{rupiah(distribution.total_cost)}</strong>
                    </div>
                </section>

                <section className="ad-dist-status-panel">
                    <div>
                        <span>Status kegiatan</span>
                        <strong>{activityLabel}</strong>
                    </div>

                    <div>
                        <span>Status laporan</span>
                        <strong>{reportLabel}</strong>
                    </div>
                </section>

                {distribution.report_status === 'revision' &&
                    distribution.report_revision_note && (
                        <section
                            className="ad-panel ad-dist-description"
                            style={{
                                background: '#fff7ed',
                                border: '1px solid #fed7aa',
                                marginBottom: 20,
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                marginBottom: 10,
                            }}>
                                <AlertCircle
                                    size={21}
                                    color="#c2410c"
                                />
                                <h3 style={{
                                    margin: 0,
                                    color: '#9a3412',
                                }}>
                                    Catatan Revisi dari Superadmin
                                </h3>
                            </div>

                            <p style={{
                                color: '#7c2d12',
                                margin: 0,
                                whiteSpace: 'pre-wrap',
                            }}>
                                {distribution.report_revision_note}
                            </p>

                            <p style={{
                                color: '#9a3412',
                                fontSize: 13,
                                marginBottom: 0,
                                marginTop: 12,
                            }}>
                                Silakan perbaiki laporan sesuai catatan
                                di atas, kemudian ajukan kembali kepada
                                Superadmin.
                            </p>
                        </section>
                    )}

                {distribution.description && (
                    <section className="ad-panel ad-dist-description">
                        <h3>Keterangan kegiatan</h3>
                        <p>{distribution.description}</p>
                    </section>
                )}

                <section className="ad-panel ad-dist-section">
                    <div className="ad-dist-heading">
                        <div>
                            <h3>Realisasi penyaluran</h3>
                            <p>
                                Catat hasil aktual pelaksanaan kegiatan
                                di lapangan.
                            </p>
                        </div>
                        <ClipboardList size={25} />
                    </div>

                    {canEdit ? (
                        <form onSubmit={submitRealization}>
                            <div className="ad-dist-form-grid">
                                <div className="ad-dist-field">
                                    <label>Jumlah penerima aktual *</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={realizationForm.data.actual_quantity}
                                        onChange={e =>
                                            realizationForm.setData(
                                                'actual_quantity',
                                                e.target.value
                                            )
                                        }
                                        required
                                    />
                                    {realizationForm.errors.actual_quantity && (
                                        <small className="ad-dist-error">
                                            {realizationForm.errors.actual_quantity}
                                        </small>
                                    )}
                                </div>

                                <div className="ad-dist-field">
                                    <label>Total biaya aktual (Rp) *</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={realizationForm.data.total_cost}
                                        onChange={e =>
                                            realizationForm.setData(
                                                'total_cost',
                                                e.target.value
                                            )
                                        }
                                        required
                                    />
                                    {realizationForm.errors.total_cost && (
                                        <small className="ad-dist-error">
                                            {realizationForm.errors.total_cost}
                                        </small>
                                    )}
                                </div>

                                <div className="ad-dist-field">
                                    <label>Status kegiatan *</label>
                                    <select
                                        value={realizationForm.data.status}
                                        onChange={e =>
                                            realizationForm.setData(
                                                'status',
                                                e.target.value
                                            )
                                        }
                                    >
                                        <option value="ongoing">
                                            Berlangsung
                                        </option>
                                        <option value="completed">
                                            Selesai
                                        </option>
                                    </select>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="ad-dist-primary-button"
                                disabled={realizationForm.processing}
                            >
                                <Save size={18} />
                                {realizationForm.processing
                                    ? 'Menyimpan...'
                                    : 'Simpan realisasi'}
                            </button>
                        </form>
                    ) : (
                        <div className="ad-dist-locked">
                            <ShieldCheck size={20} />
                            Realisasi dikunci karena laporan sedang
                            diperiksa atau sudah disetujui Superadmin.
                        </div>
                    )}
                </section>

                <section className="ad-panel ad-dist-section">
                    <div className="ad-dist-heading">
                        <div>
                            <h3>Dokumentasi kegiatan</h3>
                            <p>
                                Unggah foto atau video kegiatan sebagai bukti penyaluran.
                            </p>
                        </div>
                        <ImageIcon size={25} />
                    </div>

                    {canEdit && (
                        <form
                            onSubmit={submitDocument}
                            className="ad-dist-document-form"
                        >
                            <div className="ad-dist-form-grid">
                                <div className="ad-dist-field">
                                <label>Foto atau video dokumentasi *</label>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm"
                                    onChange={e =>
                                        documentForm.setData(
                                            'media',
                                            e.target.files[0] || null
                                        )
                                    }
                                    required
                                />
                                <small>
                                    Foto: JPG, PNG, WEBP maksimal 5 MB.
                                    Video: MP4, MOV, WEBM maksimal 50 MB.
                                </small>
                                {documentForm.errors.media && (
                                    <small className="ad-dist-error">
                                        {documentForm.errors.media}
                                    </small>
                                )}
                                </div>

                                <div className="ad-dist-field">
                                    <label>Tanggal dokumentasi</label>
                                    <input
                                        type="date"
                                        value={documentForm.data.document_date}
                                        onChange={e =>
                                            documentForm.setData(
                                                'document_date',
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>

                                <div className="ad-dist-field ad-dist-full">
                                    <label>Keterangan dokumentasi</label>
                                    <input
                                        type="text"
                                        maxLength="255"
                                        placeholder="Contoh: Penyerahan paket sembako kepada penerima"
                                        value={documentForm.data.caption}
                                        onChange={e =>
                                            documentForm.setData(
                                                'caption',
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="ad-dist-primary-button"
                                disabled={documentForm.processing}
                            >
                                <Upload size={18} />
                                {documentForm.processing
                                    ? 'Mengunggah...'
                                    : 'Unggah dokumentasi'}
                            </button>
                        </form>
                    )}

                    <div className="ad-dist-gallery">
                        {documents.length === 0 ? (
                            <div className="ad-dist-empty">
                                <ImageIcon size={34} />
                                <strong>Belum ada dokumentasi</strong>
                                <span>
                                    Foto dan video kegiatan yang diunggah akan tampil
                                    di sini.
                                </span>
                            </div>
                        ) : (
                            documents.map(document => (
                                <article
                                    className="ad-dist-photo-card"
                                    key={document.id}
                                >
                                    {document.file_type === 'video' ? (
                                        <video
                                            src={`/storage/${document.file_path}`}
                                            controls
                                            preload="metadata"
                                            style={{
                                                width: '100%',
                                                height: 200,
                                                objectFit: 'cover',
                                                background: '#000',
                                            }}
                                        >
                                            Browser tidak mendukung pemutaran video.
                                        </video>
                                    ) : (
                                        <a
                                            href={`/storage/${document.file_path}`}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <img
                                                src={`/storage/${document.file_path}`}
                                                alt={
                                                    document.caption ||
                                                    'Dokumentasi penyaluran'
                                                }
                                            />
                                        </a>
                                    )}

                                    <div className="ad-dist-photo-info">
                                        <strong>
                                            {document.caption ||
                                                'Dokumentasi kegiatan'}
                                        </strong>
                                        <span>
                                            {document.document_date || '-'}
                                        </span>

                                        <div className="ad-dist-photo-actions">
                                            <a
                                                href={`/storage/${document.file_path}`}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                <Eye size={15} /> Lihat
                                            </a>

                                            {canEdit && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        deleteDocument(document.id)
                                                    }
                                                >
                                                    <Trash2 size={15} /> Hapus
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            ))
                        )}
                    </div>
                </section>

                <section className="ad-panel ad-dist-section">
                    <div className="ad-dist-heading">
                        <div>
                            <h3>Ringkasan pengeluaran kegiatan</h3>
                            <p>
                                Pengeluaran yang terkait dengan kegiatan
                                penyaluran ini.
                            </p>
                        </div>
                        <Wallet size={25} />
                    </div>

                    <div className="ad-dist-expense-summary">
                        <div>
                            <span>Total pengeluaran</span>
                            <strong>
                                {rupiah(expenseSummary.total)}
                            </strong>
                        </div>

                        <div>
                            <span>Disetujui</span>
                            <strong>
                                {rupiah(expenseSummary.approved)}
                            </strong>
                        </div>

                        <div>
                            <span>Menunggu persetujuan</span>
                            <strong>
                                {rupiah(expenseSummary.pending)}
                            </strong>
                        </div>
                    </div>

                    {expenses.length > 0 && (
                        <div className="ad-dist-expense-list">
                            {expenses.map(expense => (
                                <div key={expense.id}>
                                    <span>
                                        <strong>
                                            {expense.expense_category}
                                        </strong>
                                        <small>
                                            {expense.description}
                                        </small>
                                    </span>
                                    <strong>
                                        {rupiah(expense.amount)}
                                    </strong>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="ad-dist-submit-panel">
                    <div>
                        <h3>Pengajuan laporan kegiatan</h3>
                        <p>
                            Pastikan realisasi sudah disimpan dan minimal
                            satu dokumentasi sudah diunggah sebelum
                            mengajukan laporan.
                        </p>
                    </div>

                    {distribution.report_status === 'pending' ? (
                        <div className="ad-dist-locked">
                            <Clock3 size={20} />
                            Laporan sedang menunggu pemeriksaan Superadmin.
                        </div>
                    ) : distribution.report_status === 'approved' ? (
                        <div className="ad-dist-approved">
                            <CheckCircle2 size={20} />
                            Laporan telah disetujui Superadmin.
                        </div>
                    ) : (
                        <>
                            {!canSubmit && (
                                <div className="ad-dist-hint">
                                    <AlertCircle size={18} />
                                    {distribution.status !== 'completed'
                                        ? 'Ubah status kegiatan menjadi Selesai sebelum mengajukan laporan.'
                                        : 'Unggah minimal satu dokumentasi foto atau video sebelum mengajukan laporan.'}
                                </div>
                            )}

                            <button
                                type="button"
                                className="ad-dist-submit-button"
                                disabled={!canSubmit}
                                onClick={submitReport}
                            >
                                <Send size={18} />
                                Ajukan laporan kepada Superadmin
                            </button>
                        </>
                    )}
                </section>
            </div>
        </AdminLayout>
    );
}
