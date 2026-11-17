<?php

namespace App\Http\Controllers;

use App\Models\Donation;
use App\Models\Campaign;
use App\Models\DonationAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class DonationController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'campaign_id' => 'required|exists:campaigns,id',
            'beneficiary_target_id' => 'nullable|integer|exists:beneficiary_targets,id',

            'donor.name' => 'required|string|max:120',
            'donor.email' => 'nullable|email|max:190',
            'donor.phone' => 'nullable|string|max:30',

            'donation_amount' => 'required|integer|min:5000|max:100000000',
            'operational_support' => 'nullable|integer|min:0|max:10000000',

            'is_anonymous' => 'required|boolean',
            'message' => 'nullable|string|max:500',

            'payment_method' => 'required|in:bank_transfer',
            'donation_account_id' => 'required|uuid|exists:donation_accounts,id',
        ]);

        // Pastikan kampanye tersedia.
        $campaign = Campaign::whereKey($data['campaign_id'])
            ->whereIn('status', ['published', 'active'])
            ->firstOrFail();

        // Pastikan target penerima terhubung dengan kampanye.
        if (!empty($data['beneficiary_target_id'])) {
            $targetExists = $campaign->beneficiaryTargets()
                ->where(
                    'beneficiary_targets.id',
                    $data['beneficiary_target_id']
                )
                ->where('beneficiary_targets.is_active', true)
                ->exists();

            if (!$targetExists) {
                throw ValidationException::withMessages([
                    'beneficiary_target_id' =>
                        'Target penerima tidak tersedia atau tidak terhubung dengan kampanye ini.',
                ]);
            }
        }

        $donation = DB::transaction(function () use ($data, $campaign, $request) {

            // Pastikan rekening yang dipilih masih aktif.
            $account = DonationAccount::whereKey(
                $data['donation_account_id']
            )
                ->where('is_active', true)
                ->lockForUpdate()
                ->first();

            if (!$account) {
                throw ValidationException::withMessages([
                    'donation_account_id' =>
                        'Rekening yang dipilih sudah tidak tersedia. Silakan pilih rekening lain.',
                ]);
            }

            // Buat kode donasi unik.
            $donationCode = 'SB-' . now()->format('Ymd') . '-' .
                strtoupper(Str::random(8));

            // Hitung total pembayaran.
            $totalAmount = $data['donation_amount'] +
                ($data['operational_support'] ?? 0);

            // Simpan data donasi beserta snapshot rekening.
            $donation = Donation::create([
                'donation_code' => $donationCode,
                'campaign_id' => $campaign->id,
                'beneficiary_target_id' =>
                    $data['beneficiary_target_id'] ?? null,

                'donor_name' => $data['donor']['name'],
                'donor_email' => $data['donor']['email'] ?? null,
                'donor_phone' => $data['donor']['phone'] ?? null,

                'donation_amount' => $data['donation_amount'],
                'operational_support' =>
                    $data['operational_support'] ?? 0,

                'is_anonymous' => $data['is_anonymous'],
                'message' => $data['message'] ?? null,

                'payment_status' => 'pending',
                'user_id' => $request->user()?->id,

                // Rekening tujuan transfer.
                'donation_account_id' => $account->id,
                'bank_name' => $account->bank_name,
                'bank_account_number' => $account->account_number,
                'bank_account_holder' => $account->account_holder,
            ]);

            // Catat transaksi transfer bank manual.
            DB::table('payment_transactions')->insert([
                'id' => (string) Str::uuid(),
                'donation_id' => $donation->id,
                'provider' => 'manual_bank_transfer',
                'order_id' => $donationCode,
                'gross_amount' => $totalAmount,
                'gateway_fee' => 0,
                'status' => 'pending',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return $donation;
        });

        // Kembalikan informasi rekening untuk halaman sukses.
        return response()->json([
            'success' => true,
            'data' => [
                'donation_code' => $donation->donation_code,

                'total_amount' =>
                    $donation->donation_amount +
                    $donation->operational_support,

                'payment_status' => 'pending',
                'payment_method' => 'bank_transfer',

                'bank_account' => [
                    'bank_name' => $donation->bank_name,
                    'account_number' =>
                        $donation->bank_account_number,
                    'account_holder' =>
                        $donation->bank_account_holder,
                ],
            ],
        ], 201);
    }

    public function status(string $code)
    {
        $donation = Donation::where('donation_code', $code)
            ->firstOrFail();

        return response()->json([
            'donation_code' => $donation->donation_code,
            'payment_status' => $donation->payment_status,
        ]);
    }
}
