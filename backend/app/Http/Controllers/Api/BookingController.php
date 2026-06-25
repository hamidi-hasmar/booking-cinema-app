<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\BookingResource;
use App\Services\BookingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    /**
     * Store a mock paid booking record after the card form is submitted.
     */
    public function store(Request $request, BookingService $bookingService): JsonResponse
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

        $booking = $bookingService->createPaidBooking($validated);

        return (new BookingResource($booking))
            ->response()
            ->setStatusCode(201);
    }
}
