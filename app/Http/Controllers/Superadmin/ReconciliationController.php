<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReconciliationController extends Controller
{
    /**
     * Kondisi transaksi yang benar-benar cocok.
     */
    private function applyMatchedCondition($query): void
    {
        $query->whereExists(function ($q) {
            $q->select(DB::raw(1))
                ->from('payment_transactions')
                ->whereColumn(
                    'payment_transactions.donation_id',
                    'donations.id'
                )
                ->whereRaw(
                    'payment_transactions.gross_amount =
                    (donations.donation_amount + donations.operational_support)'
                )
                ->where('payment_transactions.status', 'paid')
                ->where('donations.payment_status', 'paid')
                ->where(function ($provider) {
                    $provider->where(function ($manual) {
                        $manual->where(
                            'payment_transactions.provider',
                            'manual_bank_transfer'
                        )->whereNotNull('donations.transfer_proof')
                            ->where('donations.proof_status', 'approved');
                        })->orWhere(function ($online) {
                            $online->where(
                                'payment_transactions.provider',
                                'midtrans'
                            );
                        });
                });
        });
    }
/**
 * Kondisi transaksi yang masih menunggu pembayaran atau verifikasi.
 */
private function applyPendingCondition($query): void
{
    $query->whereExists(function ($q) {
        $q->select(DB::raw(1))
            ->from('payment_transactions')
            ->whereColumn(
                'payment_transactions.donation_id',
                'donations.id'
            )
            ->whereRaw(
                'payment_transactions.gross_amount =
                (donations.donation_amount + donations.operational_support)'
            )
            ->where('payment_transactions.status', 'pending')
            ->where('donations.payment_status', 'pending')
            ->where(function ($provider) {
                $provider->where(
                    'payment_transactions.provider',
                    'midtrans'
                )->orWhere(function ($manual) {
                    $manual->where(
                        'payment_transactions.provider',
                        'manual_bank_transfer'
                    )
                    ->whereNotNull('donations.transfer_proof')
                    ->where('donations.proof_status', 'pending');
                });
            });
    });
}
    /**
     * Kondisi transaksi yang belum lengkap.
     */
    private function applyIncompleteCondition($query): void
    {
        $query->where(function ($q) {
            // Belum memiliki data transaksi pembayaran.
            $q->whereNotExists(function ($payment) {
                $payment->select(DB::raw(1))
                    ->from('payment_transactions')
                    ->whereColumn(
                        'payment_transactions.donation_id',
                        'donations.id'
                    );
            })

            // Transfer manual belum mengunggah bukti.
            ->orWhereExists(function ($payment) {
                $payment->select(DB::raw(1))
                    ->from('payment_transactions')
                    ->whereColumn(
                        'payment_transactions.donation_id',
                        'donations.id'
                    )
                    ->where(
                        'payment_transactions.provider',
                        'manual_bank_transfer'
                    )
                    ->whereNull('donations.transfer_proof');
            });
        });
    }

    public function index(Request $request)
    {
        $allowedResults = [
            'matched',
            'pending',
            'review',
            'incomplete',
        ];

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
                'donations.transfer_proof',
                'donations.proof_status',
                'donations.created_at',
                'payment_transactions.id as payment_transaction_id',
                'payment_transactions.provider',
                'payment_transactions.order_id',
                'payment_transactions.gross_amount',
                'payment_transactions.gateway_fee',
                'payment_transactions.status as gateway_status',
                'payment_transactions.transaction_id',
                'payment_transactions.payment_method',
                'payment_transactions.paid_at',
                'payment_transactions.raw_response',
                'campaigns.title as campaign_title'
            );

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('donations.donation_code', 'like', "%{$search}%")
                    ->orWhere('donations.donor_name', 'like', "%{$search}%")
                    ->orWhere('payment_transactions.order_id', 'like', "%{$search}%");
            });
        }
   
        if ($result === 'matched') {
            $this->applyMatchedCondition($query);

        } elseif ($result === 'pending') {
            $this->applyPendingCondition($query);

        } elseif ($result === 'review') {
            $query->whereNotNull('payment_transactions.id')
                ->where(function ($q) {
                    $q->whereRaw(
                        'payment_transactions.gross_amount <> (donations.donation_amount + donations.operational_support)'
                    )
                    ->orWhere('donations.payment_status', '<>', 'paid')
                    ->orWhere('payment_transactions.status', '<>', 'paid')
                    ->orWhere(function ($manual) {
                        $manual->where(
                            'payment_transactions.provider',
                            'manual_bank_transfer'
                        )
                        ->where(function ($proof) {
                            $proof->whereNull('donations.transfer_proof')
                                ->orWhereNull('donations.proof_status')
                                ->orWhere('donations.proof_status', '<>', 'approved');
                        });
                    });
                });

        } elseif ($result === 'incomplete') {
            $this->applyIncompleteCondition($query);
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

                $isManual = $item->provider === 'manual_bank_transfer';

                $statusMatches = $item->payment_status === 'paid'
                    && $item->gateway_status === 'paid';

                $proofApproved = $isManual
                    && $item->transfer_proof !== null
                    && $item->proof_status === 'approved';

                    $isMatched = $amountMatches
                    && $statusMatches
                    && (!$isManual || $proofApproved);
                
                $isPending = $amountMatches
                    && $item->payment_status === 'pending'
                    && $item->gateway_status === 'pending'
                    && (
                        !$isManual
                        || (
                            $item->transfer_proof !== null
                            && $item->proof_status === 'pending'
                        )
                    );
                
                if ($item->payment_transaction_id === null) {
                    $reconciliationStatus = 'incomplete';
                    $reconciliationNote = 'Data transaksi pembayaran belum tersedia.';
                } elseif ($isManual && $item->transfer_proof === null) {
                    $reconciliationStatus = 'incomplete';
                    $reconciliationNote = 'Donatur belum mengunggah bukti transfer.';
                } elseif ($isPending) {
                    $reconciliationStatus = 'pending';
                    $reconciliationNote = 'Transaksi masih menunggu pembayaran atau verifikasi.';
                } elseif ($isManual && $item->proof_status === 'rejected') {
                    $reconciliationStatus = 'review';
                    $reconciliationNote = 'Bukti transfer ditolak dan perlu ditindaklanjuti.';
                } elseif ($isManual && $item->proof_status !== 'approved') {
                    $reconciliationStatus = 'review';
                    $reconciliationNote = 'Bukti transfer belum disetujui Superadmin.';
                } elseif (!$amountMatches) {
                    $reconciliationStatus = 'review';
                    $reconciliationNote = 'Nominal donasi dan transaksi pembayaran berbeda.';
                } elseif (!$statusMatches) {
                    $reconciliationStatus = 'review';
                    $reconciliationNote = 'Status donasi dan transaksi pembayaran belum sesuai.';
                } elseif ($isMatched) {
                    $reconciliationStatus = 'matched';
                    $reconciliationNote = 'Nominal, status, dan verifikasi pembayaran sesuai.';
                } else {
                    $reconciliationStatus = 'review';
                    $reconciliationNote = 'Transaksi perlu diperiksa lebih lanjut.';
                }

                $rawResponse = $item->raw_response;

                if (is_string($rawResponse)) {
                    $rawResponse = json_decode($rawResponse, true);
                }

                $providerStatus = is_array($rawResponse)
                    ? ($rawResponse['transaction_status'] ?? null)
                    : null;

                return [
                    'id' => $item->id,
                    'donation_code' => $item->donation_code,
                    'donor_name' => $item->donor_name,
                    'campaign_title' => $item->campaign_title,
                    'donation_total' => $donationTotal,
                    'gateway_amount' => $gatewayAmount,
                    'payment_status' => $item->payment_status,
                    'provider' => $item->provider,
                    'transfer_proof' => $item->transfer_proof,
                    'gateway_status' => $item->gateway_status,
                    'provider_status' => $providerStatus,
                    'order_id' => $item->order_id,
                    'transaction_id' => $item->transaction_id,
                    'payment_method' => $item->payment_method,
                    'paid_at' => $item->paid_at,
                    'amount_matches' => $amountMatches,
                    'status_matches' => $statusMatches,
                    'proof_status' => $item->proof_status,
                    'reconciliation_status' => $reconciliationStatus,
                    'reconciliation_note' => $reconciliationNote,
                ];
            });

        $base = DB::table('donations')
            ->where('is_simulated', false);

        $total = (clone $base)->count();

        $matchedQuery = clone $base;
        $this->applyMatchedCondition($matchedQuery);
        $matched = $matchedQuery->count();

        $pendingQuery = clone $base;
        $this->applyPendingCondition($pendingQuery);
        $pending = $pendingQuery->count();

        $incompleteQuery = clone $base;
        $this->applyIncompleteCondition($incompleteQuery);
        $incomplete = $incompleteQuery->count();

        $summary = [
            'total' => $total,
            'matched' => $matched,
            'pending' => $pending,
            'incomplete' => $incomplete,
            'review' => max(0, $total - $matched - $pending - $incomplete),
        ];

        return Inertia::render('Superadmin/Reconciliation/Index', [
            'summary' => $summary,
            'transactions' => $transactions,
            'filters' => $request->only('search', 'result'),
        ]);
    }
}
