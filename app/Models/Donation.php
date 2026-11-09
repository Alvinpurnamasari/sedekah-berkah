<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

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
    ];

    protected $casts = [
        'is_anonymous' => 'boolean',
        'donation_amount' => 'integer',
        'operational_support' => 'integer',
    ];

    public function campaign()
    {
        return $this->belongsTo(Campaign::class);
    }
}