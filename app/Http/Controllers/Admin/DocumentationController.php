<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DocumentationController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('distribution_documents')
            ->join(
                'distributions',
                'distribution_documents.distribution_id',
                '=',
                'distributions.id'
            )
            ->join(
                'campaigns',
                'distributions.campaign_id',
                '=',
                'campaigns.id'
            )
            ->select(
                'distribution_documents.id',
                'distribution_documents.file_path',
                'distribution_documents.file_type',
                'distribution_documents.caption',
                'distribution_documents.document_date',
                'distribution_documents.created_at',
                'distributions.id as distribution_id',
                'distributions.title as distribution_title',
                'distributions.location',
                'campaigns.id as campaign_id',
                'campaigns.title as campaign_title'
            )
            ->where('distributions.is_simulated', false);

        // Filter jenis dokumentasi.
        if (in_array($request->file_type, ['photo', 'video'])) {
            $query->where(
                'distribution_documents.file_type',
                $request->file_type
            );
        }

        // Filter program.
        if ($request->filled('campaign_id')) {
            $query->where(
                'distributions.campaign_id',
                $request->campaign_id
            );
        }

        // Filter kegiatan penyaluran.
        if ($request->filled('distribution_id')) {
            $query->where(
                'distributions.id',
                $request->distribution_id
            );
        }

        // Pencarian berdasarkan keterangan, program, atau kegiatan.
        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where(
                    'distribution_documents.caption',
                    'like',
                    "%{$search}%"
                )
                ->orWhere(
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

        $documents = $query
            ->orderByDesc('distribution_documents.created_at')
            ->paginate(12)
            ->withQueryString();

        // Daftar program untuk filter.
        $campaigns = DB::table('campaigns')
            ->join(
                'distributions',
                'campaigns.id',
                '=',
                'distributions.campaign_id'
            )
            ->where('distributions.is_simulated', false)
            ->select('campaigns.id', 'campaigns.title')
            ->distinct()
            ->orderBy('campaigns.title')
            ->get();

        // Daftar kegiatan untuk filter.
        $distributions = DB::table('distributions')
            ->where('is_simulated', false)
            ->select('id', 'title', 'campaign_id')
            ->orderByDesc('created_at')
            ->get();

        // Ringkasan dokumentasi.
        $summary = [
            'total' => DB::table('distribution_documents')
                ->join(
                    'distributions',
                    'distribution_documents.distribution_id',
                    '=',
                    'distributions.id'
                )
                ->where('distributions.is_simulated', false)
                ->count(),

            'photos' => DB::table('distribution_documents')
                ->join(
                    'distributions',
                    'distribution_documents.distribution_id',
                    '=',
                    'distributions.id'
                )
                ->where('distributions.is_simulated', false)
                ->where('distribution_documents.file_type', 'photo')
                ->count(),

            'videos' => DB::table('distribution_documents')
                ->join(
                    'distributions',
                    'distribution_documents.distribution_id',
                    '=',
                    'distributions.id'
                )
                ->where('distributions.is_simulated', false)
                ->where('distribution_documents.file_type', 'video')
                ->count(),
        ];

        return Inertia::render('Admin/Documentation/Index', [
            'documents' => $documents,
            'campaigns' => $campaigns,
            'distributions' => $distributions,
            'summary' => $summary,
            'filters' => [
                'search' => $request->search ?? '',
                'file_type' => $request->file_type ?? '',
                'campaign_id' => $request->campaign_id ?? '',
                'distribution_id' => $request->distribution_id ?? '',
            ],
        ]);
    }
}
