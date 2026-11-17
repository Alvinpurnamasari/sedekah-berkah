
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ledger_accounts', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->string('code', 30)->unique();
            $table->string('name', 150);

            // asset, liability, equity, revenue, expense
            $table->string('account_type', 30);

            // program, operational, sponsor, platform
            $table->string('fund_group', 30)->nullable();

            // debit atau credit
            $table->string('normal_balance', 10);

            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ledger_accounts');
    }
};
