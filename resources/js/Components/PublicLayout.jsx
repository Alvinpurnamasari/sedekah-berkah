import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import '../../css/home.css';

export default function PublicLayout({ children }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const { url } = usePage();
    const currentPath = url.split('?')[0];

    const isActive = (path) => {
        if (path === '/program') {
            return currentPath === '/program' || currentPath.startsWith('/program/');
        }

        return currentPath === path;
    };

    return (
        <div className="sb-home">
            <header className="sb-header">
                <div className="sb-container sb-nav">
                    <Link href="/" className="sb-brand">
                        <span className="sb-brand-icon">♥</span>
                        <span>Sedekah<br />Berkah</span>
                    </Link>

                    <button
                        className="sb-menu-button"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Buka menu"
                    >
                        {menuOpen ? '×' : '☰'}
                    </button>

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

                        <a
                            href="/#tentang"
                            className={url.includes('#tentang') ? 'active' : ''}
                            onClick={() => setMenuOpen(false)}
                        >
                            Tentang Kami
                        </a>
                    </nav>

                    <div className="sb-nav-actions">
                        <Link href="/login" className="sb-login">Login</Link>
                        <Link href="/#sedekah" className="sb-button sb-nav-donate">
                            Sedekah
                        </Link>
                    </div>
                </div>
            </header>

            {children}

            <footer className="sb-footer">
                <div className="sb-container">
                    <div className="sb-footer-grid">
                        <div>
                            <Link href="/" className="sb-brand">
                                <span className="sb-brand-icon">♥</span>
                                <span>Sedekah<br />Berkah</span>
                            </Link>
                            <p>
                                Satu kebaikan, banyak kebahagiaan.
                                Platform sedekah digital yang beroperasi di Yogyakarta.
                            </p>
                        </div>

                        <div>
                            <h4>Program</h4>
                            <Link href="/program/jumat-berkah">Jumat Berkah</Link>
                            <Link href="/program/subuh-berkah">Subuh Berkah</Link>
                            <Link href="/program/sedekah-jalanan">Sedekah Jalanan</Link>
                        </div>

                        <div>
                            <h4>Kontak</h4>
                            <span>Yogyakarta, Indonesia</span>
                            <span>halo@sedekahberkah.id (contoh)</span>
                            <span>Admin · <Link href="/login">Masuk</Link></span>
                        </div>
                    </div>

                    <div className="sb-copyright">
                        © {new Date().getFullYear()} Sedekah Berkah
                    </div>
                </div>
            </footer>

            <nav className="sb-mobile-bottom">
                <Link href="/">
                    <span>⌂</span>Beranda
                </Link>
                <Link href="/program">
                    <span>▦</span>Program
                </Link>
                <Link href="/#sedekah" className="bottom-donate">
                    <span>♥</span>Sedekah
                </Link>
                <Link href="/transparansi">
                    <span>▤</span>Laporan
                </Link>
                <Link href="/login">
                    <span>♙</span>Akun
                </Link>
            </nav>
        </div>
    );
}
