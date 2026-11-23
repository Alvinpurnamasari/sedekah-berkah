<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\Campaign;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Distribution;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Storage;
use App\Models\LedgerAccount;
use App\Services\Finance\JournalService;

class ExpenseController extends Controller
{
    public function index()
{
    $expenses = Expense::with('campaign:id,title')
        ->where('submitted_by', Auth::id())
        ->latest()
        ->paginate(10);

    return Inertia::render('Admin/Expenses/Index', [
        'expenses' => $expenses,

        'campaigns' => Campaign::whereIn('status', ['active', 'published'])
            ->orderBy('title')
            ->get(['id', 'title']),

            'distributions' => Distribution::with('campaign:id,title')
            ->where('created_by', Auth::id())
            ->latest()
            ->get([
                'id',
                'campaign_id',
                'title',
                'status',
                'is_simulated',
            ]),
    ]);
}


public function store(Request $request)
{
    $data = $request->validate([
        'expense_type' => ['required', 'in:distribution_detail,additional'],

        'distribution_id' => [
            'nullable',
            'required_if:expense_type,distribution_detail',
            'exists:distributions,id',
        ],

        'campaign_id' => ['nullable', 'exists:campaigns,id'],
        'expense_category' => ['required', 'string', 'max:100'],
        'description' => ['required', 'string', 'max:1000'],
        'amount' => ['required', 'integer', 'min:1000', 'max:100000000'],
    ]);

    DB::transaction(function () use ($data) {
        $distribution = null;

        if ($data['expense_type'] === 'distribution_detail') {
            $distribution = Distribution::where('id', $data['distribution_id'])
                ->lockForUpdate()
                ->firstOrFail();

            if ((string) $distribution->created_by !== (string) Auth::id()) {
                throw ValidationException::withMessages([
                    'distribution_id' => 'Anda hanya dapat mengajukan pengeluaran untuk kegiatan yang Anda buat sendiri.',
                ]);
            }   

            if ($distribution->budget_status !== 'approved') {
                throw ValidationException::withMessages([
                    'distribution_id' => 'Pengeluaran belum dapat diajukan karena anggaran penyaluran belum disetujui Superadmin.',
                ]);
            }

            $usedBudget = Expense::where('distribution_id', $distribution->id)
                ->where('is_simulated', (bool) $distribution->is_simulated)
                ->whereIn('approval_status', ['pending', 'approved'])
                ->sum('amount');

            $remainingBudget = (int) $distribution->approved_budget
                - (int) $usedBudget;

            if ((int) $data['amount'] > $remainingBudget) {
                throw ValidationException::withMessages([
                    'amount' => 'Nominal pengeluaran melebihi sisa anggaran sebesar Rp'
                        . number_format(max(0, $remainingBudget), 0, ',', '.')
                        . '.',
                ]);
            }
        }

        Expense::create([
            'expense_type' => $data['expense_type'],
            'distribution_id' => $distribution?->id,

            'campaign_id' => $distribution
                ? $distribution->campaign_id
                : ($data['campaign_id'] ?? null),

            'expense_category' => $data['expense_category'],
            'description' => $data['description'],
            'amount' => $data['amount'],

            'is_simulated' => $distribution
                ? (bool) $distribution->is_simulated
                : false,

            'approval_status' => 'pending',
            'submitted_by' => Auth::id(),
        ]);
    });

    return back()->with(
        'success',
        'Pengajuan pengeluaran berhasil dikirim untuk persetujuan Superadmin.'
    );
}

/**
 * Mencatat pembayaran pengeluaran oleh Admin
 * dan membuat jurnal otomatis untuk pengeluaran nyata.
 */
public function recordPayment(Request $request, $id)
{
    $data = $request->validate([
        'payment_source' => [
            'required',
            'in:cash,bank',
        ],
        'proof' => [
            'required',
            'file',
            'mimes:jpg,jpeg,png,pdf',
            'max:5120',
        ],
    ], [
        'payment_source.required' => 'Sumber pembayaran wajib dipilih.',
        'payment_source.in' => 'Sumber pembayaran tidak valid.',
        'proof.required' => 'Bukti pembayaran wajib diunggah.',
        'proof.mimes' => 'Bukti harus berupa JPG, JPEG, PNG, atau PDF.',
        'proof.max' => 'Ukuran bukti maksimal 5 MB.',
    ]);

    $proofPath = null;

    try {
        DB::transaction(function () use ($request, $data, $id, &$proofPath) {
            $expense = Expense::where('id', $id)
                ->where('submitted_by', Auth::id())
                ->lockForUpdate()
                ->firstOrFail();

            if ($expense->approval_status !== 'approved') {
                throw ValidationException::withMessages([
                    'proof' => 'Pengeluaran harus disetujui Superadmin sebelum pembayaran dicatat.',
                ]);
            }

            if (($expense->payment_status ?? 'unpaid') !== 'unpaid') {
                throw ValidationException::withMessages([
                    'proof' => 'Pembayaran pengeluaran ini sudah pernah dicatat.',
                ]);
            }

            if ($expense->journal_entry_id) {
                throw ValidationException::withMessages([
                    'proof' => 'Pengeluaran ini sudah terhubung dengan jurnal.',
                ]);
            }

            $distribution = null;

            if ($expense->distribution_id) {
                $distribution = DB::table('distributions')
                    ->where('id', $expense->distribution_id)
                    ->lockForUpdate()
                    ->first();

                if (!$distribution) {
                    throw ValidationException::withMessages([
                        'proof' => 'Data penyaluran tidak ditemukan.',
                    ]);
                }

                if ((bool) $expense->is_simulated !== (bool) $distribution->is_simulated) {
                    throw ValidationException::withMessages([
                        'proof' => 'Status simulasi pengeluaran tidak sesuai dengan kegiatan penyaluran.',
                    ]);
                }
                if ((string) $distribution->created_by !== (string) Auth::id()) {
                    throw ValidationException::withMessages([
                        'proof' => 'Anda tidak memiliki akses ke kegiatan penyaluran ini.',
                    ]);
                }
                
                if ($distribution->budget_status !== 'approved') {
                    throw ValidationException::withMessages([
                        'proof' => 'Anggaran penyaluran belum disetujui.',
                    ]);
                }

                $paidBefore = (int) DB::table('expenses')
                    ->where('distribution_id', $distribution->id)
                    ->where('approval_status', 'approved')
                    ->where('payment_status', 'paid')
                    ->where('is_simulated', (bool) $distribution->is_simulated)
                    ->sum('amount');

                $paidAfter = $paidBefore + (int) $expense->amount;
                $approvedBudget = (int) $distribution->approved_budget;

                if ($paidAfter > $approvedBudget) {
                    $remaining = max(0, $approvedBudget - $paidBefore);

                    throw ValidationException::withMessages([
                        'proof' => 'Pembayaran melebihi sisa anggaran. Sisa anggaran saat ini Rp'
                            . number_format($remaining, 0, ',', '.')
                            . '.',
                    ]);
                }
            }

           
            // Simpan bukti pembayaran secara privat.
            // Gambar dinormalisasi menjadi PNG agar lebih kompatibel.
            $uploadedProof = $request->file('proof');

            $imageInfo = @getimagesize($uploadedProof->getRealPath());

            if (
                $imageInfo !== false &&
                in_array($imageInfo['mime'], ['image/png', 'image/jpeg'], true)
            ) {
                $image = @imagecreatefromstring(
                    file_get_contents($uploadedProof->getRealPath())
                );

                if ($image === false) {
                    throw new \RuntimeException(
                        'Bukti pembayaran tidak dapat diproses sebagai gambar.'
                    );
                }

                ob_start();
                $pngSaved = imagepng($image);
                $pngContents = ob_get_clean();

                imagedestroy($image);

                if (!$pngSaved || $pngContents === false) {
                    throw new \RuntimeException(
                        'Gagal menormalisasi gambar bukti pembayaran.'
                    );
                }

                $proofPath = 'expense-payment-proofs/'
                    . bin2hex(random_bytes(16))
                    . '.png';

                $saved = Storage::disk('local')->put(
                    $proofPath,
                    $pngContents
                );
            } else {
                // PDF tetap disimpan dalam format aslinya.
                $proofPath = Storage::disk('local')->putFile(
                    'expense-payment-proofs',
                    $uploadedProof
                );

                $saved = (bool) $proofPath;
            }

            if (!$saved || !$proofPath) {
                throw new \RuntimeException(
                    'Gagal menyimpan bukti pembayaran.'
                );
            }


            // Catat pembayaran pengeluaran.
            $expense->update([
                'receipt_file' => $proofPath,
                'payment_source' => $data['payment_source'],
                'payment_status' => 'paid',
                'paid_at' => now(),
                'paid_by' => Auth::id(),
            ]);

            /*
             * JURNAL OTOMATIS
             *
             * Pengeluaran simulasi tidak menghasilkan jurnal nyata.
             */
            if (!$expense->is_simulated) {

                // Pastikan belum ada jurnal untuk sumber pengeluaran ini.
                $existingJournal = DB::table('journal_entries')
                    ->where('source_type', 'expense')
                    ->where('source_id', (string) $expense->id)
                    ->exists();

                if ($existingJournal) {
                    throw ValidationException::withMessages([
                        'proof' => 'Jurnal untuk pengeluaran ini sudah pernah dibuat. Periksa data jurnal sebelum melanjutkan.',
                    ]);
                }

                // Tentukan akun debit berdasarkan jenis pengeluaran.
                $debitCode = match ($expense->expense_type) {
                    'distribution_detail' => '5003',
                    'additional' => '5002',
                    default => null,
                };

                if (!$debitCode) {
                    throw ValidationException::withMessages([
                        'proof' => 'Jenis pengeluaran tidak memiliki pemetaan akun jurnal.',
                    ]);
                }

                // Tentukan akun kredit berdasarkan sumber pembayaran.
                $creditCode = match ($data['payment_source']) {
                    'cash' => '1001',
                    'bank' => '1002',
                };

                $debitAccount = LedgerAccount::where('code', $debitCode)
                    ->where('is_active', true)
                    ->first();

                $creditAccount = LedgerAccount::where('code', $creditCode)
                    ->where('is_active', true)
                    ->first();

                if (!$debitAccount || !$creditAccount) {
                    throw ValidationException::withMessages([
                        'proof' => 'Akun buku besar untuk pengeluaran tidak ditemukan atau tidak aktif.',
                    ]);
                }

                $amount = (int) $expense->amount;

                if ($amount <= 0) {
                    throw ValidationException::withMessages([
                        'proof' => 'Nominal pengeluaran tidak valid untuk jurnal.',
                    ]);
                }

                // Buat jurnal draft.
                $journalService = app(JournalService::class);

                $journal = $journalService->createDraft([
                    'entry_date' => now()->toDateString(),
                    'description' => 'Pembayaran pengeluaran: '
                        . $expense->expense_category
                        . ' - '
                        . $expense->description,

                    'source_type' => 'expense',
                    'source_id' => (string) $expense->id,

                    'lines' => [
                        [
                            'ledger_account_id' => $debitAccount->id,
                            'description' => 'Beban pengeluaran '
                                . $expense->expense_category,
                            'debit' => $amount,
                            'credit' => 0,
                        ],
                        [
                            'ledger_account_id' => $creditAccount->id,
                            'description' => $data['payment_source'] === 'cash'
                                ? 'Pembayaran melalui kas'
                                : 'Pembayaran melalui rekening bank',
                            'debit' => 0,
                            'credit' => $amount,
                        ],
                    ],
                ], Auth::id());

                // Posting jurnal.
                $postedJournal = $journalService->post(
                    $journal,
                    Auth::id()
                );

                // Simpan relasi jurnal ke pengeluaran.
                $expense->update([
                    'journal_entry_id' => $postedJournal->id,
                ]);
            }

            // Perbarui rekap total biaya aktual penyaluran.
            if ($distribution) {
                $paidTotal = (int) DB::table('expenses')
                    ->where('distribution_id', $distribution->id)
                    ->where('approval_status', 'approved')
                    ->where('payment_status', 'paid')
                    ->where('is_simulated', (bool) $distribution->is_simulated)
                    ->sum('amount');

                DB::table('distributions')
                    ->where('id', $distribution->id)
                    ->update([
                        'total_cost' => $paidTotal,
                        'updated_at' => now(),
                    ]);
            }
        });
    } catch (\Throwable $e) {
        // Hapus file jika transaksi database gagal.
        if ($proofPath) {
            Storage::disk('local')->delete($proofPath);
        }

        throw $e;
    }

    return back()->with(
        'success',
        'Pembayaran pengeluaran berhasil dicatat. Jurnal dibuat otomatis hanya untuk pengeluaran nyata.'
    );
}



/**
 * Menampilkan bukti pembayaran secara privat.
 */
public function paymentProof(string $id)
{
    $expense = Expense::findOrFail($id);

    abort_unless(
        $expense->payment_status === 'paid'
        && $expense->receipt_file
        && Storage::disk('local')->exists($expense->receipt_file),
        404,
        'Bukti pembayaran tidak ditemukan.'
    );

    $disk = Storage::disk('local');
    $path = $disk->path($expense->receipt_file);
    $mimeType = $disk->mimeType($expense->receipt_file);
    $fileName = basename($expense->receipt_file);

    // Bersihkan output buffer sebelum mengirim file.
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

}
