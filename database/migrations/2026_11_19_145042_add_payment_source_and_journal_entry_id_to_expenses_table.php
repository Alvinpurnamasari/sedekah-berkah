
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            // Sumber pembayaran: cash atau bank
            $table->string('payment_source', 20)
                ->nullable()
                ->after('payment_status');

            // Relasi ke jurnal, satu pengeluaran maksimal satu jurnal
            $table->foreignUuid('journal_entry_id')
                ->nullable()
                ->unique()
                ->constrained('journal_entries')
                ->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->dropForeign(['journal_entry_id']);
            $table->dropUnique(['journal_entry_id']);

            $table->dropColumn([
                'payment_source',
                'journal_entry_id',
            ]);
        });
    }
};
