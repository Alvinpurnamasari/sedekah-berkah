<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DistributionController extends Controller
{
    /**
     * Daftar kegiatan penyaluran untuk Admin.
     */
    public function index(Request $request)
    {
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

        return Inertia::render('Admin/Distributions/Index', [
            'distributions' => $distributions,
            'filters' => $request->only(['search', 'status']),
        ]);
    }


    /**
     * Form pembuatan rencana penyaluran oleh Admin.
     */
    public function create()
    {
        $campaigns = DB::table('campaigns')
            ->whereIn('status', ['published', 'active'])
            ->orderBy('title')
            ->get(['id', 'title']);

        return Inertia::render('Admin/Distributions/Create', [
            'campaigns' => $campaigns,
        ]);
    }

    /**
     * Menyimpan rencana penyaluran dan anggaran yang diajukan.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'campaign_id' => ['required', 'exists:campaigns,id'],
            'title' => ['required', 'string', 'max:255'],
            'distribution_date' => ['required', 'date'],
            'location' => ['required', 'string', 'max:255'],
            'planned_quantity' => ['required', 'integer', 'min:1'],
            'requested_budget' => ['required', 'integer', 'min:1'],
        ]);

        $campaignIsAvailable = DB::table('campaigns')
            ->where('id', $validated['campaign_id'])
            ->whereIn('status', ['published', 'active'])
            ->exists();

        abort_unless(
            $campaignIsAvailable,
            422,
            'Program tidak tersedia untuk pengajuan penyaluran.'
        );

        DB::transaction(function () use ($validated, $request) {
            $id = (string) \Illuminate\Support\Str::uuid();

            DB::table('distributions')->insert([
                'id' => $id,
                'campaign_id' => $validated['campaign_id'],
                'title' => $validated['title'],
                'distribution_date' => $validated['distribution_date'],
                'location' => $validated['location'],
                'planned_quantity' => $validated['planned_quantity'],
                'requested_budget' => $validated['requested_budget'],
                'approved_budget' => null,
                'budget_status' => 'draft',
                'actual_quantity' => 0,
                'total_cost' => 0,
                'is_simulated' => false,
                'status' => 'planned',
                'report_status' => 'draft',
                'created_by' => auth()->id(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('audit_logs')->insert([
                'user_id' => auth()->id(),
                'action' => 'distribution_created_by_admin',
                'entity_type' => 'distribution',
                'entity_id' => $id,
                'metadata' => json_encode([
                    'title' => $validated['title'],
                    'campaign_id' => $validated['campaign_id'],
                    'requested_budget' => $validated['requested_budget'],
                ]),
                'ip_address' => $request->ip(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });

        return redirect()
            ->route('admin.distributions.index')
            ->with('success', 'Rencana penyaluran berhasil disimpan sebagai draft.');
    }

    /**
     * Mengajukan anggaran penyaluran kepada Superadmin.
     */
    public function submitBudget(Request $request, string $id)
    {
        DB::transaction(function () use ($id, $request) {
            $distribution = DB::table('distributions')
                ->where('id', $id)
                ->lockForUpdate()
                ->first();

            abort_if(!$distribution, 404);

            abort_if(
                $distribution->created_by !== auth()->id(),
                403,
                'Anda hanya dapat mengajukan anggaran rencana yang Anda buat.'
            );

            abort_if(
                !in_array($distribution->budget_status, ['draft', 'revision', 'rejected']),
                403,
                'Pengajuan anggaran ini tidak dapat dikirim dalam status sekarang.'
            );

            abort_if(
                $distribution->requested_budget < 1,
                422,
                'Anggaran yang diajukan harus lebih dari nol.'
            );

            abort_if(
                $distribution->status !== 'planned' ||
                $distribution->report_status !== 'draft',
                403,
                'Rencana tidak dapat diajukan karena pelaksanaan atau pelaporan sudah dimulai.'
            );

            DB::table('distributions')
                ->where('id', $id)
                ->update([
                    'budget_status' => 'pending',
                    'approved_budget' => null,
                    'budget_reviewed_by' => null,
                    'budget_reviewed_at' => null,
                    'budget_revision_note' => null,
                    'updated_at' => now(),
                ]);

            DB::table('audit_logs')->insert([
                'user_id' => auth()->id(),
                'action' => 'distribution_budget_submitted',
                'entity_type' => 'distribution',
                'entity_id' => $id,
                'metadata' => json_encode([
                    'title' => $distribution->title,
                    'requested_budget' => $distribution->requested_budget,
                    'previous_status' => $distribution->budget_status,
                    'new_status' => 'pending',
                ]),
                'ip_address' => $request->ip(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });

        return redirect()
            ->route('admin.distributions.show', $id)
            ->with('success', 'Pengajuan anggaran berhasil dikirim kepada Superadmin.');
    }

    /**
     * Detail kegiatan penyaluran.
     */
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

            $realExpenses = $expenses->filter(function ($expense) {
                return !(bool) $expense->is_simulated;
            });
            
            $expenseSummary = [
                'total' => (int) $realExpenses->sum('amount'),
            
                'approved' => (int) $realExpenses
                    ->where('approval_status', 'approved')
                    ->sum('amount'),
            
                'pending' => (int) $realExpenses
                    ->where('approval_status', 'pending')
                    ->sum('amount'),
            ];

        return Inertia::render('Admin/Distributions/Show', [
            'distribution' => $distribution,
            'expenses' => $expenses,
            'expenseSummary' => $expenseSummary,
            'documents' => $documents,
        ]);
    }

    /**
     * Menyimpan realisasi kegiatan.
     */
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
                    $distribution->budget_status !== 'approved',
                    403,
                    'Realisasi belum dapat dilakukan karena anggaran belum disetujui Superadmin.'
                );
                
                abort_if(
                    !in_array($distribution->status, ['planned', 'ongoing']) ||
                    !in_array($distribution->report_status, ['draft', 'revision']),
                    403,
                    'Realisasi tidak dapat diubah karena laporan sudah diajukan atau disetujui.'
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
                    'actor' => 'admin',
                ]),
                'ip_address' => $request->ip(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });

        return redirect()
            ->route('admin.distributions.show', $id)
            ->with('success', 'Realisasi penyaluran berhasil disimpan.');
    }


