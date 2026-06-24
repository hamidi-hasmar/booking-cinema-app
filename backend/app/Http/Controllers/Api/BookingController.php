<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\SeatLock;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BookingController extends Controller
{
    /**
     * Store a mock paid booking record after the card form is submitted.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'showtimeId' => ['required', 'integer', 'exists:showtimes,id'],
            'ticketType' => ['required', 'string', 'max:100'],
            'location' => ['required', 'string', 'max:255'],
            'cinemaHall' => ['required', 'string', 'max:255'],
            'showDate' => ['required', 'date'],
            'startTime' => ['required', 'string', 'max:10'],
            'seats' => ['required', 'array', 'min:1'],
            'seats.*' => ['required', 'string', 'max:5'],
            'concessions' => ['nullable', 'array'],
            'ticketTotal' => ['required', 'integer', 'min:0'],
            'concessionTotal' => ['required', 'integer', 'min:0'],
            'grandTotal' => ['required', 'integer', 'min:0'],
            'paymentMethod' => ['required', 'string', 'max:50'],
            'cardNumber' => ['nullable', 'string', 'max:30'],
        ]);

        $cardNumber = preg_replace('/\D+/', '', (string) ($validated['cardNumber'] ?? ''));
        $serviceCharge = max(
            0,
            $validated['grandTotal'] - $validated['ticketTotal'] - $validated['concessionTotal'],
        );

        $booking = Booking::query()->create([
            'reference' => 'CB'.now()->format('ymd').strtoupper(Str::random(6)),
            'showtime_id' => $validated['showtimeId'],
            'ticket_type' => $validated['ticketType'],
            'location' => $validated['location'],
            'cinema_hall' => $validated['cinemaHall'],
            'show_date' => $validated['showDate'],
            'start_time' => $validated['startTime'],
            'seats' => $validated['seats'],
            'concessions' => $validated['concessions'] ?? [],
            'ticket_total_cents' => $validated['ticketTotal'],
            'concession_total_cents' => $validated['concessionTotal'],
            'service_charge_cents' => $serviceCharge,
            'grand_total_cents' => $validated['grandTotal'],
            'payment_method' => $validated['paymentMethod'],
            'card_last_four' => $cardNumber ? substr($cardNumber, -4) : null,
            'status' => 'paid',
        ]);

        SeatLock::query()
            ->where('showtime_id', $booking->showtime_id)
            ->whereIn('seat_number', $booking->seats)
            ->delete();

        return response()->json([
            'data' => [
                'id' => $booking->id,
                'reference' => $booking->reference,
                'showtimeId' => $booking->showtime_id,
                'ticketType' => $booking->ticket_type,
                'location' => $booking->location,
                'cinemaHall' => $booking->cinema_hall,
                'showDate' => $booking->show_date->toDateString(),
                'startTime' => $booking->start_time,
                'seats' => implode(', ', $booking->seats),
                'concessions' => collect($booking->concessions)
                    ->map(fn (array $item) => "{$item['name']} [x{$item['quantity']}]")
                    ->implode(', '),
                'ticketTotal' => $booking->ticket_total_cents,
                'concessionTotal' => $booking->concession_total_cents,
                'grandTotal' => $booking->grand_total_cents,
                'paymentMethod' => $booking->payment_method,
                'cardLastFour' => $booking->card_last_four,
                'status' => $booking->status,
                'createdAt' => $booking->created_at->toISOString(),
            ],
        ], 201);
    }
}
