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
            'recentDonations' => $recentDonations,
        ]);
    }
}
