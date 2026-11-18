<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('donations', function (Blueprint $table) {
            $table->string('transfer_proof')->nullable();

            $table->timestamp('proof_uploaded_at')->nullable();

            $table->foreignUuid('verified_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamp('verified_at')->nullable();

            $table->text('verification_note')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('donations', function (Blueprint $table) {
            $table->dropForeign(['verified_by']);

            $table->dropColumn([
                'transfer_proof',
                'proof_uploaded_at',
                'verified_by',
                'verified_at',
                'verification_note',
            ]);
        });
    }
};
