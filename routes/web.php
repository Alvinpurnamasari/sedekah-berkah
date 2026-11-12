<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\CampaignController;
use App\Http\Controllers\Superadmin\UserManagementController;
use App\Http\Controllers\Superadmin\CampaignManagementController;
use App\Http\Controllers\Superadmin\FinanceController;
use App\Http\Controllers\Superadmin\AuditLogController;
use App\Http\Controllers\Superadmin\TransactionController;
use App\Http\Controllers\Superadmin\DistributionController;
use App\Http\Controllers\Admin\DistributionController as AdminDistributionController;
use App\Http\Controllers\PublicTransparencyController;
use App\Http\Controllers\Superadmin\ReportController;
use App\Http\Controllers\Admin\CampaignController as AdminCampaignController;

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
                ->where('donations.payment_status', 'paid')
                ->where('donations.is_simulated', false);
        }, 'collected_amount')
        ->selectSub(function ($query) {
            $query->from('donations')
                ->selectRaw('COUNT(*)')
                ->whereColumn('donations.campaign_id', 'campaigns.id')
                ->where('donations.payment_status', 'paid')
                ->where('donations.is_simulated', false);
        }, 'donation_count')
        ->selectSub(function ($query) {
            $query->from('donations')
                ->join('beneficiary_targets', 'donations.beneficiary_target_id', '=', 'beneficiary_targets.id')
                ->selectRaw("GROUP_CONCAT(DISTINCT beneficiary_targets.name SEPARATOR '||')")
                ->whereColumn('donations.campaign_id', 'campaigns.id')
                ->where('donations.payment_status', 'paid')
                ->where('donations.is_simulated', false);
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

Route::get('/transparansi', [
    \App\Http\Controllers\PublicTransparencyController::class,
    'index',
])->name('transparency');

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
            ->where('is_simulated', false)
            ->sum(DB::raw('donation_amount + operational_support')),

        'successfulDonations' => DB::table('donations')
            ->where('payment_status', 'paid')
            ->where('is_simulated', false)
            ->count(),

        'distributionSchedules' => DB::table('distributions')
            ->where('status', 'planned')
            ->where('is_simulated', false)
            ->count(),

        'pendingReports' => DB::table('distributions')
            ->where('report_status', 'pending')
            ->where('is_simulated', false)
            ->count(),

        'pendingExpenses' => DB::table('expenses')
            ->where('approval_status', 'pending')
            ->where('is_simulated', false)
            ->count(),
    ];

    $recentActivities = DB::table('audit_logs')
        ->leftJoin('users', 'audit_logs.user_id', '=', 'users.id')
        ->where(function ($query) {
            $query->where('users.role_id', function ($subquery) {
                $subquery->select('id')
                    ->from('roles')
                    ->where('name', 'admin');
            })->orWhereNull('audit_logs.user_id');
        })
        ->select(
            'audit_logs.action',
            'audit_logs.entity_type',
            'audit_logs.created_at',
            'users.name as user_name'
        )
        ->latest('audit_logs.created_at')
        ->limit(6)
        ->get();

    return Inertia::render('Admin/Dashboard', [
        'summary' => $summary,
        'recentActivities' => $recentActivities,
    ]);
})->middleware('role:admin')->name('admin.dashboard');

