<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Models\CampaignCategory;
use App\Models\BeneficiaryTarget;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class CampaignManagementController extends Controller
{
    /**
     * Daftar seluruh program, termasuk Draft.
     */
    public function index(Request $request)
    {
        $query = Campaign::with(['category', 'beneficiaryTargets'])
            ->withSum([
                'donations as collected_amount' => function ($q) {
                    $q->where('payment_status', 'paid');
                }
            ], 'donation_amount')
            ->withCount([
                'donations as donor_count' => function ($q) {
                    $q->where('payment_status', 'paid');
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

        return Inertia::render('Superadmin/Campaigns/Index', [
            'campaigns' => $campaigns,
            'filters' => $request->only('search', 'status'),
            'statuses' => [
                'draft' => 'Draft',
                'pending_approval' => 'Menunggu Persetujuan',
                'published' => 'Published',
                'rejected' => 'Ditolak',
                'inactive' => 'Nonaktif',
                'active' => 'Aktif',
            ],
        ]);
    }

    
    /**
     * Detail program khusus Superadmin.
     */
    public function show(string $id)
    {
        $campaign = Campaign::with([
            'category',
            'beneficiaryTargets',
        ])
            ->withSum([
                'donations as collected_amount' => function ($query) {
                    $query->where('payment_status', 'paid');
                },
            ], 'donation_amount')
            ->withCount([
                'donations as donor_count' => function ($query) {
                    $query->where('payment_status', 'paid');
                },
            ])
            ->findOrFail($id);

        return Inertia::render('Superadmin/Campaigns/Show', [
            'campaign' => $campaign,
        ]);
    }


    /**
     * Form tambah program.
     */
    public function create()
    {
        return Inertia::render('Superadmin/Campaigns/Form', [
            'campaign' => null,
            'categories' => CampaignCategory::orderBy('name')->get(),
            'beneficiaryTargets' => BeneficiaryTarget::where('is_active', true)
                ->orderBy('name')
                ->get(),
        ]);
    }

    /**
     * Simpan program baru.
     */
    public function store(Request $request)
    {
        $data = $this->validateCampaign($request);

        DB::transaction(function () use ($data) {
            $targetIds = $data['beneficiary_targets'];
            unset($data['beneficiary_targets']);

            $data['slug'] = $this->makeUniqueSlug($data['title']);

            // Program baru harus melalui alur persetujuan.
            $data['status'] = 'draft';

            $campaign = Campaign::create($data);
            $campaign->beneficiaryTargets()->sync($targetIds);
        });

        return redirect()
            ->route('superadmin.campaigns.index')
            ->with('success', 'Program berhasil ditambahkan.');
    }

    /**
     * Form edit program.
     */
    public function edit(string $id)
    {
        $campaign = Campaign::with('beneficiaryTargets')->findOrFail($id);

        abort_if(
            $campaign->status === 'pending_approval',
            403,
            'Program yang sedang menunggu persetujuan tidak dapat diedit melalui formulir Superadmin.'
        );

        return Inertia::render('Superadmin/Campaigns/Form', [
            'campaign' => $campaign,
            'categories' => CampaignCategory::orderBy('name')->get(),
            'beneficiaryTargets' => BeneficiaryTarget::where('is_active', true)
                ->orderBy('name')
                ->get(),
        ]);
    }

    /**
     * Perbarui program.
     */
    public function update(Request $request, string $id)
    {
        $campaign = Campaign::findOrFail($id);
        $data = $this->validateCampaign($request);

        DB::transaction(function () use ($campaign, $data) {
            $targetIds = $data['beneficiary_targets'];
            unset($data['beneficiary_targets']);

            // Slug tetap dipertahankan saat judul tidak berubah.
            if ($campaign->title !== $data['title']) {
                $data['slug'] = $this->makeUniqueSlug(
                    $data['title'],
                    $campaign->id
                );
            }

            $campaign->update($data);
            $campaign->beneficiaryTargets()->sync($targetIds);
        });

        return redirect()
            ->route('superadmin.campaigns.index')
            ->with('success', 'Program berhasil diperbarui.');
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
    public function destroy(string $id)
    {
        $campaign = Campaign::findOrFail($id);
    
        // Cegah penghapusan jika memiliki riwayat keuangan
        $hasDonations = DB::table('donations')
            ->where('campaign_id', $id)
            ->exists();
    
        $hasDistributions = DB::table('distributions')
            ->where('campaign_id', $id)
            ->exists();
    
        $hasExpenses = DB::table('expenses')
            ->where('campaign_id', $id)
            ->exists();
    
        if ($hasDonations || $hasDistributions || $hasExpenses) {
            return redirect()
                ->route('superadmin.campaigns.index')
                ->setStatusCode(303)
                ->with(
                    'error',
                    'Program tidak dapat dihapus karena sudah memiliki riwayat donasi, penyaluran, atau pengeluaran.'
                );
        }
    
        DB::table('campaign_beneficiary_target')
            ->where('campaign_id', $id)
            ->delete();
    
        $campaign->delete();
    
        return redirect()
            ->route('superadmin.campaigns.index')
            ->setStatusCode(303)
            ->with('success', 'Program berhasil dihapus.');
    }

    /**
     * Menyetujui pengajuan program dan langsung mempublikasikannya.
     */
    public function approve(Request $request, string $id)
    {
        $campaign = Campaign::findOrFail($id);

        abort_if(
            $campaign->status !== 'pending_approval',
            403,
            'Hanya program yang menunggu persetujuan yang dapat disetujui.'
        );

        DB::transaction(function () use ($campaign, $request) {
            $campaign->update([
                'status' => 'published',
                'approved_by' => $request->user()->id,
                'approved_at' => now(),
                'rejection_reason' => null,
            ]);

            $this->writeCampaignAudit(
                $request,
                'campaign_approved',
                $campaign,
                [
                    'title' => $campaign->title,
                    'status' => 'published',
                ]
            );
        });

        return redirect()
            ->route('superadmin.campaigns.show', $campaign->id)
            ->with('success', 'Program berhasil disetujui dan dipublikasikan.');
    }

    /**
     * Menolak pengajuan program dengan alasan wajib.
     */
    public function reject(Request $request, string $id)
    {
        $data = $request->validate([
            'rejection_reason' => ['required', 'string', 'min:5', 'max:2000'],
        ]);

        $campaign = Campaign::findOrFail($id);

        abort_if(
            $campaign->status !== 'pending_approval',
            403,
            'Hanya program yang menunggu persetujuan yang dapat ditolak.'
        );

        DB::transaction(function () use ($campaign, $request, $data) {
            $campaign->update([
                'status' => 'rejected',
                'approved_by' => $request->user()->id,
                'approved_at' => now(),
                'rejection_reason' => $data['rejection_reason'],
            ]);

            $this->writeCampaignAudit(
                $request,
                'campaign_rejected',
                $campaign,
                [
                    'title' => $campaign->title,
                    'status' => 'rejected',
                    'rejection_reason' => $data['rejection_reason'],
                ]
            );
        });

        return redirect()
            ->route('superadmin.campaigns.show', $campaign->id)
            ->with('success', 'Pengajuan program ditolak. Alasan penolakan telah disimpan.');
    }

    /**
     * Menonaktifkan program yang sudah dipublikasikan.
     */
    public function deactivate(Request $request, string $id)
    {
        $campaign = Campaign::findOrFail($id);

        abort_if(
            $campaign->status !== 'published',
            403,
            'Hanya program Published yang dapat dinonaktifkan.'
        );

        DB::transaction(function () use ($campaign, $request) {
            $campaign->update([
                'status' => 'inactive',
            ]);

            $this->writeCampaignAudit(
                $request,
                'campaign_deactivated',
                $campaign,
                [
                    'title' => $campaign->title,
                    'status' => 'inactive',
                ]
            );
        });

        return redirect()
            ->route('superadmin.campaigns.show', $campaign->id)
            ->with('success', 'Program berhasil dinonaktifkan.');
    }

    /**
     * Mencatat keputusan program ke Audit Log.
     */
    private function writeCampaignAudit(
        Request $request,
        string $action,
        Campaign $campaign,
        array $metadata
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

}