<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class GatewayFeeController extends Controller
{
    public function index(Request $request)
    {
        $baseQuery = DB::table('payment_transactions')
            ->join(
                'donations',
                'donations.id',
                '=',
                'payment_transactions.donation_id'
            )
            ->where('payment_transactions.status', 'paid')
            ->where('donations.is_simulated', false);

        // Ringkasan biaya dari transaksi pembayaran nyata yang berhasil.
        $summary = (clone $baseQuery)
            ->selectRaw('
                COUNT(*) as total_transactions,
                COALESCE(SUM(payment_transactions.gross_amount), 0) as total_payment,
                COALESCE(SUM(payment_transactions.gateway_fee), 0) as total_gateway_fee
            ')
            ->first();

        // Ringkasan berdasarkan penyedia pembayaran.
        $providerSummary = (clone $baseQuery)
            ->select(
                'payment_transactions.provider'
            )
            ->selectRaw('
                COUNT(*) as total_transactions,
                COALESCE(SUM(payment_transactions.gross_amount), 0) as total_payment,
                COALESCE(SUM(payment_transactions.gateway_fee), 0) as total_gateway_fee
            ')
            ->groupBy('payment_transactions.provider')
            ->orderBy('payment_transactions.provider')
            ->get();

        // Riwayat pembayaran berhasil.
        $transactions = (clone $baseQuery)
            ->leftJoin(
                'campaigns',
                'campaigns.id',
                '=',
                'donations.campaign_id'
            )
            ->select(
                'payment_transactions.id',
                'payment_transactions.provider',
                'payment_transactions.order_id',
                'payment_transactions.transaction_id',
                'payment_transactions.payment_method',
                'payment_transactions.gross_amount',
                'payment_transactions.gateway_fee',
                'payment_transactions.paid_at',
                'donations.donation_code',
                'donations.donor_name',
                'campaigns.title as campaign_title'
            )
            ->orderByDesc('payment_transactions.paid_at')
            ->orderByDesc('payment_transactions.created_at')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Superadmin/GatewayFees/Index', [
            'summary' => [
                'total_transactions' => (int) $summary->total_transactions,
                'total_payment' => (int) $summary->total_payment,
                'total_gateway_fee' => (int) $summary->total_gateway_fee,
            ],
            'providerSummary' => $providerSummary,
            'transactions' => $transactions,
        ]);
    }
}
