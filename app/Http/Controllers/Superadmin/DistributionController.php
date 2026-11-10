<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DistributionController extends Controller
{
    public function index(Request $request)
    {
        $summary = [
            'totalActivities' => DB::table('distributions')->count(),

            'totalDistributed' => (int) DB::table('distributions')
                ->where('status', 'completed')
                ->sum('total_cost'),

            'totalRecipients' => (int) DB::table('distributions')
                ->where('status', 'completed')
                ->sum('actual_quantity'),

            'pendingReports' => DB::table('distributions')
                ->where('report_status', 'pending')
                ->count(),
        ];

        $distributions = DB::table('distributions')
            ->leftJoin(
                'campaigns',
                'distributions.campaign_id',
                '=',
                'campaigns.id'
            )
            ->select(
                'distributions.*',
                'campaigns.title as campaign_title'
            )
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('distributions.title', 'like', "%{$search}%")
                        ->orWhere('campaigns.title', 'like', "%{$search}%")
                        ->orWhere('distributions.location', 'like', "%{$search}%");
                });
            })
            ->when($request->status, function ($query, $status) {
                $query->where('distributions.status', $status);
            })
            ->orderByDesc('distributions.created_at')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Superadmin/Distributions/Index', [
            'summary' => $summary,
            'distributions' => $distributions,
            'filters' => $request->only(['search', 'status']),
        ]);
    }


public function create()
{
    $campaigns = DB::table('campaigns')
        ->whereIn('status', ['active', 'published'])
        ->orderBy('title')
        ->get(['id', 'title']);

    return Inertia::render('Superadmin/Distributions/Create', [
        'campaigns' => $campaigns,
    ]);
}

