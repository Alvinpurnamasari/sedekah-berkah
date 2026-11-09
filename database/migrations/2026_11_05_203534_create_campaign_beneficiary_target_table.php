
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('campaign_beneficiary_target', function (Blueprint $table) {
            $table->id();

            $table->uuid('campaign_id');
            $table->unsignedBigInteger('beneficiary_target_id');

            $table->timestamps();

            $table->foreign('campaign_id')
                ->references('id')
                ->on('campaigns')
                ->cascadeOnDelete();

            $table->foreign('beneficiary_target_id')
                ->references('id')
                ->on('beneficiary_targets')
                ->cascadeOnDelete();

            $table->unique(
                ['campaign_id', 'beneficiary_target_id'],
                'campaign_beneficiary_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('campaign_beneficiary_target');
    }
};
