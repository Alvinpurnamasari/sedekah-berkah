import React, { useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    LayoutDashboard, Megaphone, Users, Receipt, HandHeart,
    Images, Wallet, FileText, Menu, X, Bell, LogOut,
    ShieldCheck, ClipboardList, Plus, Upload, Clock3,
    CheckCircle2, XCircle, FileImage, MapPin
} from 'lucide-react';
import '../../../../css/admin.css';
import '../../../../css/admin-expenses.css';

const adminMenus = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, url: '/admin' },
    { id: 'campaigns', label: 'Manajemen Program', icon: Megaphone },
    { id: 'beneficiaries', label: 'Target Penerima', icon: Users },
    { id: 'transactions', label: 'Transaksi', icon: Receipt },
    { id: 'distribution', label: 'Penyaluran Dana', icon: HandHeart },
    { id: 'documentation', label: 'Dokumentasi', icon: Images },
    { id: 'expenses', label: 'Pengeluaran', icon: Wallet, url: '/admin/pengeluaran' },
    { id: 'reports', label: 'Laporan Kegiatan', icon: FileText },
];

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

export default function Index({ expenses, campaigns }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { props } = usePage();

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        campaign_id: '',
        expense_category: '',
        description: '',
        amount: '',
        receipt: null,
    });

    function submitExpense(e) {
        e.preventDefault();

        post('/admin/pengeluaran', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    }

    function logout() {
        router.post('/logout');
    }

    return (
        <>
            <Head title="Pengeluaran Admin - Sedekah Berkah" />

            <div className="ad-app">
                {sidebarOpen && (
                    <button
                        className="ad-overlay"
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Tutup menu"
                    />
                )}

                <aside className={`ad-sidebar ${sidebarOpen ? 'show' : ''}`}>
                    <div className="ad-brand">
                        <div className="ad-brand-icon">♥</div>
                        <div>
                            <strong>Sedekah Berkah</strong>
                            <small>Administration</small>
                        </div>
                        <button
                            className="ad-close"
                            onClick={() => setSidebarOpen(false)}
                            aria-label="Tutup menu"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="ad-role">
                        <ShieldCheck size={17} />
                        ADMIN OPERASIONAL
                    </div>

                    <div className="ad-menu-title">MENU OPERASIONAL</div>

                    <nav className="ad-navigation">
                        {adminMenus.map(item => {
                            const Icon = item.icon;
                            const active = item.id === 'expenses';

                            return item.url ? (
                                <button
                                    key={item.id}
                                    type="button"
                                    className={`ad-menu-item ${active ? 'active' : 'upcoming'} ad-menu-link`}
                                    onClick={() => {
                                        router.visit(item.url);
                                        setSidebarOpen(false);
                                    }}
                                >
                                    <Icon size={19} />
                                    <span>{item.label}</span>
                                    {active && <span className="ad-active-dot" />}
                                    {!active && <span className="ad-coming">Buka</span>}
                                </button>
                            ) : (
                                <div
                                    key={item.id}
                                    className="ad-menu-item upcoming"
                                    title="Modul akan diaktifkan pada tahap berikutnya"
                                >
                                    <Icon size={19} />
                                    <span>{item.label}</span>
                                    <span className="ad-coming">Segera</span>
                                </div>
                            );
                        })}
                    </nav>

                    <div className="ad-sidebar-bottom">
                        <div className="ad-sidebar-note">
                            <ClipboardList size={20} />
                            <div>
                                <strong>Area operasional</strong>
                                <small>Kelola kegiatan dan laporan</small>
                            </div>
                        </div>

                        <button className="ad-logout" onClick={logout}>
                            <LogOut size={18} />
                            Keluar
                        </button>
                    </div>
                </aside>

                <div className="ad-main">
                    <header className="ad-header">
                        <div className="ad-header-left">
                            <button
                                className="ad-mobile-menu"
                                onClick={() => setSidebarOpen(true)}
                                aria-label="Buka menu"
                            >
                                <Menu size={22} />
                            </button>
                            <div>
                                <div className="ad-breadcrumb">
                                    Admin / Pengeluaran
                                </div>
                                <h1>Pengeluaran Operasional</h1>
                            </div>
                        </div>

                        <div className="ad-header-right">
                            <span className="ad-admin-status">
                                <span />
                                Area Admin
                            </span>
                            <button className="ad-notification" title="Notifikasi">
                                <Bell size={19} />
                            </button>
                            <div className="ad-avatar">AD</div>
                        </div>
                    </header>

                    <main className="ad-content">
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
                                        <p>Lengkapi informasi pengeluaran di bawah ini.</p>
                                    </div>
                                </div>

                                <form onSubmit={submitExpense}>
                                    <div className="ad-expense-field">
                                        <label htmlFor="expense-category">
                                            Kategori pengeluaran *
                                        </label>
                                        <select
                                            id="expense-category"
                                            value={data.expense_category}
                                            onChange={e => setData('expense_category', e.target.value)}
                                            required
                                        >
                                            <option value="">Pilih kategori</option>
                                            <option value="Konsumsi">Konsumsi</option>
                                            <option value="Transportasi">Transportasi</option>
                                            <option value="Perlengkapan">Perlengkapan</option>
                                            <option value="Dokumentasi">Dokumentasi</option>
                                            <option value="Distribusi Bantuan">Distribusi Bantuan</option>
                                            <option value="Operasional Lapangan">Operasional Lapangan</option>
                                            <option value="Lainnya">Lainnya</option>
                                        </select>
                                        {errors.expense_category && (
                                            <small className="ad-expense-error">{errors.expense_category}</small>
                                        )}
                                    </div>

                                    <div className="ad-expense-field">
                                        <label htmlFor="expense-campaign">
                                            Program terkait
                                        </label>
                                        <select
                                            id="expense-campaign"
                                            value={data.campaign_id}
                                            onChange={e => setData('campaign_id', e.target.value)}
                                        >
                                            <option value="">Pengeluaran umum / tidak terkait program</option>
                                            {campaigns.map(campaign => (
                                                <option key={campaign.id} value={campaign.id}>
                                                    {campaign.title}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.campaign_id && (
                                            <small className="ad-expense-error">{errors.campaign_id}</small>
                                        )}
                                    </div>

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
                                            onChange={e => setData('amount', e.target.value)}
                                            required
                                        />
                                        {errors.amount && (
                                            <small className="ad-expense-error">{errors.amount}</small>
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
                                            onChange={e => setData('description', e.target.value)}
                                            required
                                        />
                                        {errors.description && (
                                            <small className="ad-expense-error">{errors.description}</small>
                                        )}
                                    </div>

                                    <div className="ad-expense-field">
                                        <label htmlFor="expense-receipt">
                                            Bukti nota / transaksi
                                        </label>
                                        <label className="ad-expense-upload" htmlFor="expense-receipt">
                                            <Upload size={23} />
                                            <strong>
                                                {data.receipt ? data.receipt.name : 'Pilih file bukti'}
                                            </strong>
                                            <span>JPG, PNG, atau PDF. Maksimal 5 MB.</span>
                                        </label>
                                        <input
                                            id="expense-receipt"
                                            type="file"
                                            accept=".jpg,.jpeg,.png,.pdf"
                                            className="ad-expense-file-input"
                                            onChange={e => setData('receipt', e.target.files[0] || null)}
                                        />
                                        {errors.receipt && (
                                            <small className="ad-expense-error">{errors.receipt}</small>
                                        )}
                                    </div>

                                    <div className="ad-expense-notice">
                                        <ShieldCheck size={19} />
                                        <span>
                                            Pengajuan akan berstatus Menunggu. Dana baru
                                            mengurangi saldo setelah disetujui Superadmin.
                                        </span>
                                    </div>

                                    <button
                                        type="submit"
                                        className="ad-expense-submit"
                                        disabled={processing}
                                    >
                                        <Plus size={18} />
                                        {processing ? 'Mengirim pengajuan...' : 'Kirim Pengajuan'}
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
                                        <li>Pengajuan masuk ke daftar Superadmin.</li>
                                        <li>Superadmin memeriksa nominal dan bukti.</li>
                                        <li>Status berubah setelah keputusan dibuat.</li>
                                    </ol>
                                </div>

                                <div className="ad-expense-info-card">
                                    <div className="ad-expense-info-icon">
                                        <FileImage size={22} />
                                    </div>
                                    <h3>Ketentuan bukti</h3>
                                    <p>
                                        Sertakan foto nota atau dokumen transaksi
                                        yang jelas agar pengajuan lebih mudah diperiksa.
                                    </p>
                                </div>
                            </section>
                        </div>

                        <section className="ad-expense-history">
                            <div className="ad-expense-history-heading">
                                <div>
                                    <h3>Riwayat Pengajuan Saya</h3>
                                    <p>Daftar pengeluaran yang pernah diajukan oleh akun ini.</p>
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
                                        {expenses.data.length > 0 ? expenses.data.map(expense => (
                                            <tr key={expense.id}>
                                                <td>
                                                    <strong>{expense.expense_category}</strong>
                                                    <small>{expense.description}</small>
                                                    {expense.receipt_file && (
                                                        <a
                                                            href={`/storage/${expense.receipt_file}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="ad-expense-receipt-link"
                                                        >
                                                            Lihat bukti
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
                                                    {new Date(expense.created_at).toLocaleDateString('id-ID', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                                </td>                                               
                                                <td>
                                                    <span className={`ad-expense-status ${expense.approval_status}`}>
                                                        {statusLabel[expense.approval_status] || expense.approval_status}
                                                    </span>

                                                    {expense.approval_status === 'rejected' && expense.rejection_reason && (
                                                        <div className="ad-expense-rejection-reason">
                                                            <strong>Alasan penolakan:</strong>
                                                            <p>{expense.rejection_reason}</p>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="5" className="ad-expense-empty">
                                                    <Wallet size={30} />
                                                    <strong>Belum ada pengajuan pengeluaran</strong>
                                                    <span>Pengajuan yang kamu kirim akan muncul di sini.</span>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {expenses.links && expenses.last_page > 1 && (
                                <div className="ad-expense-pagination">
                                    <span>
                                        Menampilkan {expenses.from}–{expenses.to} dari {expenses.total} pengajuan
                                    </span>
                                    <div>
                                        {expenses.links.map((link, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                disabled={!link.url || link.active}
                                                className={link.active ? 'active' : ''}
                                                onClick={() => router.visit(link.url, { preserveScroll: true })}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>
                    </main>

                    <footer className="ad-footer">
                        © {new Date().getFullYear()} Sedekah Berkah
                        <span>Admin Operational Panel</span>
                    </footer>
                </div>
            </div>
        </>
    );
}

