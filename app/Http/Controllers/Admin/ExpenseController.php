<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\Campaign;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

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
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'campaign_id' => ['nullable', 'exists:campaigns,id'],
            'expense_category' => ['required', 'string', 'max:100'],
            'description' => ['required', 'string', 'max:1000'],
            'amount' => ['required', 'integer', 'min:1000', 'max:100000000'],
            'receipt' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
        ]);

        $receiptPath = null;

        if ($request->hasFile('receipt')) {
            $receiptPath = $request->file('receipt')
                ->store('expense-receipts', 'public');
        }

        Expense::create([
            'campaign_id' => $data['campaign_id'] ?? null,
            'expense_category' => $data['expense_category'],
            'description' => $data['description'],
            'amount' => $data['amount'],
            'receipt_file' => $receiptPath,
            'approval_status' => 'pending',
            'submitted_by' => Auth::id(),
        ]);

        return back()->with(
            'success',
            'Pengajuan pengeluaran berhasil dikirim untuk persetujuan Superadmin.'
        );
    }
}
