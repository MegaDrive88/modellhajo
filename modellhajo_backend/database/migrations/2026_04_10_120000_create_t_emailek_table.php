<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('t_emailek')) {
            return;
        }

        Schema::create('t_emailek', function (Blueprint $table) {
            $table->id();
            $table->string('cimzett_email');
            $table->string('targy');
            $table->longText('tartalom_html');
            $table->timestamp('letrehozva')->nullable();
            $table->timestamp('elkuldve')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_emailek');
    }
};
