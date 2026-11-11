<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class FinanceController extends Controller
{
    public function index()
    {
        // Pemasukan donasi nyata yang sudah dibayar
        $income = DB::table('donations')
            ->where('payment_status', 'paid')
            ->where('is_simulated', false)
            ->selectRaw('
                COALESCE(SUM(donation_amount), 0) as donation_total,
                COALESCE(SUM(operational_support), 0) as operational_total,
                COUNT(*) as donation_count
            ')
            ->first();

        $donationTotal = (int) $income->donation_total;
        $operationalTotal = (int) $income->operational_total;
        $totalIncome = $donationTotal + $operationalTotal;

        // Pengeluaran disetujui, hanya data nyata.
        // Rincian distribution_detail tidak dijumlahkan lagi
        // karena sudah termasuk dalam distributions.total_cost.
        $approvedExpense = (int) DB::table('expenses')
            ->where('approval_status', 'approved')
            ->where('is_simulated', false)
            ->where(function ($query) {
                $query->where('expense_type', 'additional')
                    ->orWhereNull('expense_type');
            })
            ->sum('amount');

        // Pengeluaran tambahan yang masih menunggu persetujuan.
        $pendingExpense = (int) DB::table('expenses')
            ->where('approval_status', 'pending')
            ->where('is_simulated', false)
            ->where(function ($query) {
                $query->where('expense_type', 'additional')
                    ->orWhereNull('expense_type');
            })
            ->sum('amount');

        // Total biaya penyaluran nyata yang sudah selesai.
        $distributionExpense = (int) DB::table('distributions')
            ->where('status', 'completed')
            ->where('is_simulated', false)
            ->sum('total_cost');

        $campaignFinance = DB::table('campaigns')
            ->leftJoin('donations', function ($join) {
                $join->on('campaigns.id', '=', 'donations.campaign_id')
                    ->where('donations.payment_status', '=', 'paid')
                    ->where('donations.is_simulated', '=', false);
            })
            ->select('campaigns.id', 'campaigns.title')
            ->selectRaw('
                COALESCE(SUM(donations.donation_amount), 0) as donation_total,
                COALESCE(SUM(donations.operational_support), 0) as operational_total,
                COUNT(donations.id) as donor_count
            ')
            ->groupBy('campaigns.id', 'campaigns.title')
            ->orderBy('campaigns.title')
            ->get();

        $recentDonations = DB::table('donations')
            ->where('donations.is_simulated', false)
            ->join('campaigns', 'campaigns.id', '=', 'donations.campaign_id')
            ->select(
                'donations.id',
                'donations.donation_code',
                'donations.donor_name',
                'donations.donation_amount',
                'donations.operational_support',
                'donations.payment_status',
                'donations.created_at',
                'campaigns.title as campaign_title'
            )
            ->orderByDesc('donations.created_at')
            ->limit(8)
            ->get();

        $recentExpenses = DB::table('expenses')
            ->where('expenses.is_simulated', false)
            ->leftJoin('campaigns', 'campaigns.id', '=', 'expenses.campaign_id')
            ->select(
                'expenses.id',
                'expenses.expense_category',
                'expenses.description',
                'expenses.amount',
                'expenses.expense_type',
                'expenses.approval_status',
                'expenses.created_at',
                'campaigns.title as campaign_title'
            )
            ->orderByDesc('expenses.created_at')
            ->limit(8)
            ->get();

        return Inertia::render('Superadmin/Finance/Index', [
            'summary' => [
                'donation_total' => $donationTotal,
                'operational_total' => $operationalTotal,
                'total_income' => $totalIncome,
                'approved_expense' => $approvedExpense,
                'pending_expense' => $pendingExpense,
                'distribution_expense' => $distributionExpense,
                'total_expense' => $approvedExpense + $distributionExpense,
                'available_balance' => $totalIncome - $approvedExpense - $distributionExpense,
                'donation_count' => (int) $income->donation_count,
            ],
            'campaignFinance' => $campaignFinance,
            'recentDonations' => $recentDonations,
            'recentExpenses' => $recentExpenses,
        ]);
    }
}
