
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('donation_accounts', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->string('bank_name', 100);
            $table->string('account_number', 50);
            $table->string('account_holder', 150);

            // Keterangan yang boleh ditampilkan kepada publik
            $table->text('description')->nullable();

            $table->string('logo')->nullable();
            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('donation_accounts');
    }
};
