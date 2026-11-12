<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BeneficiaryTarget;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BeneficiaryTargetController extends Controller
{
    public function index(Request $request)
    {
        $query = BeneficiaryTarget::query();

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where(
                'is_active',
                $request->status === 'active'
            );
        }

        $targets = $query
            ->withCount('campaigns')
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Beneficiaries/Index', [
            'targets' => $targets,
            'filters' => $request->only('search', 'status'),
            'summary' => [
                'total' => BeneficiaryTarget::count(),
                'active' => BeneficiaryTarget::where('is_active', true)->count(),
                'inactive' => BeneficiaryTarget::where('is_active', false)->count(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:beneficiary_targets,name'],
            'description' => ['nullable', 'string', 'max:2000'],
        ]);

        $target = BeneficiaryTarget::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'is_active' => true,
        ]);

        $this->writeAuditLog(
            'beneficiary_target_created',
            $target,
            ['name' => $target->name]
        );

        return redirect()
            ->route('admin.beneficiaries.index')
            ->with('success', 'Target penerima berhasil ditambahkan.');
    }

    public function update(Request $request, $id)
    {
        $target = BeneficiaryTarget::findOrFail($id);

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                'unique:beneficiary_targets,name,' . $target->id,
            ],
            'description' => ['nullable', 'string', 'max:2000'],
        ]);

        $target->update($validated);

        $this->writeAuditLog(
            'beneficiary_target_updated',
            $target,
            ['name' => $target->name]
        );

        return redirect()
            ->route('admin.beneficiaries.index')
            ->with('success', 'Target penerima berhasil diperbarui.');
    }

    public function toggleStatus($id)
    {
        $target = BeneficiaryTarget::findOrFail($id);

        $target->update([
            'is_active' => !$target->is_active,
        ]);

        $this->writeAuditLog(
            'beneficiary_target_status_changed',
            $target,
            ['is_active' => $target->is_active]
        );

        return redirect()
            ->route('admin.beneficiaries.index')
            ->with(
                'success',
                $target->is_active
                    ? 'Target penerima berhasil diaktifkan.'
                    : 'Target penerima berhasil dinonaktifkan.'
            );
    }

    private function writeAuditLog($action, $target, array $metadata = [])
    {
        DB::table('audit_logs')->insert([
            'user_id' => auth()->id(),
            'action' => $action,
            'entity_type' => 'beneficiary_target',
            'entity_id' => (string) $target->id,
            'metadata' => json_encode($metadata),
            'ip_address' => request()->ip(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
