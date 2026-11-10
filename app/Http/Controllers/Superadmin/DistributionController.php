<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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

}
