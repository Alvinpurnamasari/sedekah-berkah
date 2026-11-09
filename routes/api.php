<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DonationController;
use App\Http\Controllers\PaymentWebhookController;
use App\Http\Controllers\CampaignController;
Route::get('/v1/campaigns',[CampaignController::class,'index']);
Route::get('/v1/campaigns/{slug}', [CampaignController::class, 'apiShow']);
Route::post('/v1/donations',[DonationController::class,'store'])->middleware('throttle:10,1');
Route::get('/v1/donations/{code}',[DonationController::class,'status']);
Route::post('/v1/payments/midtrans/webhook',[PaymentWebhookController::class,'handle']);
