<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use App\Models\AuditLog;
use App\Models\JournalEntry;
use App\Models\PaymentStatusHistory;
use App\Services\Finance\JournalService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

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
                'beneficiary_targets.name as beneficiary_name',
                'donations.transfer_proof',
                'donations.proof_status',
                'donations.proof_uploaded_at',
                'donations.verified_by',
                'donations.verified_at',
                'donations.verification_note',
                'donations.bank_name',
                'donations.bank_account_number',
                'donations.bank_account_holder'
            )
            ->first();
    
        abort_if(!$transaction, 404);
    
        $transaction->verifier_name = DB::table('users')
            ->where('id', $transaction->verified_by)
            ->value('name');
    
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
    


    public function proof(string $id)
    {
        $donation = DB::table('donations')
            ->where('id', $id)
            ->first(['id', 'transfer_proof']);
    
        abort_if(
            !$donation || !$donation->transfer_proof,
            404
        );
    
        $disk = Storage::disk('local');
    
        abort_unless(
            $disk->exists($donation->transfer_proof),
            404,
            'File bukti transfer tidak ditemukan.'
        );
    
        $path = $disk->path($donation->transfer_proof);
        $mimeType = $disk->mimeType($donation->transfer_proof);
        $fileName = basename($donation->transfer_proof);
    
        // Bersihkan output buffer sebelum mengirim gambar.
        while (ob_get_level() > 0) {
            ob_end_clean();
        }
    
        return response()->file($path, [
            'Content-Type' => $mimeType,
            'Content-Disposition' => 'inline; filename="' . $fileName . '"',
            'Cache-Control' => 'private, no-store',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
    
/**
 * Menyetujui bukti transfer manual dan membuat jurnal.
 */
public function approveProof(
    Request $request,
    string $id,
    JournalService $journalService
) {
    DB::transaction(function () use ($request, $id, $journalService) {

        $userId = Auth::id();

        // Kunci data donasi agar tidak diproses bersamaan.
        $donation = DB::table('donations')
            ->where('id', $id)
            ->lockForUpdate()
            ->first();

        if (!$donation) {
            abort(404);
        }

        if (
            $donation->payment_status !== 'pending' ||
            $donation->proof_status !== 'pending'
        ) {
            throw ValidationException::withMessages([
                'proof' => 'Donasi ini tidak sedang menunggu verifikasi bukti transfer.',
            ]);
        }

        if (
            empty($donation->transfer_proof) ||
            !Storage::disk('local')->exists($donation->transfer_proof)
        ) {
            throw ValidationException::withMessages([
                'proof' => 'File bukti transfer tidak ditemukan.',
            ]);
        }

        if ((bool) $donation->is_simulated) {
            throw ValidationException::withMessages([
                'proof' => 'Donasi simulasi tidak dapat diverifikasi sebagai pembayaran nyata.',
            ]);
        }

        $donationAmount = (int) $donation->donation_amount;
        $operationalSupport = (int) $donation->operational_support;
        $totalAmount = $donationAmount + $operationalSupport;

        if ($donationAmount <= 0 || $operationalSupport < 0) {
            throw ValidationException::withMessages([
                'proof' => 'Nominal donasi tidak valid.',
            ]);
        }

        // Ambil dan kunci transaksi pembayaran manual.
        $payment = DB::table('payment_transactions')
            ->where('donation_id', $id)
            ->where('provider', 'manual_bank_transfer')
            ->orderByDesc('created_at')
            ->lockForUpdate()
            ->first();

        if (!$payment || $payment->status !== 'pending') {
            throw ValidationException::withMessages([
                'proof' => 'Transaksi pembayaran manual tidak ditemukan atau sudah diproses.',
            ]);
        }

        if (
            (int) $payment->gross_amount !== $totalAmount ||
            (int) $payment->gateway_fee !== 0
        ) {
            throw ValidationException::withMessages([
                'proof' => 'Nominal transaksi tidak sesuai dengan data donasi.',
            ]);
        }

        // Pastikan jurnal untuk donasi ini belum pernah dibuat.
        $existingJournal = JournalEntry::where(
            'source_type',
            'donation_manual_transfer'
        )
            ->where('source_id', $id)
            ->exists();

        if ($existingJournal) {
            throw ValidationException::withMessages([
                'proof' => 'Jurnal untuk donasi ini sudah pernah dibuat.',
            ]);
        }

        // Ambil kampanye dan akun buku besarnya.
        $campaign = DB::table('campaigns')
            ->where('id', $donation->campaign_id)
            ->first();

        if (!$campaign || !$campaign->ledger_account_id) {
            throw ValidationException::withMessages([
                'proof' => 'Kampanye belum memiliki akun buku besar. Pemetaan akun harus diselesaikan terlebih dahulu.',
            ]);
        }

        $programAccount = DB::table('ledger_accounts')
            ->where('id', $campaign->ledger_account_id)
            ->where('is_active', true)
            ->where('fund_group', 'program')
            ->first();

        if (!$programAccount) {
            throw ValidationException::withMessages([
                'proof' => 'Akun buku besar program tidak ditemukan atau tidak aktif.',
            ]);
        }

        // Akun rekening bank 1002.
        $bankAccount = DB::table('ledger_accounts')
            ->where('code', '1002')
            ->where('is_active', true)
            ->first();

        if (!$bankAccount) {
            throw ValidationException::withMessages([
                'proof' => 'Akun Rekening Bank (1002) tidak ditemukan atau tidak aktif.',
            ]);
        }

        // Susun baris jurnal.
        $lines = [
            [
                'ledger_account_id' => $bankAccount->id,
                'description' => 'Penerimaan transfer donasi ' . $donation->donation_code,
                'debit' => $totalAmount,
                'credit' => 0,
            ],
            [
                'ledger_account_id' => $programAccount->id,
                'description' => 'Penerimaan dana program ' . $campaign->title,
                'debit' => 0,
                'credit' => $donationAmount,
            ],
        ];

        // Jika ada dukungan operasional, masukkan ke akun 3101.
        if ($operationalSupport > 0) {
            $operationalAccount = DB::table('ledger_accounts')
                ->where('code', '3101')
                ->where('is_active', true)
                ->first();

            if (!$operationalAccount) {
                throw ValidationException::withMessages([
                    'proof' => 'Akun Dana Operasional (3101) tidak ditemukan atau tidak aktif.',
                ]);
            }

            $lines[] = [
                'ledger_account_id' => $operationalAccount->id,
                'description' => 'Penerimaan dukungan operasional',
                'debit' => 0,
                'credit' => $operationalSupport,
            ];
        }

        // Buat dan posting jurnal.
        $journal = $journalService->createDraft([
            'entry_date' => now()->toDateString(),
            'description' => 'Verifikasi transfer donasi ' . $donation->donation_code,
            'source_type' => 'donation_manual_transfer',
            'source_id' => $donation->id,
            'lines' => $lines,
        ], $userId);

        $postedJournal = $journalService->post($journal, $userId);

        // Perbarui status donasi setelah jurnal berhasil diposting.
        DB::table('donations')
            ->where('id', $id)
            ->update([
                'payment_status' => 'paid',
                'proof_status' => 'approved',
                'verified_by' => $userId,
                'verified_at' => now(),
                'verification_note' => null,
                'updated_at' => now(),
            ]);

        // Perbarui transaksi pembayaran.
        DB::table('payment_transactions')
            ->where('id', $payment->id)
            ->update([
                'status' => 'paid',
                'paid_at' => now(),
                'payment_method' => $payment->payment_method ?: 'bank_transfer',
                'updated_at' => now(),
            ]);

        // Catat perubahan status pembayaran.
        PaymentStatusHistory::create([
            'donation_id' => $id,
            'old_status' => 'pending',
            'new_status' => 'paid',
            'provider_status' => 'manual_superadmin_verified',
            'transaction_id' => $payment->transaction_id,
            'payment_method' => $payment->payment_method ?: 'bank_transfer',
            'metadata' => [
                'verified_by' => $userId,
                'journal_id' => $postedJournal->id,
                'journal_number' => $postedJournal->journal_number,
            ],
        ]);

        // Catat aktivitas Superadmin.
        AuditLog::create([
            'user_id' => $userId,
            'action' => 'donation.manual_transfer_verified',
            'entity_type' => \App\Models\Donation::class,
            'entity_id' => $id,
            'metadata' => [
                'donation_code' => $donation->donation_code,
                'donation_amount' => $donationAmount,
                'operational_support' => $operationalSupport,
                'journal_id' => $postedJournal->id,
                'journal_number' => $postedJournal->journal_number,
            ],
            'ip_address' => $request->ip(),
        ]);
    });

    return redirect()
        ->route('superadmin.transactions.show', $id)
        ->with('success', 'Bukti transfer berhasil diverifikasi dan jurnal berhasil diposting.');
}

/**
 * Menolak bukti transfer manual.
 */
public function rejectProof(Request $request, string $id)
{
    $data = $request->validate([
        'reason' => ['required', 'string', 'max:1000'],
    ]);

    DB::transaction(function () use ($request, $id, $data) {

        $userId = Auth::id();

        $donation = DB::table('donations')
            ->where('id', $id)
            ->lockForUpdate()
            ->first();

        if (!$donation) {
            abort(404);
        }

        if (
            $donation->payment_status !== 'pending' ||
            $donation->proof_status !== 'pending'
        ) {
            throw ValidationException::withMessages([
                'proof' => 'Bukti transfer ini tidak sedang menunggu pemeriksaan.',
            ]);
        }

        if (
            empty($donation->transfer_proof) ||
            !Storage::disk('local')->exists($donation->transfer_proof)
        ) {
            throw ValidationException::withMessages([
                'proof' => 'File bukti transfer tidak ditemukan.',
            ]);
        }

        if ((bool) $donation->is_simulated) {
            throw ValidationException::withMessages([
                'proof' => 'Donasi simulasi tidak dapat diproses melalui verifikasi transfer.',
            ]);
        }

        $payment = DB::table('payment_transactions')
            ->where('donation_id', $id)
            ->where('provider', 'manual_bank_transfer')
            ->orderByDesc('created_at')
            ->lockForUpdate()
            ->first();

        if (!$payment || $payment->status !== 'pending') {
            throw ValidationException::withMessages([
                'proof' => 'Transaksi pembayaran manual tidak ditemukan atau sudah diproses.',
            ]);
        }

        // Penolakan tidak mengubah status pembayaran menjadi paid.
        DB::table('donations')
            ->where('id', $id)
            ->update([
                'proof_status' => 'rejected',
                'verified_by' => $userId,
                'verified_at' => now(),
                'verification_note' => trim($data['reason']),
                'updated_at' => now(),
            ]);

        // Catat aktivitas penolakan.
        AuditLog::create([
            'user_id' => $userId,
            'action' => 'donation.manual_transfer_rejected',
            'entity_type' => \App\Models\Donation::class,
            'entity_id' => $id,
            'metadata' => [
                'donation_code' => $donation->donation_code,
                'reason' => trim($data['reason']),
                'proof_path' => $donation->transfer_proof,
            ],
            'ip_address' => $request->ip(),
        ]);
    });

    return redirect()
        ->route('superadmin.transactions.show', $id)
        ->with('success', 'Bukti transfer berhasil ditolak.');
}
}
