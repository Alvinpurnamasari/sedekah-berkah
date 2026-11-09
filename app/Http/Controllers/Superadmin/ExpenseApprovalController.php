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