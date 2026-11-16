<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();

            $table->string('setting_group', 100)->default('general');
            $table->string('setting_key', 150)->unique();
            $table->longText('setting_value')->nullable();

            $table->timestamps();

            $table->index('setting_group');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};