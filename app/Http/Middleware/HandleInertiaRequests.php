<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function share(Request $request): array
    {
        $organization = DB::table('settings')
            ->where('setting_group', 'general')
            ->whereIn('setting_key', [
                'organization_name',
                'organization_description',
                'organization_address',
                'organization_email',
                'organization_phone',
                'organization_website',
                'organization_logo',
            ])
            ->pluck('setting_value', 'setting_key')
            ->toArray();

        return array_merge(parent::share($request), [
            // Informasi pengguna yang sedang login
            'auth' => [
                'user' => fn () => $request->user()
                    ? $request->user()->only('id', 'name', 'email')
                    : null,
            ],

            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],

            'organization' => array_merge([
                'organization_name' => 'Sedekah Berkah',
                'organization_description' => 'Sedekah Berkah adalah platform sedekah digital yang berfokus pada penyaluran bantuan secara terarah dan transparan di Yogyakarta.',
                'organization_address' => '',
                'organization_email' => '',
                'organization_phone' => '',
                'organization_website' => '',
                'organization_logo' => '',
            ], $organization),
        ]);
    }
}
