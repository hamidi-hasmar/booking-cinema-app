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
        Schema::create('bookings', function (Blueprint $table): void {
            $table->id();
            $table->string('reference')->unique();
            $table->foreignId('showtime_id')->constrained()->cascadeOnDelete();
            $table->string('ticket_type');
            $table->string('location');
            $table->string('cinema_hall');
            $table->date('show_date');
            $table->string('start_time', 10);
            $table->json('seats');
            $table->json('concessions')->nullable();
            $table->unsignedInteger('ticket_total_cents');
            $table->unsignedInteger('concession_total_cents')->default(0);
            $table->unsignedInteger('service_charge_cents')->default(50);
            $table->unsignedInteger('grand_total_cents');
            $table->string('payment_method');
            $table->string('card_last_four', 4)->nullable();
            $table->string('status')->default('paid');
            $table->timestamps();

            $table->index(['showtime_id', 'show_date']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
