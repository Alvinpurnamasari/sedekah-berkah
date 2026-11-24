<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\CampaignController;
use App\Http\Controllers\Superadmin\UserManagementController;
use App\Http\Controllers\Superadmin\CampaignManagementController;
use App\Http\Controllers\Superadmin\FinanceController;
use App\Http\Controllers\Superadmin\AllocationController;
use App\Http\Controllers\Superadmin\AuditLogController;
use App\Http\Controllers\Superadmin\TransactionController;
use App\Http\Controllers\Superadmin\DistributionController;
use App\Http\Controllers\Admin\DistributionController as AdminDistributionController;
use App\Http\Controllers\PublicTransparencyController;
use App\Http\Controllers\Superadmin\ReportController;
use App\Http\Controllers\Admin\CampaignController as AdminCampaignController;
use App\Http\Controllers\Admin\BeneficiaryTargetController;
use App\Http\Controllers\Admin\TransactionController as AdminTransactionController;
use App\Http\Controllers\Admin\DocumentationController;
use App\Http\Controllers\Superadmin\SettingsController;
use App\Http\Controllers\Superadmin\GatewayFeeController;
use App\Http\Controllers\Pensedekah\DashboardController;
use App\Http\Controllers\DonationController;

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
        ->whereIn('campaigns.status', ['published', 'active'])
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


    Route::get('/checkout/{slug}', function ($slug) {
        $donationAccounts = DB::table('donation_accounts')
            ->where('is_active', true)
            ->orderBy('bank_name')
            ->get([
                'id',
                'bank_name',
                'account_number',
                'account_holder',
                'description',
            ]);
    
        return Inertia::render('Public/Checkout', [
            'slug' => $slug,
            'donationAccounts' => $donationAccounts,
        ]);
    })->name('checkout.show');
    

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

    // Pensedekah
    Route::middleware('role:pensedekah')->group(function () {

        // Membuat transaksi donasi (wajib login Pensedekah)
        Route::post('/api/v1/donations', [
            \App\Http\Controllers\DonationController::class,
            'store'
        ])
            ->middleware('throttle:10,1')
            ->name('pensedekah.donations.store');

        // Upload bukti transfer (hanya pemilik donasi)
        Route::post('/api/v1/donations/{code}/proof', [
            \App\Http\Controllers\DonationController::class,
            'uploadProof'
        ])
            ->middleware('throttle:5,1')
            ->name('pensedekah.donations.upload-proof');

        // Dashboard Pensedekah
        Route::get('/akun', [DashboardController::class, 'index'])
            ->name('pensedekah.dashboard');

        // Riwayat donasi
        Route::get('/akun/donasi', [
            \App\Http\Controllers\Pensedekah\DonationController::class,
            'index'
        ])->name('pensedekah.donations.index');

        // Detail donasi
        Route::get('/akun/donasi/{code}', [
            \App\Http\Controllers\Pensedekah\DonationController::class,
            'show'
        ])->name('pensedekah.donations.show');

        // Lihat bukti donasi
        Route::get('/akun/donasi/{code}/bukti', [
            \App\Http\Controllers\Pensedekah\DonationController::class,
            'proof'
        ])->name('pensedekah.donations.proof');


        // Profil Saya - menampilkan data profil
        Route::get('/akun/profil', [
            \App\Http\Controllers\Pensedekah\ProfileController::class,
            'edit'
        ])->name('pensedekah.profile.edit');

        // Memperbarui data profil
        Route::put('/akun/profil', [
            \App\Http\Controllers\Pensedekah\ProfileController::class,
            'update'
        ])->name('pensedekah.profile.update');

        // Mengubah password
        Route::put('/akun/profil/password', [
            \App\Http\Controllers\Pensedekah\ProfileController::class,
            'updatePassword'
        ])->name('pensedekah.profile.password');

        // Program & Kampanye
        Route::get('/akun/program', [
            \App\Http\Controllers\Pensedekah\ProgramController::class,
            'index'
        ])->name('pensedekah.programs.index');

        // Laporan penyaluran
        Route::get('/akun/penyaluran', [
            \App\Http\Controllers\Pensedekah\DistributionReportController::class,
            'index'
        ])->name('pensedekah.reports.index');

        // Tracking penyaluran sedekah
    Route::get('/akun/tracking', [
        \App\Http\Controllers\Pensedekah\TrackingController::class,
        'index'
    ])->name('pensedekah.tracking.index');
    });


    Route::get('/admin', function () {
        $adminId = auth()->id();
    
        $summary = [
            // Statistik kampanye dan donasi bersifat global.
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
    
            // Statistik penyaluran berdasarkan Admin pembuat.
            'distributionSchedules' => DB::table('distributions')
                ->where('created_by', $adminId)
                ->where('status', 'planned')
                ->where('is_simulated', false)
                ->count(),
    
            'pendingReports' => DB::table('distributions')
                ->where('created_by', $adminId)
                ->where('report_status', 'pending')
                ->where('is_simulated', false)
                ->count(),
    
            // Pengeluaran berdasarkan Admin pengaju.
            'pendingExpenses' => DB::table('expenses')
                ->where('submitted_by', $adminId)
                ->where('approval_status', 'pending')
                ->where('is_simulated', false)
                ->count(),
        ];
    
        // Aktivitas hanya milik Admin yang sedang login.
        $recentActivities = DB::table('audit_logs')
            ->leftJoin('users', 'audit_logs.user_id', '=', 'users.id')
            ->where('audit_logs.user_id', $adminId)
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

            Route::post('/{id}/ajukan-persetujuan', [
                AdminCampaignController::class,
                'submitForApproval'
            ])->name('submit-approval');
    });

    Route::middleware('role:admin')
    ->prefix('admin/target-penerima')
    ->name('admin.beneficiaries.')
    ->group(function () {
        Route::get('/', [BeneficiaryTargetController::class, 'index'])
            ->name('index');

        Route::post('/', [BeneficiaryTargetController::class, 'store'])
            ->name('store');

        Route::put('/{id}', [BeneficiaryTargetController::class, 'update'])
            ->name('update');

        Route::patch('/{id}/status', [BeneficiaryTargetController::class, 'toggleStatus'])
            ->name('status');
    });
    Route::middleware('role:admin')
    ->prefix('admin/transaksi')
    ->name('admin.transactions.')
    ->group(function () {
        Route::get('/', [AdminTransactionController::class, 'index'])
            ->name('index');

        Route::get('/{id}', [AdminTransactionController::class, 'show'])
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

        // Pencatatan pembayaran pengeluaran oleh Admin
        Route::post('/admin/pengeluaran/{id}/bayar', [
            \App\Http\Controllers\Admin\ExpenseController::class,
            'recordPayment'
        ])->middleware('role:admin')->name('admin.expenses.payment');

        // Melihat bukti pembayaran pengeluaran
        Route::get('/admin/pengeluaran/{id}/bukti-pembayaran', [
            \App\Http\Controllers\Admin\ExpenseController::class,
            'paymentProof'
        ])->middleware('role:admin')->name('admin.expenses.payment-proof');

        // Penyaluran dana oleh Admin
        Route::middleware('role:admin')
        ->prefix('admin/penyaluran')
        ->name('admin.distributions.')
        ->group(function () {

            Route::get('/', [AdminDistributionController::class, 'index'])
                ->name('index');

            Route::get('/tambah', [AdminDistributionController::class, 'create'])
                ->name('create');
            
            Route::post('/', [AdminDistributionController::class, 'store'])
                ->name('store');
            
            Route::post('/{id}/ajukan-anggaran', [AdminDistributionController::class, 'submitBudget'])
                ->name('submit-budget');
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

        // Dokumentasi kegiatan Admin
        Route::middleware('role:admin')
            ->get('/admin/dokumentasi', [
                DocumentationController::class,
                'index'
            ])
            ->name('admin.documentation.index');

        // Laporan kegiatan Admin
        Route::middleware('role:admin')
            ->get('/admin/laporan-kegiatan', [
                \App\Http\Controllers\Admin\ReportController::class,
                'index'
            ])
            ->name('admin.reports.index');
            

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
    // Persetujuan dan pengelolaan publikasi program
    Route::post('/program/{id}/setujui', [
        CampaignManagementController::class,
        'approve'
    ])->name('campaigns.approve');

    Route::post('/program/{id}/tolak', [
        CampaignManagementController::class,
        'reject'
    ])->name('campaigns.reject');

    Route::post('/program/{id}/nonaktifkan', [
        CampaignManagementController::class,
        'deactivate'
    ])->name('campaigns.deactivate');
        
    Route::delete('/program/{id}', [CampaignManagementController::class, 'destroy'])
        ->name('campaigns.destroy');

    Route::get('/keuangan', [FinanceController::class, 'index'])
        ->name('finance.index');

    Route::get('/biaya-payment-gateway', [GatewayFeeController::class, 'index'])
        ->name('gateway-fees.index');

    Route::get('/alokasi-dana', [AllocationController::class, 'index'])
        ->name('allocations.index');
  
    Route::get('/transaksi', [TransactionController::class, 'index'])
        ->name('transactions.index');
       
    Route::get('/transaksi/{id}', [TransactionController::class, 'show'])
        ->name('transactions.show');

    Route::get('/transaksi/{id}/bukti', [TransactionController::class, 'proof'])
        ->name('transactions.proof');

    Route::post('/transaksi/{id}/setujui-bukti', [ TransactionController::class,'approveProof'
        ])->name('transactions.approve-proof');
        
    Route::post('/transaksi/{id}/tolak-bukti', [ TransactionController::class, 'rejectProof'
        ])->name('transactions.reject-proof');

        // Rekonsiliasi transaksi
Route::get('/rekonsiliasi', [
    \App\Http\Controllers\Superadmin\ReconciliationController::class,
    'index'
])->name('reconciliation.index');

    Route::get('/penyaluran', [DistributionController::class, 'index'])
        ->name('distributions.index');

    Route::get('/penyaluran/tambah', [DistributionController::class, 'create'])
        ->name('distributions.create');

    Route::post('/penyaluran', [DistributionController::class, 'store'])
        ->name('distributions.store');

    Route::get('/penyaluran/{id}', [DistributionController::class, 'show'])
        ->name('distributions.show');

    Route::post('/penyaluran/{id}/setujui-anggaran', [
        DistributionController::class,
        'approveBudget'
    ])->name('distributions.approve-budget');
    
    Route::post('/penyaluran/{id}/tolak-anggaran', [
        DistributionController::class,
        'rejectBudget'
    ])->name('distributions.reject-budget');
    
    Route::post('/penyaluran/{id}/minta-revisi-anggaran', [
        DistributionController::class,
        'requestBudgetRevision'
    ])->name('distributions.request-budget-revision');
        
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

        Route::get('/pengeluaran/{id}/bukti-pembayaran', [
            \App\Http\Controllers\Superadmin\ExpenseApprovalController::class,
            'paymentProof'
        ])->name('expenses.payment-proof');

    Route::get('/audit-log', [AuditLogController::class, 'index'])
        ->name('audit.index');

    Route::get('/laporan', [ReportController::class, 'index'])
        ->name('reports.index');

    Route::get('/laporan/pdf', [ReportController::class, 'exportPdf'])
        ->name('reports.pdf');

    Route::get('/laporan/excel', [ReportController::class, 'exportExcel'])
        ->name('reports.excel');

    // Pengelolaan rekening donasi
    Route::get('/rekening-donasi', [
        \App\Http\Controllers\Superadmin\DonationAccountController::class,
        'index'
    ])->name('donation-accounts.index');

    Route::get('/rekening-donasi/tambah', [
        \App\Http\Controllers\Superadmin\DonationAccountController::class,
        'create'
    ])->name('donation-accounts.create');

    Route::post('/rekening-donasi', [
        \App\Http\Controllers\Superadmin\DonationAccountController::class,
        'store'
    ])->name('donation-accounts.store');

    Route::get('/rekening-donasi/{id}/edit', [
        \App\Http\Controllers\Superadmin\DonationAccountController::class,
        'edit'
    ])->name('donation-accounts.edit');

    Route::put('/rekening-donasi/{id}', [
        \App\Http\Controllers\Superadmin\DonationAccountController::class,
        'update'
    ])->name('donation-accounts.update');

    Route::patch('/rekening-donasi/{id}/status', [
        \App\Http\Controllers\Superadmin\DonationAccountController::class,
        'toggleStatus'
    ])->name('donation-accounts.status');

    Route::delete('/rekening-donasi/{id}', [
        \App\Http\Controllers\Superadmin\DonationAccountController::class,
        'destroy'
    ])->name('donation-accounts.destroy');

    Route::get('/pengaturan', [SettingsController::class, 'index'])
        ->name('settings.index');
    
    Route::put('/pengaturan', [SettingsController::class, 'update'])
        ->name('settings.update');
        
    });

});