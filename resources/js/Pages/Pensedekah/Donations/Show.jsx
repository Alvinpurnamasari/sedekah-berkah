import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import axios from 'axios';
import PensedekahLayout from '../../../Components/PensedekahLayout';

const formatRupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value) || 0);

const formatDate = (value) => {
    if (!value) return '-';

    return new Date(value).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const paymentLabels = {
    pending: 'Menunggu Pembayaran',
    paid: 'Berhasil Dibayar',
    failed: 'Pembayaran Gagal',
    expired: 'Kedaluwarsa',
};

const proofLabels = {
    pending: 'Menunggu Verifikasi',
    approved: 'Bukti Transfer Diterima',
    rejected: 'Bukti Transfer Ditolak',
};

function StatusBadge({ status, type = 'payment' }) {
    const labels = type === 'proof' ? proofLabels : paymentLabels;
    const label = labels[status] || status || 'Belum tersedia';

    const colors = {
        paid: { background: '#dcfce7', color: '#166534' },
        approved: { background: '#dcfce7', color: '#166534' },
        pending: { background: '#fef3c7', color: '#92400e' },
        rejected: { background: '#fee2e2', color: '#991b1b' },
        failed: { background: '#fee2e2', color: '#991b1b' },
        expired: { background: '#e2e8f0', color: '#475569' },
    };

    const style = colors[status] || {
        background: '#e2e8f0',
        color: '#475569',
    };

    return (
        <span style={{
            display: 'inline-block',
            padding: '7px 12px',
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 600,
            background: style.background,
            color: style.color,
        }}>
            {label}
        </span>
    );
}

function DetailRow({ label, value }) {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 20,
            padding: '13px 0',
            borderBottom: '1px solid #e5e7eb',
        }}>
            <span style={{ color: '#64748b', fontSize: 14 }}>
                {label}
            </span>

            <strong style={{
                color: '#1e293b',
                textAlign: 'right',
                overflowWrap: 'anywhere',
                fontSize: 14,
            }}>
                {value || '-'}
            </strong>
        </div>
    );
}

