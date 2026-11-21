<?php

namespace App\Http\Controllers\Pensedekah;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class ProfileController extends Controller
{
    /**
     * Menampilkan halaman profil pensedekah.
     */
    public function edit(Request $request)
    {
        return Inertia::render('Pensedekah/Profile/Edit', [
            'user' => $request->user()->only([
                'id',
                'name',
                'email',
                'phone',
            ]),
        ]);
    }

    /**
     * Memperbarui data profil pensedekah.
     */
    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'phone' => [
                'nullable',
                'string',
                'max:20',
            ],
        ]);

        $user->update($validated);

        return back()->with(
            'success',
            'Profil berhasil diperbarui.'
        );
    }

    /**
     * Mengubah password pensedekah.
     */
    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => [
                'required',
                'current_password',
            ],
            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
            ],
        ], [
            'current_password.current_password' =>
                'Password saat ini tidak sesuai.',
            'password.min' =>
                'Password baru minimal 8 karakter.',
            'password.confirmed' =>
                'Konfirmasi password baru tidak cocok.',
        ]);

        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back()->with(
            'success',
            'Password berhasil diperbarui.'
        );
    }
}
