
import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import '../../css/home.css';

export default function PublicLayout({ children }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const { url, props } = usePage();

    const currentPath = url.split('?')[0];
    const organization = props.organization || {};

    const organizationName =
        organization.organization_name || 'Sedekah Berkah';

    const description =
        organization.organization_description ||
        'Sedekah Berkah adalah platform sedekah digital yang berfokus pada penyaluran bantuan secara terarah dan transparan di Yogyakarta.';

    const logo = organization.organization_logo
        ? `/storage/${organization.organization_logo}`
        : null;

    const isActive = (path) => {
        if (path === '/program') {
            return currentPath === '/program' || currentPath.startsWith('/program/');
        }

        return currentPath === path;
    };

    const Brand = () => (
        <Link href="/" className="sb-brand">
            {logo ? (
                <img
                    src={logo}
                    alt={organizationName}
                    className="sb-brand-logo"
                />
            ) : (
                <span className="sb-brand-icon">♥</span>
            )}
            <span>{organizationName}</span>
        </Link>
    );

    return (
        <div className="sb-home">
            <header className="sb-header">
                <div className="sb-container sb-nav">
                    <Brand />

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
                        <Link href="/login" className="sb-login">
                            Login
                        </Link>
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
                            <Brand />
                            <p>{description}</p>
                        </div>

                        <div>
                            <h4>Program</h4>
                            <Link href="/program/jumat-berkah">Jumat Berkah</Link>
                            <Link href="/program/subuh-berkah">Subuh Berkah</Link>
                            <Link href="/program/sedekah-jalanan">Sedekah Jalanan</Link>
                        </div>

                        <div>
                            <h4>Kontak</h4>

                            {organization.organization_address && (
                                <span>{organization.organization_address}</span>
                            )}

                            {organization.organization_email && (
                                <span>{organization.organization_email}</span>
                            )}

                            {organization.organization_phone && (
                                <span>{organization.organization_phone}</span>
                            )}

                            <span>
                                Admin · <Link href="/login">Masuk</Link>
                            </span>
                        </div>
                    </div>

                    <div className="sb-copyright">
                        © {new Date().getFullYear()} {organizationName}
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
                    <span>◈</span>Laporan
                </Link>
                <Link href="/login">
                    <span>♙</span>Akun
                </Link>
            </nav>
        </div>
    );
}
