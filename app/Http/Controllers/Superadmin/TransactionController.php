<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index(Request $request)
{
    $statuses = ['pending', 'paid', 'failed', 'expired'];

    $request->validate([
        'search' => ['nullable', 'string', 'max:100'],
        'status' => ['nullable', 'in:pending,paid,failed,expired'],
        'start_date' => ['nullable', 'date'],
        'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
    ]);

        // Ringkasan seluruh transaksi, tidak terpengaruh filter tabel.
        $summaryData = DB::table('donations')
            ->selectRaw("
                COUNT(*) as total,
                SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) as paid,
                SUM(CASE WHEN payment_status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN payment_status = 'failed' THEN 1 ELSE 0 END) as failed,
                SUM(CASE WHEN payment_status = 'expired' THEN 1 ELSE 0 END) as expired
            ")
            ->first();

        $query = DB::table('donations')
            ->join('campaigns', 'campaigns.id', '=', 'donations.campaign_id')
            ->leftJoin(
                'beneficiary_targets',
                'beneficiary_targets.id',
                '=',
                'donations.beneficiary_target_id'
            )
            ->select(
                'donations.id',
                'donations.donation_code',
                'donations.donor_name',
                'donations.donor_email',
                'donations.donor_phone',
                'donations.donation_amount',
                'donations.operational_support',
                'donations.is_anonymous',
                'donations.message',
                'donations.payment_status',
                'donations.is_simulated',
                'donations.created_at',
                'campaigns.title as campaign_title',
                'beneficiary_targets.name as beneficiary_name'
            );

        // Pencarian transaksi.
        $search = trim((string) $request->input('search', ''));

        if ($search !== '') {

            $query->where(function ($q) use ($search) {
                $q->where('donations.donation_code', 'like', "%{$search}%")
                    ->orWhere('donations.donor_name', 'like', "%{$search}%")
                    ->orWhere('donations.donor_email', 'like', "%{$search}%")
                    ->orWhere('donations.donor_phone', 'like', "%{$search}%")
                    ->orWhere('campaigns.title', 'like', "%{$search}%");
            
                // Pencarian khusus donatur anonim.
                $normalizedSearch = mb_strtolower($search);
            
                if (
                    str_contains($normalizedSearch, 'hamba') ||
                    str_contains($normalizedSearch, 'allah')
                ) {
                    $q->orWhere('donations.is_anonymous', true);
                }
            });
        }

        // Filter status.
        if (in_array($request->status, $statuses, true)) {
            $query->where(
                'donations.payment_status',
                $request->status
            ); 
        }

        // Filter tanggal mulai.
        if ($request->filled('start_date')) {
            $query->whereDate(
                'donations.created_at',
                '>=',
                $request->start_date
            );
        }

        // Filter tanggal selesai.
        if ($request->filled('end_date')) {
            $query->whereDate(
                'donations.created_at',
                '<=',
                $request->end_date
            );
        }

        $transactions = $query
            ->orderByDesc('donations.created_at')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Superadmin/Transactions/Index', [
            'summary' => [
                'total' => (int) ($summaryData->total ?? 0),
                'paid' => (int) ($summaryData->paid ?? 0),
                'pending' => (int) ($summaryData->pending ?? 0),
                'failed' => (int) ($summaryData->failed ?? 0),
                'expired' => (int) ($summaryData->expired ?? 0),
            ],
            'transactions' => $transactions,
            'filters' => [
                'search' => $request->search ?? '',
                'status' => $request->status ?? '',
                'start_date' => $request->start_date ?? '',
                'end_date' => $request->end_date ?? '',
            ],
        ]);
    }

    public function show(string $id)
    {
        $transaction = DB::table('donations')
            ->join('campaigns', 'campaigns.id', '=', 'donations.campaign_id')
            ->leftJoin(
                'beneficiary_targets',
                'beneficiary_targets.id',
                '=',
                'donations.beneficiary_target_id'
            )
            ->where('donations.id', $id)
            ->select(
                'donations.id',
                'donations.donation_code',
                'donations.donor_name',
                'donations.donor_email',
                'donations.donor_phone',
                'donations.donation_amount',
                'donations.operational_support',
                'donations.is_anonymous',
                'donations.message',
                'donations.payment_status',
                'donations.is_simulated',
                'donations.created_at as donation_date',
                'campaigns.title as campaign_title',
                'beneficiary_targets.name as beneficiary_name'
            )
            ->first();
    
        abort_if(!$transaction, 404);
    
        // Ambil informasi transaksi gateway terbaru.
        $payment = DB::table('payment_transactions')
            ->where('donation_id', $id)
            ->latest('created_at')
            ->first();
    
        // Ambil seluruh riwayat perubahan status.
        $history = DB::table('payment_status_histories')
            ->where('donation_id', $id)
            ->orderBy('created_at')
            ->get();
    
        return Inertia::render('Superadmin/Transactions/Show', [
            'transaction' => $transaction,
            'payment' => $payment,
            'history' => $history,
        ]);
    }
    
}
