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
 * Mencatat pembayaran pengeluaran oleh Admin.
 */
public function recordPayment(Request $request, $id)
{
    $request->validate([
        'proof' => [
            'required',
            'file',
            'mimes:jpg,jpeg,png,pdf',
            'max:5120',
        ],
    ], [
        'proof.required' => 'Bukti pembayaran wajib diunggah.',
        'proof.mimes' => 'Bukti harus berupa JPG, JPEG, PNG, atau PDF.',
        'proof.max' => 'Ukuran bukti maksimal 5 MB.',
    ]);

    $proofPath = null;

    try {
        DB::transaction(function () use ($request, $id, &$proofPath) {
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

            // Simpan bukti pada private local storage.
            $proofPath = Storage::disk('local')->putFile(
                'expense-payment-proofs',
                $request->file('proof')
            );

            if (!$proofPath) {
                throw new \RuntimeException(
                    'Gagal menyimpan bukti pembayaran.'
                );
            }

            $expense->update([
                'receipt_file' => $proofPath,
                'payment_status' => 'paid',
                'paid_at' => now(),
                'paid_by' => Auth::id(),
            ]);
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
        'Pembayaran pengeluaran berhasil dicatat.'
    );
}


/**
 * Menampilkan bukti pembayaran secara privat.
 */
public function paymentProof($id)
{
    $expense = Expense::where('id', $id)
        ->where('submitted_by', Auth::id())
        ->firstOrFail();

    if (
        $expense->payment_status !== 'paid' ||
        !$expense->receipt_file ||
        !Storage::disk('local')->exists($expense->receipt_file)
    ) {
        abort(404, 'Bukti pembayaran tidak ditemukan.');
    }

    return Storage::disk('local')->response(
        $expense->receipt_file
    );
}

}
