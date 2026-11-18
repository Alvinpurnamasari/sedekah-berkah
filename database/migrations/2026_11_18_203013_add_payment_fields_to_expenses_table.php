
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->string('payment_status', 20)
                ->default('unpaid')
                ->after('approval_status');

            $table->timestamp('paid_at')
                ->nullable()
                ->after('payment_status');

            $table->foreignUuid('paid_by')
                ->nullable()
                ->after('paid_at')
                ->constrained('users')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->dropForeign(['paid_by']);
            $table->dropColumn([
                'payment_status',
                'paid_at',
                'paid_by',
            ]);
        });
    }
};
