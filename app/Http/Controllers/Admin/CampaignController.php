<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Models\CampaignCategory;
use App\Models\BeneficiaryTarget;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CampaignController extends Controller
{
    /**
     * Daftar seluruh program.
     */
    public function index(Request $request)
    {
        $query = Campaign::with(['category', 'beneficiaryTargets'])
            ->withSum([
                'donations as collected_amount' => function ($q) {
                    $q->where('payment_status', 'paid')
                        ->where('is_simulated', false);
                }
            ], 'donation_amount')
            ->withCount([
                'donations as donor_count' => function ($q) {
                    $q->where('payment_status', 'paid')
                        ->where('is_simulated', false);
                }
            ]);

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $campaigns = $query
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Campaigns/Index', [
            'campaigns' => $campaigns,
            'filters' => $request->only('search', 'status'),
            'statuses' => [
                'draft' => 'Draft',
                'active' => 'Aktif',
                'published' => 'Published',
            ],
        ]);
    }

    /**
     * Detail program.
     */
    public function show(string $id)
    {
        $campaign = Campaign::with([
            'category',
            'beneficiaryTargets',
        ])
            ->withSum([
                'donations as collected_amount' => function ($query) {
                    $query->where('payment_status', 'paid')
                        ->where('is_simulated', false);
                },
            ], 'donation_amount')
            ->withCount([
                'donations as donor_count' => function ($query) {
                    $query->where('payment_status', 'paid')
                        ->where('is_simulated', false);
                },
            ])
            ->findOrFail($id);

        return Inertia::render('Admin/Campaigns/Show', [
            'campaign' => $campaign,
        ]);
    }

    /**
     * Form tambah program.
     */
    public function create()
    {
        return Inertia::render('Admin/Campaigns/Form', [
            'campaign' => null,
            'categories' => CampaignCategory::orderBy('name')->get(),
            'beneficiaryTargets' => BeneficiaryTarget::where('is_active', true)
                ->orderBy('name')
                ->get(),
        ]);
    }

    /**
     * Simpan program baru sebagai Draft.
     */
    public function store(Request $request)
    {
        $data = $this->validateCampaign($request);

        $campaign = DB::transaction(function () use ($data, $request) {
            $targetIds = $data['beneficiary_targets'];
            unset($data['beneficiary_targets']);

            $data['slug'] = $this->makeUniqueSlug($data['title']);
            $data['status'] = 'draft';

            $campaign = Campaign::create($data);

            $campaign->beneficiaryTargets()->sync($targetIds);

            $this->writeAuditLog(
                'campaign_created',
                $campaign,
                [
                    'title' => $campaign->title,
                    'status' => 'draft',
                ],
                $request
            );

            return $campaign;
        });

        return redirect()
            ->route('admin.campaigns.index')
            ->with('success', 'Program berhasil dibuat sebagai Draft dan menunggu pemeriksaan Superadmin.');
    }

    /**
     * Form edit program.
     * Admin hanya boleh mengedit program Draft.
     */
    public function edit(string $id)
    {
        $campaign = Campaign::with('beneficiaryTargets')
            ->findOrFail($id);

            abort_if(
                !in_array($campaign->status, ['draft', 'rejected'], true),
                403,
                'Admin hanya dapat mengedit program Draft atau Rejected.'
            );

        return Inertia::render('Admin/Campaigns/Form', [
            'campaign' => $campaign,
            'categories' => CampaignCategory::orderBy('name')->get(),
            'beneficiaryTargets' => BeneficiaryTarget::where('is_active', true)
                ->orderBy('name')
                ->get(),
        ]);
    }

    /**
     * Perbarui program Draft.
     */
    public function update(Request $request, string $id)
    {
        $campaign = Campaign::findOrFail($id);

        abort_if(
            !in_array($campaign->status, ['draft', 'rejected'], true),
            403,
            'Admin hanya dapat mengubah program Draft atau Rejected.'
        );

        $data = $this->validateCampaign($request);

        DB::transaction(function () use ($campaign, $data, $request) {
            $targetIds = $data['beneficiary_targets'];
            unset($data['beneficiary_targets']);

            if ($campaign->title !== $data['title']) {
                $data['slug'] = $this->makeUniqueSlug(
                    $data['title'],
                    $campaign->id
                );
            }

            // Status tidak diambil dari request Admin.
            $campaign->update($data);

            $campaign->beneficiaryTargets()->sync($targetIds);

            $this->writeAuditLog(
                'campaign_updated',
                $campaign,
                [
                    'title' => $campaign->title,
                    'status' => $campaign->status,
                ],
                $request
            );
        });

        return redirect()
            ->route('admin.campaigns.show', $campaign->id)
            ->with('success', 'Program Draft berhasil diperbarui.');
    }

    /**
     * Validasi data program.
     */
    private function validateCampaign(Request $request): array
    {
        return $request->validate([
            'category_id' => [
                'required',
                'integer',
                'exists:campaign_categories,id',
            ],
            'title' => [
                'required',
                'string',
                'max:255',
            ],
            'description' => [
                'required',
                'string',
            ],
            'target_amount' => [
                'required',
                'integer',
                'min:5000',
            ],
            'target_beneficiaries' => [
                'required',
                'integer',
                'min:1',
            ],
            'start_date' => [
                'required',
                'date',
            ],
            'end_date' => [
                'required',
                'date',
                'after_or_equal:start_date',
            ],
            'location' => [
                'required',
                'string',
                'max:255',
            ],
            'beneficiary_targets' => [
                'required',
                'array',
                'min:1',
            ],
            'beneficiary_targets.*' => [
                'integer',
                'distinct',
                'exists:beneficiary_targets,id',
            ],
        ]);
    }

    /**
     * Membuat slug unik.
     */
    private function makeUniqueSlug(
        string $title,
        ?string $ignoreId = null
    ): string {
        $baseSlug = Str::slug($title);
        $slug = $baseSlug;
        $counter = 1;

        while (
            Campaign::where('slug', $slug)
                ->when($ignoreId, function ($query) use ($ignoreId) {
                    $query->where('id', '!=', $ignoreId);
                })
                ->exists()
        ) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }

    /**
     * Catat aktivitas ke Audit Log.
     */
    private function writeAuditLog(
        string $action,
        Campaign $campaign,
        array $metadata,
        Request $request
    ): void {
        DB::table('audit_logs')->insert([
            'user_id' => $request->user()->id,
            'action' => $action,
            'entity_type' => 'campaign',
            'entity_id' => $campaign->id,
            'metadata' => json_encode($metadata),
            'ip_address' => $request->ip(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Admin mengajukan kampanye untuk persetujuan Superadmin.
     */
    public function submitForApproval(Request $request, string $id)
    {
        $campaign = Campaign::findOrFail($id);

        abort_if(
            !in_array($campaign->status, ['draft', 'rejected'], true),
            403,
            'Hanya program Draft atau Rejected yang dapat diajukan.'
        );

        DB::transaction(function () use ($campaign, $request) {
            $campaign->update([
                'status' => 'pending_approval',
                'submitted_by' => $request->user()->id,
                'submitted_at' => now(),
                'approved_by' => null,
                'approved_at' => null,
                'rejection_reason' => null,
            ]);

            $this->writeAuditLog(
                'campaign_submitted_for_approval',
                $campaign,
                [
                    'title' => $campaign->title,
                    'status' => 'pending_approval',
                ],
                $request
            );
        });

        return redirect()
            ->route('admin.campaigns.show', $campaign->id)
            ->with(
                'success',
                'Program berhasil diajukan dan menunggu persetujuan Superadmin.'
            );
    }

}
