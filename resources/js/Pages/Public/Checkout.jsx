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

export default function Checkout({ slug }) {
    const [campaign, setCampaign] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [amount, setAmount] = useState(25000);
    const [customAmount, setCustomAmount] = useState('');
    const [targetId, setTargetId] = useState('');
    const [name, setName] = useState('');
    const [contact, setContact] = useState('');
    const [anon, setAnon] = useState(false);
    const [message, setMessage] = useState('');
    const [supportEnabled, setSupportEnabled] = useState(false);
    const [supportAmount, setSupportAmount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('qris');

    const [busy, setBusy] = useState(false);
    const [result, setResult] = useState(null);

    useEffect(() => {
        axios.get(`/api/v1/campaigns/${slug}`)
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
            .finally(() => setLoading(false));
    }, [slug]);

    const selectedAmount = Number(customAmount || amount);
    const operationalAmount = supportEnabled ? Number(supportAmount || 0) : 0;

    const total = useMemo(
        () => selectedAmount + operationalAmount,
        [selectedAmount, operationalAmount]
    );

    const selectedTarget = campaign?.beneficiary_targets?.find(
        (target) => String(target.id) === String(targetId)
    );

    async function submitDonation(event) {
        event.preventDefault();

        if (!campaign) return;

        if (!Number.isInteger(selectedAmount) || selectedAmount < 5000) {
            alert('Nominal sedekah minimal Rp5.000.');
            return;
        }

        if (!name.trim()) {
            alert('Silakan isi nama pensedekah.');
            return;
        }

        setBusy(true);

        try {
            const response = await axios.post('/api/v1/donations', {
                campaign_id: campaign.id,
                beneficiary_target_id: targetId || null,
                donor: {
                    name: name.trim(),
                    email: contact.includes('@') ? contact.trim() : null,
                    phone: contact.includes('@') ? null : contact.trim() || null,
                },
                donation_amount: selectedAmount,
                operational_support: operationalAmount,
                is_anonymous: anon,
                message: message.trim() || null,
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

    if (loading) {
        return <div className="checkout-loading">Memuat kampanye...</div>;
    }

    if (error || !campaign) {
        return (
            <div className="checkout-loading">
                <p>{error || 'Kampanye tidak ditemukan.'}</p>
                <Link href="/program">Kembali ke program</Link>
            </div>
        );
    }

    return (
        <main className="checkout-page">
            <Head title={`Checkout - ${campaign.title}`} />

            <header className="checkout-header">
                <Link href="/" className="checkout-brand">
                    <span className="checkout-brand-icon">♥</span>
                    <span>Sedekah<br /><b>Berkah</b></span>
                </Link>

                <nav>
                    <Link href="/">Beranda</Link>
                    <Link href="/program">Program</Link>
                    <Link href="/transparansi">Laporan</Link>
                </nav>
            </header>

            <div className="checkout-container">
                <Link href={`/program/${slug}`} className="checkout-back">
                    ← Kembali ke kampanye
                </Link>

                {result ? (
                    <section className="checkout-success">
                        <div className="success-icon">✓</div>
                        <h1>Terima kasih atas sedekah Anda!</h1>
                        <p>Transaksi donasi berhasil dibuat dan menunggu pembayaran.</p>

                        <div className="success-detail">
                            <span>Kode donasi</span>
                            <strong>{result.donation_code}</strong>

                            <span>Total pembayaran</span>
                            <strong className="success-total">
                                {formatRupiah(result.total_amount)}
                            </strong>

                            <span>Status</span>
                            <strong>Menunggu pembayaran</strong>
                        </div>

                        <p className="checkout-notice">
                            Metode {paymentMethod.toUpperCase()} sudah dipilih,
                            tetapi instruksi pembayaran belum tersedia karena
                            payment gateway belum diintegrasikan.
                        </p>

                        <Link href="/program" className="checkout-primary">
                            Lihat program lainnya
                        </Link>
                    </section>
                ) : (
                    <form onSubmit={submitDonation} className="checkout-layout">
                        <div className="checkout-main">
                            <section className="checkout-card campaign-summary">
                                <div className="campaign-thumb">♥</div>
                                <div>
                                    <span className="checkout-eyebrow">
                                        {campaign.category?.name || 'Program Sedekah'}
                                    </span>
                                    <h2>{campaign.title}</h2>
                                    <p>{campaign.location || 'Yogyakarta'}</p>
                                </div>
                            </section>

                            <section className="checkout-card">
                                <h2><span>1</span> Pilih target penerima</h2>
                                <p className="checkout-description">
                                    Tentukan kelompok penerima manfaat dari sedekah Anda.
                                </p>

                                <div className="target-options">
                                    {(campaign.beneficiary_targets || []).map((target) => (
                                        <button
                                            type="button"
                                            key={target.id}
                                            className={`target-option ${
                                                String(targetId) === String(target.id)
                                                    ? 'selected'
                                                    : ''
                                            }`}
                                            onClick={() => setTargetId(String(target.id))}
                                        >
                                            <strong>{target.name}</strong>
                                            <small>{target.description || 'Penerima manfaat kampanye'}</small>
                                            {String(targetId) === String(target.id) && (
                                                <span className="target-check">✓</span>
                                            )}
                                        </button>
                                    ))}

                                    <button
                                        type="button"
                                        className={`target-option ${
                                            targetId === '' ? 'selected' : ''
                                        }`}
                                        onClick={() => setTargetId('')}
                                    >
                                        <strong>Serahkan kepada Pengelola</strong>
                                        <small>Pengelola menyalurkan sesuai kebutuhan.</small>
                                        {targetId === '' && (
                                            <span className="target-check">✓</span>
                                        )}
                                    </button>
                                </div>
                            </section>

                            <section className="checkout-card">
                                <h2><span>2</span> Nominal sedekah</h2>

                                <div className="amount-options">
                                    {nominalPilihan.map((value) => (
                                        <button
                                            type="button"
                                            key={value}
                                            className={
                                                !customAmount && amount === value
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
                                        onChange={(event) => setCustomAmount(event.target.value)}
                                        placeholder="Masukkan nominal sendiri"
                                    />
                                </label>
                            </section>

                            <section className="checkout-card">
                                <h2><span>3</span> Data pensedekah</h2>

                                <label className="checkout-label">
                                    Nama lengkap
                                    <input
                                        type="text"
                                        required
                                        maxLength="120"
                                        value={name}
                                        onChange={(event) => setName(event.target.value)}
                                        placeholder="Nama lengkap atau Hamba Allah"
                                    />
                                </label>

                                <label className="checkout-label">
                                    Email atau nomor WhatsApp
                                    <input
                                        type="text"
                                        value={contact}
                                        onChange={(event) => setContact(event.target.value)}
                                        placeholder="Email atau nomor WhatsApp"
                                    />
                                </label>

                                <label className="checkout-check">
                                    <input
                                        type="checkbox"
                                        checked={anon}
                                        onChange={(event) => setAnon(event.target.checked)}
                                    />
                                    <span>Sembunyikan nama saya (Hamba Allah)</span>
                                </label>

                                <label className="checkout-label">
                                    Doa atau pesan (opsional)
                                    <textarea
                                        rows="3"
                                        maxLength="500"
                                        value={message}
                                        onChange={(event) => setMessage(event.target.value)}
                                        placeholder="Tuliskan doa atau pesan..."
                                    />
                                </label>

                                <div className="support-box">
                                    <label className="checkout-check">
                                        <input
                                            type="checkbox"
                                            checked={supportEnabled}
                                            onChange={(event) => {
                                                setSupportEnabled(event.target.checked);
                                                if (!event.target.checked) setSupportAmount(0);
                                            }}
                                        />
                                        <span>
                                            <strong>Dukung biaya operasional (sukarela)</strong>
                                            <small>
                                                Bantuan untuk relawan, logistik, dan dokumentasi.
                                                Tidak wajib.
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
                                                    setSupportAmount(event.target.value)
                                                }
                                                placeholder="Masukkan nominal dukungan"
                                            />
                                        </label>
                                    )}
                                </div>
                            </section>

                            <section className="checkout-card">
                                <h2><span>4</span> Metode pembayaran</h2>

                                <div className="payment-options">
                                    {[
                                        ['qris', '▦', 'QRIS', 'Semua e-wallet dan mobile banking'],
                                        ['virtual_account', '▤', 'Virtual Account', 'Transfer melalui rekening bank'],
                                        ['ewallet', '▣', 'E-Wallet', 'GoPay, OVO, DANA, dan lainnya'],
                                    ].map(([value, symbol, title, description]) => (
                                        <button
                                            type="button"
                                            key={value}
                                            className={`payment-option ${
                                                paymentMethod === value ? 'selected' : ''
                                            }`}
                                            onClick={() => setPaymentMethod(value)}
                                        >
                                            <span className="payment-symbol">{symbol}</span>
                                            <span>
                                                <strong>{title}</strong>
                                                <small>{description}</small>
                                            </span>
                                            <span className="payment-radio">
                                                {paymentMethod === value ? '●' : '○'}
                                            </span>
                                        </button>
                                    ))}
                                </div>

                                <p className="checkout-notice">
                                    Pilihan metode pembayaran akan diaktifkan setelah
                                    integrasi payment gateway selesai.
                                </p>
                            </section>
                        </div>

                        <aside className="checkout-sidebar">
                            <div className="checkout-card payment-summary">
                                <h3>Ringkasan sedekah</h3>

                                <div className="summary-campaign">
                                    {campaign.title}
                                </div>

                                <div className="summary-line">
                                    <span>Sedekah</span>
                                    <strong>{formatRupiah(selectedAmount)}</strong>
                                </div>

                                <div className="summary-line">
                                    <span>Dukungan operasional</span>
                                    <strong>{formatRupiah(operationalAmount)}</strong>
                                </div>

                                <div className="summary-line">
                                    <span>Penerima</span>
                                    <strong>{selectedTarget?.name || 'Dikelola pengelola'}</strong>
                                </div>

                                <div className="summary-total">
                                    <span>Total pembayaran</span>
                                    <strong>{formatRupiah(total)}</strong>
                                </div>

                                <button
                                    type="submit"
                                    className="checkout-primary"
                                    disabled={busy}
                                >
                                    {busy ? 'Memproses...' : 'Buat Transaksi'}
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