public function store(Request $request)
{
    $validated = $request->validate([
        'campaign_id' => ['required', 'exists:campaigns,id'],
        'title' => ['required', 'string', 'max:255'],
        'distribution_date' => ['required', 'date'],
        'location' => ['required', 'string', 'max:255'],
        'planned_quantity' => ['required', 'integer', 'min:1'],
    ]);

    DB::transaction(function () use ($validated) {
        $id = (string) \Illuminate\Support\Str::uuid();

        DB::table('distributions')->insert([
            'id' => $id,
            'campaign_id' => $validated['campaign_id'],
            'title' => $validated['title'],
            'distribution_date' => $validated['distribution_date'],
            'location' => $validated['location'],
            'planned_quantity' => $validated['planned_quantity'],
            'actual_quantity' => 0,
            'total_cost' => 0,
            'status' => 'planned',
            'report_status' => 'draft',
            'created_by' => auth()->id(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('audit_logs')->insert([
            'user_id' => auth()->id(),
            'action' => 'distribution_created',
            'entity_type' => 'distribution',
            'entity_id' => $id,
            'metadata' => json_encode([
                'title' => $validated['title'],
                'campaign_id' => $validated['campaign_id'],
                'location' => $validated['location'],
            ]),
            'ip_address' => request()->ip(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    });

    return redirect()
        ->route('superadmin.distributions.index')
        ->with('success', 'Rencana penyaluran berhasil dibuat.');
}



public function show(string $id)
{
    $distribution = DB::table('distributions')
        ->leftJoin(
            'campaigns',
            'distributions.campaign_id',
            '=',
            'campaigns.id'
        )
        ->where('distributions.id', $id)
        ->select(
            'distributions.*',
            'campaigns.title as campaign_title'
        )
        ->first();

    abort_if(!$distribution, 404);

    $expenses = DB::table('expenses')
        ->where('distribution_id', $id)
        ->orderByDesc('created_at')
        ->get();

    $documents = DB::table('distribution_documents')
        ->where('distribution_id', $id)
        ->orderByDesc('created_at')
        ->get();

    $expenseSummary = [
        'total' => (int) $expenses->sum('amount'),
        'approved' => (int) $expenses
            ->where('approval_status', 'approved')
            ->sum('amount'),
        'pending' => (int) $expenses
            ->where('approval_status', 'pending')
            ->sum('amount'),
    ];

    $documents = DB::table('distribution_documents')
        ->where('distribution_id', $id)
        ->orderByDesc('created_at')
        ->get();

    return Inertia::render('Superadmin/Distributions/Show', [
        'distribution' => $distribution,
        'expenses' => $expenses,
        'expenseSummary' => $expenseSummary,
        'documents' => $documents,
    ]);
}


public function edit(string $id)
{
    $distribution = DB::table('distributions')
        ->where('id', $id)
        ->first();

    abort_if(!$distribution, 404);

    abort_if(
        $distribution->status !== 'planned' ||
        $distribution->report_status !== 'draft',
        403,
        'Rencana tidak dapat diedit setelah pelaksanaan atau pelaporan dimulai.'
    );

    $campaigns = DB::table('campaigns')
        ->whereIn('status', ['active', 'published'])
        ->orderBy('title')
        ->get(['id', 'title']);

    return Inertia::render('Superadmin/Distributions/Edit', [
        'distribution' => $distribution,
        'campaigns' => $campaigns,
    ]);
}

public function update(Request $request, string $id)
{
    $validated = $request->validate([
        'campaign_id' => ['required', 'exists:campaigns,id'],
        'title' => ['required', 'string', 'max:255'],
        'distribution_date' => ['required', 'date'],
        'location' => ['required', 'string', 'max:255'],
        'planned_quantity' => ['required', 'integer', 'min:1'],
    ]);

    DB::transaction(function () use ($validated, $id) {
        $distribution = DB::table('distributions')
            ->where('id', $id)
            ->lockForUpdate()
            ->first();

        abort_if(!$distribution, 404);

        abort_if(
            $distribution->status !== 'planned' ||
            $distribution->report_status !== 'draft',
            403,
            'Rencana tidak dapat diedit setelah pelaksanaan atau pelaporan dimulai.'
        );

        $before = [
            'campaign_id' => $distribution->campaign_id,
            'title' => $distribution->title,
            'distribution_date' => $distribution->distribution_date,
            'location' => $distribution->location,
            'planned_quantity' => $distribution->planned_quantity,
        ];

        DB::table('distributions')
            ->where('id', $id)
            ->update([
                'campaign_id' => $validated['campaign_id'],
                'title' => $validated['title'],
                'distribution_date' => $validated['distribution_date'],
                'location' => $validated['location'],
                'planned_quantity' => $validated['planned_quantity'],
                'updated_at' => now(),
            ]);

        DB::table('audit_logs')->insert([
            'user_id' => auth()->id(),
            'action' => 'distribution_updated',
            'entity_type' => 'distribution',
            'entity_id' => $id,
            'metadata' => json_encode([
                'before' => $before,
                'after' => $validated,
            ]),
            'ip_address' => request()->ip(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    });

    return redirect()
        ->route('superadmin.distributions.show', $id)
        ->with('success', 'Rencana penyaluran berhasil diperbarui.');
}


public function saveRealization(Request $request, string $id)
{
    $validated = $request->validate([
        'actual_quantity' => ['required', 'integer', 'min:0'],
        'total_cost' => ['required', 'integer', 'min:0'],
        'status' => ['required', 'in:ongoing,completed'],
    ]);

    DB::transaction(function () use ($validated, $id, $request) {
        $distribution = DB::table('distributions')
            ->where('id', $id)
            ->lockForUpdate()
            ->first();

        abort_if(!$distribution, 404);

        abort_if(
            !in_array($distribution->status, ['planned', 'ongoing']),
            403,
            'Realisasi tidak dapat diubah untuk kegiatan ini.'
        );

        $before = [
            'actual_quantity' => $distribution->actual_quantity,
            'total_cost' => $distribution->total_cost,
            'status' => $distribution->status,
        ];

        DB::table('distributions')
            ->where('id', $id)
            ->update([
                'actual_quantity' => $validated['actual_quantity'],
                'total_cost' => $validated['total_cost'],
                'status' => $validated['status'],
                'updated_at' => now(),
            ]);

        DB::table('audit_logs')->insert([
            'user_id' => auth()->id(),
            'action' => 'distribution_realization_updated',
            'entity_type' => 'distribution',
            'entity_id' => $id,
            'metadata' => json_encode([
                'before' => $before,
                'after' => $validated,
            ]),
            'ip_address' => $request->ip(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    });

    return redirect()
        ->route('superadmin.distributions.show', $id)
        ->with('success', 'Realisasi penyaluran berhasil disimpan.');
}
public function uploadDocument(Request $request, string $id)
{
    $validated = $request->validate([
        'photo' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        'caption' => ['nullable', 'string', 'max:255'],
        'document_date' => ['nullable', 'date'],
    ]);

    $distribution = DB::table('distributions')
        ->where('id', $id)
        ->first();

    abort_if(!$distribution, 404);

    // Simpan foto ke storage/app/public/distribution-documents
    $filePath = $request->file('photo')
        ->store('distribution-documents', 'public');

    try {
        DB::transaction(function () use ($validated, $id, $filePath) {
            $documentId = DB::table('distribution_documents')->insertGetId([
                'distribution_id' => $id,
                'file_path' => $filePath,
                'caption' => $validated['caption'] ?? null,
                'document_date' => $validated['document_date'] ?? null,
                'uploaded_by' => auth()->id(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('audit_logs')->insert([
                'user_id' => auth()->id(),
                'action' => 'distribution_document_uploaded',
                'entity_type' => 'distribution',
                'entity_id' => $id,
                'metadata' => json_encode([
                    'document_id' => $documentId,
                    'file_path' => $filePath,
                    'caption' => $validated['caption'] ?? null,
                ]),
                'ip_address' => request()->ip(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });
    } catch (\Throwable $e) {
        Storage::disk('public')->delete($filePath);
        throw $e;
    }

    return redirect()
        ->route('superadmin.distributions.show', $id)
        ->with('success', 'Dokumentasi kegiatan berhasil diunggah.');
}
public function deleteDocument(string $id, int $documentId)
{
    $document = DB::table('distribution_documents')
        ->where('id', $documentId)
        ->where('distribution_id', $id)
        ->first();

    abort_if(!$document, 404);

    DB::transaction(function () use ($document, $id, $documentId) {
        DB::table('distribution_documents')
            ->where('id', $documentId)
            ->delete();

        DB::table('audit_logs')->insert([
            'user_id' => auth()->id(),
            'action' => 'distribution_document_deleted',
            'entity_type' => 'distribution',
            'entity_id' => $id,
            'metadata' => json_encode([
                'document_id' => $documentId,
                'file_path' => $document->file_path,
                'caption' => $document->caption,
            ]),
            'ip_address' => request()->ip(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    });

    Storage::disk('public')->delete($document->file_path);

    return redirect()
        ->route('superadmin.distributions.show', $id)
        ->with('success', 'Dokumentasi berhasil dihapus.');
}
}
