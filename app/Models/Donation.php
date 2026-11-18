<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Donation extends Model
{
    use HasUuids;

    protected $fillable = [
        'donation_code',
        'user_id',
        'campaign_id',
        'beneficiary_target_id',
        'donor_name',
        'donor_email',
        'donor_phone',
        'donation_amount',
        'operational_support',
        'is_anonymous',
        'message',
        'payment_status',
        'donation_account_id',
        'bank_name',
        'bank_account_number',
        'bank_account_holder',
        'transfer_proof',
        'proof_status',
        'proof_uploaded_at',
        'verified_by',
        'verified_at',
        'verification_note',
    ];

    protected $casts = [
        'is_anonymous' => 'boolean',
        'donation_amount' => 'integer',
        'operational_support' => 'integer',
        'proof_uploaded_at' => 'datetime',
        'verified_at' => 'datetime',
    ];

    public function campaign()
    {
        return $this->belongsTo(Campaign::class);
    }
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function donationAccount(): BelongsTo
    {
        return $this->belongsTo(
            DonationAccount::class,
            'donation_account_id'
        );
    }

    public function verifier()
{
    return $this->belongsTo(User::class, 'verified_by');
}
public function paymentStatusHistories(): HasMany
{
    return $this->hasMany(PaymentStatusHistory::class)
        ->latest();
}
}