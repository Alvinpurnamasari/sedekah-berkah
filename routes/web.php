<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\CampaignController;
use App\Http\Controllers\Superadmin\UserManagementController;
use App\Http\Controllers\Superadmin\CampaignManagementController;

Route::get('/', fn () => Inertia::render('Public/Home'))
    ->name('home');

Route::get('/program', function () {
    $campaigns = DB::table('campaigns')
        ->leftJoin('campaign_categories', 'campaigns.category_id', '=', 'campaign_categories.id')
        ->select(
            'campaigns.id',
            'campaigns.title',
            'campaigns.slug',
            'campaigns.description',
            'campaigns.target_amount',
            'campaigns.target_beneficiaries',
            'campaigns.location',
            'campaigns.status',
            'campaign_categories.name as category_name'
        )
        ->selectSub(function ($query) {
            $query->from('donations')
                ->selectRaw('COALESCE(SUM(donation_amount), 0)')
                ->whereColumn('donations.campaign_id', 'campaigns.id')
                ->where('donations.payment_status', 'paid');
        }, 'collected_amount')
        ->selectSub(function ($query) {
            $query->from('donations')
                ->selectRaw('COUNT(*)')
                ->whereColumn('donations.campaign_id', 'campaigns.id')
                ->where('donations.payment_status', 'paid');
        }, 'donation_count')
        ->selectSub(function ($query) {
            $query->from('donations')
                ->join('beneficiary_targets', 'donations.beneficiary_target_id', '=', 'beneficiary_targets.id')
                ->selectRaw("GROUP_CONCAT(DISTINCT beneficiary_targets.name SEPARATOR '||')")
                ->whereColumn('donations.campaign_id', 'campaigns.id')
                ->where('donations.payment_status', 'paid');
        }, 'beneficiary_names')
        ->where('campaigns.status', '!=', 'draft')
        ->orderByDesc('campaigns.created_at')
        ->get()
        ->map(function ($campaign) {
            $campaign->beneficiary_names = $campaign->beneficiary_names
                ? explode('||', $campaign->beneficiary_names)
                : [];

            return $campaign;
        });

    return Inertia::render('Public/Programs', [
        'campaigns' => $campaigns,
    ]);
})->name('programs.index');

Route::get('/program/{slug}', [CampaignController::class, 'show'])
    ->name('programs.show');

Route::get('/checkout/{slug}', fn ($slug) =>
    Inertia::render('Public/Checkout', ['slug' => $slug])
)->name('checkout.show');

Route::get('/transparansi', fn () =>
    Inertia::render('Public/Transparency')
)->name('transparency');

// Halaman login dan pendaftaran
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])
        ->name('login');

    Route::post('/login', [AuthController::class, 'login'])
        ->middleware('throttle:5,1')
        ->name('login.store');

    Route::get('/daftar', [AuthController::class, 'showRegister'])
        ->name('register');

    Route::post('/daftar', [AuthController::class, 'register'])
        ->middleware('throttle:5,1')
        ->name('register.store');
});

// Halaman yang hanya bisa diakses setelah login
Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])
        ->name('logout');

    Route::get('/akun', fn () =>
        Inertia::render('Pensedekah/Dashboard')
    )->middleware('role:pensedekah')->name('pensedekah.dashboard');

    Route::get('/admin', function () {
        $summary = [
            'activeCampaigns' => DB::table('campaigns')
                ->where('status', 'active')
                ->count(),
    
            'verifiedFunds' => DB::table('donations')
                ->where('payment_status', 'paid')
                ->sum('donation_amount'),
    
            'distributionSchedules' => DB::table('distributions')
                ->where('status', 'planned')
                ->count(),
        ];
    
        return Inertia::render('Admin/Dashboard', [
            'summary' => $summary,
        ]);
    })->middleware('role:admin')->name('admin.dashboard');

    Route::get('/superadmin', function () {

        // Total dana masuk dari donasi yang sudah dibayar
        $totalDanaMasuk = DB::table('donations')
            ->where('payment_status', 'paid')
            ->sum(DB::raw('donation_amount + operational_support'));
    
        // Total dana yang sudah disalurkan
        $danaDisalurkan = DB::table('distributions')
            ->where('status', 'completed')
            ->sum('total_cost');
    
        // Dana yang belum disalurkan
        $danaBelumDisalurkan = max(
            0,
            $totalDanaMasuk - $danaDisalurkan
        );
    
        // Total donatur unik yang sudah berhasil berdonasi
        $totalDonatur = DB::table('donations')
            ->where('payment_status', 'paid')
            ->selectRaw("
                COUNT(DISTINCT COALESCE(
                    user_id,
                    NULLIF(donor_email, ''),
                    NULLIF(donor_phone, ''),
                    donation_code
                )) as total
            ")
            ->value('total');
    
        // Total transaksi berhasil
        $transaksiBerhasil = DB::table('donations')
            ->where('payment_status', 'paid')
            ->count();
    
        // Pengeluaran yang masih menunggu persetujuan
        $menungguPersetujuan = DB::table('expenses')
            ->where('approval_status', 'pending')
            ->count();
    
        return Inertia::render('Superadmin/Dashboard', [
            'stats' => [
                'totalDanaMasuk' => (int) $totalDanaMasuk,
                'danaDisalurkan' => (int) $danaDisalurkan,
                'danaBelumDisalurkan' => (int) $danaBelumDisalurkan,
                'totalDonatur' => (int) $totalDonatur,
                'transaksiBerhasil' => (int) $transaksiBerhasil,
                'menungguPersetujuan' => (int) $menungguPersetujuan,
            ],
        ]);
    
    })->middleware('role:superadmin')->name('superadmin.dashboard');
    
Route::middleware('role:superadmin')->prefix('superadmin')->name('superadmin.')->group(function () {

    Route::get('/pengguna', [UserManagementController::class, 'index'])
        ->name('users.index');

    Route::post('/pengguna', [UserManagementController::class, 'store'])
        ->name('users.store');

    Route::put('/pengguna/{id}', [UserManagementController::class, 'update'])
        ->name('users.update');

    Route::patch('/pengguna/{id}/status', [UserManagementController::class, 'toggleStatus'])
        ->name('users.status');

    Route::put('/pengguna/{id}/password', [UserManagementController::class, 'resetPassword'])
        ->name('users.password');

        Route::get('/program', [CampaignManagementController::class, 'index'])
        ->name('campaigns.index');
    
    Route::get('/program/tambah', [CampaignManagementController::class, 'create'])
        ->name('campaigns.create');
    
    Route::post('/program', [CampaignManagementController::class, 'store'])
        ->name('campaigns.store');
    
    Route::get('/program/{id}/edit', [CampaignManagementController::class, 'edit'])
        ->name('campaigns.edit');
    
    Route::put('/program/{id}', [CampaignManagementController::class, 'update'])
        ->name('campaigns.update');
        
    Route::delete('/program/{id}', [CampaignManagementController::class, 'destroy'])
        ->name('campaigns.destroy');

});

});