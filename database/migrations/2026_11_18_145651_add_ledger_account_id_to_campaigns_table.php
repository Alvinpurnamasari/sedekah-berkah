<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('campaigns', function (Blueprint $table) {
            $table->foreignUuid('ledger_account_id')
                ->nullable()
                ->after('category_id')
                ->constrained('ledger_accounts')
                ->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('campaigns', function (Blueprint $table) {
            $table->dropForeign(['ledger_account_id']);
            $table->dropColumn('ledger_account_id');
        });
    }
};