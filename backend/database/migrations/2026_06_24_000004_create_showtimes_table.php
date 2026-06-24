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
        Schema::create('showtimes', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('movie_id')->constrained()->cascadeOnDelete();
            $table->foreignId('cinema_hall_id')->constrained()->cascadeOnDelete();
            $table->dateTime('starts_at');
            $table->string('ticket_type')->default('Classic');
            $table->unsignedInteger('price_cents');
            $table->timestamps();

            $table->unique(['movie_id', 'cinema_hall_id', 'starts_at']);
            $table->index(['movie_id', 'starts_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('showtimes');
    }
};
