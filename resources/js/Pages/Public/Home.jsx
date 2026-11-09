import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import '../../../css/home.css';

const programs = [
    { name: 'Jumat Berkah', slug: 'jumat-berkah', desc: 'Nasi kotak, makanan, minuman, dan sembako untuk masyarakat yang membutuhkan.', image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=900&q=85' },
    { name: 'Subuh Berkah', slug: 'subuh-berkah', desc: 'Sarapan dan minuman hangat untuk pekerja pagi dan masyarakat sekitar.', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=85' },
    { name: 'Sedekah Jalanan', slug: 'sedekah-jalanan', desc: 'Bantuan langsung untuk pemulung, tukang becak, pengamen, lansia, dan pekerja jalanan.', image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=900&q=85' },
];

const campaigns = [
    { program: 'Sedekah Jalanan', title: 'Paket Makan Siang untuk Pekerja Jalanan', location: 'Kawasan wisata, Yogyakarta', collected: 0, target: 3500000, donors: 0, targetPeople: 100, slug: 'sedekah-jalanan', image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=900&q=85' },
    { program: 'Subuh Berkah', title: 'Roti dan Minuman untuk Pengamen Jalanan', location: 'Simpang Tugu, Yogyakarta', collected: 360000, target: 2500000, donors: 1, targetPeople: 150, slug: 'subuh-berkah', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=85' },
    { program: 'Jumat Berkah', title: 'Bantuan Makanan untuk Warga Membutuhkan', location: 'Kota Yogyakarta', collected: 2440000, target: 4000000, donors: 3, targetPeople: 200, slug: 'jumat-berkah', image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=900&q=85' },
];

const photos = [
    ['Kunjungan relawan ke rumah warga', 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=85'],
    ['Paket sembako untuk warga', 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=85'],
    ['Makanan untuk sesama', 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=85'],
    ['Kepedulian untuk pekerja jalanan', 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=800&q=85'],
    ['Persiapan bantuan bersama relawan', 'https://images.unsplash.com/photo-1594708767771-a7502209ff51?auto=format&fit=crop&w=800&q=85'],
    ['Makanan siap dibagikan', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=85'],
];

const rupiah = (n) => new Intl.NumberFormat('id-ID').format(n);

export default function Home() {
    const [amount, setAmount] = useState(10000);
    const [menuOpen, setMenuOpen] = useState(false);
    const { url } = usePage();
    const currentPath = url.split('?')[0];

    const isActive = (path) => {
        if (path === '/program') {
            return currentPath === '/program' || currentPath.startsWith('/program/');
        }

        return currentPath === path;
    };

    return <>
        <Head title="Sedekah Berkah - Tebarkan Kebaikan" />
        <div className="sb-home">
            <header className="sb-header">
                <div className="sb-container sb-nav">
                    <Link href="/" className="sb-brand"><span className="sb-brand-icon">♥</span><span>Sedekah<br />Berkah</span></Link>
                    <button className="sb-menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Buka menu">{menuOpen ? '×' : '☰'}</button>
                    <nav className={`sb-links ${menuOpen ? 'open' : ''}`}>
                        <Link
                            href="/"
                            className={isActive('/') ? 'active' : ''}
                            onClick={() => setMenuOpen(false)}
                        >
                            Beranda
                        </Link>

                        <Link
                            href="/program"
                            className={isActive('/program') ? 'active' : ''}
                            onClick={() => setMenuOpen(false)}
                        >
                            Program
                        </Link>

                        <Link
                            href="/transparansi"
                            className={isActive('/transparansi') ? 'active' : ''}
                            onClick={() => setMenuOpen(false)}
                        >
                            Laporan
                        </Link>

                        <a href="/#tentang" onClick={() => setMenuOpen(false)}>
                            Tentang Kami
                        </a>
                    </nav>
                    <div className="sb-nav-actions"><Link href="/login" className="sb-login">Login</Link><a href="#sedekah" className="sb-button sb-nav-donate">Sedekah</a></div>
                </div>
            </header>

            <main>
                <section className="sb-hero" id="beranda">
                    <div className="sb-container sb-hero-grid">
                        <div className="sb-hero-copy">
                            <span className="sb-eyebrow">♧ &nbsp; Transparan · Yogyakarta</span>
                            <h1>Mari Tebarkan <span>Kebaikan</span> Hari Ini.</h1>
                            <p className="sb-hero-description">Pilih siapa yang ingin kamu bantu. Kami bantu salurkan dan laporkan setiap kegiatan sedekah.</p>
                            <a href="#program" className="sb-button sb-explore">Jelajahi Program →</a>
                            <div className="sb-donation-box" id="sedekah">
                                <strong>Sedekah cepat</strong>
                                <div className="sb-amounts">{[5000, 10000, 25000, 50000].map(n => <button key={n} className={amount === n ? 'sb-amount active' : 'sb-amount'} onClick={() => setAmount(n)}>{rupiah(n)}</button>)}</div>
                                <Link href={`/checkout/jumat-berkah?amount=${amount}`} className="sb-button sb-donate-button">Sedekah Sekarang Rp{rupiah(amount)} →</Link>
                            </div>
                        </div>
                        <div className="sb-hero-visual">
                            <img className="sb-hero-image" src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=85" alt="Ilustrasi kegiatan membantu sesama" />
                            <div className="sb-hero-floating"><div className="sb-floating-top">Jumat Berkah minggu ini <b>DEMO</b></div><strong>Rp3.725.000</strong><div className="sb-progress"><span style={{width:'75%'}} /></div><small>Contoh data simulasi, bukan transaksi nyata</small></div>
                        </div>
                    </div>
                </section>

                <section className="sb-container sb-stats">
                    <div><span>Total sedekah</span><strong>Rp48.650.000</strong></div>
                    <div><span>Telah disalurkan</span><strong>Rp41.200.000</strong></div>
                    <div><span>Penerima manfaat</span><strong>3.240</strong></div>
                    <div><span>Pensedekah</span><strong>1.870</strong></div>
                    <small>* Angka simulasi (DEMO), belum berasal dari transaksi sebenarnya.</small>
                </section>

                <section className="sb-section sb-program-section" id="program">
                    <div className="sb-container">
                        <div className="sb-section-heading left"><label>PROGRAM UTAMA</label><h2>Tiga jalan kebaikan</h2><p>Pilih program, lalu tentukan sendiri siapa yang ingin kamu bantu.</p></div>
                        <div className="sb-program-grid">{programs.map(p => <Link href={`/program/${p.slug}`} className="sb-program-card" key={p.slug}><img src={p.image} alt={p.name} /><div><h3>{p.name}</h3><p>{p.desc}</p><b>Lihat kampanye →</b></div></Link>)}</div>
                    </div>
                </section>

                <section className="sb-section sb-campaign-section">
                    <div className="sb-container">
                        <div className="sb-section-title-row"><div className="sb-section-heading left"><label>SALURKAN KEBAIKAN</label><h2>Kampanye yang sedang berlangsung</h2><p>Dukung target penerima manfaat melalui kampanye pilihan.</p></div><Link href="/program/jumat-berkah" className="sb-outline-button">Semua Program</Link></div>
                        <div className="sb-campaign-grid">{campaigns.map(c => {
                            const progress = Math.min(100, Math.round(c.collected / c.target * 100));
                            return <article className="sb-campaign-card" key={c.title}><img src={c.image} alt={c.title} /><div className="sb-campaign-body"><div className="sb-chip-row"><span className="sb-chip">{c.program}</span><span className="sb-chip muted-chip">Berlangsung · DEMO</span></div><h3>{c.title}</h3><p className="sb-location">⌖ &nbsp;{c.location}</p><div className="sb-fund-row"><b>Rp{rupiah(c.collected)}</b><span>dari Rp{rupiah(c.target)}</span></div><div className="sb-progress"><span style={{width:`${progress}%`}} /></div><p className="sb-campaign-meta">{progress}% tercapai · {c.donors} donatur · target {c.targetPeople} penerima</p><div className="sb-card-actions"><Link href={`/program/${c.slug}`} className="sb-outline-button">Lihat Detail</Link><Link href={`/checkout/${c.slug}`} className="sb-button">Sedekah</Link></div></div></article>;
                        })}</div>
                        <p className="sb-demo-note">Kartu kampanye dan nominal di atas merupakan contoh tampilan (DEMO).</p>
                    </div>
                </section>

                <section className="sb-section">
                    <div className="sb-container sb-info-grid">
                        <div className="sb-info-card"><label>TERBUKA DAN BERTANGGUNG JAWAB</label><h2>Laporan transparansi</h2><p>Setiap rupiah dapat ditelusuri: dana terkumpul, disalurkan, belum disalurkan, dan dukungan operasional.</p><div className="sb-money-grid"><div><span>Terkumpul</span><b>Rp8.230.000</b></div><div><span>Disalurkan</span><b>Rp3.180.000</b></div><div><span>Belum disalurkan</span><b>Rp4.992.390</b></div><div><span>Dukungan operasional</span><b>Rp180.000</b></div></div><Link href="/transparansi" className="sb-button">Buka Laporan Lengkap →</Link><small>* Angka simulasi (DEMO).</small></div>
                        <div className="sb-info-card sb-story"><label>CERITA KEBAIKAN</label><h2>Setiap bantuan punya arti.</h2><blockquote>“Nasi kotak hari Jumat itu jadi makan siang saya dan cucu.”</blockquote><p>Ilustrasi kisah penerima (DEMO), nama disamarkan.</p><div className="sb-quote">“Saya senang bisa memilih langsung siapa yang dibantu.”<small>Pensedekah (DEMO)</small></div><div className="sb-quote">“Laporannya jelas, ada foto dan rincian biaya.”<small>Pensedekah (DEMO)</small></div></div>
                    </div>
                </section>

                <section className="sb-section sb-documentation">
                    <div className="sb-container">
                        <div className="sb-section-title-row"><div className="sb-section-heading left"><label>BUKTI KEGIATAN</label><h2>Dokumentasi penyaluran</h2><p>Foto berikut merupakan ilustrasi. Dokumentasi nyata ditampilkan setelah tersedia.</p></div><Link href="/transparansi" className="sb-outline-button">Lihat Laporan</Link></div>
                        <div className="sb-photo-grid">{photos.map(([title, image]) => <article className="sb-photo-card" key={title}><img src={image} alt={title} loading="lazy" /><div><b>{title}</b><small>Ilustrasi dokumentasi</small></div></article>)}</div>
                    </div>
                </section>

                <section className="sb-about" id="tentang"><div className="sb-container sb-about-inner"><div><label>TENTANG SEDEKAH BERKAH</label><h2>Satu kebaikan, banyak kebahagiaan.</h2><p>Sedekah Berkah adalah platform sedekah digital yang berfokus pada penyaluran bantuan secara terarah dan transparan di Yogyakarta.</p></div><Link href="/transparansi" className="sb-button">Kenali laporan kami →</Link></div></section>
            </main>

            <footer className="sb-footer"><div className="sb-container"><div className="sb-footer-grid"><div><Link href="/" className="sb-brand"><span className="sb-brand-icon">♥</span><span>Sedekah<br />Berkah</span></Link><p>Satu kebaikan, banyak kebahagiaan. Platform sedekah digital yang beroperasi di Yogyakarta.</p></div><div><h4>Program</h4><a href="#program">Jumat Berkah</a><a href="#program">Subuh Berkah</a><a href="#program">Sedekah Jalanan</a></div><div><h4>Kontak</h4><span>Yogyakarta, Indonesia</span><span>halo@sedekahberkah.id (contoh)</span><span>Admin · <Link href="/login">Masuk</Link></span></div></div><div className="sb-copyright">© {new Date().getFullYear()} Sedekah Berkah · Seluruh angka simulasi ditandai DEMO.</div></div></footer>

            <nav className="sb-mobile-bottom"><a href="#beranda"><span>⌂</span>Beranda</a><a href="#program"><span>▦</span>Program</a><a href="#sedekah" className="bottom-donate"><span>♥</span>Sedekah</a><Link href="/transparansi"><span>▤</span>Laporan</Link><Link href="/login"><span>♙</span>Akun</Link></nav>
        </div>
    </>;
}
