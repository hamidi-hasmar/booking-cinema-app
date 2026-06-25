<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\SeatLock;
use Illuminate\Support\Str;

class BookingService
{

    /**
     * @param array<string, mixed> $data
     */

    public function createPaidBooking(array $data): Booking
    {
        $cardNumber = preg_replace('/\D+/', '', (string) ($data['cardNumber'] ?? ''));
        $serviceCharge = max(
            0,
            $data['grandTotal'] - $data['ticketTotal'] - $data['concessionTotal'],
        );

        $booking = Booking::query()->create([
            'reference' => 'CB'.now()->format('ymd').strtoupper(Str::random(6)),
            'showtime_id' => $data['showtimeId'],
            'ticket_type' => $data['ticketType'],
            'location' => $data['location'],
            'cinema_hall' => $data['cinemaHall'],
            'show_date' => $data['showDate'],
            'start_time' => $data['startTime'],
            'seats' => $data['seats'],
            'concessions' => $data['concessions'] ?? [],
            'ticket_total_cents' => $data['ticketTotal'],
            'concession_total_cents' => $data['concessionTotal'],
            'service_charge_cents' => $serviceCharge,
            'grand_total_cents' => $data['grandTotal'],
            'payment_method' => $data['paymentMethod'],
            'card_last_four' => $cardNumber ? substr($cardNumber, -4) : null,
            'status' => 'paid',
        ]);

        SeatLock::query()
            ->where('showtime_id', $booking->showtime_id)
            ->whereIn('seat_number', $booking->seats)
            ->delete();

        return $booking;
    }

}
