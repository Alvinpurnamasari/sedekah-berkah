<?php

namespace App\Http\Controllers\Pensedekah;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        $donations = DB::table('donations')
            ->where('user_id', $userId)
            ->where('is_simulated', false);

        $summary = [
            'totalDonations' => (clone $donations)->count(),

            'totalAmount' => (clone $donations)
                ->where('payment_status', 'paid')
                ->selectRaw(
                    'COALESCE(SUM(COALESCE(donation_amount, 0) + COALESCE(operational_support, 0)), 0) as total'
                )
                ->value('total'),

            'successfulDonations' => (clone $donations)
                ->where('payment_status', 'paid')
                ->count(),

            'pendingDonations' => (clone $donations)
                ->where('payment_status', 'pending')
                ->count(),

            'totalCampaigns' => (clone $donations)
                ->where('payment_status', 'paid')
                ->whereNotNull('campaign_id')
                ->distinct()
                ->count('campaign_id'),
        ];

        // Program yang pernah didukung melalui donasi nyata berhasil.
        $supportedCampaignIds = (clone $donations)
            ->where('payment_status', 'paid')
            ->whereNotNull('campaign_id')
            ->distinct()
            ->pluck('campaign_id');

                /*
         * Ringkasan keuangan program.
         * Mengikuti perhitungan pada halaman Tracking Penyaluran.
         */

         $programCampaignIds = DB::table('campaigns')
         ->join(
             'ledger_accounts',
             'campaigns.ledger_account_id',
             '=',
             'ledger_accounts.id'
         )
         ->whereIn('campaigns.id', $supportedCampaignIds)
         ->where('ledger_accounts.fund_group', 'program')
         ->pluck('campaigns.id');

     // Total donasi berhasil per program.
     $donationTotals = DB::table('donations')
         ->whereIn('campaign_id', $programCampaignIds)
         ->where('payment_status', 'paid')
         ->where('is_simulated', false)
         ->select('campaign_id')
         ->selectRaw('SUM(COALESCE(donation_amount, 0)) as total')
         ->groupBy('campaign_id')
         ->get()
         ->keyBy('campaign_id');

     // Total anggaran yang disetujui per program.
     $allocationTotals = DB::table('distributions')
         ->whereIn('campaign_id', $programCampaignIds)
         ->where('budget_status', 'approved')
         ->where('is_simulated', false)
         ->select('campaign_id')
         ->selectRaw('SUM(COALESCE(approved_budget, 0)) as total')
         ->groupBy('campaign_id')
         ->get()
         ->keyBy('campaign_id');

     // Total pengeluaran terealisasi per program.
     $expenseTotals = DB::table('expenses')
         ->whereIn('campaign_id', $programCampaignIds)
         ->where('expense_type', 'distribution_detail')
         ->where('approval_status', 'approved')
         ->where('payment_status', 'paid')
         ->where('is_simulated', false)
         ->select('campaign_id')
         ->selectRaw('SUM(COALESCE(amount, 0)) as total')
         ->groupBy('campaign_id')
         ->get()
         ->keyBy('campaign_id');

     // Jumlahkan hasil masing-masing program.
     $totalProgramDonations = (int) $programCampaignIds->sum(
         fn ($id) => (int) ($donationTotals->get($id)->total ?? 0)
     );

     $totalAllocatedBudget = (int) $programCampaignIds->sum(
         fn ($id) => (int) ($allocationTotals->get($id)->total ?? 0)
     );

     $totalProgramExpenses = (int) $programCampaignIds->sum(
         fn ($id) => (int) ($expenseTotals->get($id)->total ?? 0)
     );

     $financeSummary = [
         'total_donations' => $totalProgramDonations,
         'allocated_budget' => $totalAllocatedBudget,
         'total_expenses' => $totalProgramExpenses,

         'unallocated_balance' => max(
             0,
             $totalProgramDonations - $totalAllocatedBudget
         ),

         'allocated_not_realized' => max(
             0,
             $totalAllocatedBudget - $totalProgramExpenses
         ),

         'funding_shortfall' => max(
             0,
             $totalAllocatedBudget - $totalProgramDonations
         ),
     ];

        // Kegiatan penyaluran yang boleh dilihat Pensedekah.
        $distributions = DB::table('distributions')
            ->whereIn('campaign_id', $supportedCampaignIds)
            ->where('is_simulated', false)
            ->where(function ($query) {
                $query->where(function ($q) {
                    $q->where('budget_status', 'approved')
                        ->whereIn('status', ['planned', 'ongoing']);
                })->orWhere(function ($q) {
                    $q->where('status', 'completed')
                        ->where('report_status', 'approved')
                        ->where('is_published', true);
                });
            });

        $distributionSummary = [
            'preparation' => (clone $distributions)
                ->where('status', 'planned')
                ->where('budget_status', 'approved')
                ->count(),

            'ongoing' => (clone $distributions)
                ->where('status', 'ongoing')
                ->where('budget_status', 'approved')
                ->count(),

            'completed' => (clone $distributions)
                ->where('status', 'completed')
                ->where('report_status', 'approved')
                ->where('is_published', true)
                ->count(),
        ];

        $recentDonations = (clone $donations)
            ->leftJoin(
                'campaigns',
                'campaigns.id',
                '=',
                'donations.campaign_id'
            )
            ->select(
                'donations.id',
                'donations.donation_code',
                'donations.donation_amount',
                'donations.operational_support',
                'donations.payment_status',
                'donations.created_at',
                'campaigns.title as campaign_title'
            )
            ->latest('donations.created_at')
            ->limit(5)
            ->get();

            return Inertia::render('Pensedekah/Dashboard', [
                'summary' => $summary,
                'distributionSummary' => $distributionSummary,
                'recentDonations' => $recentDonations,
                'financeSummary' => $financeSummary,
            ]);
    }
}
