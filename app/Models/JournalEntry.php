<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Validation\ValidationException;

class JournalEntry extends Model
{
    use HasUuids;

    protected $fillable = [
        'journal_number',
        'entry_date',
        'description',
        'source_type',
        'source_id',
        'status',
        'posted_at',
        'reversed_by',
        'created_by',
        'posted_by',
    ];

    protected function casts(): array
    {
        return [
            'entry_date' => 'date',
            'posted_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::updating(function (JournalEntry $journal) {
            if ($journal->getOriginal('status') !== 'draft') {
                throw ValidationException::withMessages([
                    'journal' => 'Jurnal yang sudah diposting tidak boleh diubah.',
                ]);
            }

            $allowedChanges = [
                'description',
                'entry_date',
            ];

            $changedFields = array_keys($journal->getDirty());

            if (array_diff($changedFields, $allowedChanges)) {
                throw ValidationException::withMessages([
                    'journal' => 'Perubahan status dan metadata sistem hanya boleh melalui JournalService.',
                ]);
            }
        });

        static::deleting(function (JournalEntry $journal) {
            if ($journal->status !== 'draft') {
                throw ValidationException::withMessages([
                    'journal' => 'Jurnal yang sudah diposting tidak boleh dihapus.',
                ]);
            }

            if ($journal->lines()->exists()) {
                $journal->lines()->delete();
            }
        });
    }

    public function lines(): HasMany
    {
        return $this->hasMany(JournalLine::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function poster(): BelongsTo
    {
        return $this->belongsTo(User::class, 'posted_by');
    }

    public function reversal(): BelongsTo
    {
        return $this->belongsTo(self::class, 'reversed_by');
    }

    public function reversedEntries(): HasMany
    {
        return $this->hasMany(self::class, 'reversed_by');
    }
}
