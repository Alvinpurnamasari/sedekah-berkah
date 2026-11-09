<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_status_histories', function (Blueprint $table) {
            $table->id();

            $table->foreignUuid('donation_id')
                ->constrained('donations')
                ->cascadeOnDelete();

            $table->string('old_status')->nullable();
            $table->string('new_status');

            $table->string('provider_status')->nullable();
            $table->string('transaction_id')->nullable();
            $table->string('payment_method')->nullable();

            $table->json('metadata')->nullable();

            $table->timestamps();

            $table->index(['donation_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_status_histories');
    }
};