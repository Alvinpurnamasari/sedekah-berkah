<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AllocationController extends Controller
{
    public function index()
    {
        $fundGroups = [
            'program' => 'Dana Program',
            'operational' => 'Dana Operasional',
            'sponsor' => 'Dana Sponsor',
        ];

        // Saldo dihitung dari seluruh jurnal yang sudah diposting.
        // Jurnal pembalik tetap dihitung bersama jurnal asalnya.
        $balances = DB::table('ledger_accounts')
            ->leftJoin('journal_lines', 'journal_lines.ledger_account_id', '=', 'ledger_accounts.id')
            ->leftJoin('journal_entries', function ($join) {
                $join->on('journal_entries.id', '=', 'journal_lines.journal_entry_id')
                    ->where('journal_entries.status', '=', 'posted');
            })
            ->whereIn('ledger_accounts.fund_group', array_keys($fundGroups))
            ->where('ledger_accounts.is_active', true)
            ->select(
                'ledger_accounts.fund_group',
                'ledger_accounts.id',
                'ledger_accounts.code',
                'ledger_accounts.name',
                'ledger_accounts.account_type'
            )
            ->selectRaw('
                COALESCE(SUM(
                    CASE
                        WHEN journal_entries.id IS NOT NULL
                        THEN journal_lines.credit - journal_lines.debit
                        ELSE 0
                    END
                ), 0) as balance
            ')
            ->groupBy(
                'ledger_accounts.fund_group',
                'ledger_accounts.id',
                'ledger_accounts.code',
                'ledger_accounts.name',
                'ledger_accounts.account_type'
            )
            ->orderBy('ledger_accounts.code')
            ->get();

        $accounts = $balances->map(function ($account) {
            $account->balance = (int) $account->balance;
            return $account;
        });

        $summary = [];

        foreach ($fundGroups as $key => $label) {
            $groupAccounts = $accounts->where('fund_group', $key);

            $summary[] = [
                'key' => $key,
                'label' => $label,
                'balance' => (int) $groupAccounts->sum('balance'),
                'accounts' => $groupAccounts->values(),
            ];
        }

        return Inertia::render('Superadmin/Allocations/Index', [
            'summary' => $summary,
            'total_balance' => (int) $accounts->sum('balance'),
        ]);
    }
}
