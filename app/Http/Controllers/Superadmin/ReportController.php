<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Models\Donation;
use App\Models\Distribution;
use App\Models\Expense;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Font;

class ReportController extends Controller
{
    private function filters(Request $request): array
    {
        $validated = $request->validate([
            'campaign_id' => ['nullable', 'uuid', 'exists:campaigns,id'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
        ]);

        return [
            'campaign_id' => $validated['campaign_id'] ?? null,
            'start_date' => $validated['start_date'] ?? null,
            'end_date' => $validated['end_date'] ?? null,
        ];
    }

    private function donationQuery(array $filters, bool $simulated = false)
    {
        return Donation::query()
            ->with('campaign:id,title')
            ->where('payment_status', 'paid')
            ->where('is_simulated', $simulated)
            ->when($filters['campaign_id'], fn ($q) =>
                $q->where('campaign_id', $filters['campaign_id'])
            )
            ->when($filters['start_date'], fn ($q) =>
                $q->whereDate('created_at', '>=', $filters['start_date'])
            )
            ->when($filters['end_date'], fn ($q) =>
                $q->whereDate('created_at', '<=', $filters['end_date'])
            );
    }

    private function distributionQuery(array $filters, bool $simulated = false)
    {
        return Distribution::query()
            ->with(['campaign:id,title', 'creator:id,name', 'reviewer:id,name', 'documents'])
            ->where('is_simulated', $simulated)
            ->when($filters['campaign_id'], fn ($q) =>
                $q->where('campaign_id', $filters['campaign_id'])
            )
            ->when($filters['start_date'], fn ($q) =>
                $q->whereDate('distribution_date', '>=', $filters['start_date'])
            )
            ->when($filters['end_date'], fn ($q) =>
                $q->whereDate('distribution_date', '<=', $filters['end_date'])
            );
    }

    private function expenseQuery(array $filters, bool $simulated = false)
    {
        return Expense::query()
            ->with('campaign:id,title')
            ->where('is_simulated', $simulated)
            ->where('approval_status', 'approved')
            ->where(function ($q) {
                $q->where('expense_type', 'additional')
                    ->orWhereNull('expense_type');
            })
            ->when($filters['campaign_id'], fn ($q) =>
                $q->where('campaign_id', $filters['campaign_id'])
            )
            ->when($filters['start_date'], fn ($q) =>
                $q->whereDate('created_at', '>=', $filters['start_date'])
            )
            ->when($filters['end_date'], fn ($q) =>
                $q->whereDate('created_at', '<=', $filters['end_date'])
            );
    }

    public function index(Request $request)
    {
        $filters = $this->filters($request);

        $donations = $this->donationQuery($filters);
        $distributions = $this->distributionQuery($filters);
        $additionalExpenses = $this->expenseQuery($filters);

        $campaigns = Campaign::query()
            ->with('category')
            ->withCount([
                'donations as paid_donations_count' => fn ($q) => $q
                    ->where('payment_status', 'paid')
                    ->where('is_simulated', false),
            ])
            ->get();

        $reportDistributions = $this->distributionQuery($filters)
            ->latest()
            ->get();

        $realReports = $reportDistributions->where('is_simulated', false);
        $simulatedReports = $this->distributionQuery($filters, true)->get();

        $totalDonation = (clone $donations)->sum('donation_amount');

        $totalOperationalSupport = (clone $donations)->sum('operational_support');

        $totalIncome = $totalDonation + $totalOperationalSupport;

        $totalDistributionExpense = (clone $distributions)
            ->where('status', 'completed')
            ->sum('total_cost');

        $totalAdditionalExpense = (clone $additionalExpenses)->sum('amount');

        $totalExpense = $totalDistributionExpense + $totalAdditionalExpense;

        $availableBalance = $totalIncome - $totalExpense;

        return Inertia::render('Superadmin/Reports/Index', [
            'filters' => $filters,
            'campaigns' => $campaigns,
            'summary' => [
            'total_donation' => $totalDonation,
            'total_operational_support' => $totalOperationalSupport,
            'total_income' => $totalIncome,
            'total_donations' => (clone $donations)->count(),

            'distribution_expense' => $totalDistributionExpense,
            'total_additional_expenses' => $totalAdditionalExpense,
            'total_expense' => $totalExpense,
            'available_balance' => $availableBalance,

            'total_distributed' => $totalDistributionExpense,
            'total_beneficiaries' => (clone $distributions)
                ->where('status', 'completed')
                ->sum('actual_quantity'),

            'pending_reports' => $realReports
                ->where('report_status', 'pending')->count(),

            'approved_reports' => $realReports
                ->where('report_status', 'approved')->count(),

            'simulated_reports' => $simulatedReports->count(),

            'published_reports' => (clone $reportDistributions)
                ->where('is_published', true)
                ->where('is_simulated', false)
                ->count(),
        ],
            'distributions' => $reportDistributions,
        ]);
    }

    public function exportPdf(Request $request)
    {
        $filters = $this->filters($request);

        $donations = $this->donationQuery($filters)->get();
        $distributions = $this->distributionQuery($filters)->latest()->get();
        $expenses = $this->expenseQuery($filters)->get();

        $simulatedDonations = $this->donationQuery($filters, true)->get();
        $simulatedDistributions = $this->distributionQuery($filters, true)->latest()->get();
        $simulatedExpenses = $this->expenseQuery($filters, true)->get();

        $totalDonation = $donations->sum('donation_amount');
        $totalOperationalSupport = $donations->sum('operational_support');
        $totalIncome = $totalDonation + $totalOperationalSupport;

        $distributionExpense = $distributions
            ->where('status', 'completed')
            ->sum('total_cost');

        $additionalExpense = $expenses->sum('amount');

        $totalExpense = $distributionExpense + $additionalExpense;

        $summary = [
            'donation' => $totalDonation,
            'operational_support' => $totalOperationalSupport,
            'income' => $totalIncome,
            'donation_count' => $donations->count(),
            'distribution_cost' => $distributionExpense,
            'beneficiaries' => $distributions
                ->where('status', 'completed')
                ->sum('actual_quantity'),
            'additional_expenses' => $additionalExpense,
            'total_expense' => $totalExpense,
            'available_balance' => $totalIncome - $totalExpense,
        ];

        $selectedCampaign = $filters['campaign_id']
            ? Campaign::find($filters['campaign_id'])
            : null;

        $generatedAt = now()->format('d-m-Y H:i:s');

        $pdf = Pdf::loadView('superadmin.reports.pdf', compact(
            'filters',
            'donations',
            'distributions',
            'expenses',
            'simulatedDonations',
            'simulatedDistributions',
            'simulatedExpenses',
            'summary',
            'selectedCampaign',
            'generatedAt',  
        ))->setPaper('a4', 'landscape');

        return $pdf->download('laporan-sedekah-berkah.pdf');
    }

    public function exportExcel(Request $request)
    {
        $filters = $this->filters($request);

        $selectedCampaign = $filters['campaign_id']
            ? Campaign::find($filters['campaign_id'])
            : null;

        $generatedAt = now()->format('d-m-Y H:i:s');

        $spreadsheet = new Spreadsheet();

        $sheets = [
            [
                'title' => 'Data Riil',
                'simulated' => false,
            ],
            [
                'title' => 'Data Simulasi',
                'simulated' => true,
            ],
        ];

        foreach ($sheets as $index => $sheetData) {
            $sheet = $index === 0
                ? $spreadsheet->getActiveSheet()
                : $spreadsheet->createSheet();

            $sheet->setTitle($sheetData['title']);

            $sheet->fromArray([
                ['LAPORAN SEDEKAH BERKAH'],
                ['Jenis Data', $sheetData['simulated'] ? 'SIMULASI' : 'RIIL'],
                ['Filter Program', $selectedCampaign?->title ?? 'Semua Program'],
                ['Periode Mulai', $filters['start_date'] ?: '-'],
                ['Periode Selesai', $filters['end_date'] ?: '-'],
                ['Dibuat Pada', $generatedAt],
                [],
                [
                    'JENIS',
                    'TANGGAL',
                    'KODE / NAMA',
                    'PROGRAM',
                    'KETERANGAN',
                    'DONASI POKOK',
                    'DUKUNGAN OPERASIONAL',
                    'NOMINAL TOTAL',
                    'STATUS',
                ],
            ], null, 'A1');
            
            $row = 9;
            $simulated = $sheetData['simulated'];

            foreach ($this->donationQuery($filters, $simulated)->get() as $item) {
                $principal = (int) $item->donation_amount;
                $operational = (int) $item->operational_support;
            
                $sheet->fromArray([[
                    'Donasi',
                    optional($item->created_at)->format('Y-m-d'),
                    $item->donation_code,
                    $item->campaign?->title ?? '-',
                    'Donasi dari ' . ($item->is_anonymous ? 'Hamba Allah' : $item->donor_name),
                    $principal,
                    $operational,
                    $principal + $operational,
                    $item->payment_status,
                ]], null, 'A' . $row++);
            }

            foreach ($this->distributionQuery($filters, $simulated)->get() as $item) {
                $sheet->fromArray([[
                    'Penyaluran',
                    optional($item->distribution_date)->format('Y-m-d'),
                    $item->title,
                    $item->campaign?->title ?? '-',
                    $item->location,
                    0,
                    0,
                    $item->status === 'completed' ? (int) $item->total_cost : 0,
                    $item->report_status,
                ]], null, 'A' . $row++);
            }

            foreach ($this->expenseQuery($filters, $simulated)->get() as $item) {
                $sheet->fromArray([[
                    'Pengeluaran Tambahan',
                    optional($item->created_at)->format('Y-m-d'),
                    $item->expense_category,
                    $item->campaign?->title ?? '-',
                    $item->description,
                    0,
                    0,
                    (int) $item->amount,
                    $item->approval_status,
                ]], null, 'A' . $row++);
            }

            $sheet->getStyle('A1:I1')->getFont()->setBold(true)->setSize(16);
            $sheet->getStyle('A9:I9')->getFont()->setBold(true);

            $sheet->getStyle('A9:I9')->getFill()
                ->setFillType(Fill::FILL_SOLID)
                ->getStartColor()->setRGB('DCEFE3');

            $sheet->getStyle('F10:H' . max(10, $row - 1))
                ->getNumberFormat()
                ->setFormatCode('"Rp" #,##0');

            foreach (range('A', 'I') as $column) {
                $sheet->getColumnDimension($column)->setAutoSize(true);
            }

            $sheet->freezePane('A10');
            $sheet->setAutoFilter('A9:I' . max(9, $row - 1));
        }

        $spreadsheet->setActiveSheetIndex(0);

        return response()->streamDownload(function () use ($spreadsheet) {
            $writer = new Xlsx($spreadsheet);
            $writer->save('php://output');
            $spreadsheet->disconnectWorksheets();
        }, 'laporan-sedekah-berkah.xlsx', [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }
}
