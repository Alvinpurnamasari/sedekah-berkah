<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Campaign extends Model
{
    
    protected $keyType = 'string';

    public $incrementing = false;
    
    protected $fillable = [
        'category_id',
        'title',
        'slug',
        'description',
        'target_amount',
        'target_beneficiaries',
        'start_date',
        'end_date',
        'status',
        'location',

        // Informasi pengajuan dan persetujuan
        'submitted_by',
        'submitted_at',
        'approved_by',
        'approved_at',
        'rejection_reason',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'submitted_at' => 'datetime',
        'approved_at' => 'datetime',
    ];

    public function donations()
    {
        return $this->hasMany(Donation::class);
    }

    public function category()
    {
        return $this->belongsTo(CampaignCategory::class, 'category_id');
    }

    public function beneficiaryTargets()
    {
        return $this->belongsToMany(
            BeneficiaryTarget::class,
            'campaign_beneficiary_target',
            'campaign_id',
            'beneficiary_target_id'
        );
    }

    public function submitter()
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
