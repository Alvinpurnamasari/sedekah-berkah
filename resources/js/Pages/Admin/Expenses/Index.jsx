
import React from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    Plus,
    Upload,
    Clock3,
    CheckCircle2,
    FileImage,
    ShieldCheck,
    Wallet,
} from 'lucide-react';

import AdminLayout from '../../../Components/AdminLayout';
import '../../../../css/admin.css';
import '../../../../css/admin-expenses.css';

const formatRupiah = (value) =>
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
const paymentStatusLabel = {
    unpaid: 'Belum Dibayar',
    paid: 'Sudah Dibayar',
};
export default function Index({ expenses, campaigns, distributions = [] }) {
    const { props } = usePage();

    const [paymentProofs, setPaymentProofs] = React.useState({});
    const [paymentSources, setPaymentSources] = React.useState({});
    const [paymentProcessing, setPaymentProcessing] = React.useState(null);

    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
    } = useForm({
        expense_type: '',
        distribution_id: '',
        campaign_id: '',
        expense_category: '',
        description: '',
        amount: '',
    });

    function submitExpense(e) {
        e.preventDefault();

        post('/admin/pengeluaran', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    }

    function submitPayment(e, expenseId) {
        e.preventDefault();
    
        const proof = paymentProofs[expenseId];
        const paymentSource = paymentSources[expenseId];
    
        if (!proof || !paymentSource) {
            return;
        }
    
        setPaymentProcessing(expenseId);
    
        router.post(
            `/admin/pengeluaran/${expenseId}/bayar`,
            {
                proof,
                payment_source: paymentSource,
            },
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    setPaymentProofs((prev) => ({
                        ...prev,
                        [expenseId]: null,
                    }));
    
                    setPaymentSources((prev) => ({
                        ...prev,
                        [expenseId]: '',
                    }));
                },
                onFinish: () => {
                    setPaymentProcessing(null);
                },
            }
        );
    }

    return (
        <>
            <Head title="Pengeluaran Admin - Sedekah Berkah" />

            <AdminLayout
                title="Pengeluaran Operasional"
                activeMenu="expenses"
            >
                <div className="ad-content">
                    <section className="ad-expense-heading">
                        <div>
                            <span className="ad-eyebrow">
                                PENGELOLAAN KEUANGAN OPERASIONAL
                            </span>
                            <h2>Pengajuan Pengeluaran</h2>
                            <p>
                                Catat biaya kegiatan dan kirimkan pengajuan
                                untuk diperiksa oleh Superadmin.
                            </p>
                        </div>
                    </section>

                    {props.flash?.success && (
                        <div className="ad-expense-alert success">
                            <CheckCircle2 size={19} />
                            {props.flash.success}
                        </div>
                    )}

                    <div className="ad-expense-layout">
                        <section className="ad-expense-panel">
                            <div className="ad-expense-panel-heading">
                                <div className="ad-expense-heading-icon">
                                    <Plus size={21} />
                                </div>

                                <div>
                                    <h3>Form Pengajuan Biaya</h3>
                                    <p>
                                        Lengkapi informasi pengeluaran di bawah ini.
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={submitExpense}>
                                <div className="ad-expense-field">
                                    <label htmlFor="expense-type">
                                        Jenis pengeluaran *
                                    </label>

                                    <select
                                        id="expense-type"
                                        value={data.expense_type}
                                        onChange={(e) => {
                                            const value = e.target.value;

                                            setData((prev) => ({
                                                ...prev,
                                                expense_type: value,
                                                distribution_id:
                                                    value === 'distribution_detail'
                                                        ? prev.distribution_id
                                                        : '',
                                            }));
                                        }}
                                        required
                                    >
                                        <option value="">
                                            Pilih jenis pengeluaran
                                        </option>
                                        <option value="distribution_detail">
                                            Rincian biaya penyaluran
                                        </option>
                                        <option value="additional">
                                            Biaya tambahan
                                        </option>
                                    </select>

                                    {errors.expense_type && (
                                        <small className="ad-expense-error">
                                            {errors.expense_type}
                                        </small>
                                    )}

                                    <small>
                                        {data.expense_type === 'distribution_detail'
                                            ? 'Rincian biaya penyaluran merupakan bagian dari total biaya penyaluran kegiatan.'
                                            : data.expense_type === 'additional'
                                            ? 'Biaya tambahan dicatat secara terpisah dari rincian biaya penyaluran.'
                                            : 'Pilih jenis pengeluaran untuk melihat keterangannya.'}
                                    </small>
                                </div>

                                {data.expense_type === 'distribution_detail' && (
                                    <div className="ad-expense-field">
                                        <label htmlFor="expense-distribution">
                                            Penyaluran terkait *
                                        </label>

                                        <select
                                            id="expense-distribution"
                                            value={data.distribution_id}
                                            onChange={(e) =>
                                                setData('distribution_id', e.target.value)
                                            }
                                            required
                                        >
                                            <option value="">
                                                Pilih data penyaluran
                                            </option>

                                            {distributions.map((distribution) => (
                                                <option
                                                    key={distribution.id}
                                                    value={distribution.id}
                                                >
                                                    {distribution.title}
                                                    {distribution.campaign?.title
                                                        ? ` — ${distribution.campaign.title}`
                                                        : ''}
                                                </option>
                                            ))}
                                        </select>

                                        {errors.distribution_id && (
                                            <small className="ad-expense-error">
                                                {errors.distribution_id}
                                            </small>
                                        )}

                                        {distributions.length === 0 && (
                                            <small className="ad-expense-error">
                                                Belum ada data penyaluran yang tersedia.
                                            </small>
                                        )}
                                    </div>
                                )}

                                <div className="ad-expense-field">
                                    <label htmlFor="expense-category">
                                        Kategori pengeluaran *
                                    </label>

                                    <select
                                        id="expense-category"
                                        value={data.expense_category}
                                        onChange={(e) =>
                                            setData('expense_category', e.target.value)
                                        }
                                        required
                                    >
                                        <option value="">Pilih kategori</option>
                                        <option value="Konsumsi">Konsumsi</option>
                                        <option value="Transportasi">Transportasi</option>
                                        <option value="Perlengkapan">Perlengkapan</option>
                                        <option value="Dokumentasi">Dokumentasi</option>
                                        <option value="Distribusi Bantuan">
                                            Distribusi Bantuan
                                        </option>
                                        <option value="Operasional Lapangan">
                                            Operasional Lapangan
                                        </option>
                                        <option value="Lainnya">Lainnya</option>
                                    </select>

                                    {errors.expense_category && (
                                        <small className="ad-expense-error">
                                            {errors.expense_category}
                                        </small>
                                    )}
                                </div>

                                {data.expense_type === 'additional' && (
                                    <div className="ad-expense-field">
                                        <label htmlFor="expense-campaign">
                                            Program terkait
                                        </label>

                                        <select
                                            id="expense-campaign"
                                            value={data.campaign_id}
                                            onChange={(e) =>
                                                setData('campaign_id', e.target.value)
                                            }
                                        >
                                            <option value="">
                                                Pengeluaran umum / tidak terkait program
                                            </option>

                                            {campaigns.map((campaign) => (
                                                <option
                                                    key={campaign.id}
                                                    value={campaign.id}
                                                >
                                                    {campaign.title}
                                                </option>
                                            ))}
                                        </select>

                                        {errors.campaign_id && (
                                            <small className="ad-expense-error">
                                                {errors.campaign_id}
                                            </small>
                                        )}
                                    </div>
                                )}
                                <div className="ad-expense-field">
                                    <label htmlFor="expense-amount">
                                        Nominal pengeluaran (Rp) *
                                    </label>

                                    <input
                                        id="expense-amount"
                                        type="number"
                                        min="1000"
                                        max="100000000"
                                        step="1000"
                                        placeholder="Contoh: 150000"
                                        value={data.amount}
                                        onChange={(e) =>
                                            setData('amount', e.target.value)
                                        }
                                        required
                                    />

                                    {errors.amount && (
                                        <small className="ad-expense-error">
                                            {errors.amount}
                                        </small>
                                    )}
                                </div>

                                <div className="ad-expense-field">
                                    <label htmlFor="expense-description">
                                        Keterangan pengeluaran *
                                    </label>

                                    <textarea
                                        id="expense-description"
                                        rows="4"
                                        maxLength="1000"
                                        placeholder="Jelaskan tujuan dan rincian pengeluaran..."
                                        value={data.description}
                                        onChange={(e) =>
                                            setData('description', e.target.value)
                                        }
                                        required
                                    />

                                    {errors.description && (
                                        <small className="ad-expense-error">
                                            {errors.description}
                                        </small>
                                    )}
                                </div>

                        

                                <div className="ad-expense-notice">
                                    <ShieldCheck size={19} />
                                    <span>
                                        Pengajuan akan diperiksa oleh Superadmin.
                                        Setelah disetujui dan dibayarkan, Admin wajib
                                        mengunggah bukti pembayaran.
                                    </span>
                                </div>

                                <button
                                    type="submit"
                                    className="ad-expense-submit"
                                    disabled={processing}
                                >
                                    <Plus size={18} />
                                    {processing
                                        ? 'Mengirim pengajuan...'
                                        : 'Kirim Pengajuan'}
                                </button>
                            </form>
                        </section>

                        <section className="ad-expense-side">
                            <div className="ad-expense-info-card">
                                <div className="ad-expense-info-icon">
                                    <Clock3 size={22} />
                                </div>

                                <h3>Alur persetujuan</h3>

                                <ol>
                                    <li>Admin mengisi pengajuan biaya.</li>
                                    <li>Pengajuan diperiksa oleh Superadmin.</li>
                                    <li>Superadmin menyetujui atau menolak pengajuan.</li>
                                    <li>Admin melakukan pembayaran dan mengunggah bukti.</li>
                                    <li>Sistem mencatat realisasi pembayaran.</li>
                                </ol>
                            </div>

                            <div className="ad-expense-info-card">
                                <div className="ad-expense-info-icon">
                                    <FileImage size={22} />
                                </div>

                                <h3>Ketentuan bukti</h3>

                                <p>
                                    Bukti nota atau transaksi wajib diunggah setelah
                                    pengeluaran benar-benar dibayarkan.
                                </p>
                            </div>
                        </section>
                    </div>

                    <section className="ad-expense-history">
                        <div className="ad-expense-history-heading">
                            <div>
                                <h3>Riwayat Pengajuan Saya</h3>
                                <p>
                                    Daftar pengeluaran yang pernah diajukan
                                    oleh akun ini.
                                </p>
                            </div>

                            <span>{expenses.total} pengajuan</span>
                        </div>

                        <div className="ad-expense-table-wrap">
                            <table className="ad-expense-table">
                                <thead>
                                    <tr>
                                        <th>KATEGORI & KETERANGAN</th>
                                        <th>PROGRAM</th>
                                        <th>NOMINAL</th>
                                        <th>TANGGAL</th>
                                        <th>STATUS</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {expenses.data.length > 0 ? (
                                        expenses.data.map((expense) => (
                                            <tr key={expense.id}>
                                                <td>
                                                    <strong>
                                                        {expense.expense_category}
                                                    </strong>

                                                    <small>
                                                        {expense.expense_type ===
                                                        'distribution_detail'
                                                            ? 'Rincian biaya penyaluran'
                                                            : expense.expense_type ===
                                                              'additional'
                                                            ? 'Biaya tambahan'
                                                            : 'Jenis belum diklasifikasikan'}
                                                    </small>

                                                    <small>
                                                        {expense.description}
                                                    </small>

                                                    {expense.payment_status === 'paid' && expense.receipt_file && (
                                                        <a
                                                            href={`/admin/pengeluaran/${expense.id}/bukti-pembayaran`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="ad-expense-receipt-link"
                                                        >
                                                            Lihat bukti pembayaran
                                                        </a>
                                                    )}
                                                </td>

                                                <td>
                                                    {expense.campaign?.title || 'Umum'}
                                                </td>

                                                <td className="ad-expense-amount">
                                                    {formatRupiah(expense.amount)}
                                                </td>

                                                <td>
                                                    {new Date(
                                                        expense.created_at
                                                    ).toLocaleDateString('id-ID', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                                </td>

                                                <td>
                                                    <div className="ad-expense-status-wrapper">
                                                        <span
                                                            className={`ad-expense-status ${expense.approval_status}`}
                                                        >
                                                            {statusLabel[expense.approval_status] ||
                                                                expense.approval_status}
                                                        </span>

                                                        {expense.approval_status === 'approved' && (
                                                            <>
                                                                <small>
                                                                    Pembayaran:{' '}
                                                                    {paymentStatusLabel[
                                                                        expense.payment_status || 'unpaid'
                                                                    ] || 'Belum Dibayar'}
                                                                </small>

                                                                {expense.payment_status !== 'paid' && (
                                                                    <form
                                                                        onSubmit={(e) => submitPayment(e, expense.id)}
                                                                        className="ad-expense-payment-form"
                                                                    >
                                                                        <label>
                                                                            Sumber Pembayaran *
                                                                        </label>

                                                                        <select
                                                                            value={paymentSources[expense.id] || ''}
                                                                            onChange={(e) =>
                                                                                setPaymentSources((prev) => ({
                                                                                    ...prev,
                                                                                    [expense.id]: e.target.value,
                                                                                }))
                                                                            }
                                                                            required
                                                                        >
                                                                            <option value="">
                                                                                Pilih sumber pembayaran
                                                                            </option>
                                                                            <option value="cash">
                                                                                Kas
                                                                            </option>
                                                                            <option value="bank">
                                                                                Rekening Bank
                                                                            </option>
                                                                        </select>

                                                                        {props.errors?.payment_source && (
                                                                            <small className="ad-expense-error">
                                                                                {props.errors.payment_source}
                                                                            </small>
                                                                        )}

                                                                        <label>
                                                                            Bukti Pembayaran *
                                                                        </label>

                                                                        <input
                                                                            type="file"
                                                                            accept=".jpg,.jpeg,.png,.pdf"
                                                                            onChange={(e) =>
                                                                                setPaymentProofs((prev) => ({
                                                                                    ...prev,
                                                                                    [expense.id]: e.target.files?.[0] || null,
                                                                                }))
                                                                            }
                                                                            required
                                                                        />

                                                                        {props.errors?.proof && (
                                                                            <small className="ad-expense-error">
                                                                                {props.errors.proof}
                                                                            </small>
                                                                        )}

                                                                        <button
                                                                            type="submit"
                                                                            disabled={
                                                                                paymentProcessing === expense.id ||
                                                                                !paymentProofs[expense.id] ||
                                                                                !paymentSources[expense.id]
                                                                            }
                                                                        >
                                                                            {paymentProcessing === expense.id
                                                                                ? 'Memproses pembayaran...'
                                                                                : 'Catat Pembayaran'}
                                                                        </button>
                                                                    </form>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="5"
                                                className="ad-expense-empty"
                                            >
                                                <Wallet size={30} />
                                                <strong>
                                                    Belum ada pengajuan pengeluaran
                                                </strong>
                                                <span>
                                                    Pengajuan yang kamu kirim akan
                                                    muncul di sini.
                                                </span>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {expenses.links && expenses.last_page > 1 && (
                            <div className="ad-expense-pagination">
                                <span>
                                    Menampilkan {expenses.from}–{expenses.to} dari{' '}
                                    {expenses.total} pengajuan
                                </span>

                                <div>
                                    {expenses.links.map((link, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            disabled={!link.url || link.active}
                                            className={link.active ? 'active' : ''}
                                            onClick={() =>
                                                router.visit(link.url, {
                                                    preserveScroll: true,
                                                })
                                            }
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </AdminLayout>
        </>
    );
}
