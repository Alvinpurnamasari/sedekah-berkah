
import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import SuperadminLayout from '../../../Components/SuperadminLayout';
import {
    ClipboardList, CheckCircle, XCircle, Clock,
    FileText, Eye, Search, Wallet
} from 'lucide-react';
import '../../../../css/superadmin-expenses.css';

const rupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

const statusLabel = {
    pending: 'Menunggu',
    approved: 'Disetujui',
    rejected: 'Ditolak',
};

export default function Index({ expenses }) {
    const [search, setSearch] = useState('');
    const [processingId, setProcessingId] = useState(null);

    const rows = expenses?.data || [];

    const filtered = rows.filter((item) => {
        const keyword = search.toLowerCase();
    
        return (
            item.description?.toLowerCase().includes(keyword) ||
            item.expense_category?.toLowerCase().includes(keyword) ||
            item.expense_type?.toLowerCase().includes(keyword) ||
            item.campaign?.title?.toLowerCase().includes(keyword) ||
            item.distribution?.title?.toLowerCase().includes(keyword) ||
            item.submitter?.name?.toLowerCase().includes(keyword)
        );
    });

    function approve(item) {
        if (!confirm(`Setujui pengeluaran ${rupiah(item.amount)}?`)) return;

        setProcessingId(item.id);
        router.post(`/superadmin/pengeluaran/${item.id}/setujui`, {}, {
            preserveScroll: true,
            onFinish: () => setProcessingId(null),
        });
    }

    function reject(item) {
        const reason = prompt('Masukkan alasan penolakan:');
        if (!reason || reason.trim().length < 3) {
            alert('Alasan penolakan minimal 3 karakter.');
            return;
        }

        setProcessingId(item.id);
        router.post(`/superadmin/pengeluaran/${item.id}/tolak`, {
            reason: reason.trim(),
        }, {
            preserveScroll: true,
            onFinish: () => setProcessingId(null),
        });
    }

    return (
        <SuperadminLayout
            title="Pengeluaran & Persetujuan"
            activeMenu="expenses"
        >
            <Head title="Pengeluaran & Persetujuan" />

            <div className="se-page">
                <div className="se-heading">
                    <div>
                        <span className="se-eyebrow">PENGELOLAAN KEUANGAN</span>
                        <h1>Pengeluaran & Persetujuan</h1>
                        <p>
                            Periksa pengajuan biaya dan kelola persetujuan
                            pengeluaran Sedekah Berkah.
                        </p>
                    </div>
                </div>

                <div className="se-summary">
                    <div className="se-summary-icon">
                        <ClipboardList size={25} />
                    </div>
                    <div>
                        <span>Total pengajuan ditampilkan</span>
                        <strong>{expenses?.total || 0}</strong>
                    </div>
                </div>

                <div className="se-card">
                    <div className="se-card-heading">
                        <div>
                            <h2>Daftar Pengajuan Pengeluaran</h2>
                            <p>
                                Periksa rincian pengajuan dari Admin.
                            </p>
                        </div>

                        <div className="se-search">
                            <Search size={18} />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari kategori, program, pengaju..."
                            />
                        </div>
                    </div>

                    <div className="se-table-wrap">
                        <table className="se-table">
                            <thead>
                                <tr>
                                    <th>Kategori & Keterangan</th>
                                    <th>Program</th>
                                    <th>Penyaluran</th>
                                    <th>Pengaju</th>
                                    <th>Nominal</th>
                                    <th>Bukti</th>
                                    <th>Status</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="se-empty">
                                            <Wallet size={30} />
                                            <strong>
                                                Belum ada pengajuan pengeluaran
                                            </strong>
                                            <span>
                                                Pengajuan dari Admin akan muncul di sini.
                                            </span>
                                        </td>
                                    </tr>
                                ) : filtered.map((item) => (
                                    <tr key={item.id}>
                                        <td>
                                        <strong>{item.expense_category}</strong>

                                            <small>
                                                {item.expense_type === 'distribution_detail'
                                                    ? 'Rincian biaya penyaluran'
                                                    : item.expense_type === 'additional'
                                                        ? 'Biaya tambahan'
                                                        : 'Jenis belum diklasifikasikan'}
                                            </small>

                                            <small>{item.description}</small>

                                            {item.expense_type === 'distribution_detail' && (
                                                <small>
                                                    Penyaluran: {item.distribution?.title || 'Belum tersedia'}
                                                </small>
                                            )}
                                        </td>
                                        <td>
                                            {item.campaign?.title || 'Umum'}
                                        </td>
                                        <td>
                                            {item.distribution?.title || '-'}

                                            {item.expense_type === 'distribution_detail' && item.distribution && (
                                                <div className="se-budget-info">
                                                {item.distribution.is_simulated ? (
                                                    <strong>Data simulasi — bukan saldo nyata</strong>
                                                ) : (
                                                    <>
                                                        <small>
                                                            Status anggaran: {
                                                                item.distribution.budget_status === 'approved'
                                                                    ? 'Disetujui'
                                                                    : 'Belum disetujui'
                                                            }
                                                        </small>
                                            
                                                        <small>
                                                            Anggaran disetujui: {rupiah(item.distribution.approved_budget)}
                                                        </small>
                                            
                                                        <small>
                                                            Pengeluaran disetujui: {rupiah(item.distribution.approved_expenses_total)}
                                                        </small>
                                            
                                                        <small>
                                                            Pengajuan menunggu: {rupiah(item.distribution.pending_expenses_total)}
                                                        </small>
                                            
                                                        <small>
                                                            Sisa anggaran: {
                                                                rupiah(
                                                                    Number(item.distribution.approved_budget || 0)
                                                                    - Number(item.distribution.approved_expenses_total || 0)
                                                                    - Number(item.distribution.pending_expenses_total || 0)
                                                                )
                                                            }
                                                        </small>
                                                    </>
                                                )}
                                            </div>
                                            )}
                                        </td>
                                        <td>
                                            {item.submitter?.name || '-'}
                                        </td>
                                        <td>
                                            <strong>{rupiah(item.amount)}</strong>
                                        </td>
                                        <td>
                                            {item.receipt_file ? (
                                                <a
                                                    href={`/storage/${item.receipt_file}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="se-proof"
                                                >
                                                    <Eye size={16} /> Lihat
                                                </a>
                                            ) : (
                                                <span>-</span>
                                            )}
                                        </td>                                  
                                        <td>
                                            <span className={`se-status ${item.approval_status}`}>
                                                {statusLabel[item.approval_status] || item.approval_status}
                                            </span>

                                            {item.approval_status === 'rejected' && item.rejection_reason && (
                                                <div className="se-rejection-reason">
                                                    <strong>Alasan penolakan:</strong>
                                                    <p>{item.rejection_reason}</p>
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            {item.approval_status === 'pending' ? (
                                                <div className="se-actions">
                                                    <button
                                                        type="button"
                                                        className="se-approve"
                                                        disabled={processingId === item.id}
                                                        onClick={() => approve(item)}
                                                    >
                                                        <CheckCircle size={15} />
                                                        Setujui
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="se-reject"
                                                        disabled={processingId === item.id}
                                                        onClick={() => reject(item)}
                                                    >
                                                        <XCircle size={15} />
                                                        Tolak
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="se-processed">
                                                    Sudah diproses
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="se-pagination">
                        <span>
                            Menampilkan {expenses?.from || 0}–{expenses?.to || 0}
                            {' '}dari {expenses?.total || 0} pengajuan
                        </span>

                        <div>
                            {expenses?.links?.map((link, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    disabled={!link.url || link.active}
                                    className={link.active ? 'active' : ''}
                                    onClick={() => router.visit(link.url, {
                                        preserveScroll: true,
                                    })}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="se-note">
                    <Clock size={18} />
                    Pengajuan penyaluran berstatus Menunggu dan Disetujui
                    diperhitungkan dalam penggunaan anggaran agar tidak terjadi
                    pengajuan melebihi pagu. Pengajuan Ditolak tidak diperhitungkan.
                    Data simulasi tidak memengaruhi saldo nyata.
                </div>
            </div>
        </SuperadminLayout>
    );
}
