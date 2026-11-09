<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class UserManagementController extends Controller
{
    public function index(Request $request)
    {
        $users = User::with('role')
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->when($request->role, function ($query, $role) {
                $query->whereHas('role', function ($q) use ($role) {
                    $q->where('name', $role);
                });
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Superadmin/Users', [
            'users' => $users,
            'filters' => $request->only('search', 'role', 'status'),
            'roles' => Role::whereIn('name', ['admin', 'pensedekah'])
                ->orderBy('name')
                ->get(['id', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:30'],
            'password' => ['required', 'string', 'min:8'],
            'role_id' => ['required', 'exists:roles,id'],
        ]);

        $role = Role::findOrFail($data['role_id']);

        if (!in_array($role->name, ['admin', 'pensedekah'], true)) {
            return back()->withErrors([
                'role_id' => 'Role tersebut tidak boleh diberikan melalui menu ini.',
            ]);
        }

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'password' => $data['password'],
            'role_id' => $role->id,
            'status' => 'active',
        ]);

        $this->writeAuditLog(
            $request,
            'user_created',
            $user,
            [
                'name' => $user->name,
                'email' => $user->email,
                'role' => $role->name,
            ]
        );

        return redirect()->route('superadmin.users.index')
            ->with('success', 'Pengguna berhasil ditambahkan.');
    }

    public function update(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'phone' => ['nullable', 'string', 'max:30'],
            'role_id' => ['required', 'exists:roles,id'],
        ]);

        $role = Role::findOrFail($data['role_id']);

        if (!in_array($role->name, ['admin', 'pensedekah'], true)) {
            return back()->withErrors([
                'role_id' => 'Role tersebut tidak boleh diberikan melalui menu ini.',
            ]);
        }

        if ($user->id === Auth::id() && $user->role?->name === 'superadmin') {
            return back()->withErrors([
                'role_id' => 'Role akun Superadmin yang sedang digunakan tidak dapat diubah.',
            ]);
        }

        $oldData = [
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'role' => $user->role?->name,
        ];

        $user->update([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'role_id' => $role->id,
        ]);

        $this->writeAuditLog(
            $request,
            'user_updated',
            $user,
            [
                'before' => $oldData,
                'after' => [
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'role' => $role->name,
                ],
            ]
        );

        return redirect()
            ->route('superadmin.users.index', [], 303)
            ->with('success', 'Data pengguna berhasil diperbarui.');
    }

  
public function toggleStatus(Request $request, string $id)
{
    $user = User::findOrFail($id);

    if ($user->id === Auth::id()) {
        return redirect()
            ->route('superadmin.users.index', [], 303)
            ->withErrors([
                'status' => 'Kamu tidak dapat menonaktifkan akun yang sedang digunakan.',
            ]);
    }

    if ($user->role?->name === 'superadmin') {
        return redirect()
            ->route('superadmin.users.index', [], 303)
            ->withErrors([
                'status' => 'Akun Superadmin tidak dapat dinonaktifkan melalui menu ini.',
            ]);
    }

    $oldStatus = $user->status;

    $user->status = $user->status === 'active' ? 'inactive' : 'active';
    $user->save();

    $this->writeAuditLog(
        $request,
        'user_status_changed',
        $user,
        [
            'name' => $user->name,
            'before' => $oldStatus,
            'after' => $user->status,
        ]
    );

    return redirect()
        ->route('superadmin.users.index', [], 303)
        ->with('success', 'Status pengguna berhasil diperbarui.');
}


 
public function resetPassword(Request $request, string $id)
{
    $user = User::findOrFail($id);

    if ($user->id === Auth::id()) {
        return redirect()
            ->route('superadmin.users.index', [], 303)
            ->withErrors([
                'password' => 'Gunakan pengaturan akun sendiri untuk mengganti password.',
            ]);
    }

    $data = $request->validate([
        'password' => ['required', 'string', 'min:8', 'confirmed'],
    ]);

    $user->update([
        'password' => $data['password'],
    ]);

    $this->writeAuditLog(
        $request,
        'user_password_reset',
        $user,
        [
            'name' => $user->name,
            'email' => $user->email,
            'message' => 'Password pengguna berhasil diatur ulang.',
        ]
    );

    return redirect()
        ->route('superadmin.users.index', [], 303)
        ->with('success', 'Password pengguna berhasil diatur ulang.');
}


    private function writeAuditLog(
        Request $request,
        string $action,
        User $user,
        array $metadata = []
    ): void {
        DB::table('audit_logs')->insert([
            'user_id' => Auth::id(),
            'action' => $action,
            'entity_type' => 'user',
            'entity_id' => $user->id,
            'metadata' => json_encode($metadata),
            'ip_address' => $request->ip(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
