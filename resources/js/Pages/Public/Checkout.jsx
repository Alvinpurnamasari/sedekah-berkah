
import React, { useEffect, useMemo, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import '../../../css/checkout.css';

const formatRupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

const nominalPilihan = [5000, 10000, 25000, 50000, 100000];

const paymentMethods = [
    {
        value: 'qris',
        symbol: '▦',
        title: 'QRIS',
        description: 'Semua e-wallet dan mobile banking',
    },
    {
        value: 'bank_transfer',
        symbol: '▤',
        title: 'Transfer Bank',
        description: 'Transfer melalui rekening bank tujuan',
    },
    {
        value: 'ewallet',
        symbol: '▣',
        title: 'E-Wallet',
        description: 'GoPay, OVO, DANA, dan lainnya',
    },
];

export default function Checkout({
    slug,
    donationAccounts = [],
}) {
    const [campaign, setCampaign] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Nominal donasi
    const [amount, setAmount] = useState(25000);
    const [customAmount, setCustomAmount] = useState('');

    // Data donatur
    const [targetId, setTargetId] = useState('');
    const [name, setName] = useState('');
    const [contact, setContact] = useState('');
    const [anon, setAnon] = useState(false);
    const [message, setMessage] = useState('');

    // Dukungan operasional
    const [supportEnabled, setSupportEnabled] = useState(false);
    const [supportAmount, setSupportAmount] = useState(0);

    // Metode pembayaran
    const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
    const [selectedDonationAccountId, setSelectedDonationAccountId] =
        useState('');

    // Status transaksi
    const [busy, setBusy] = useState(false);
    const [result, setResult] = useState(null);

    // Upload bukti transfer
const [proofFile, setProofFile] = useState(null);
const [proofBusy, setProofBusy] = useState(false);
const [proofMessage, setProofMessage] = useState('');
const [proofError, setProofError] = useState('');
    // Status salin nomor rekening
    const [copiedAccountId, setCopiedAccountId] = useState(null);

    // Rekening yang dipilih
    const selectedDonationAccount = donationAccounts.find(
        (account) =>
            String(account.id) === String(selectedDonationAccountId)
    );

    // Mengambil data kampanye
    useEffect(() => {
        axios
            .get(`/api/v1/campaigns/${slug}`)
            .then((response) => {
                const data = response.data.data;

                setCampaign(data);

                if (data.beneficiary_targets?.length) {
                    setTargetId(String(data.beneficiary_targets[0].id));
                }
            })
            .catch(() => {
                setError('Kampanye tidak ditemukan atau belum tersedia.');
            })
            .finally(() => {
                setLoading(false);
            });
    }, [slug]);

    // Perhitungan nominal
    const selectedAmount = Number(customAmount || amount);
    const operationalAmount = supportEnabled
        ? Number(supportAmount || 0)
        : 0;

    const total = useMemo(
        () => selectedAmount + operationalAmount,
        [selectedAmount, operationalAmount]
    );

    // Target penerima yang dipilih
    const selectedTarget = campaign?.beneficiary_targets?.find(
        (target) => String(target.id) === String(targetId)
    );

    // Salin nomor rekening
    async function copyAccountNumber(account) {
        try {
            await navigator.clipboard.writeText(account.account_number);

            setCopiedAccountId(account.id);

            alert('Nomor rekening berhasil disalin.');
        } catch (error) {
            alert(
                'Gagal menyalin nomor rekening. Silakan salin secara manual.'
            );
        }
    }

    // Memilih metode pembayaran
    function handlePaymentMethodChange(method) {
        setPaymentMethod(method);

        if (method !== 'bank_transfer') {
            setSelectedDonationAccountId('');
        }
    }

    // Membuat transaksi donasi
    async function submitDonation(event) {
        event.preventDefault();

        if (!campaign) {
            return;
        }

        if (
            !Number.isInteger(selectedAmount) ||
            selectedAmount < 5000
        ) {
            alert('Nominal sedekah minimal Rp5.000.');
            return;
        }

        if (!Number.isInteger(operationalAmount) || operationalAmount < 0) {
            alert('Nominal dukungan operasional tidak valid.');
            return;
        }

        if (!name.trim()) {
            alert('Silakan isi nama pensedekah.');
            return;
        }

        // QRIS dan E-Wallet belum diintegrasikan
        if (paymentMethod !== 'bank_transfer') {
            alert(
                'Metode pembayaran ini belum tersedia. Silakan pilih Transfer Bank.'
            );
            return;
        }

        if (!selectedDonationAccountId) {
            alert('Silakan pilih rekening bank tujuan transfer.');
            return;
        }

        setBusy(true);

        try {
            const response = await axios.post('/api/v1/donations', {
                campaign_id: campaign.id,

                beneficiary_target_id: targetId || null,

                donor: {
                    name: name.trim(),
                    email: contact.includes('@')
                        ? contact.trim()
                        : null,
                    phone: contact.includes('@')
                        ? null
                        : contact.trim() || null,
                },

                donation_amount: selectedAmount,
                operational_support: operationalAmount,

                is_anonymous: anon,
                message: message.trim() || null,

                payment_method: paymentMethod,
                donation_account_id: selectedDonationAccountId,
            });

            setResult(response.data.data);
        } catch (err) {
            const validationErrors = err.response?.data?.errors;

            const firstError = validationErrors
                ? Object.values(validationErrors).flat()[0]
                : null;

            alert(
                firstError ||
                err.response?.data?.message ||
                'Transaksi belum berhasil dibuat. Silakan coba kembali.'
            );
        } finally {
            setBusy(false);
        }
    }

    // Upload bukti transfer
async function uploadTransferProof(event) {
    event.preventDefault();

    if (!result || !proofFile) {
        setProofError('Silakan pilih foto bukti transfer terlebih dahulu.');
        return;
    }

    const allowedTypes = ['image/jpeg', 'image/png'];

    if (!allowedTypes.includes(proofFile.type)) {
        setProofError('Format file harus JPG, JPEG, atau PNG.');
        return;
    }

    if (proofFile.size > 2 * 1024 * 1024) {
        setProofError('Ukuran file maksimal 2 MB.');
        return;
    }

    setProofBusy(true);
    setProofError('');
    setProofMessage('');

    try {
        const formData = new FormData();
        formData.append('proof', proofFile);

        const response = await axios.post(
            `/api/v1/donations/${encodeURIComponent(result.donation_code)}/proof`,
            formData
        );

        setProofMessage(
            response.data.message || 'Bukti transfer berhasil diunggah.'
        );

        setProofFile(null);
    } catch (err) {
        const validationErrors = err.response?.data?.errors;

        const firstError = validationErrors
            ? Object.values(validationErrors).flat()[0]
            : null;

        setProofError(
            firstError ||
            err.response?.data?.message ||
            'Bukti transfer gagal diunggah. Silakan coba kembali.'
        );
    } finally {
        setProofBusy(false);
    }
}

    // Tampilan loading
    if (loading) {
        return (
            <div className="checkout-loading">
                Memuat kampanye...
            </div>
        );
    }

    // Tampilan error
    if (error || !campaign) {
        return (
            <div className="checkout-loading">
                <p>{error || 'Kampanye tidak ditemukan.'}</p>

                <Link href="/program">
                    Kembali ke program
                </Link>
            </div>
        );
    }

    return (
        <main className="checkout-page">
            <Head title={`Checkout - ${campaign.title}`} />

            {/* HEADER */}
            <header className="checkout-header">
                <Link href="/" className="checkout-brand">
                    <span className="checkout-brand-icon">♥</span>

                    <span>
                        Sedekah<br />
                        <b>Berkah</b>
                    </span>
                </Link>

                <nav>
                    <Link href="/">Beranda</Link>
                    <Link href="/program">Program</Link>
                    <Link href="/transparansi">Laporan</Link>
                </nav>
            </header>

            <div className="checkout-container">
                <Link
                    href={`/program/${slug}`}
                    className="checkout-back"
                >
                    ← Kembali ke kampanye
                </Link>

                {/* HALAMAN SUKSES */}
                {result ? (
                    <section className="checkout-success">
                        <div className="success-icon">✓</div>

                        <h1>Terima kasih atas sedekah Anda!</h1>

                        <p>
                            Transaksi donasi berhasil dibuat dan menunggu pembayaran.
                        </p>

                        <div className="success-detail">
                            <span>Kode donasi</span>

                            <strong>{result.donation_code}</strong>

                            <span>Total pembayaran</span>

                            <strong className="success-total">
                                {formatRupiah(result.total_amount)}
                            </strong>

                            <span>Metode pembayaran</span>

                            <strong>Transfer Bank</strong>

                            <span>Status</span>

                            <strong>Menunggu pembayaran</strong>
                        </div>

                        {result.bank_account && (
                            <div className="selected-account-detail">
                                <strong>
                                    Silakan transfer ke rekening berikut
                                </strong>

                                <h3>
                                    {result.bank_account.bank_name}
                                </h3>

                                <div className="donation-account-number">
                                    {result.bank_account.account_number}
                                </div>

                                <p>
                                    Atas nama: {result.bank_account.account_holder}
                                </p>

                                <button
                                    type="button"
                                    className="donation-account-copy"
                                    onClick={() =>
                                        copyAccountNumber({
                                            id: 'success',
                                            account_number:
                                                result.bank_account.account_number,
                                        })
                                    }
                                >
                                    {copiedAccountId === 'success'
                                        ? 'Tersalin'
                                        : 'Salin Nomor Rekening'}
                                </button>
                            </div>
                        )}

                        <p className="checkout-notice">
                            Silakan transfer sesuai total pembayaran.
                            Donasi akan diverifikasi oleh pengelola setelah
                            pembayaran diterima.
                        </p>
                        {/* UPLOAD BUKTI TRANSFER */}
                            <div className="transfer-proof-section">
                                <h3>Konfirmasi Pembayaran</h3>

                                <p>
                                    Setelah melakukan transfer, silakan unggah
                                    bukti pembayaran Anda.
                                </p>

                                <form onSubmit={uploadTransferProof}>
                                    <label className="checkout-label">
                                        Foto bukti transfer

                                        <input
                                            type="file"
                                            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                                            onChange={(event) => {
                                                setProofFile(event.target.files?.[0] || null);
                                                setProofError('');
                                                setProofMessage('');
                                            }}
                                            disabled={proofBusy}
                                        />
                                    </label>

                                    {proofFile && (
                                        <p>
                                            File dipilih: <strong>{proofFile.name}</strong>
                                        </p>
                                    )}

                                    {proofError && (
                                        <p role="alert" style={{ color: '#dc2626' }}>
                                            {proofError}
                                        </p>
                                    )}

                                    {proofMessage && (
                                        <p role="status" style={{ color: '#15803d' }}>
                                            {proofMessage}
                                        </p>
                                    )}

                                    <button
                                        type="submit"
                                        className="checkout-primary"
                                        disabled={!proofFile || proofBusy}
                                    >
                                        {proofBusy
                                            ? 'Mengunggah...'
                                            : 'Unggah Bukti Transfer'}
                                    </button>

                                    <small>
                                        Format JPG, JPEG, atau PNG. Maksimal 2 MB.
                                    </small>
                                </form>
                            </div>

                        <Link
                            href="/program"
                            className="checkout-primary"
                        >
                            Lihat program lainnya
                        </Link>
                    </section>
                ) : (
                    <form
                        onSubmit={submitDonation}
                        className="checkout-layout"
                    >
                        <div className="checkout-main">

                            {/* INFORMASI KAMPANYE */}
                            <section className="checkout-card campaign-summary">
                                <div className="campaign-thumb">
                                    ♥
                                </div>

                                <div>
                                    <span className="checkout-eyebrow">
                                        {campaign.category?.name ||
                                            'Program Sedekah'}
                                    </span>

                                    <h2>{campaign.title}</h2>

                                    <p>
                                        {campaign.location || 'Yogyakarta'}
                                    </p>
                                </div>
                            </section>

                            {/* TARGET PENERIMA */}
                            <section className="checkout-card">
                                <h2>
                                    <span>1</span>
                                    Pilih target penerima
                                </h2>

                                <p className="checkout-description">
                                    Tentukan kelompok penerima manfaat
                                    dari sedekah Anda.
                                </p>

                                <div className="target-options">
                                    {(campaign.beneficiary_targets || []).map(
                                        (target) => (
                                            <button
                                                type="button"
                                                key={target.id}
                                                className={`target-option ${
                                                    String(targetId) ===
                                                    String(target.id)
                                                        ? 'selected'
                                                        : ''
                                                }`}
                                                onClick={() =>
                                                    setTargetId(String(target.id))
                                                }
                                            >
                                                <strong>{target.name}</strong>

                                                <small>
                                                    {target.description ||
                                                        'Penerima manfaat kampanye'}
                                                </small>

                                                {String(targetId) ===
                                                    String(target.id) && (
                                                    <span className="target-check">
                                                        ✓
                                                    </span>
                                                )}
                                            </button>
                                        )
                                    )}

                                    <button
                                        type="button"
                                        className={`target-option ${
                                            targetId === '' ? 'selected' : ''
                                        }`}
                                        onClick={() => setTargetId('')}
                                    >
                                        <strong>
                                            Serahkan kepada Pengelola
                                        </strong>

                                        <small>
                                            Pengelola menyalurkan sesuai kebutuhan.
                                        </small>

                                        {targetId === '' && (
                                            <span className="target-check">
                                                ✓
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </section>

                            {/* NOMINAL SEDEKAH */}
                            <section className="checkout-card">
                                <h2>
                                    <span>2</span>
                                    Nominal sedekah
                                </h2>

                                <div className="amount-options">
                                    {nominalPilihan.map((value) => (
                                        <button
                                            type="button"
                                            key={value}
                                            className={
                                                !customAmount &&
                                                amount === value
                                                    ? 'amount-option selected'
                                                    : 'amount-option'
                                            }
                                            onClick={() => {
                                                setAmount(value);
                                                setCustomAmount('');
                                            }}
                                        >
                                            {formatRupiah(value)}
                                        </button>
                                    ))}
                                </div>

                                <label className="checkout-label">
                                    Nominal lainnya (Rp)

                                    <input
                                        type="number"
                                        min="5000"
                                        step="1000"
                                        value={customAmount}
                                        onChange={(event) =>
                                            setCustomAmount(event.target.value)
                                        }
                                        placeholder="Masukkan nominal sendiri"
                                    />
                                </label>
                            </section>

                            {/* DATA PENSEDEKAH */}
                            <section className="checkout-card">
                                <h2>
                                    <span>3</span>
                                    Data pensedekah
                                </h2>

                                <label className="checkout-label">
                                    Nama lengkap

                                    <input
                                        type="text"
                                        required
                                        maxLength="120"
                                        value={name}
                                        onChange={(event) =>
                                            setName(event.target.value)
                                        }
                                        placeholder="Nama lengkap atau Hamba Allah"
                                    />
                                </label>

                                <label className="checkout-label">
                                    Email atau nomor WhatsApp

                                    <input
                                        type="text"
                                        value={contact}
                                        onChange={(event) =>
                                            setContact(event.target.value)
                                        }
                                        placeholder="Email atau nomor WhatsApp"
                                    />
                                </label>

                                <label className="checkout-check">
                                    <input
                                        type="checkbox"
                                        checked={anon}
                                        onChange={(event) =>
                                            setAnon(event.target.checked)
                                        }
                                    />

                                    <span>
                                        Sembunyikan nama saya (Hamba Allah)
                                    </span>
                                </label>

                                <label className="checkout-label">
                                    Doa atau pesan (opsional)

                                    <textarea
                                        rows="3"
                                        maxLength="500"
                                        value={message}
                                        onChange={(event) =>
                                            setMessage(event.target.value)
                                        }
                                        placeholder="Tuliskan doa atau pesan..."
                                    />
                                </label>

                                {/* DUKUNGAN OPERASIONAL */}
                                <div className="support-box">
                                    <label className="checkout-check">
                                        <input
                                            type="checkbox"
                                            checked={supportEnabled}
                                            onChange={(event) => {
                                                setSupportEnabled(
                                                    event.target.checked
                                                );

                                                if (!event.target.checked) {
                                                    setSupportAmount(0);
                                                }
                                            }}
                                        />

                                        <span>
                                            <strong>
                                                Dukung biaya operasional (sukarela)
                                            </strong>

                                            <small>
                                                Bantuan untuk relawan, logistik,
                                                dan dokumentasi. Tidak wajib.
                                            </small>
                                        </span>
                                    </label>

                                    {supportEnabled && (
                                        <label className="checkout-label">
                                            Nominal dukungan operasional (Rp)

                                            <input
                                                type="number"
                                                min="0"
                                                step="1000"
                                                value={supportAmount}
                                                onChange={(event) =>
                                                    setSupportAmount(
                                                        event.target.value
                                                    )
                                                }
                                                placeholder="Masukkan nominal dukungan"
                                            />
                                        </label>
                                    )}
                                </div>
                            </section>

                            {/* METODE PEMBAYARAN */}
                            <section className="checkout-card">
                                <h2>
                                    <span>4</span>
                                    Metode pembayaran
                                </h2>

                                <div className="payment-options">
                                    {paymentMethods.map((method) => (
                                        <button
                                            type="button"
                                            key={method.value}
                                            className={`payment-option ${
                                                paymentMethod === method.value
                                                    ? 'selected'
                                                    : ''
                                            }`}
                                            onClick={() =>
                                                handlePaymentMethodChange(
                                                    method.value
                                                )
                                            }
                                        >
                                            <span className="payment-symbol">
                                                {method.symbol}
                                            </span>

                                            <span>
                                                <strong>{method.title}</strong>

                                                <small>
                                                    {method.description}
                                                </small>
                                            </span>

                                            <span className="payment-radio">
                                                {paymentMethod === method.value
                                                    ? '●'
                                                    : '○'}
                                            </span>
                                        </button>
                                    ))}
                                </div>

                                {/* PILIH REKENING BANK */}
                                {paymentMethod === 'bank_transfer' && (
                                    <div className="donation-accounts">
                                        <h3>Pilih Bank Tujuan</h3>

                                        <p className="donation-accounts-description">
                                            Pilih salah satu rekening aktif
                                            untuk tujuan transfer donasi.
                                        </p>

                                        {donationAccounts.length > 0 ? (
                                            <div className="donation-account-list">                        
                                            {donationAccounts.map((account) => {
                                                const isSelected =
                                                    String(selectedDonationAccountId) === String(account.id);

                                                return (
                                                    <div
                                                        key={account.id}
                                                        role="button"
                                                        tabIndex={0}
                                                        aria-pressed={isSelected}
                                                        className={`donation-account-item ${
                                                            isSelected ? 'selected' : ''
                                                        }`}
                                                        onClick={() => setSelectedDonationAccountId(account.id)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' || e.key === ' ') {
                                                                e.preventDefault();
                                                                setSelectedDonationAccountId(account.id);
                                                            }
                                                        }}
                                                    >
                                                        <div className="donation-account-info">
                                                            <strong>{account.bank_name}</strong>

                                                            <span className="donation-account-number">
                                                                {account.account_number}
                                                            </span>

                                                            <span>
                                                                Atas nama: {account.account_holder}
                                                            </span>

                                                            {account.description && (
                                                                <small>{account.description}</small>
                                                            )}

                                                            {isSelected && (
                                                                <button
                                                                    type="button"
                                                                    className="donation-account-copy"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        copyAccountNumber(account);
                                                                    }}
                                                                >
                                                                    {copiedAccountId === account.id
                                                                        ? 'Tersalin'
                                                                        : 'Salin Nomor Rekening'}
                                                                </button>
                                                            )}
                                                        </div>

                                                        <span className="payment-radio">
                                                            {isSelected ? '●' : '○'}
                                                        </span>
                                                    </div>
                                                );
                                            })}

                                            </div>
                                        ) : (
                                            <p className="donation-accounts-empty">
                                                Belum ada rekening aktif.
                                                Silakan hubungi pengelola.
                                            </p>
                                        )}

                                    </div>
                                )}

                                {/* INFORMASI QRIS */}
                                {paymentMethod === 'qris' && (
                                    <p className="checkout-notice">
                                        Pembayaran QRIS belum tersedia.
                                        Silakan gunakan Transfer Bank
                                        untuk menyelesaikan donasi saat ini.
                                    </p>
                                )}

                                {/* INFORMASI EWALLET */}
                                {paymentMethod === 'ewallet' && (
                                    <p className="checkout-notice">
                                        Pembayaran E-Wallet belum tersedia.
                                        Silakan gunakan Transfer Bank
                                        untuk menyelesaikan donasi saat ini.
                                    </p>
                                )}

                                {paymentMethod === 'bank_transfer' && (
                                    <p className="checkout-notice">
                                        Transfer dilakukan secara manual.
                                        Donasi akan berstatus menunggu pembayaran
                                        sampai pengelola melakukan verifikasi.
                                    </p>
                                )}
                            </section>
                        </div>

                        {/* RINGKASAN PEMBAYARAN */}
                        <aside className="checkout-sidebar">
                            <div className="checkout-card payment-summary">
                                <h3>Ringkasan sedekah</h3>

                                <div className="summary-campaign">
                                    {campaign.title}
                                </div>

                                <div className="summary-line">
                                    <span>Sedekah</span>

                                    <strong>
                                        {formatRupiah(selectedAmount)}
                                    </strong>
                                </div>

                                <div className="summary-line">
                                    <span>Dukungan operasional</span>

                                    <strong>
                                        {formatRupiah(operationalAmount)}
                                    </strong>
                                </div>

                                <div className="summary-line">
                                    <span>Penerima</span>

                                    <strong>
                                        {selectedTarget?.name ||
                                            'Dikelola pengelola'}
                                    </strong>
                                </div>

                                <div className="summary-total">
                                    <span>Total pembayaran</span>

                                    <strong>{formatRupiah(total)}</strong>
                                </div>

                                {paymentMethod === 'bank_transfer' &&
                                    selectedDonationAccount && (
                                        <div className="summary-line">
                                            <span>Bank tujuan</span>

                                            <strong>
                                                {selectedDonationAccount.bank_name}
                                            </strong>
                                        </div>
                                    )}

                                <button
                                    type="submit"
                                    className="checkout-primary"
                                    disabled={
                                        busy ||
                                        (paymentMethod === 'bank_transfer' &&
                                            donationAccounts.length === 0)
                                    }
                                >
                                    {busy
                                        ? 'Memproses...'
                                        : 'Buat Transaksi'}
                                </button>

                                <p className="checkout-secure">
                                    Donasi tanpa harus membuat akun.
                                </p>
                            </div>
                        </aside>
                    </form>
                )}
            </div>
        </main>
    );
}
