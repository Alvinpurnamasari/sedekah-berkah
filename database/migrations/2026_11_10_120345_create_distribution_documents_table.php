<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('distribution_documents', function (Blueprint $table) {
            $table->id();

            $table->foreignUuid('distribution_id')
                ->constrained('distributions')
                ->cascadeOnDelete();

            $table->string('file_path');
            $table->string('caption')->nullable();
            $table->date('document_date')->nullable();

            $table->foreignUuid('uploaded_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamps();

            $table->index(['distribution_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('distribution_documents');
    }
};