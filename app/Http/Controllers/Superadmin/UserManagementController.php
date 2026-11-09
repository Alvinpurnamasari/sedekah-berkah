<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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

        User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'password' => $data['password'],
            'role_id' => $role->id,
            'status' => 'active',
        ]);

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

        // Superadmin tidak boleh mengubah role akunnya sendiri.
        if ($user->id === Auth::id() && $user->role?->name === 'superadmin') {
            return back()->withErrors([
                'role_id' => 'Role akun Superadmin yang sedang digunakan tidak dapat diubah.',
            ]);
        }

        $user->update([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'role_id' => $role->id,
        ]);

        return redirect()
    ->route('superadmin.users.index', [], 303)
    ->with('success', 'Data pengguna berhasil diperbarui.');
    }

    public function toggleStatus(string $id)
    {
        $user = User::findOrFail($id);

        if ($user->id === Auth::id()) {
            return back()->withErrors([
                'status' => 'Kamu tidak dapat menonaktifkan akun yang sedang digunakan.',
            ]);
        }

        if ($user->role?->name === 'superadmin') {
            return back()->withErrors([
                'status' => 'Akun Superadmin tidak dapat dinonaktifkan melalui menu ini.',
            ]);
        }

        $user->status = $user->status === 'active' ? 'inactive' : 'active';
        $user->save();

        return back()->with(
            'success',
            'Status pengguna berhasil diperbarui.'
        );
    }

    public function resetPassword(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        if ($user->id === Auth::id()) {
            return back()->withErrors([
                'password' => 'Gunakan pengaturan akun sendiri untuk mengganti password.',
            ]);
        }

        $data = $request->validate([
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user->update([
            'password' => $data['password'],
        ]);

        return back()->with('success', 'Password pengguna berhasil diatur ulang.');
    }
}