// Manajemen Program Admin
Route::middleware('role:admin')
    ->prefix('admin/program')
    ->name('admin.campaigns.')
    ->group(function () {

        Route::get('/', [AdminCampaignController::class, 'index'])
            ->name('index');

        Route::get('/tambah', [AdminCampaignController::class, 'create'])
            ->name('create');

        Route::post('/', [AdminCampaignController::class, 'store'])
            ->name('store');

        Route::get('/{id}/edit', [AdminCampaignController::class, 'edit'])
            ->name('edit');

        Route::put('/{id}', [AdminCampaignController::class, 'update'])
            ->name('update');

        Route::get('/{id}', [AdminCampaignController::class, 'show'])
            ->name('show');
    });

        // Pengajuan pengeluaran oleh Admin
        Route::get('/admin/pengeluaran', [
            \App\Http\Controllers\Admin\ExpenseController::class,
            'index'
        ])->middleware('role:admin')->name('admin.expenses.index');
    
        Route::post('/admin/pengeluaran', [
            \App\Http\Controllers\Admin\ExpenseController::class,
            'store'
        ])->middleware('role:admin')->name('admin.expenses.store');

        // Penyaluran dana oleh Admin
        Route::middleware('role:admin')
        ->prefix('admin/penyaluran')
        ->name('admin.distributions.')
        ->group(function () {

            Route::get('/', [AdminDistributionController::class, 'index'])
                ->name('index');

            Route::get('/{id}', [AdminDistributionController::class, 'show'])
                ->name('show');

            Route::post('/{id}/realisasi', [AdminDistributionController::class, 'saveRealization'])
                ->name('realization');

            Route::post('/{id}/dokumentasi', [AdminDistributionController::class, 'uploadDocument'])
                ->name('documents.store');

            Route::delete('/{id}/dokumentasi/{documentId}', [AdminDistributionController::class, 'deleteDocument'])
                ->name('documents.delete');

            Route::post('/{id}/ajukan-laporan', [AdminDistributionController::class, 'submitReport'])
                ->name('submit-report');
        });

    Route::get('/superadmin', function () {

        // Total dana masuk dari donasi yang sudah dibayar
       // Total dana masuk dari pembayaran riil
        $totalDanaMasuk = DB::table('donations')
        ->where('payment_status', 'paid')
        ->where('is_simulated', false)
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
            ->where('is_simulated', false)
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
            ->where('is_simulated', false)
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
        
    Route::get('/program/{id}', [CampaignManagementController::class, 'show'])
        ->name('campaigns.show');

    Route::get('/program/{id}/edit', [CampaignManagementController::class, 'edit'])
        ->name('campaigns.edit');
    
    Route::put('/program/{id}', [CampaignManagementController::class, 'update'])
        ->name('campaigns.update');
        
    Route::delete('/program/{id}', [CampaignManagementController::class, 'destroy'])
        ->name('campaigns.destroy');

    Route::get('/keuangan', [FinanceController::class, 'index'])
        ->name('finance.index');
  
    Route::get('/transaksi', [TransactionController::class, 'index'])
        ->name('transactions.index');
       
    Route::get('/transaksi/{id}', [TransactionController::class, 'show'])
        ->name('transactions.show');

    Route::post('/transaksi/{id}/simulasi-status', [TransactionController::class, 'simulateStatus'])
        ->name('transactions.simulate-status');

    Route::get('/penyaluran', [DistributionController::class, 'index'])
        ->name('distributions.index');

    Route::get('/penyaluran/tambah', [DistributionController::class, 'create'])
        ->name('distributions.create');

    Route::post('/penyaluran', [DistributionController::class, 'store'])
        ->name('distributions.store');

    Route::get('/penyaluran/{id}', [DistributionController::class, 'show'])
        ->name('distributions.show');

    Route::get('/penyaluran/{id}/edit', [DistributionController::class, 'edit'])
        ->name('distributions.edit');

    Route::post('/penyaluran/{id}/dokumentasi', [DistributionController::class, 'uploadDocument'
        ])->name('distributions.documents.store');

    Route::put('/penyaluran/{id}', [DistributionController::class, 'update'])
        ->name('distributions.update');

    Route::post('/penyaluran/{id}/realisasi', [DistributionController::class, 'saveRealization' ])
        ->name('distributions.realization');
    
    Route::delete('/penyaluran/{id}/dokumentasi/{documentId}', [DistributionController::class, 'deleteDocument']
        )->name('distributions.documents.delete');

    Route::post('/penyaluran/{id}/setujui-laporan', [DistributionController::class, 'approveReport'])
        ->name('distributions.approve-report');

    Route::post('/penyaluran/{id}/minta-revisi', [DistributionController::class, 'requestRevision'])
        ->name('distributions.request-revision');
   
    Route::post('/penyaluran/{id}/publikasikan', [DistributionController::class, 'publish'])
        ->name('distributions.publish');
    
    Route::post('/penyaluran/{id}/sembunyikan', [DistributionController::class, 'unpublish'])
        ->name('distributions.unpublish');
    
        Route::get('/pengeluaran', [
            \App\Http\Controllers\Superadmin\ExpenseApprovalController::class,
            'index'
        ])->name('expenses.index');
        
        Route::post('/pengeluaran/{id}/setujui', [
            \App\Http\Controllers\Superadmin\ExpenseApprovalController::class,
            'approve'
        ])->name('expenses.approve');
        
        Route::post('/pengeluaran/{id}/tolak', [
            \App\Http\Controllers\Superadmin\ExpenseApprovalController::class,
            'reject'
        ])->name('expenses.reject');

    Route::get('/audit-log', [AuditLogController::class, 'index'])
        ->name('audit.index');

    Route::get('/laporan', [ReportController::class, 'index'])
        ->name('reports.index');

    Route::get('/laporan/pdf', [ReportController::class, 'exportPdf'])
        ->name('reports.pdf');

    Route::get('/laporan/excel', [ReportController::class, 'exportExcel'])
        ->name('reports.excel');

});

});