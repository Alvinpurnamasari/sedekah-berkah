<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReconciliationController extends Controller
{
    public function index(Request $request)
    {
        $allowedResults = ['matched', 'review', 'incomplete'];

        $result = $request->input('result');

        if (!in_array($result, $allowedResults, true)) {
            $result = '';
        }

        $query = DB::table('donations')
            ->leftJoin(
                'payment_transactions',
                'payment_transactions.donation_id',
                '=',
                'donations.id'
            )
            ->leftJoin(
                'campaigns',
                'campaigns.id',
                '=',
                'donations.campaign_id'
            )
            ->where('donations.is_simulated', false)
            ->select(
                'donations.id',
                'donations.donation_code',
                'donations.donor_name',
                'donations.donation_amount',
                'donations.operational_support',
                'donations.payment_status',
                'payment_transactions.id as payment_transaction_id',
                'payment_transactions.order_id',
                'payment_transactions.gross_amount',
                'payment_transactions.gateway_fee',
                'payment_transactions.status as gateway_status',
                'payment_transactions.transaction_id',
                'payment_transactions.payment_method',
                'payment_transactions.paid_at',
                'campaigns.title as campaign_title'
            );

        // Filter pencarian
        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('donations.donation_code', 'like', "%{$search}%")
                    ->orWhere('donations.donor_name', 'like', "%{$search}%")
                    ->orWhere('payment_transactions.order_id', 'like', "%{$search}%");
            });
        }

        // Filter hasil rekonsiliasi
        if ($result === 'matched') {
            $query->whereNotNull('payment_transactions.id')
                ->whereRaw(
                    'payment_transactions.gross_amount = (donations.donation_amount + donations.operational_support)'
                )
                ->whereColumn(
                    'payment_transactions.status',
                    'donations.payment_status'
                );
        } elseif ($result === 'review') {
            $query->whereNotNull('payment_transactions.id')
                ->where(function ($q) {
                    $q->whereRaw(
                        'payment_transactions.gross_amount <> (donations.donation_amount + donations.operational_support)'
                    )->orWhereColumn(
                        'payment_transactions.status',
                        '<>',
                        'donations.payment_status'
                    );
                });
        } elseif ($result === 'incomplete') {
            $query->whereNull('payment_transactions.id');
        }

        $transactions = $query
            ->orderByDesc('donations.created_at')
            ->paginate(15)
            ->withQueryString()
            ->through(function ($item) {
                $donationTotal =
                    (int) $item->donation_amount +
                    (int) $item->operational_support;

                $gatewayAmount = $item->gross_amount !== null
                    ? (int) $item->gross_amount
                    : null;

                $amountMatches = $gatewayAmount !== null
                    && $donationTotal === $gatewayAmount;

                $statusMatches = $item->gateway_status !== null
                    && $item->payment_status === $item->gateway_status;

                if ($item->payment_transaction_id === null) {
                    $reconciliationStatus = 'incomplete';
                    $reconciliationNote = 'Data transaksi pembayaran belum tersedia.';
                } elseif (!$amountMatches || !$statusMatches) {
                    $reconciliationStatus = 'review';
                    $reconciliationNote = 'Terdapat perbedaan nominal atau status pembayaran.';
                } else {
                    $reconciliationStatus = 'matched';
                    $reconciliationNote = 'Nominal dan status pembayaran sesuai.';
                }

                return [
                    'id' => $item->id,
                    'donation_code' => $item->donation_code,
                    'donor_name' => $item->donor_name,
                    'campaign_title' => $item->campaign_title,
                    'donation_total' => $donationTotal,
                    'gateway_amount' => $gatewayAmount,
                    'payment_status' => $item->payment_status,
                    'gateway_status' => $item->gateway_status,
                    'order_id' => $item->order_id,
                    'transaction_id' => $item->transaction_id,
                    'payment_method' => $item->payment_method,
                    'paid_at' => $item->paid_at,
                    'amount_matches' => $amountMatches,
                    'status_matches' => $statusMatches,
                    'reconciliation_status' => $reconciliationStatus,
                    'reconciliation_note' => $reconciliationNote,
                ];
            });

        // Ringkasan seluruh transaksi non-simulasi
        $summary = [
            'total' => DB::table('donations')
                ->where('is_simulated', false)
                ->count(),

            'matched' => DB::table('donations')
                ->where('is_simulated', false)
                ->whereExists(function ($q) {
                    $q->select(DB::raw(1))
                        ->from('payment_transactions')
                        ->whereColumn(
                            'payment_transactions.donation_id',
                            'donations.id'
                        )
                        ->whereRaw(
                            'payment_transactions.gross_amount = (donations.donation_amount + donations.operational_support)'
                        )
                        ->whereColumn(
                            'payment_transactions.status',
                            'donations.payment_status'
                        );
                })
                ->count(),

            'incomplete' => DB::table('donations')
                ->where('is_simulated', false)
                ->whereNotExists(function ($q) {
                    $q->select(DB::raw(1))
                        ->from('payment_transactions')
                        ->whereColumn(
                            'payment_transactions.donation_id',
                            'donations.id'
                        );
                })
                ->count(),
        ];

        $summary['review'] = max(
            0,
            $summary['total'] - $summary['matched'] - $summary['incomplete']
        );

        return Inertia::render('Superadmin/Reconciliation/Index', [
            'summary' => $summary,
            'transactions' => $transactions,
            'filters' => $request->only('search', 'result'),
        ]);
    }
}
