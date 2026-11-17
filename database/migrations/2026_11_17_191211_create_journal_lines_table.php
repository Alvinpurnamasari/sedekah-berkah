
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('journal_lines', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->foreignUuid('journal_entry_id')
                ->constrained('journal_entries')
                ->restrictOnDelete();

            $table->foreignUuid('ledger_account_id')
                ->constrained('ledger_accounts')
                ->restrictOnDelete();

            $table->text('description')->nullable();

            $table->unsignedBigInteger('debit')->default(0);
            $table->unsignedBigInteger('credit')->default(0);

            $table->timestamps();

            $table->index('ledger_account_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('journal_lines');
    }
};
