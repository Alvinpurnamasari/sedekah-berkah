<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CampaignCategory extends Model
{
    protected $fillable = [
        'name',
        'slug',
    ];

    public function campaigns(): HasMany
    {
        return $this->hasMany(
            Campaign::class,
            'category_id'
        );
    }
}
