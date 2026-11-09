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
                'active' => 'Aktif',
                'published' => 'Published',
            ],
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
            'status' => [
                'required',
                Rule::in(['draft', 'active', 'published']),
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
}