<?php

namespace App\Http\Controllers\Pensedekah;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DistributionReportController extends Controller
{
    public function index()
    {
        // Hanya laporan nyata yang selesai, disetujui,
        // dan sudah dipublikasikan.
        $reports = DB::table('distributions')
            ->leftJoin(
                'campaigns',
                'distributions.campaign_id',
                '=',
                'campaigns.id'
            )
            ->where('distributions.status', 'completed')
            ->where('distributions.report_status', 'approved')
            ->where('distributions.is_published', true)
            ->where('distributions.is_simulated', false)
            ->select(
                'distributions.id',
                'distributions.campaign_id',
                'distributions.title',
                'distributions.distribution_date',
                'distributions.location',
                'distributions.actual_quantity',
                'distributions.total_cost',
                'distributions.published_at',
                'campaigns.title as campaign_title'
            )
            ->orderByDesc('distributions.published_at')
            ->get();

        $reportIds = $reports->pluck('id');

        // Rincian pengeluaran yang sudah disetujui.
        $detailExpenses = DB::table('expenses')
            ->whereIn('distribution_id', $reportIds)
            ->where('expense_type', 'distribution_detail')
            ->where('approval_status', 'approved')
            ->where('is_simulated', false)
            ->select(
                'id',
                'distribution_id',
                'expense_category',
                'description',
                'amount'
            )
            ->orderBy('created_at')
            ->get()
            ->groupBy('distribution_id');

        // Dokumentasi laporan penyaluran.
        $documents = DB::table('distribution_documents')
            ->whereIn('distribution_id', $reportIds)
            ->orderByDesc('created_at')
            ->get()
            ->groupBy('distribution_id');

        $reports = $reports->map(function ($report) use (
            $documents,
            $detailExpenses
        ) {
            $report->documents = $documents
                ->get($report->id, collect())
                ->values();

            $report->expenses = $detailExpenses
                ->get($report->id, collect())
                ->values();

            return $report;
        });

        return Inertia::render('Pensedekah/Reports/Index', [
            'reports' => $reports,
            'summary' => [
                'totalReports' => $reports->count(),
                'totalCost' => (int) $reports->sum('total_cost'),
                'totalBeneficiaries' => (int) $reports->sum('actual_quantity'),
            ],
        ]);
    }
}
