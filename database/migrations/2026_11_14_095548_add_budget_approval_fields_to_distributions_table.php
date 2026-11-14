
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('distributions', function (Blueprint $table) {
            $table->unsignedBigInteger('requested_budget')
                ->default(0)
                ->after('planned_quantity');

            $table->unsignedBigInteger('approved_budget')
                ->nullable()
                ->after('requested_budget');

            $table->string('budget_status', 20)
                ->default('draft')
                ->after('approved_budget');

            $table->char('budget_reviewed_by', 36)
                ->nullable()
                ->after('budget_status');

            $table->timestamp('budget_reviewed_at')
                ->nullable()
                ->after('budget_reviewed_by');

            $table->text('budget_revision_note')
                ->nullable()
                ->after('budget_reviewed_at');

            $table->foreign('budget_reviewed_by')
                ->references('id')
                ->on('users')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('distributions', function (Blueprint $table) {
            $table->dropForeign(['budget_reviewed_by']);

            $table->dropColumn([
                'requested_budget',
                'approved_budget',
                'budget_status',
                'budget_reviewed_by',
                'budget_reviewed_at',
                'budget_revision_note',
            ]);
        });
    }
};
