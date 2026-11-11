<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('distributions', function (Blueprint $table) {
            $table->foreignUuid('report_reviewed_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamp('report_reviewed_at')->nullable();

            $table->text('report_revision_note')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('distributions', function (Blueprint $table) {
            $table->dropForeign(['report_reviewed_by']);

            $table->dropColumn([
                'report_reviewed_by',
                'report_reviewed_at',
                'report_revision_note',
            ]);
        });
    }
};