export default function Show({ donation }) {
    const [hasProof, setHasProof] = useState(Boolean(donation.transfer_proof));
    const [proofStatus, setProofStatus] = useState(donation.proof_status);
    const [proofUploadedAt, setProofUploadedAt] = useState(donation.proof_uploaded_at);
    const [proofFile, setProofFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [uploadSuccess, setUploadSuccess] = useState('');

    const total =
        Number(donation.donation_amount || 0) +
        Number(donation.operational_support || 0);

    const proofUrl = hasProof
        ? `/akun/donasi/${encodeURIComponent(donation.donation_code)}/bukti`
        : null;

        const handleUploadProof = async (event) => {
            event.preventDefault();
        
            if (!proofFile) {
                setUploadError('Silakan pilih gambar bukti transfer terlebih dahulu.');
                return;
            }
        
            const formData = new FormData();
            formData.append('proof', proofFile);
        
            setUploading(true);
            setUploadError('');
            setUploadSuccess('');
        
            try {
                const response = await axios.post(
                    `/api/v1/donations/${encodeURIComponent(donation.donation_code)}/proof`,
                    formData,
                    {
                        headers: {
                            Accept: 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                        },
                    }
                );
        
                const result = response.data;
        
                setHasProof(true);
                setProofStatus(result.data.proof_status);
                setProofUploadedAt(result.data.proof_uploaded_at);
                setProofFile(null);
        
                setUploadSuccess(
                    result.message || 'Bukti transfer berhasil diunggah.'
                );
            } catch (error) {
                const result = error.response?.data;
        
                setUploadError(
                    result?.errors?.proof?.[0] ||
                    result?.message ||
                    'Gagal mengunggah bukti transfer.'
                );
            } finally {
                setUploading(false);
            }
        };

    return (
        <PensedekahLayout title="Detail Donasi">
            <div style={{
                maxWidth: 950,
                margin: '0 auto',
            }}>
                <div style={{ marginBottom: 24 }}>
                    <Link
                        href="/akun/donasi"
                        style={{
                            color: '#176b45',
                            textDecoration: 'none',
                            fontWeight: 600,
                            fontSize: 14,
                        }}
                    >
                        ← Kembali ke Riwayat Donasi
                    </Link>

                    <h2 style={{
                        color: '#176b45',
                        fontSize: 24,
                        fontWeight: 700,
                        margin: '20px 0 8px',
                    }}>
                        Detail Donasi
                    </h2>

                    <p style={{
                        color: '#64748b',
                        margin: 0,
                    }}>
                        Informasi lengkap transaksi donasi Anda.
                    </p>
                </div>

                {/* Ringkasan Transaksi */}
                <section style={{
                    background: '#fff',
                    padding: 24,
                    borderRadius: 14,
                    marginBottom: 20,
                    border: '1px solid #e5e7eb',
                }}>
                    <p style={{
                        color: '#64748b',
                        margin: '0 0 8px',
                        fontSize: 14,
                    }}>
                        Kode Donasi
                    </p>

                    <h3 style={{
                        color: '#176b45',
                        margin: '0 0 18px',
                        fontSize: 21,
                        overflowWrap: 'anywhere',
                    }}>
                        {donation.donation_code}
                    </h3>

                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 10,
                    }}>
                        <StatusBadge status={donation.payment_status} />

                        {proofStatus && (
                            <StatusBadge
                                status={proofStatus}
                                type="proof"
                            />
                        )}
                    </div>

                    <div style={{
                        background: '#f0f7f2',
                        borderRadius: 10,
                        padding: 20,
                        marginTop: 22,
                    }}>
                        <p style={{
                            color: '#64748b',
                            margin: '0 0 6px',
                            fontSize: 14,
                        }}>
                            Total Donasi
                        </p>

                        <h2 style={{
                            color: '#176b45',
                            fontSize: 28,
                            margin: 0,
                        }}>
                            {formatRupiah(total)}
                        </h2>
                    </div>
                </section>

                {/* Informasi Donasi */}
                <section style={{
                    background: '#fff',
                    padding: 24,
                    borderRadius: 14,
                    marginBottom: 20,
                    border: '1px solid #e5e7eb',
                }}>
                    <h3 style={{
                        color: '#176b45',
                        margin: '0 0 12px',
                    }}>
                        Informasi Donasi
                    </h3>

                    <DetailRow
                        label="Program"
                        value={donation.campaign_title}
                    />

                    <DetailRow
                        label="Tanggal Donasi"
                        value={formatDate(donation.created_at)}
                    />

                    <DetailRow
                        label="Nominal Donasi"
                        value={formatRupiah(donation.donation_amount)}
                    />

                    <DetailRow
                        label="Dukungan Operasional"
                        value={formatRupiah(donation.operational_support)}
                    />

                    <DetailRow
                        label="Total"
                        value={formatRupiah(total)}
                    />

                    <DetailRow
                        label="Pembayaran Berhasil Pada"
                        value={formatDate(donation.paid_at)}
                    />
                </section>

                {/* Informasi Pembayaran */}
                <section style={{
                    background: '#fff',
                    padding: 24,
                    borderRadius: 14,
                    marginBottom: 20,
                    border: '1px solid #e5e7eb',
                }}>
                    <h3 style={{
                        color: '#176b45',
                        margin: '0 0 12px',
                    }}>
                        Informasi Pembayaran
                    </h3>

                    <DetailRow
                        label="Penyedia Pembayaran"
                        value={donation.provider}
                    />

                    <DetailRow
                        label="Nomor Pesanan"
                        value={donation.order_id}
                    />

                    <DetailRow
                        label="Metode Pembayaran"
                        value={donation.payment_method}
                    />

                    <DetailRow
                        label="Jumlah Transaksi"
                        value={
                            donation.gross_amount !== null
                                ? formatRupiah(donation.gross_amount)
                                : '-'
                        }
                    />

                    <DetailRow
                        label="Biaya Gateway"
                        value={
                            donation.gateway_fee !== null
                                ? formatRupiah(donation.gateway_fee)
                                : '-'
                        }
                    />
                </section>

                {/* Verifikasi Bukti Transfer */}
                <section style={{
                    background: '#fff',
                    padding: 24,
                    borderRadius: 14,
                    marginBottom: 20,
                    border: '1px solid #e5e7eb',
                }}>
                    <h3 style={{
                        color: '#176b45',
                        margin: '0 0 12px',
                    }}>
                        Verifikasi Bukti Transfer
                    </h3>

                    <DetailRow
                        label="Status Bukti Transfer"
                        value={
                            proofStatus
                                ? (
                                    <StatusBadge
                                        status={proofStatus}
                                        type="proof"
                                    />
                                )
                                : 'Belum ada bukti transfer'
                        }
                    />

                    <DetailRow
                        label="Tanggal Upload"
                        value={formatDate(proofUploadedAt)}
                    />

                    <DetailRow
                        label="Tanggal Verifikasi"
                        value={formatDate(donation.verified_at)}
                    />
                    <div style={{ paddingTop: 18 }}>
                        <p style={{
                            color: '#64748b',
                            marginBottom: 10,
                            fontSize: 14,
                            fontWeight: 600,
                        }}>
                            Bukti Transfer
                        </p>

                        {proofUrl ? (
                            <a
                                href={proofUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'inline-block',
                                    textDecoration: 'none',
                                }}
                            >
                                <img
                                    src={proofUrl}
                                    alt="Bukti transfer donasi"
                                    style={{
                                        display: 'block',
                                        maxWidth: '100%',
                                        width: 420,
                                        maxHeight: 450,
                                        objectFit: 'contain',
                                        borderRadius: 10,
                                        border: '1px solid #e5e7eb',
                                        background: '#f8fafc',
                                    }}
                                />
                                <span style={{
                                    display: 'inline-block',
                                    marginTop: 10,
                                    color: '#176b45',
                                    fontSize: 13,
                                    fontWeight: 600,
                                }}>
                                    Klik gambar untuk membuka ukuran penuh
                                </span>
                            </a>
                        ) : (
                            <>
                                <p style={{
                                    color: '#94a3b8',
                                    fontSize: 14,
                                    margin: '0 0 16px',
                                }}>
                                    Belum ada bukti transfer yang diunggah.
                                </p>

                                {donation.payment_status === 'pending' && (
                                    <form onSubmit={handleUploadProof}>
                                        <div style={{
                                            background: '#f8fafc',
                                            border: '1px dashed #94a3b8',
                                            borderRadius: 10,
                                            padding: 20,
                                        }}>
                                            <label style={{
                                                display: 'block',
                                                color: '#334155',
                                                fontWeight: 600,
                                                marginBottom: 10,
                                            }}>
                                                Pilih Bukti Transfer
                                            </label>

                                            <input
                                                type="file"
                                                accept="image/jpeg,image/png"
                                                onChange={(event) => {
                                                    setProofFile(event.target.files?.[0] || null);
                                                    setUploadError('');
                                                    setUploadSuccess('');
                                                }}
                                                style={{
                                                    display: 'block',
                                                    width: '100%',
                                                    marginBottom: 12,
                                                }}
                                            />

                                            <p style={{
                                                color: '#64748b',
                                                fontSize: 12,
                                                marginBottom: 15,
                                            }}>
                                                Format JPG, JPEG, atau PNG. Maksimal 2 MB.
                                            </p>

                                            {proofFile && (
                                                <p style={{ fontSize: 13, color: '#334155' }}>
                                                    File dipilih: {proofFile.name}
                                                </p>
                                            )}

                                            {uploadError && (
                                                <p style={{
                                                    color: '#dc2626',
                                                    fontSize: 13,
                                                    marginBottom: 12,
                                                }}>
                                                    {uploadError}
                                                </p>
                                            )}

                                            {uploadSuccess && (
                                                <p style={{
                                                    color: '#15803d',
                                                    fontSize: 13,
                                                    marginBottom: 12,
                                                }}>
                                                    {uploadSuccess}
                                                </p>
                                            )}

                                            <button
                                                type="submit"
                                                disabled={uploading || !proofFile}
                                                style={{
                                                    background: uploading || !proofFile ? '#94a3b8' : '#176b45',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: 8,
                                                    padding: '12px 20px',
                                                    fontWeight: 600,
                                                    cursor: uploading || !proofFile ? 'not-allowed' : 'pointer',
                                                }}
                                            >
                                                {uploading ? 'Mengunggah...' : 'Upload Bukti Pembayaran'}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </>
                        )}
                    </div>

                    {donation.verification_note && (
                        <div style={{ paddingTop: 15 }}>
                            <p style={{
                                color: '#64748b',
                                marginBottom: 6,
                                fontSize: 14,
                            }}>
                                Catatan Verifikasi
                            </p>

                            <p style={{
                                color: '#334155',
                                margin: 0,
                                lineHeight: 1.6,
                            }}>
                                {donation.verification_note}
                            </p>
                        </div>
                    )}
                </section>

                {donation.payment_status === 'pending' && (
                    <div style={{
                        background: '#fffbeb',
                        color: '#92400e',
                        padding: 18,
                        borderRadius: 10,
                        marginBottom: 20,
                        lineHeight: 1.6,
                    }}>
                        Pembayaran donasi ini masih menunggu penyelesaian
                        atau verifikasi. Silakan periksa kembali status
                        pembayaran Anda.
                    </div>
                )}

                <div style={{
                    textAlign: 'center',
                    padding: '10px 0 30px',
                }}>
                    <Link
                        href="/akun/donasi"
                        style={{
                            display: 'inline-block',
                            padding: '12px 22px',
                            background: '#176b45',
                            color: '#fff',
                            borderRadius: 8,
                            textDecoration: 'none',
                            fontWeight: 600,
                        }}
                    >
                        ← Kembali ke Riwayat Donasi
                    </Link>
                </div>
            </div>
        </PensedekahLayout>
    );
}
