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
        ]);
    }
}
