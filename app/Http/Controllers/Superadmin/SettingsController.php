<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
{
    $settings = DB::table('settings')
        ->get()
        ->keyBy('setting_key')
        ->map(fn ($item) => $item->setting_value);

    return Inertia::render('Superadmin/Settings/Index', [
        'settings' => $settings,
        'flash' => [
            'success' => session('success'),
        ],
    ]);
}
    public function update(Request $request)
    {
        $validated = $request->validate([
            'organization_name' => ['required', 'string', 'max:150'],
            'organization_description' => ['nullable', 'string', 'max:2000'],
            'organization_address' => ['nullable', 'string', 'max:1000'],
            'organization_email' => ['nullable', 'email', 'max:150'],
            'organization_phone' => ['nullable', 'string', 'max:30'],
            'organization_website' => ['nullable', 'url', 'max:255'],
            'logo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        DB::transaction(function () use ($validated, $request) {
            $settings = [
                'organization_name' => $validated['organization_name'],
                'organization_description' => $validated['organization_description'] ?? '',
                'organization_address' => $validated['organization_address'] ?? '',
                'organization_email' => $validated['organization_email'] ?? '',
                'organization_phone' => $validated['organization_phone'] ?? '',
                'organization_website' => $validated['organization_website'] ?? '',
            ];

            foreach ($settings as $key => $value) {
                $this->saveSetting('general', $key, $value);
            }

            if ($request->hasFile('logo')) {
                $oldLogo = DB::table('settings')
                    ->where('setting_key', 'organization_logo')
                    ->value('setting_value');

                $logoPath = $request->file('logo')
                    ->store('settings', 'public');

                $this->saveSetting(
                    'general',
                    'organization_logo',
                    $logoPath
                );

                if ($oldLogo) {
                    Storage::disk('public')->delete($oldLogo);
                }
            }

            DB::table('audit_logs')->insert([
                'user_id' => auth()->id(),
                'action' => 'system_settings_updated',
                'entity_type' => 'settings',
                'entity_id' => null,
                'metadata' => json_encode([
                    'updated_keys' => array_keys($settings),
                    'logo_updated' => $request->hasFile('logo'),
                ]),
                'ip_address' => $request->ip(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });

        return redirect()
            ->route('superadmin.settings.index')
            ->with('success', 'Pengaturan lembaga berhasil diperbarui.');
    }

    private function saveSetting(string $group, string $key, ?string $value): void
    {
        DB::table('settings')->updateOrInsert(
            ['setting_key' => $key],
            [
                'setting_group' => $group,
                'setting_value' => $value,
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );
    }
}
