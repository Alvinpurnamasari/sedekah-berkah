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

        // Ambil program yang pernah didukung pengguna
        // melalui donasi nyata yang sudah dibayar.
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

        // Ambil kegiatan penyaluran nyata dari program
        // yang pernah didukung pengguna.
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
        $documents = DB::table('distribution_documents')
            ->whereIn('distribution_id', $distributionIds)
            ->whereIn('distribution_id', $distributions
                ->where('status', 'completed')
                ->where('report_status', 'approved')
                ->where('is_published', true)
                ->pluck('id'))
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
        ]);
    }
}

