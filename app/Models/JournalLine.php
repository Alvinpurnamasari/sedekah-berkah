<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Validation\ValidationException;

class JournalLine extends Model
{
    use HasUuids;

    protected $fillable = [
        'journal_entry_id',
        'ledger_account_id',
        'description',
        'debit',
        'credit',
    ];

    protected function casts(): array
    {
        return [
            'debit' => 'integer',
            'credit' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        static::saving(function (JournalLine $line) {
            if (!$line->journal_entry_id) {
                return;
            }

            $journal = JournalEntry::find($line->journal_entry_id);

            if (!$journal || $journal->status !== 'draft') {
                throw ValidationException::withMessages([
                    'journal_line' => 'Baris jurnal hanya dapat ditambahkan atau diubah selama jurnal berstatus draft.',
                ]);
            }
        });

        static::deleting(function (JournalLine $line) {
            $journal = JournalEntry::find($line->journal_entry_id);

            if (!$journal || $journal->status !== 'draft') {
                throw ValidationException::withMessages([
                    'journal_line' => 'Baris jurnal dari jurnal yang sudah diposting tidak boleh dihapus.',
                ]);
            }
        });
    }

    public function journalEntry(): BelongsTo
    {
        return $this->belongsTo(JournalEntry::class);
    }

    public function ledgerAccount(): BelongsTo
    {
        return $this->belongsTo(LedgerAccount::class);
    }
}
