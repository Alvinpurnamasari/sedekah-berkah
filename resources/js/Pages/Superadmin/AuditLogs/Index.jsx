
import React from 'react';
import { Head, router } from '@inertiajs/react';
import SuperadminLayout from '../../../Components/SuperadminLayout';
import { Search, ClipboardList, RefreshCw } from 'lucide-react';

export default function Index({ logs, actions, filters }) {
    const formatDate = (date) => {
        if (!date) return '-';

        return new Date(date).toLocaleString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const actionLabels = {
        expense_approved: 'Pengeluaran disetujui',
        expense_rejected: 'Pengeluaran ditolak',
        user_created: 'Pengguna dibuat',
        user_updated: 'Pengguna diperbarui',
        user_status_changed: 'Status pengguna diubah',
        user_password_reset: 'Password diatur ulang',
    };

    const formatAction = (action) => {
        return actionLabels[action] ||
            action?.replaceAll('_', ' ') ||
            '-';
    };

    const handleFilter = (key, value) => {
        router.get('/superadmin/audit-log', {
            ...filters,
            [key]: value,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const formatValue = (value) => {
        if (value === null || value === undefined) {
            return '-';
        }

        if (typeof value === 'boolean') {
            return value ? 'Ya' : 'Tidak';
        }

        if (Array.isArray(value)) {
            return value.map((item) => formatValue(item)).join(', ');
        }

        if (typeof value === 'object') {
            return Object.entries(value)
                .map(([key, item]) => {
                    return `${key}: ${formatValue(item)}`;
                })
                .join(', ');
        }

        return String(value);
    };

    const formatKey = (key) => {
        const labels = {
            name: 'Nama',
            email: 'Email',
            phone: 'Telepon',
            role: 'Role',
            status: 'Status',
            before: 'Sebelumnya',
            after: 'Sesudahnya',
            message: 'Keterangan',
            password: 'Password',
        };

        return labels[key] || key.replaceAll('_', ' ');
    };

    const getMetadata = (metadata) => {
        if (!metadata) return '-';

        if (typeof metadata === 'string') {
            try {
                metadata = JSON.parse(metadata);
            } catch {
                return metadata;
            }
        }

        if (typeof metadata !== 'object' || Array.isArray(metadata)) {
            return formatValue(metadata);
        }

        return Object.entries(metadata)
            .filter(([key]) => {
                return !['password', 'password_confirmation'].includes(
                    key.toLowerCase()
                );
            })
            .map(([key, value]) => {
                return `${formatKey(key)}: ${formatValue(value)}`;
            })
            .join(' | ');
    };

    return (
        <SuperadminLayout>
            <Head title="Audit Log" />

            <div className="sa-audit-page">
                <div className="sa-audit-header">
                    <div>
                        <h1>Audit Log</h1>
                        <p>
                            Riwayat aktivitas dan perubahan dalam sistem
                            Sedekah Berkah.
                        </p>
                    </div>
                </div>

                <div className="sa-audit-filters">
                    <div className="sa-audit-search">
                        <Search size={18} />

                        <input
                            type="text"
                            placeholder="Cari pengguna atau aktivitas..."
                            value={filters.search || ''}
                            onChange={(e) =>
                                handleFilter('search', e.target.value)
                            }
                        />
                    </div>

                    <select
                        value={filters.action || ''}
                        onChange={(e) =>
                            handleFilter('action', e.target.value)
                        }
                    >
                        <option value="">Semua aktivitas</option>

                        {actions.map((action) => (
                            <option key={action} value={action}>
                                {formatAction(action)}
                            </option>
                        ))}
                    </select>

                    <button
                        type="button"
                        onClick={() => router.get('/superadmin/audit-log')}
                    >
                        <RefreshCw size={16} />
                        Reset
                    </button>
                </div>

                <div className="sa-audit-card">
                    <div className="sa-audit-card-title">
                        <ClipboardList size={20} />
                        <h2>Riwayat Aktivitas</h2>
                        <span>{logs.total} aktivitas</span>
                    </div>

                    <div className="sa-audit-table-wrap">
                        <table className="sa-audit-table">
                            <thead>
                                <tr>
                                    <th>Waktu</th>
                                    <th>Pengguna</th>
                                    <th>Aktivitas</th>
                                    <th>Objek</th>
                                    <th>Detail</th>
                                    <th>IP Address</th>
                                </tr>
                            </thead>

                            <tbody>
                                {logs.data.length > 0 ? (
                                    logs.data.map((item) => (
                                        <tr key={item.id}>
                                            <td>
                                                {formatDate(item.created_at)}
                                            </td>

                                            <td>
                                                {item.user_name ||
                                                    'Pengguna tidak tersedia'}
                                            </td>

                                            <td>
                                                <span className="sa-audit-action">
                                                    {formatAction(item.action)}
                                                </span>
                                            </td>

                                            <td>
                                                {item.entity_type || '-'}
                                            </td>

                                            <td className="sa-audit-detail">
                                                {getMetadata(item.metadata)}
                                            </td>

                                            <td>
                                                {item.ip_address || '-'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="sa-audit-empty"
                                        >
                                            Belum ada aktivitas yang tercatat.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="sa-audit-pagination">
                        <span>
                            Menampilkan {logs.from || 0}–{logs.to || 0}
                            {' '}dari {logs.total}
                        </span>

                        <div>
                            {logs.links.map((link, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    disabled={!link.url}
                                    className={link.active ? 'active' : ''}
                                    onClick={() =>
                                        link.url && router.visit(link.url)
                                    }
                                >
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </SuperadminLayout>
    );
}
