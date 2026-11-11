<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PublicTransparencyController extends Controller
{
    public function index()
    {
        // Hanya penyaluran nyata yang selesai, disetujui,
        // dan sudah dipublikasikan.
        $publishedIds = DB::table('distributions')
            ->where('status', 'completed')
            ->where('report_status', 'approved')
            ->where('is_published', true)
            ->where('is_simulated', false)
            ->select('id');

        // Dana terkumpul dari donasi nyata yang sudah dibayar.
        $donationTotal = (int) DB::table('donations')
            ->where('payment_status', 'paid')
            ->where('is_simulated', false)
            ->selectRaw(
                'COALESCE(SUM(donation_amount + operational_support), 0) as total'
            )
            ->value('total');

        // Daftar laporan penyaluran yang boleh dilihat publik.
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

        $campaignIds = $reports
            ->pluck('campaign_id')
            ->filter()
            ->unique()
            ->values();

        // Total biaya utama dari penyaluran nyata yang dipublikasikan.
        $distributedTotal = (int) DB::table('distributions')
            ->whereIn('id', $publishedIds)
            ->where('is_simulated', false)
            ->sum('total_cost');

        // Rincian biaya kegiatan yang sudah disetujui.
        // Tidak dijumlahkan lagi karena sudah termasuk total_cost.
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
                'amount',
            )
            ->orderBy('created_at')
            ->get()
            ->groupBy('distribution_id');

        // Pengeluaran tambahan nyata pada program
        // yang memiliki laporan penyaluran dipublikasikan.
        $additionalExpenses = DB::table('expenses')
            ->whereIn('campaign_id', $campaignIds)
            ->whereNull('distribution_id')
            ->where('expense_type', 'additional')
            ->where('approval_status', 'approved')
            ->where('is_simulated', false)
            ->select(
                'id',
                'campaign_id',
                'expense_category',
                'description',
                'amount',
                'receipt_file'
            )
            ->orderByDesc('created_at')
            ->get();

        $additionalExpenseTotal = (int) $additionalExpenses->sum('amount');

        // Total penggunaan dana.
        // Rincian distribution_detail tidak dihitung dua kali.
        $totalUse = $distributedTotal + $additionalExpenseTotal;

        // Penerima manfaat dari laporan yang dipublikasikan.
        $beneficiaryTotal = (int) $reports->sum('actual_quantity');

        // Dokumentasi penyaluran.
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

        return Inertia::render('Public/Transparency', [
            'summary' => [
                'donationTotal' => $donationTotal,
                'distributedTotal' => $distributedTotal,
                'additionalExpenseTotal' => $additionalExpenseTotal,
                'totalUse' => $totalUse,
                'beneficiaryTotal' => $beneficiaryTotal,
            ],
            'reports' => $reports,
            'additionalExpenses' => $additionalExpenses,
        ]);
    }
}
