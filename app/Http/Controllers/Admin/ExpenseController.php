<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\Campaign;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Models\Distribution;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

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
        'receipt' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
    ]);

    DB::transaction(function () use ($data, $request) {
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

        $receiptPath = null;

        if ($request->hasFile('receipt')) {
            $receiptPath = $request->file('receipt')
                ->store('expense-receipts', 'public');
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
            'receipt_file' => $receiptPath,

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

}
