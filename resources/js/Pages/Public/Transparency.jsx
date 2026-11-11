
import React from 'react';
import { Head } from '@inertiajs/react';

const rupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value || 0);

const dateFormat = (value) => {
    if (!value) return '-';

    return new Date(value).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};

function ExpenseList({ expenses }) {
    if (!expenses?.length) {
        return <p className="muted">Belum ada rincian pengeluaran.</p>;
    }

    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                minWidth: 350,
            }}>
                <thead>
                    <tr style={{
                        textAlign: 'left',
                        background: '#f5f8f6',
                    }}>
                        <th style={{ padding: 10 }}>Kategori</th>
                        <th style={{ padding: 10 }}>Keterangan</th>
                        <th style={{ padding: 10 }}>Nominal</th>
                    </tr>
                </thead>
                <tbody>
                    {expenses.map((expense) => (
                        <tr key={expense.id} style={{
                            borderBottom: '1px solid #edf1ee',
                        }}>
                            <td style={{ padding: 10 }}>
                                {expense.expense_category}
                            </td>
                            <td style={{ padding: 10 }}>
                                {expense.description || '-'}
                            </td>
                            <td style={{ padding: 10 }}>
                                {rupiah(expense.amount)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}


export default function Transparency({
    summary,
    reports,
    additionalExpenses = [],
}) {
    return (
        <main className="container" style={{ padding: '40px 0' }}>
            <Head title="Transparansi dan Laporan Penyaluran" />

            <a href="/">← Beranda</a>

            <h1>Laporan Transparansi</h1>

            <p className="muted">
                Ringkasan dana dan dokumentasi kegiatan penyaluran
                yang telah disetujui serta dipublikasikan.
            </p>

            <div className="grid3">
                {[
                    ['Dana terkumpul', rupiah(summary.donationTotal)],
                    ['Dana disalurkan', rupiah(summary.distributedTotal)],
                    [
                        'Penerima manfaat',
                        `${Number(summary.beneficiaryTotal || 0).toLocaleString('id-ID')} orang`,
                    ],
                    [
                        'Biaya tambahan',
                        rupiah(summary.additionalExpenseTotal),
                    ],
                    ['Total penggunaan dana', rupiah(summary.totalUse)],
                ].map(([label, value]) => (
                    <div className="card" key={label}>
                        <p className="muted">{label}</p>
                        <h2>{value}</h2>
                    </div>
                ))}
            </div>

            <section style={{ marginTop: 32 }}>
                <h2>Dokumentasi Penyaluran</h2>

                <p className="muted">
                    Kegiatan yang telah selesai, diperiksa,
                    dan dipublikasikan oleh Superadmin.
                </p>

                {reports.length > 0 ? (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns:
                            'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: 20,
                    }}>
                        {reports.map((report) => (
                            <article className="card" key={report.id}>
                                <h3 style={{ marginTop: 0 }}>
                                    {report.title}
                                </h3>

                                <p className="muted">
                                    {report.campaign_title || 'Program'} ·{' '}
                                    {report.location}
                                </p>

                                <p>
                                    <strong>Tanggal:</strong>{' '}
                                    {dateFormat(report.distribution_date)}
                                </p>

                                <p>
                                    <strong>Biaya utama kegiatan:</strong>{' '}
                                    {rupiah(report.total_cost)}
                                </p>

                                <p>
                                    <strong>Penerima manfaat:</strong>{' '}
                                    {Number(report.actual_quantity || 0)
                                        .toLocaleString('id-ID')} orang
                                </p>

                                <h4>Rincian biaya kegiatan</h4>
                                <ExpenseList expenses={report.expenses} />

                                {report.documents?.length > 0 && (
                                    <>
                                        <h4>Dokumentasi kegiatan</h4>
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns:
                                                'repeat(2, minmax(0, 1fr))',
                                            gap: 8,
                                        }}>
                                            {report.documents.map((document) => (
                                                <a
                                                    key={document.id}
                                                    href={`/storage/${document.file_path}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    <img
                                                        src={`/storage/${document.file_path}`}
                                                        alt={document.caption || 'Dokumentasi penyaluran'}
                                                        loading="lazy"
                                                        style={{
                                                            width: '100%',
                                                            height: 140,
                                                            objectFit: 'cover',
                                                            borderRadius: 8,
                                                        }}
                                                    />
                                                    <small>
                                                        {document.caption || 'Dokumentasi kegiatan'}
                                                    </small>
                                                </a>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="card" style={{
                        marginTop: 20,
                        textAlign: 'center',
                        padding: 32,
                    }}>
                        <h3>Belum ada laporan yang dipublikasikan</h3>
                        <p className="muted">
                            Laporan penyaluran yang telah disetujui
                            dan dipublikasikan akan tampil di sini.
                        </p>
                    </div>
                )}
            </section>

            <section style={{ marginTop: 32 }}>
                <h2>Pengeluaran Tambahan</h2>
                <p className="muted">
                    Pengeluaran di luar biaya utama kegiatan yang
                    telah disetujui Superadmin.
                </p>

                <div className="card">
                    <ExpenseList expenses={additionalExpenses} />
                </div>
            </section>
        </main>
    );
}
