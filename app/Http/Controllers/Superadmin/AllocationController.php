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

        // Saldo akun berdasarkan jurnal yang sudah diposting.
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

        // Rekap donasi riil per kampanye.
        // Dukungan operasional dipisahkan dari dana program.
        $donationTotals = DB::table('donations')
            ->select('campaign_id')
            ->selectRaw('SUM(donation_amount) as total_donations')
            ->selectRaw('SUM(operational_support) as total_operational_support')
            ->where('payment_status', 'paid')
            ->where('is_simulated', false)
            ->groupBy('campaign_id');

        // Rekap pengeluaran program yang benar-benar sudah dibayar.
        // Pengeluaran simulasi, pending, dan ditolak tidak dihitung.
        $expenseTotals = DB::table('expenses')
            ->select('campaign_id')
            ->selectRaw('SUM(amount) as total_expenses')
            ->where('expense_type', 'distribution_detail')
            ->where('approval_status', 'approved')
            ->where('payment_status', 'paid')
            ->where('is_simulated', false)
            ->groupBy('campaign_id');

        // Rekap anggaran penyaluran yang sudah disetujui.
        // Hanya penyaluran riil dengan status anggaran approved.
        $allocationTotals = DB::table('distributions')
            ->select('campaign_id')
            ->selectRaw('SUM(approved_budget) as total_allocated_budget')
            ->where('budget_status', 'approved')
            ->where('is_simulated', false)
            ->whereNotNull('campaign_id')
            ->groupBy('campaign_id');

        // Kampanye yang sudah terhubung dengan akun Dana Program.
        $campaigns = DB::table('campaigns')
            ->join('ledger_accounts', 'ledger_accounts.id', '=', 'campaigns.ledger_account_id')
            ->leftJoin('campaign_categories', 'campaign_categories.id', '=', 'campaigns.category_id')
            ->leftJoinSub($donationTotals, 'donation_totals', function ($join) {
                $join->on('donation_totals.campaign_id', '=', 'campaigns.id');
            })
            ->leftJoinSub($expenseTotals, 'expense_totals', function ($join) {
                $join->on('expense_totals.campaign_id', '=', 'campaigns.id');
            })
            ->leftJoinSub($allocationTotals, 'allocation_totals', function ($join) {
                $join->on('allocation_totals.campaign_id', '=', 'campaigns.id');
            })
            ->where('ledger_accounts.fund_group', 'program')
            ->select(
                'campaigns.id',
                'campaigns.title',
                'campaigns.status',
                'campaign_categories.name as category_name',
                'ledger_accounts.code as account_code',
                'ledger_accounts.name as account_name'
            )
            ->selectRaw('COALESCE(donation_totals.total_donations, 0) as total_donations')
            ->selectRaw('COALESCE(donation_totals.total_operational_support, 0) as total_operational_support')
            ->selectRaw('COALESCE(expense_totals.total_expenses, 0) as total_expenses')
            ->selectRaw('COALESCE(allocation_totals.total_allocated_budget, 0) as allocated_budget')
            ->orderBy('campaigns.title')
            ->get()
            ->map(function ($campaign) {
                $campaign->total_donations = (int) $campaign->total_donations;
                $campaign->total_operational_support = (int) $campaign->total_operational_support;
                $campaign->total_expenses = (int) $campaign->total_expenses;
                $campaign->allocated_budget = (int) $campaign->allocated_budget;

                // Saldo dana setelah pengeluaran riil.
                $campaign->remaining_balance =
                    $campaign->total_donations - $campaign->total_expenses;

                // Estimasi dana yang belum dialokasikan.
                $campaign->unallocated_balance = max(
                    $campaign->total_donations - $campaign->allocated_budget,
                    0
                );

                // Anggaran yang belum didukung oleh dana masuk.
                $campaign->funding_shortfall = max(
                    $campaign->allocated_budget - $campaign->total_donations,
                    0
                );

                return $campaign;
            });

        // Total dana program berdasarkan kampanye yang memiliki akun program.
        $totalProgramReceived = (int) $campaigns->sum('total_donations');
        $totalProgramExpenses = (int) $campaigns->sum('total_expenses');
        $totalAllocatedBudget = (int) $campaigns->sum('allocated_budget');

        // Anggaran approved yang belum terhubung dengan akun Dana Program.
        // Tidak dimasukkan ke total alokasi program.
        $unmappedApprovedBudget = (int) DB::table('distributions')
            ->leftJoin('campaigns', 'campaigns.id', '=', 'distributions.campaign_id')
            ->leftJoin('ledger_accounts', 'ledger_accounts.id', '=', 'campaigns.ledger_account_id')
            ->where('distributions.budget_status', 'approved')
            ->where('distributions.is_simulated', false)
            ->where(function ($query) {
                $query->whereNull('ledger_accounts.id')
                    ->orWhere('ledger_accounts.fund_group', '!=', 'program');
            })
            ->sum('distributions.approved_budget');

        return Inertia::render('Superadmin/Allocations/Index', [
            'summary' => $summary,
            'total_balance' => (int) $accounts->sum('balance'),

            'campaigns' => $campaigns,

            'allocation_totals' => [
                'program_received' => $totalProgramReceived,

                // Dana tersedia secara fisik setelah pengeluaran riil.
                'program_expenses' => $totalProgramExpenses,
                'program_remaining' => $totalProgramReceived - $totalProgramExpenses,

                // Anggaran penyaluran yang telah disetujui.
                'allocated_budget' => $totalAllocatedBudget,

                // Dana masuk dikurangi anggaran yang telah dialokasikan.
                'unallocated_funds' => max(
                    $totalProgramReceived - $totalAllocatedBudget,
                    0
                ),

                // Anggaran yang belum didukung dana masuk.
                'funding_shortfall' => max(
                    $totalAllocatedBudget - $totalProgramReceived,
                    0
                ),

                // Anggaran approved yang belum terhubung ke akun program.
                'unmapped_approved_budget' => $unmappedApprovedBudget,

                'operational_support' => (int) $campaigns->sum('total_operational_support'),
            ],
        ]);
    }
}
