
import React from 'react';
import { Link } from '@inertiajs/react';
import {
    Heart,
    History,
    FileText,
    ArrowRight,
} from 'lucide-react';

import PensedekahLayout from '@/Components/PensedekahLayout';

export default function Dashboard() {
    return (
        <PensedekahLayout
            title="Dashboard"
            activeMenu="dashboard"
        >
            <div className="pd-welcome">
                <div>
                    <h2>Selamat Datang di Sedekah Berkah</h2>
                    <p>
                        Pantau riwayat donasi dan perkembangan
                        penyaluran kebaikan Anda.
                    </p>
                </div>

                <div className="pd-welcome-icon">
                    <Heart size={34} />
                </div>
            </div>

            <div className="pd-dashboard-grid">
                <Link
                    href="/akun/donasi"
                    className="pd-dashboard-card"
                >
                    <div className="pd-dashboard-card-icon">
                        <History size={24} />
                    </div>
                    <h3>Riwayat Donasi</h3>
                    <p>
                        Lihat daftar donasi dan status pembayaran Anda.
                    </p>
                    <span>
                        Lihat Riwayat <ArrowRight size={16} />
                    </span>
                </Link>

                <div className="pd-dashboard-card">
                    <div className="pd-dashboard-card-icon">
                        <FileText size={24} />
                    </div>
                    <h3>Laporan Penyaluran</h3>
                    <p>
                        Pantau informasi kegiatan penyaluran dana.
                    </p>
                    <small>Segera tersedia</small>
                </div>
            </div>
        </PensedekahLayout>
    );
}
