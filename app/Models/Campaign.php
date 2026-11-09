<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Campaign extends Model
{
    use HasUuids;

    protected $fillable = [
        'category_id',
        'title',
        'slug',
        'description',
        'target_amount',
        'target_beneficiaries',
        'start_date',
        'end_date',
        'location',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'target_amount' => 'integer',
            'target_beneficiaries' => 'integer',
            'start_date' => 'date',
            'end_date' => 'date',
        ];
    }

    public function beneficiaryTargets(): BelongsToMany
    {
        return $this->belongsToMany(
            BeneficiaryTarget::class,
            'campaign_beneficiary_target',
            'campaign_id',
            'beneficiary_target_id'
        )->withTimestamps();
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(
            CampaignCategory::class,
            'category_id'
        );
    }
    public function donations(): HasMany
{
    return $this->hasMany(Donation::class, 'campaign_id');
}
}
