<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class DonationAccount extends Model
{
    use HasUuids;

    protected $table = 'donation_accounts';

    protected $fillable = [
        'bank_name',
        'account_number',
        'account_holder',
        'description',
        'logo',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }
}
