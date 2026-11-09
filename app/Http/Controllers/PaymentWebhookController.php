<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Donation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentWebhookController extends Controller
{
    public function handle(Request $request)
    {
        $payload = $request->all();

        // Pastikan data penting dari Midtrans tersedia.
        if (
            !isset(
                $payload['order_id'],
                $payload['transaction_status'],
                $payload['status_code'],
                $payload['gross_amount'],
                $payload['signature_key']
            )
        ) {
            return response()->json([
                'message' => 'Invalid payload',
            ], 422);
        }

        // Verifikasi tanda tangan Midtrans.
        $serverKey = config('services.midtrans.server_key');

        if (!$serverKey) {
            return response()->json([
                'message' => 'Midtrans server key belum dikonfigurasi.',
            ], 500);
        }

        $expectedSignature = hash(
            'sha512',
            $payload['order_id']
                . $payload['status_code']
                . $payload['gross_amount']
                . $serverKey
        );

        if (!hash_equals($expectedSignature, $payload['signature_key'])) {
            return response()->json([
                'message' => 'Invalid signature',
            ], 403);
        }

        // Terjemahkan status Midtrans menjadi status internal.
        $providerStatus = $payload['transaction_status'];

        $newStatus = match ($providerStatus) {
            'settlement' => 'paid',
            'capture' => ($payload['fraud_status'] ?? '') === 'accept'
                ? 'paid'
                : 'pending',
            'pending' => 'pending',
            'expire' => 'expired',
            'deny', 'cancel' => 'failed',
            default => null,
        };

        if ($newStatus === null) {
            return response()->json([
                'message' => 'Status transaksi tidak dikenali.',
            ], 200);
        }

        DB::transaction(function () use ($payload, $providerStatus, $newStatus) {

            // Kunci donasi agar webhook bersamaan tidak mengubah data secara bersamaan.
            $donation = Donation::where(
                'donation_code',
                $payload['order_id']
            )->lockForUpdate()->first();

            if (!$donation) {
                abort(404, 'Donation not found.');
            }

            $oldStatus = $donation->payment_status;

            // Simpan perubahan hanya jika status memang berbeda.
            if ($oldStatus !== $newStatus) {
                $donation->update([
                    'payment_status' => $newStatus,
                ]);

                DB::table('payment_status_histories')->insert([
                    'donation_id' => $donation->id,
                    'old_status' => $oldStatus,
                    'new_status' => $newStatus,
                    'provider_status' => $providerStatus,
                    'transaction_id' => $payload['transaction_id'] ?? null,
                    'payment_method' => $payload['payment_type'] ?? null,
                    'metadata' => json_encode([
                        'order_id' => $payload['order_id'],
                        'status_code' => $payload['status_code'],
                        'gross_amount' => $payload['gross_amount'],
                        'fraud_status' => $payload['fraud_status'] ?? null,
                    ]),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // Perbarui data transaksi gateway jika catatannya tersedia.
            DB::table('payment_transactions')
                ->where('order_id', $payload['order_id'])
                ->update([
                    'transaction_id' => $payload['transaction_id'] ?? null,
                    'payment_method' => $payload['payment_type'] ?? null,
                    'status' => $newStatus,
                    'raw_response' => json_encode($payload),
                    'updated_at' => now(),
                ]);
        });

        return response()->json([
            'message' => 'OK',
        ]);
    }
}