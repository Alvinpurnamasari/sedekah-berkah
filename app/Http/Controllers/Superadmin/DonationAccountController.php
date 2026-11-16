<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\DonationAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DonationAccountController extends Controller
{
    /**
     * Menampilkan seluruh rekening donasi.
     */
    public function index(Request $request)
    {
        $query = DonationAccount::query();

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('bank_name', 'like', "%{$search}%")
                    ->orWhere('account_number', 'like', "%{$search}%")
                    ->orWhere('account_holder', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where(
                'is_active',
                $request->status === 'active'
            );
        }

        $accounts = $query
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Superadmin/DonationAccounts/Index', [
            'accounts' => $accounts,
            'filters' => $request->only('search', 'status'),
        ]);
    }

    /**
     * Form tambah rekening.
     */
    public function create()
    {
        return Inertia::render('Superadmin/DonationAccounts/Form', [
            'account' => null,
        ]);
    }

    /**
     * Menyimpan rekening baru.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'bank_name' => ['required', 'string', 'max:100'],
            'account_number' => ['required', 'string', 'max:50'],
            'account_holder' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:2000'],
        ]);

        $data['is_active'] = $request->boolean('is_active', true);

        DB::transaction(function () use ($data, $request) {
            $account = DonationAccount::create($data);

            $this->writeAudit(
                $request,
                'donation_account_created',
                $account,
                [
                    'bank_name' => $account->bank_name,
                    'account_number' => $account->account_number,
                    'account_holder' => $account->account_holder,
                    'is_active' => $account->is_active,
                ]
            );
        });

        return redirect()
            ->route('superadmin.donation-accounts.index')
            ->with('success', 'Rekening donasi berhasil ditambahkan.');
    }

    /**
     * Form edit rekening.
     */
    public function edit(string $id)
    {
        $account = DonationAccount::findOrFail($id);

        return Inertia::render('Superadmin/DonationAccounts/Form', [
            'account' => $account,
        ]);
    }

    /**
     * Memperbarui rekening.
     */
    public function update(Request $request, string $id)
    {
        $account = DonationAccount::findOrFail($id);

        $data = $request->validate([
            'bank_name' => ['required', 'string', 'max:100'],
            'account_number' => ['required', 'string', 'max:50'],
            'account_holder' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:2000'],
            'is_active' => ['required', 'boolean'],
        ]);

        DB::transaction(function () use ($account, $data, $request) {
            $before = $account->only([
                'bank_name',
                'account_number',
                'account_holder',
                'description',
                'is_active',
            ]);

            $account->update($data);

            $this->writeAudit(
                $request,
                'donation_account_updated',
                $account,
                [
                    'before' => $before,
                    'after' => $account->only([
                        'bank_name',
                        'account_number',
                        'account_holder',
                        'description',
                        'is_active',
                    ]),
                ]
            );
        });

        return redirect()
            ->route('superadmin.donation-accounts.index')
            ->with('success', 'Rekening donasi berhasil diperbarui.');
    }

    /**
     * Mengaktifkan atau menonaktifkan rekening.
     */
    public function toggleStatus(Request $request, string $id)
    {
        $account = DonationAccount::findOrFail($id);

        DB::transaction(function () use ($account, $request) {
            $oldStatus = $account->is_active;

            $account->update([
                'is_active' => !$oldStatus,
            ]);

            $this->writeAudit(
                $request,
                $account->is_active
                    ? 'donation_account_activated'
                    : 'donation_account_deactivated',
                $account,
                [
                    'bank_name' => $account->bank_name,
                    'old_status' => $oldStatus,
                    'new_status' => $account->is_active,
                ]
            );
        });

        return redirect()
            ->route('superadmin.donation-accounts.index')
            ->with('success', 'Status rekening berhasil diperbarui.');
    }

    /**
     * Menghapus rekening.
     */
    public function destroy(Request $request, string $id)
    {
        $account = DonationAccount::findOrFail($id);

        DB::transaction(function () use ($account, $request) {
            $metadata = [
                'bank_name' => $account->bank_name,
                'account_number' => $account->account_number,
                'account_holder' => $account->account_holder,
                'is_active' => $account->is_active,
            ];

            $this->writeAudit(
                $request,
                'donation_account_deleted',
                $account,
                $metadata
            );

            $account->delete();
        });

        return redirect()
            ->route('superadmin.donation-accounts.index')
            ->with('success', 'Rekening donasi berhasil dihapus.');
    }

    /**
     * Mencatat aktivitas rekening ke Audit Log.
     */
    private function writeAudit(
        Request $request,
        string $action,
        DonationAccount $account,
        array $metadata
    ): void {
        DB::table('audit_logs')->insert([
            'user_id' => $request->user()->id,
            'action' => $action,
            'entity_type' => 'donation_account',
            'entity_id' => $account->id,
            'metadata' => json_encode($metadata),
            'ip_address' => $request->ip(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
