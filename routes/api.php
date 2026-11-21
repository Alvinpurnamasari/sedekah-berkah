<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DonationController;
use App\Http\Controllers\PaymentWebhookController;
use App\Http\Controllers\CampaignController;

// ==========================================
// PUBLIC API
// ==========================================

// Daftar program donasi
Route::get('/v1/campaigns', [CampaignController::class, 'index']);

// Detail program donasi
Route::get('/v1/campaigns/{slug}', [CampaignController::class, 'apiShow']);

// Status transaksi donasi
Route::get('/v1/donations/{code}', [DonationController::class, 'status']);

// Webhook pembayaran
Route::post('/v1/payments/midtrans/webhook', [
    PaymentWebhookController::class,
    'handle'
]);