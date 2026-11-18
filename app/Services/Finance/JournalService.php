<?php

namespace App\Services\Finance;

use App\Models\JournalEntry;
use App\Models\LedgerAccount;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Validator;
use App\Models\AuditLog;

class JournalService
{
    /**
     * Membuat jurnal baru dengan status draft.
     */
    public function createDraft(array $data, ?string $userId = null): JournalEntry
    {
        $lines = $data['lines'] ?? [];

        $this->validateLines($lines);

        return DB::transaction(function () use ($data, $lines, $userId) {
            $this->validateAccounts($lines);

            $totalDebit = collect($lines)->sum('debit');
            $totalCredit = collect($lines)->sum('credit');

            if ($totalDebit !== $totalCredit) {
                throw ValidationException::withMessages([
                    'lines' => 'Total debit dan kredit harus sama.',
                ]);
            }

            $entry = JournalEntry::create([
                'journal_number' => 'SBJ-' . now()->format('YmdHis')
                    . '-' . strtoupper(Str::random(6)),
                'entry_date' => $data['entry_date'] ?? now()->toDateString(),
                'description' => $data['description'] ?? null,
                'source_type' => $data['source_type'] ?? null,
                'source_id' => $data['source_id'] ?? null,
                'status' => 'draft',
                'created_by' => $userId,
            ]);

            foreach ($lines as $line) {
                $entry->lines()->create([
                    'ledger_account_id' => $line['ledger_account_id'],
                    'description' => $line['description'] ?? null,
                    'debit' => (int) ($line['debit'] ?? 0),
                    'credit' => (int) ($line['credit'] ?? 0),
                ]);
            }

            return $entry->load('lines.ledgerAccount');
        });
    }

