<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ExpenseApprovalController extends Controller
{
    
public function index()
{
    $expenses = Expense::with([
        'campaign:id,title',
        'distribution' => function ($query) {
            $query
                ->select(
                    'id',
                    'title',
                    'campaign_id',
                    'is_simulated',
                    'requested_budget',
                    'approved_budget',
                    'budget_status'
                )
                ->withSum([
                    'expenses as approved_expenses_total' => function ($expenseQuery) {
                        $expenseQuery
                            ->where('is_simulated', false)
                            ->where('approval_status', 'approved');
                    },
                ], 'amount')
                ->withSum([
                    'expenses as pending_expenses_total' => function ($expenseQuery) {
                        $expenseQuery
                            ->where('is_simulated', false)
                            ->where('approval_status', 'pending');
                    },
                ], 'amount');
        },
        'submitter:id,name',
        'approver:id,name',
    ])
        ->latest()
        ->paginate(10)
        ->withQueryString();

    return Inertia::render('Superadmin/Expenses/Index', [
        'expenses' => $expenses,
    ]);
}


   
public function approve(string $id)
{
    DB::transaction(function () use ($id) {
        $expense = Expense::whereKey($id)
            ->lockForUpdate()
            ->firstOrFail();

        if ($expense->approval_status !== 'pending') {
            abort(422, 'Pengajuan ini sudah diproses sebelumnya.');
        }

        $distribution = null;

        if ($expense->distribution_id) {
            $distribution = DB::table('distributions')
                ->where('id', $expense->distribution_id)
                ->lockForUpdate()
                ->first();

            abort_if(!$distribution, 404);

            if ($distribution->budget_status !== 'approved') {
                abort(422, 'Anggaran penyaluran belum disetujui Superadmin.');
            }

            $usedBudget = Expense::where('distribution_id', $distribution->id)
                ->where('is_simulated', (bool) $distribution->is_simulated)
                ->whereIn('approval_status', ['pending', 'approved'])
                ->sum('amount');

            if ((int) $usedBudget > (int) $distribution->approved_budget) {
                abort(
                    422,
                    'Pengeluaran tidak dapat disetujui karena total pengajuan melebihi anggaran yang disetujui.'
                );
            }
        }

        $expense->update([
            'approval_status' => 'approved',
            'approved_by' => Auth::id(),
        ]);

        DB::table('audit_logs')->insert([
            'user_id' => Auth::id(),
            'action' => 'expense_approved',
            'entity_type' => 'expense',
            'entity_id' => $expense->id,
            'metadata' => json_encode([
                'amount' => $expense->amount,
                'category' => $expense->expense_category,
                'expense_type' => $expense->expense_type,
                'distribution_id' => $expense->distribution_id,
                'campaign_id' => $expense->campaign_id,
                'is_simulated' => (bool) $expense->is_simulated,
            ]),
            'ip_address' => request()->ip(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    });

    return back()->with('success', 'Pengeluaran berhasil disetujui.');
}

    public function reject(Request $request, string $id)
    {
        $data = $request->validate([
            'reason' => ['required', 'string', 'min:3', 'max:500'],
        ]);
    
        $ipAddress = $request->ip();
    
        DB::transaction(function () use ($id, $data, $ipAddress) {
            $expense = Expense::whereKey($id)
                ->lockForUpdate()
                ->firstOrFail();
    
            if ($expense->approval_status !== 'pending') {
                abort(422, 'Pengajuan ini sudah diproses sebelumnya.');
            }
    
            $expense->update([
                'approval_status' => 'rejected',
                'approved_by' => Auth::id(),
                'rejection_reason' => $data['reason'],
            ]);
    
            DB::table('audit_logs')->insert([
                'user_id' => Auth::id(),
                'action' => 'expense_rejected',
                'entity_type' => 'expense',
                'entity_id' => $expense->id,
                'metadata' => json_encode([
                    'amount' => $expense->amount,
                    'category' => $expense->expense_category,
                    'expense_type' => $expense->expense_type,
                    'distribution_id' => $expense->distribution_id,
                    'campaign_id' => $expense->campaign_id,
                    'reason' => $data['reason'],
                ]),
                'ip_address' => $ipAddress,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });
    
        return back()->with('success', 'Pengajuan pengeluaran berhasil ditolak.');
    }
    
}