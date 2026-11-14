<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $baseQuery = DB::table('distributions')
            ->where('distributions.is_simulated', false);

        // Ringkasan status laporan
        $summary = [
            'total' => (clone $baseQuery)->count(),

            'draft' => (clone $baseQuery)
                ->where('report_status', 'draft')
                ->count(),

            'pending' => (clone $baseQuery)
                ->where('report_status', 'pending')
                ->count(),

            'revision' => (clone $baseQuery)
                ->where('report_status', 'revision')
                ->count(),

            'approved' => (clone $baseQuery)
                ->where('report_status', 'approved')
                ->count(),
        ];

        // Daftar laporan kegiatan
        $query = DB::table('distributions')
            ->leftJoin(
                'campaigns',
                'distributions.campaign_id',
                '=',
                'campaigns.id'
            )
            ->where('distributions.is_simulated', false)
            ->select(
                'distributions.id',
                'distributions.title',
                'distributions.distribution_date',
                'distributions.location',
                'distributions.status',
                'distributions.report_status',
                'distributions.actual_quantity',
                'distributions.planned_quantity',
                'distributions.total_cost',
                'distributions.report_revision_note',
                'distributions.report_reviewed_at',
                'campaigns.title as campaign_title'
            );
            

        // Pencarian
        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where(
                    'distributions.title',
                    'like',
                    "%{$search}%"
                )
                ->orWhere(
                    'campaigns.title',
                    'like',
                    "%{$search}%"
                )
                ->orWhere(
                    'distributions.location',
                    'like',
                    "%{$search}%"
                );
            });
        }

        // Filter status laporan
        $allowedStatuses = [
            'draft',
            'pending',
            'revision',
            'approved',
        ];

        if (in_array($request->report_status, $allowedStatuses, true)) {
            $query->where(
                'distributions.report_status',
                $request->report_status
            );
        }

        $reports = $query
            ->orderByDesc('distributions.updated_at')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Reports/Index', [
            'reports' => $reports,
            'summary' => $summary,
            'filters' => [
                'search' => $request->search ?? '',
                'report_status' => $request->report_status ?? '',
            ],
        ]);
    }
}
