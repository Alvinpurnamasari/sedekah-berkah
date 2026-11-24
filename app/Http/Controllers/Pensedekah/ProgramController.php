<?php

namespace App\Http\Controllers\Pensedekah;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ProgramController extends Controller
{
    public function index()
    {
        $campaigns = DB::table('campaigns')
            ->leftJoin(
                'campaign_categories',
                'campaigns.category_id',
                '=',
                'campaign_categories.id'
            )
            ->select(
                'campaigns.id',
                'campaigns.title',
                'campaigns.slug',
                'campaigns.description',
                'campaigns.target_amount',
                'campaigns.target_beneficiaries',
                'campaigns.location',
                'campaigns.status',
                'campaign_categories.name as category_name'
            )
            ->selectSub(function ($query) {
                $query->from('donations')
                    ->selectRaw('COALESCE(SUM(donation_amount), 0)')
                    ->whereColumn('donations.campaign_id', 'campaigns.id')
                    ->where('donations.payment_status', 'paid')
                    ->where('donations.is_simulated', false);
            }, 'collected_amount')
            ->selectSub(function ($query) {
                $query->from('donations')
                    ->selectRaw('COUNT(*)')
                    ->whereColumn('donations.campaign_id', 'campaigns.id')
                    ->where('donations.payment_status', 'paid')
                    ->where('donations.is_simulated', false);
            }, 'donation_count')
            ->selectSub(function ($query) {
                $query->from('donations')
                    ->join(
                        'beneficiary_targets',
                        'donations.beneficiary_target_id',
                        '=',
                        'beneficiary_targets.id'
                    )
                    ->selectRaw(
                        "GROUP_CONCAT(DISTINCT beneficiary_targets.name SEPARATOR '||')"
                    )
                    ->whereColumn('donations.campaign_id', 'campaigns.id')
                    ->where('donations.payment_status', 'paid')
                    ->where('donations.is_simulated', false);
            }, 'beneficiary_names')
            ->whereIn('campaigns.status', ['published', 'active'])
            ->orderByDesc('campaigns.created_at')
            ->get()
            ->map(function ($campaign) {
                $campaign->beneficiary_names = $campaign->beneficiary_names
                    ? explode('||', $campaign->beneficiary_names)
                    : [];

                return $campaign;
            });

        return Inertia::render('Pensedekah/Programs/Index', [
            'campaigns' => $campaigns,
        ]);
    }
}
