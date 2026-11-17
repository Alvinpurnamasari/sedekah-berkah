
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('donations', function (Blueprint $table) {
            $table->foreignUuid('donation_account_id')
                ->nullable()
                ->constrained('donation_accounts')
                ->nullOnDelete();

            // Snapshot rekening saat donasi dibuat.
            $table->string('bank_name')->nullable();
            $table->string('bank_account_number', 50)->nullable();
            $table->string('bank_account_holder', 150)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('donations', function (Blueprint $table) {
            $table->dropForeign(['donation_account_id']);
            $table->dropColumn([
                'donation_account_id',
                'bank_name',
                'bank_account_number',
                'bank_account_holder',
            ]);
        });
    }
};
