<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class CampaignController extends Controller
{
    // API: daftar kampanye
    public function index(): JsonResponse
    {
        $campaigns = Campaign::with([
            'category',
            'beneficiaryTargets' => function ($query) {
                $query->where('is_active', true);
            },
        ])
        ->withSum([
            'donations as collected_amount' => function ($query) {
                $query->where('payment_status', 'paid')
                    ->where('is_simulated', false);
            },
        ], 'donation_amount')
        ->withCount([
            'donations as donor_count' => function ($query) {
                $query->where('payment_status', 'paid')
                    ->where('is_simulated', false);
            },
        ])
        ->whereIn('status', ['published', 'active'])
        ->orderByDesc('created_at')
        ->get();

        return response()->json([
            'success' => true,
            'data' => $campaigns,
        ]);
    }

    // Halaman publik: detail kampanye melalui Inertia
    public function show(string $slug): Response
    {
        $campaign = Campaign::with([
            'category',
            'beneficiaryTargets' => function ($query) {
                $query->where('is_active', true);
            },
        ])
        ->withSum([
            'donations as collected_amount' => function ($query) {
                $query->where('payment_status', 'paid')
                    ->where('is_simulated', false);
            },
        ], 'donation_amount')
        ->withCount([
            'donations as donor_count' => function ($query) {
                $query->where('payment_status', 'paid')
                    ->where('is_simulated', false);
            },
        ])
        ->where('slug', $slug)
        ->whereIn('status', ['published', 'active'])
        ->firstOrFail();

        return Inertia::render('Public/Campaign', [
            'campaign' => $campaign,
        ]);
    }

    // API: detail kampanye untuk Checkout
    public function apiShow(string $slug): JsonResponse
    {
        $campaign = Campaign::with([
            'category',
            'beneficiaryTargets' => function ($query) {
                $query->where('is_active', true);
            },
        ])
        ->withSum([
            'donations as collected_amount' => function ($query) {
                $query->where('payment_status', 'paid')
                    ->where('is_simulated', false);
            },
        ], 'donation_amount')
        ->withCount([
            'donations as donor_count' => function ($query) {
                $query->where('payment_status', 'paid')
                    ->where('is_simulated', false);
            },
        ])
        ->where('slug', $slug)
        ->whereIn('status', ['published', 'active'])
        ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $campaign,
        ]);
    }
}