/**
 * Mengunggah dokumentasi foto atau video penyaluran.
 */
public function uploadDocument(Request $request, string $id)
{
    $validated = $request->validate([
        'media' => [
            'required',
            'file',
            'mimes:jpg,jpeg,png,webp,mp4,mov,webm',
            'max:51200',
        ],
        'caption' => ['nullable', 'string', 'max:255'],
        'document_date' => ['nullable', 'date'],
    ]);

    $distribution = DB::table('distributions')
        ->where('id', $id)
        ->first();

    abort_if(!$distribution, 404);

    abort_if(
        !in_array($distribution->report_status, ['draft', 'revision']),
        403,
        'Dokumentasi tidak dapat diubah karena laporan sudah diajukan atau disetujui.'
    );

    $file = $request->file('media');
    $mimeType = $file->getMimeType();
    $fileType = str_starts_with($mimeType, 'video/')
        ? 'video'
        : 'photo';

    // Foto maksimal 5 MB, video maksimal 50 MB.
    if ($fileType === 'photo' && $file->getSize() > 5 * 1024 * 1024) {
        return back()
            ->withErrors(['media' => 'Ukuran foto maksimal 5 MB.'])
            ->withInput();
    }

    $filePath = $file->store('distribution-documents', 'public');

    try {
        DB::transaction(function () use (
            $validated,
            $id,
            $filePath,
            $fileType,
            $request
        ) {
            $documentId = DB::table('distribution_documents')
                ->insertGetId([
                    'distribution_id' => $id,
                    'file_path' => $filePath,
                    'file_type' => $fileType,
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
                    'file_type' => $fileType,
                    'caption' => $validated['caption'] ?? null,
                    'actor' => 'admin',
                ]),
                'ip_address' => $request->ip(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });
    } catch (\Throwable $e) {
        Storage::disk('public')->delete($filePath);
        throw $e;
    }

    return redirect()
        ->route('admin.distributions.show', $id)
        ->with('success', 'Dokumentasi berhasil diunggah.');
}


    /**
     * Menghapus dokumentasi penyaluran.
     */
    public function deleteDocument(string $id, int $documentId)
    {
        $distribution = DB::table('distributions')
            ->where('id', $id)
            ->first();

        abort_if(!$distribution, 404);

        abort_if(
            !in_array($distribution->report_status, ['draft', 'revision']),
            403,
            'Dokumentasi tidak dapat dihapus karena laporan sudah diajukan atau disetujui.'
        );

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
                    'actor' => 'admin',
                ]),
                'ip_address' => request()->ip(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });

        Storage::disk('public')->delete($document->file_path);

        return redirect()
            ->route('admin.distributions.show', $id)
            ->with('success', 'Dokumentasi berhasil dihapus.');
    }

    /**
     * Mengajukan laporan kepada Superadmin.
     */
    public function submitReport(string $id)
    {
        DB::transaction(function () use ($id) {
            $distribution = DB::table('distributions')
                ->where('id', $id)
                ->lockForUpdate()
                ->first();

            abort_if(!$distribution, 404);

            abort_if(
                $distribution->status !== 'completed',
                422,
                'Kegiatan harus berstatus selesai sebelum laporan diajukan.'
            );

            abort_if(
                !in_array($distribution->report_status, ['draft', 'revision']),
                403,
                'Laporan sudah diajukan atau sudah disetujui.'
            );

            $documentCount = DB::table('distribution_documents')
                ->where('distribution_id', $id)
                ->count();

            abort_if(
                $documentCount < 1,
                422,
                'Unggah minimal satu dokumentasi sebelum mengajukan laporan.'
            );

            DB::table('distributions')
                ->where('id', $id)
                ->update([
                    'report_status' => 'pending',
                    'updated_at' => now(),
                ]);

            DB::table('audit_logs')->insert([
                'user_id' => auth()->id(),
                'action' => 'distribution_report_submitted',
                'entity_type' => 'distribution',
                'entity_id' => $id,
                'metadata' => json_encode([
                    'title' => $distribution->title,
                    'actual_quantity' => $distribution->actual_quantity,
                    'total_cost' => $distribution->total_cost,
                    'document_count' => $documentCount,
                ]),
                'ip_address' => request()->ip(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });

        return redirect()
            ->route('admin.distributions.show', $id)
            ->with('success', 'Laporan penyaluran berhasil diajukan kepada Superadmin.');
    }
}
