
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('journal_entries', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->string('journal_number', 50)->unique();
            $table->date('entry_date');
            $table->text('description')->nullable();

            // Sumber transaksi, misalnya donation, expense, sponsor
            $table->string('source_type', 50)->nullable();
            $table->string('source_id', 100)->nullable();

            // draft, posted, reversed
            $table->string('status', 20)->default('draft');

            $table->timestamp('posted_at')->nullable();

            $table->foreignUuid('reversed_by')
            ->nullable()
            ->constrained('journal_entries')
            ->restrictOnDelete();

            $table->foreignUuid('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignUuid('posted_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamps();

            $table->index(['source_type', 'source_id']);
            $table->index(['entry_date', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('journal_entries');
    }
};
