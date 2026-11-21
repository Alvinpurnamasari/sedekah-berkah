<?php

namespace App\Http\Controllers\Pensedekah;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DonationController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        $baseQuery = DB::table('donations')
            ->where('donations.user_id', $userId)
            ->where('donations.is_simulated', false);

        $summary = [
            'totalDonations' => (clone $baseQuery)->count(),

            'totalAmount' => (int) (clone $baseQuery)
                ->where('payment_status', 'paid')
                ->sum(DB::raw(
                    'donation_amount + operational_support'
                )),

            'successfulDonations' => (clone $baseQuery)
                ->where('payment_status', 'paid')
                ->count(),

            'pendingDonations' => (clone $baseQuery)
                ->where('payment_status', 'pending')
                ->count(),
        ];

        $donations = (clone $baseQuery)
            ->leftJoin(
                'campaigns',
                'donations.campaign_id',
                '=',
                'campaigns.id'
            )
            ->select(
                'donations.id',
                'donations.donation_code',
                'donations.donation_amount',
                'donations.operational_support',
                'donations.payment_status',
                'donations.proof_status',
                'donations.created_at',
                'campaigns.title as campaign_title'
            )
            ->orderByDesc('donations.created_at')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Pensedekah/Donations/Index', [
            'summary' => $summary,
            'donations' => $donations,
        ]);
    }

    public function show(Request $request, string $code)
    {
        $donation = DB::table('donations')
            ->leftJoin(
                'campaigns',
                'donations.campaign_id',
                '=',
                'campaigns.id'
            )
            ->leftJoin(
                'payment_transactions',
                'donations.id',
                '=',
                'payment_transactions.donation_id'
            )
            ->where('donations.user_id', $request->user()->id)
            ->where('donations.donation_code', $code)
            ->where('donations.is_simulated', false)
            ->select(
                'donations.id',
                'donations.donation_code',
                'donations.donor_name',
                'donations.donation_amount',
                'donations.operational_support',
                'donations.payment_status',
                'donations.proof_status',
                'donations.proof_uploaded_at',
                'donations.verified_at',
                'donations.verification_note',
                'donations.bank_name',
                'donations.bank_account_number',
                'donations.bank_account_holder',
                'donations.created_at',
                'campaigns.title as campaign_title',
                'payment_transactions.provider',
                'payment_transactions.order_id',
                'payment_transactions.payment_method',
                'payment_transactions.gross_amount',
                'payment_transactions.gateway_fee',
                'payment_transactions.status as transaction_status',
                'payment_transactions.paid_at'
            )
            ->first();

        abort_if(!$donation, 404);

        return Inertia::render('Pensedekah/Donations/Show', [
            'donation' => $donation,
        ]);
    }
}
