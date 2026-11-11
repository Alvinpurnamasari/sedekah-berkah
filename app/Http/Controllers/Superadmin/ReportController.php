<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Models\Donation;
use App\Models\Distribution;
use App\Models\Expense;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $campaignId = $request->input('campaign_id');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $donations = Donation::query()
            ->where('payment_status', 'paid')
            ->where('is_simulated', false)
            ->when($campaignId, fn ($query) => $query->where('campaign_id', $campaignId))
            ->when($startDate, fn ($query) => $query->whereDate('created_at', '>=', $startDate))
            ->when($endDate, fn ($query) => $query->whereDate('created_at', '<=', $endDate));

        $distributions = Distribution::query()
            ->where('is_simulated', false)
            ->when($campaignId, fn ($query) => $query->where('campaign_id', $campaignId))
            ->when($startDate, fn ($query) => $query->whereDate('distribution_date', '>=', $startDate))
            ->when($endDate, fn ($query) => $query->whereDate('distribution_date', '<=', $endDate));

        $additionalExpenses = Expense::query()
            ->where('is_simulated', false)
            ->where('approval_status', 'approved')
            ->where(function ($query) {
                $query->where('expense_type', 'additional')
                    ->orWhereNull('expense_type');
            })
            ->when($campaignId, fn ($query) => $query->where('campaign_id', $campaignId))
            ->when($startDate, fn ($query) => $query->whereDate('created_at', '>=', $startDate))
            ->when($endDate, fn ($query) => $query->whereDate('created_at', '<=', $endDate));

        $campaigns = Campaign::query()
            ->with('category')
            ->withCount([
                'donations as paid_donations_count' => fn ($query) => $query
                    ->where('payment_status', 'paid')
                    ->where('is_simulated', false),
            ])
            ->get();

        $reportDistributions = Distribution::query()
            ->with(['campaign:id,title', 'creator:id,name', 'reviewer:id,name', 'documents'])
            ->when($campaignId, fn ($query) => $query->where('campaign_id', $campaignId))
            ->when($startDate, fn ($query) => $query->whereDate('distribution_date', '>=', $startDate))
            ->when($endDate, fn ($query) => $query->whereDate('distribution_date', '<=', $endDate))
            ->latest()
            ->get();

        return Inertia::render('Superadmin/Reports/Index', [
            'filters' => [
                'campaign_id' => $campaignId,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
            'campaigns' => $campaigns,
            'summary' => [
                'total_income' => (clone $donations)->sum('donation_amount'),
                'total_donations' => (clone $donations)->count(),
                'total_distributed' => (clone $distributions)
                    ->where('status', 'completed')
                    ->sum('total_cost'),
                'total_beneficiaries' => (clone $distributions)
                    ->where('status', 'completed')
                    ->sum('actual_quantity'),
                'total_additional_expenses' => (clone $additionalExpenses)->sum('amount'),
                'pending_reports' => (clone $reportDistributions)
                    ->where('report_status', 'pending')->count(),
                'approved_reports' => (clone $reportDistributions)
                    ->where('report_status', 'approved')->count(),
                'published_reports' => (clone $reportDistributions)
                    ->where('is_published', true)
                    ->where('is_simulated', false)
                    ->count(),
            ],
            'distributions' => $reportDistributions,
        ]);
    }
}
