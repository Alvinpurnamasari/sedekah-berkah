<?php

namespace App\Http\Controllers\Pensedekah;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TrackingController extends Controller
{
    public function index()
    {
        $userId = auth()->id();

        // Program yang pernah didukung melalui donasi nyata berhasil.
        $campaigns = DB::table('campaigns')
            ->join('donations', 'campaigns.id', '=', 'donations.campaign_id')
            ->where('donations.user_id', $userId)
            ->where('donations.payment_status', 'paid')
            ->where('donations.is_simulated', false)
            ->select(
                'campaigns.id',
                'campaigns.title',
                'campaigns.slug'
            )
            ->selectRaw('SUM(donations.donation_amount) as total_donation')
            ->selectRaw('COUNT(donations.id) as donation_count')
            ->groupBy(
                'campaigns.id',
                'campaigns.title',
                'campaigns.slug'
            )
            ->orderByDesc('campaigns.title')
            ->get();

        $campaignIds = $campaigns->pluck('id');

        /*
         * Perhitungan keuangan program.
         * Hanya kampanye yang terhubung ke akun buku besar
         * dengan fund_group program yang dihitung.
         */

        $programCampaignIds = DB::table('campaigns')
            ->join(
                'ledger_accounts',
                'campaigns.ledger_account_id',
                '=',
                'ledger_accounts.id'
            )
            ->whereIn('campaigns.id', $campaignIds)
            ->where('ledger_accounts.fund_group', 'program')
            ->pluck('campaigns.id');

        // Total donasi berhasil untuk masing-masing program.
        $donationTotals = DB::table('donations')
            ->whereIn('campaign_id', $programCampaignIds)
            ->where('payment_status', 'paid')
            ->where('is_simulated', false)
            ->select('campaign_id')
            ->selectRaw('SUM(COALESCE(donation_amount, 0)) as total_donations')
            ->groupBy('campaign_id')
            ->get()
            ->keyBy('campaign_id');

        // Total anggaran penyaluran yang sudah disetujui.
        $allocationTotals = DB::table('distributions')
            ->whereIn('campaign_id', $programCampaignIds)
            ->where('budget_status', 'approved')
            ->where('is_simulated', false)
            ->select('campaign_id')
            ->selectRaw('SUM(COALESCE(approved_budget, 0)) as allocated_budget')
            ->groupBy('campaign_id')
            ->get()
            ->keyBy('campaign_id');

        // Pengeluaran penyaluran nyata yang sudah disetujui dan dibayar.
        $expenseTotals = DB::table('expenses')
            ->whereIn('campaign_id', $programCampaignIds)
            ->where('expense_type', 'distribution_detail')
            ->where('approval_status', 'approved')
            ->where('payment_status', 'paid')
            ->where('is_simulated', false)
            ->select('campaign_id')
            ->selectRaw('SUM(COALESCE(amount, 0)) as total_expenses')
            ->groupBy('campaign_id')
            ->get()
            ->keyBy('campaign_id');

        // Gabungkan perhitungan berdasarkan masing-masing program.
        $campaigns = $campaigns->map(function ($campaign) use (
            $programCampaignIds,
            $donationTotals,
            $allocationTotals,
            $expenseTotals
        ) {
            $isProgramMapped = $programCampaignIds->contains($campaign->id);

            $donations = $isProgramMapped
                ? (int) ($donationTotals->get($campaign->id)->total_donations ?? 0)
                : 0;

            $allocated = $isProgramMapped
                ? (int) ($allocationTotals->get($campaign->id)->allocated_budget ?? 0)
                : 0;

            $expenses = $isProgramMapped
                ? (int) ($expenseTotals->get($campaign->id)->total_expenses ?? 0)
                : 0;

            $campaign->total_program_donations = $donations;
            $campaign->allocated_budget = $allocated;
            $campaign->total_expenses = $expenses;
            $campaign->unallocated_balance = max(0, $donations - $allocated);
            $campaign->allocated_not_realized = max(0, $allocated - $expenses);

            return $campaign;
        });

        // Ringkasan keseluruhan program yang pernah didukung.
        // Total dihitung setelah dikelompokkan per program.
        $financeSummary = [
            'total_donations' => (int) $campaigns->sum('total_program_donations'),
            'allocated_budget' => (int) $campaigns->sum('allocated_budget'),
            'total_expenses' => (int) $campaigns->sum('total_expenses'),
            'unallocated_balance' => (int) $campaigns->sum('unallocated_balance'),
            'allocated_not_realized' => (int) $campaigns->sum('allocated_not_realized'),
        ];

        // Kegiatan penyaluran yang boleh dilihat Pensedekah.
        $distributions = DB::table('distributions')
            ->join('campaigns', 'distributions.campaign_id', '=', 'campaigns.id')
            ->whereIn('distributions.campaign_id', $campaignIds)
            ->where('distributions.is_simulated', false)
            ->where(function ($query) {
                $query->where(function ($q) {
                    $q->where('distributions.budget_status', 'approved')
                        ->whereIn('distributions.status', ['planned', 'ongoing']);
                })->orWhere(function ($q) {
                    $q->where('distributions.status', 'completed')
                        ->where('distributions.report_status', 'approved')
                        ->where('distributions.is_published', true);
                });
            })
            ->select(
                'distributions.id',
                'distributions.campaign_id',
                'distributions.title',
                'distributions.distribution_date',
                'distributions.location',
                'distributions.planned_quantity',
                'distributions.actual_quantity',
                'distributions.status',
                'distributions.report_status',
                'distributions.is_published',
                'campaigns.title as campaign_title',
                'campaigns.slug as campaign_slug'
            )
            ->orderByDesc('distributions.distribution_date')
            ->get();

        $distributionIds = $distributions->pluck('id');

        // Dokumentasi hanya untuk laporan yang sudah dipublikasikan.
        $publishedDistributionIds = $distributions
            ->where('status', 'completed')
            ->where('report_status', 'approved')
            ->where('is_published', true)
            ->pluck('id');

        $documents = DB::table('distribution_documents')
            ->whereIn('distribution_id', $publishedDistributionIds)
            ->select(
                'id',
                'distribution_id',
                'file_path',
                'file_type',
                'caption',
                'document_date'
            )
            ->orderByDesc('document_date')
            ->get()
            ->groupBy('distribution_id');

        $distributions = $distributions->map(function ($distribution) use ($documents) {
            if ($distribution->status === 'completed') {
                $distribution->tracking_stage = 'completed';
                $distribution->tracking_label = 'Penyaluran selesai';
            } elseif ($distribution->status === 'ongoing') {
                $distribution->tracking_stage = 'ongoing';
                $distribution->tracking_label = 'Penyaluran berlangsung';
            } else {
                $distribution->tracking_stage = 'preparation';
                $distribution->tracking_label = 'Persiapan penyaluran';
            }

            $distribution->documents = $documents
                ->get($distribution->id, collect())
                ->values();

            return $distribution;
        });

        return Inertia::render('Pensedekah/Tracking/Index', [
            'campaigns' => $campaigns,
            'distributions' => $distributions,
            'financeSummary' => $financeSummary,
        ]);
    }
}
