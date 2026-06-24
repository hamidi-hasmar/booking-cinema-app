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
        Schema::create('cinema_halls', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('cinema_location_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->unsignedSmallInteger('seat_rows')->default(8);
            $table->unsignedSmallInteger('seats_per_row')->default(8);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['cinema_location_id', 'name']);
            $table->index(['cinema_location_id', 'sort_order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cinema_halls');
    }
};
