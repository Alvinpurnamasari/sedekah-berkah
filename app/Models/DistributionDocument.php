<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DistributionDocument extends Model
{
    protected $fillable = [
        'distribution_id',
        'file_path',
        'caption',
        'document_date',
        'uploaded_by',
    ];

    protected $casts = [
        'document_date' => 'date',
    ];

    public function distribution()
    {
        return $this->belongsTo(Distribution::class);
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}