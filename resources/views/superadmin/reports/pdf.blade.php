
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Sedekah Berkah</title>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 10px;
            color: #26352d;
        }

        h1 {
            color: #176b43;
            text-align: center;
            font-size: 20px;
            margin-bottom: 4px;
        }

        h2 {
            color: #176b43;
            font-size: 14px;
            margin-top: 22px;
        }

        p {
            margin: 4px 0;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        th, td {
            border: 1px solid #d6dfd9;
            padding: 6px;
            text-align: left;
        }

        th {
            background: #e4f1e8;
        }

        .summary td {
            width: 50%;
        }

        .simulasi {
            color: #a45a00;
            font-weight: bold;
        }

        .note {
            margin-top: 20px;
            font-size: 9px;
            color: #64746a;
        }
    </style>
</head>
<body>
    <h1>SEDEKAH BERKAH</h1>
    <p style="text-align:center;">Laporan Pemasukan dan Penyaluran Dana</p>

    <p><strong>Periode:</strong>
        {{ $filters['start_date'] ?: 'Semua tanggal' }}
        sampai
        {{ $filters['end_date'] ?: 'Semua tanggal' }}
    </p>
    <p>
        <strong>Program:</strong>
        {{ $selectedCampaign?->title ?? 'Semua Program' }}
    </p>
    
    <p>
        <strong>Dibuat pada:</strong>
        {{ $generatedAt }}
    </p>

    <h2>Ringkasan Data Riil</h2>

    <table class="summary">
        <tr>
            <th>Total Donasi Pokok</th>
            <td>Rp {{ number_format($summary['donation'], 0, ',', '.') }}</td>
        </tr>
        <tr>
            <th>Dukungan Operasional</th>
            <td>Rp {{ number_format($summary['operational_support'], 0, ',', '.') }}</td>
        </tr>
        <tr>
            <th>Total Pemasukan</th>
            <td>Rp {{ number_format($summary['income'], 0, ',', '.') }}</td>
        </tr>
        <tr>
            <th>Jumlah Transaksi Berhasil</th>
            <td>{{ number_format($summary['donation_count'], 0, ',', '.') }}</td>
        </tr>
        <tr>
            <th>Biaya Penyaluran</th>
            <td>Rp {{ number_format($summary['distribution_cost'], 0, ',', '.') }}</td>
        </tr>
        <tr>
            <th>Pengeluaran Tambahan Disetujui</th>
            <td>Rp {{ number_format($summary['additional_expenses'], 0, ',', '.') }}</td>
        </tr>
        <tr>
            <th>Total Pengeluaran</th>
            <td>Rp {{ number_format($summary['total_expense'], 0, ',', '.') }}</td>
        </tr>
        <tr>
            <th>Saldo Tersedia</th>
            <td><strong>Rp {{ number_format($summary['available_balance'], 0, ',', '.') }}</strong></td>
        </tr>
        <tr>
            <th>Penerima Manfaat</th>
            <td>{{ number_format($summary['beneficiaries'], 0, ',', '.') }}</td>
        </tr>
    </table>

    <h2>Donasi Riil</h2>
    <table>
        <thead>
            <tr>
                <th>Kode Donasi</th>
                <th>Tanggal</th>
                <th>Donatur</th>
                <th>Program</th>
                <th>Nominal</th>
            </tr>
        </thead>
        <tbody>
            @forelse($donations as $item)
                <tr>
                    <td>{{ $item->donation_code }}</td>
                    <td>{{ optional($item->created_at)->format('d-m-Y') }}</td>
                    <td>{{ $item->is_anonymous ? 'Hamba Allah' : $item->donor_name }}</td>
                    <td>{{ $item->campaign?->title ?? '-' }}</td>
                    <td>Rp {{ number_format($item->donation_amount, 0, ',', '.') }}</td>
                </tr>
            @empty
                <tr><td colspan="5">Belum ada donasi riil.</td></tr>
            @endforelse
        </tbody>
    </table>

    <h2>Penyaluran Riil</h2>
    <table>
        <thead>
            <tr>
                <th>Kegiatan</th>
                <th>Program</th>
                <th>Tanggal</th>
                <th>Lokasi</th>
                <th>Penerima</th>
                <th>Biaya</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse($distributions as $item)
                <tr>
                    <td>{{ $item->title }}</td>
                    <td>{{ $item->campaign?->title ?? '-' }}</td>
                    <td>{{ optional($item->distribution_date)->format('d-m-Y') }}</td>
                    <td>{{ $item->location }}</td>
                    <td>{{ $item->actual_quantity }}</td>
                    <td>Rp {{ number_format($item->total_cost, 0, ',', '.') }}</td>
                    <td>{{ $item->status }}</td>
                </tr>
            @empty
                <tr><td colspan="7">Belum ada penyaluran riil.</td></tr>
            @endforelse
        </tbody>
    </table>

    <h2>Pengeluaran Tambahan Riil</h2>
    <table>
        <thead>
            <tr>
                <th>Kategori</th>
                <th>Program</th>
                <th>Keterangan</th>
                <th>Nominal</th>
            </tr>
        </thead>
        <tbody>
            @forelse($expenses as $item)
                <tr>
                    <td>{{ $item->expense_category }}</td>
                    <td>{{ $item->campaign?->title ?? '-' }}</td>
                    <td>{{ $item->description }}</td>
                    <td>Rp {{ number_format($item->amount, 0, ',', '.') }}</td>
                </tr>
            @empty
                <tr><td colspan="4">Belum ada pengeluaran tambahan riil.</td></tr>
            @endforelse
        </tbody>
    </table>

    <h2 class="simulasi">Lampiran Data Simulasi — Bukan Transaksi Riil</h2>
    <p class="simulasi">
        Bagian ini hanya untuk pemeriksaan internal dan tidak termasuk ringkasan keuangan riil.
    </p>

    <table>
        <thead>
            <tr>
                <th>Jenis</th>
                <th>Nama / Kode</th>
                <th>Program</th>
                <th>Tanggal</th>
                <th>Nominal / Biaya</th>
            </tr>
        </thead>
        <tbody>
            @foreach($simulatedDonations as $item)
                <tr>
                    <td>Donasi simulasi</td>
                    <td>{{ $item->donation_code }}</td>
                    <td>{{ $item->campaign?->title ?? '-' }}</td>
                    <td>{{ optional($item->created_at)->format('d-m-Y') }}</td>
                    <td>Rp {{ number_format($item->donation_amount, 0, ',', '.') }}</td>
                </tr>
            @endforeach

            @foreach($simulatedDistributions as $item)
                <tr>
                    <td>Penyaluran simulasi</td>
                    <td>{{ $item->title }}</td>
                    <td>{{ $item->campaign?->title ?? '-' }}</td>
                    <td>{{ optional($item->distribution_date)->format('d-m-Y') }}</td>
                    <td>Rp {{ number_format($item->total_cost, 0, ',', '.') }}</td>
                </tr>
            @endforeach

            @foreach($simulatedExpenses as $item)
                <tr>
                    <td>Pengeluaran simulasi</td>
                    <td>{{ $item->expense_category }}</td>
                    <td>{{ $item->campaign?->title ?? '-' }}</td>
                    <td>{{ optional($item->created_at)->format('d-m-Y') }}</td>
                    <td>Rp {{ number_format($item->amount, 0, ',', '.') }}</td>
                </tr>
            @endforeach

            @if($simulatedDonations->isEmpty() && $simulatedDistributions->isEmpty() && $simulatedExpenses->isEmpty())
                <tr><td colspan="5">Tidak ada data simulasi pada filter ini.</td></tr>
            @endif
        </tbody>
    </table>

    <p class="note">
        Dokumen ini dibuat secara otomatis oleh sistem Sedekah Berkah.
        Data riil dan data simulasi disajikan terpisah.
    </p>
</body>
</html>
