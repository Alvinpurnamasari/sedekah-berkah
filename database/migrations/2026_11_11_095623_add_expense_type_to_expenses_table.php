<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Distribution extends Model
{
    use HasUuids;

    protected $fillable = [
        'campaign_id',
        'title',
        'distribution_date',
        'location',
        'planned_quantity',
        'actual_quantity',
        'total_cost',
        'status',
        'report_status',
        'created_by',
        'report_reviewed_by',
        'report_reviewed_at',
        'report_revision_note',
    ];

    protected $casts = [
        'distribution_date' => 'date',
        'report_reviewed_at' => 'datetime',
        'planned_quantity' => 'integer',
        'actual_quantity' => 'integer',
        'total_cost' => 'integer',
    ];

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class);
    }

    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(DistributionDocument::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'report_reviewed_by');
    }
}
