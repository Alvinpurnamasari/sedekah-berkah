<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class FinanceController extends Controller
{
    public function index()
    {
        $income = DB::table('donations')
            ->where('payment_status', 'paid')
            ->selectRaw('
                COALESCE(SUM(donation_amount), 0) as donation_total,
                COALESCE(SUM(operational_support), 0) as operational_total,
                COUNT(*) as donation_count
            ')
            ->first();

        $donationTotal = (int) $income->donation_total;
        $operationalTotal = (int) $income->operational_total;
        $totalIncome = $donationTotal + $operationalTotal;

        $approvedExpense = (int) DB::table('expenses')
            ->where('approval_status', 'approved')
            ->sum('amount');

        $pendingExpense = (int) DB::table('expenses')
            ->where('approval_status', 'pending')
            ->sum('amount');

        $campaignFinance = DB::table('campaigns')
            ->leftJoin('donations', function ($join) {
                $join->on('campaigns.id', '=', 'donations.campaign_id')
                    ->where('donations.payment_status', '=', 'paid');
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
            ->leftJoin('campaigns', 'campaigns.id', '=', 'expenses.campaign_id')
            ->select(
                'expenses.id',
                'expenses.expense_category',
                'expenses.description',
                'expenses.amount',
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
                'available_balance' => $totalIncome - $approvedExpense,
                'donation_count' => (int) $income->donation_count,
            ],
            'campaignFinance' => $campaignFinance,
            'recentDonations' => $recentDonations,
            'recentExpenses' => $recentExpenses,
        ]);
    }
}