    /**
     * Memposting jurnal draft.
     */
    public function post(JournalEntry $entry, ?string $userId = null): JournalEntry
    {
        return DB::transaction(function () use ($entry, $userId) {
            $entry = JournalEntry::whereKey($entry->getKey())
                ->lockForUpdate()
                ->with('lines')
                ->firstOrFail();

            if ($entry->status !== 'draft') {
                throw ValidationException::withMessages([
                    'journal' => 'Hanya jurnal draft yang dapat diposting.',
                ]);
            }

            if ($entry->lines->count() < 2) {
                throw ValidationException::withMessages([
                    'journal' => 'Jurnal harus memiliki minimal dua baris.',
                ]);
            }

            $totalDebit = $entry->lines->sum('debit');
            $totalCredit = $entry->lines->sum('credit');
            $this->validateAccounts(
                $entry->lines->map(fn ($line) => [
                    'ledger_account_id' => $line->ledger_account_id,
                ])->all()
            );

            if ($totalDebit <= 0 || $totalDebit !== $totalCredit) {
                throw ValidationException::withMessages([
                    'journal' => 'Jurnal tidak seimbang atau nominalnya tidak valid.',
                ]);
            }

            $entry->updateQuietly([
                'status' => 'posted',
                'posted_at' => now(),
                'posted_by' => $userId,
            ]);

            return $entry->fresh('lines.ledgerAccount');
        });
    }


/**
 * Membalik jurnal yang sudah diposting.
 */
public function reverse(
    JournalEntry $entry,
    ?string $userId = null,
    ?string $reason = null
): JournalEntry {
    if (!$reason || trim($reason) === '') {
        throw ValidationException::withMessages([
            'reason' => 'Alasan pembalikan jurnal wajib diisi.',
        ]);
    }
    return DB::transaction(function () use ($entry, $userId, $reason) {

        // Kunci jurnal asal agar tidak dibalik bersamaan.
        $original = JournalEntry::whereKey($entry->getKey())
            ->lockForUpdate()
            ->with('lines')
            ->firstOrFail();

        if ($original->status !== 'posted') {
            throw ValidationException::withMessages([
                'journal' => 'Hanya jurnal posted yang dapat dibalik.',
            ]);
        }

        if ($original->reversed_by !== null) {
            throw ValidationException::withMessages([
                'journal' => 'Jurnal ini sudah pernah dibalik.',
            ]);
        }

        if ($original->lines->count() < 2) {
            throw ValidationException::withMessages([
                'journal' => 'Jurnal asal tidak memiliki rincian yang valid.',
            ]);
        }

        $totalDebit = $original->lines->sum('debit');
        $totalCredit = $original->lines->sum('credit');

        if ($totalDebit <= 0 || $totalDebit !== $totalCredit) {
            throw ValidationException::withMessages([
                'journal' => 'Jurnal asal tidak seimbang dan tidak dapat dibalik.',
            ]);
        }
        
        $this->validateAccounts(
            $original->lines->map(fn ($line) => [
                'ledger_account_id' => $line->ledger_account_id,
            ])->all()
        );

        $reversal = JournalEntry::create([
            'journal_number' => 'SBJ-' . now()->format('YmdHis')
                . '-' . strtoupper(Str::random(6)),
            'entry_date' => now()->toDateString(),
            'description' => 'Pembalikan jurnal ' . $original->journal_number
                . '. Alasan: ' . trim($reason),
            'source_type' => 'journal_reversal',
            'source_id' => $original->id,
            'status' => 'draft',
            'created_by' => $userId,
        ]);

        // Debit menjadi kredit, kredit menjadi debit.
        foreach ($original->lines as $line) {
            $reversal->lines()->create([
                'ledger_account_id' => $line->ledger_account_id,
                'description' => 'Pembalikan: ' . ($line->description ?? 'Jurnal asal'),
                'debit' => $line->credit,
                'credit' => $line->debit,
            ]);
        }

        // Posting jurnal pembalik melalui fungsi yang sudah ada.
        $reversal = $this->post($reversal, $userId);

        // Hubungkan jurnal asal dengan jurnal pembalik.
        $original->reversed_by = $reversal->id;
        $original->saveQuietly();

        // Catat aktivitas pembalikan.
        AuditLog::create([
            'user_id' => $userId,
            'action' => 'journal.reversed',
            'entity_type' => JournalEntry::class,
            'entity_id' => $original->id,
            'metadata' => [
                'original_journal_number' => $original->journal_number,
                'reversal_journal_id' => $reversal->id,
                'reversal_journal_number' => $reversal->journal_number,
                'reason' => $reason,
            ],
            'ip_address' => request()->ip(),
        ]);

        return $reversal->fresh('lines.ledgerAccount');
    });
}


    /**
     * Memvalidasi struktur dan nominal setiap baris jurnal.
     */
    
private function validateLines(array $lines): void
{
    $validator = Validator::make(
        ['lines' => $lines],
        [
            'lines' => ['required', 'array', 'min:2'],
            'lines.*.ledger_account_id' => [
                'required',
                'uuid',
                'exists:ledger_accounts,id',
            ],
            'lines.*.debit' => [
                'required',
                'integer',
                'min:0',
            ],
            'lines.*.credit' => [
                'required',
                'integer',
                'min:0',
            ],
            'lines.*.description' => [
                'nullable',
                'string',
                'max:255',
            ],
        ]
    );

    $validator->validate();

    foreach ($lines as $index => $line) {
        $debit = (int) $line['debit'];
        $credit = (int) $line['credit'];

        if (
            ($debit > 0 && $credit > 0) ||
            ($debit === 0 && $credit === 0)
        ) {
            throw ValidationException::withMessages([
                "lines.$index" => 'Setiap baris harus memiliki debit atau kredit, bukan keduanya.',
            ]);
        }
    }
}


    /**
     * Memastikan akun tersedia dan aktif.
     */
    private function validateAccounts(array $lines): void
    {
        $accountIds = collect($lines)
            ->pluck('ledger_account_id')
            ->unique()
            ->values();

        $activeCount = LedgerAccount::whereIn('id', $accountIds)
            ->where('is_active', true)
            ->count();

        if ($activeCount !== $accountIds->count()) {
            throw ValidationException::withMessages([
                'lines' => 'Ada akun yang tidak ditemukan atau sudah tidak aktif.',
            ]);
        }
    }
}
