<?php

namespace App\Http\Controllers\Pensedekah;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DocumentationController extends Controller
{
    public function index()
    {
        // Hanya dokumentasi dari penyaluran nyata
        // yang selesai, disetujui, dan dipublikasikan.
        $documents = DB::table('distribution_documents as dd')
            ->join(
                'distributions as d',
                'dd.distribution_id',
                '=',
                'd.id'
            )
            ->leftJoin(
                'campaigns as c',
                'd.campaign_id',
                '=',
                'c.id'
            )
            ->where('d.status', 'completed')
            ->where('d.report_status', 'approved')
            ->where('d.is_published', true)
            ->where('d.is_simulated', false)
            ->select(
                'dd.id',
                'dd.distribution_id',
                'dd.file_path',
                'dd.file_type',
                'dd.caption',
                'dd.document_date',
                'd.title as distribution_title',
                'd.distribution_date',
                'd.location',
                'c.title as campaign_title'
            )
            ->orderByDesc('dd.document_date')
            ->orderByDesc('dd.created_at')
            ->get();

        return Inertia::render('Pensedekah/Documentation/Index', [
            'documents' => $documents,
            'summary' => [
                'totalDocuments' => $documents->count(),
                'totalPhotos' => $documents
                    ->where('file_type', 'photo')
                    ->count(),
                'totalVideos' => $documents
                    ->where('file_type', 'video')
                    ->count(),
                'totalActivities' => $documents
                    ->pluck('distribution_id')
                    ->unique()
                    ->count(),
            ],
        ]);
    }
}
