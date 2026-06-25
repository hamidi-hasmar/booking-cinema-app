<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SeatLock;
use App\Models\Showtime;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ShowtimeSeatController extends Controller
{
    private const LOCK_MINUTES = 5;

    /**
     * Return the current seat map for a showtime.
     */
    public function index(Showtime $showtime, Request $request): JsonResponse
    {
        $clientId = $request->query('clientId');

        $this->deleteExpiredLocks($showtime);

        $showtime->load('hall');

        $locks = SeatLock::query()
            ->where('showtime_id', $showtime->id)
            ->where('expires_at', '>', now())
            ->get()
            ->keyBy('seat_number');

        $bookedSeats = Booking::query()
            ->where('showtime_id', $showtime->id)
            ->where('status', 'paid')
            ->get()
            ->flatMap(fn(Booking $booking) => $booking->seats ?? [])
            ->unique()
            ->values();

        $seats = [];

        foreach (range('A', chr(ord('A') + $showtime->hall->seat_rows - 1)) as $row) {
            foreach (range(1, $showtime->hall->seats_per_row) as $number) {
                $seatNumber = $row . $number;
                $isBooked = $bookedSeats->contains($seatNumber);

                $lock = $locks->get($seatNumber);

                $seats[] = [
                    'seatNumber' => $seatNumber,
                    'row' => $row,
                    'column' => $number,
                    'status' => $isBooked ? 'booked' : ($lock ? 'locked' : 'available'),
                    'lockedByCurrentUser' => ! $isBooked && $lock && $clientId && $lock->locked_by === $clientId,
                    'lockedUntil' => $isBooked ? null : $lock?->expires_at?->toISOString(),
                ];
            }
        }

        return response()->json([
            'data' => [
                'showtimeId' => $showtime->id,
                'seatRows' => $showtime->hall->seat_rows,
                'seatsPerRow' => $showtime->hall->seats_per_row,
                'lockExpiresInSeconds' => self::LOCK_MINUTES * 60,
                'seats' => $seats,
            ],
        ]);
    }

    /**
     * Lock one seat for the current browser/device session.
     */
    public function lock(Showtime $showtime, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'seatNumber' => ['required', 'string', 'max:5'],
            'clientId' => ['required', 'string', 'max:100'],
        ]);

        $seatNumber = strtoupper($validated['seatNumber']);
        $clientId = $validated['clientId'];

        $this->assertSeatExists($showtime, $seatNumber);

        $lock = DB::transaction(function () use ($showtime, $seatNumber, $clientId) {
            $this->deleteExpiredLocks($showtime);

            $isBooked = Booking::query()
                ->where('showtime_id', $showtime->id)
                ->where('status', 'paid')
                ->get()
                ->contains(fn(Booking $booking) => in_array($seatNumber, $booking->seats ?? [], true));

            if ($isBooked) {
                abort(409, 'Seat is already booked');
            }

            $existingLock = SeatLock::query()
                ->where('showtime_id', $showtime->id)
                ->where('seat_number', $seatNumber)
                ->lockForUpdate()
                ->first();

            if ($existingLock && $existingLock->locked_by !== $clientId) {
                abort(409, 'Seat is already locked');
            }

            return SeatLock::query()->updateOrCreate(
                [
                    'showtime_id' => $showtime->id,
                    'seat_number' => $seatNumber,
                ],
                [
                    'locked_by' => $clientId,
                    'expires_at' => now()->addMinutes(self::LOCK_MINUTES),
                ],
            );
        });

        return response()->json([
            'data' => [
                'seatNumber' => $lock->seat_number,
                'status' => 'locked',
                'lockedByCurrentUser' => true,
                'lockedUntil' => $lock->expires_at->toISOString(),
            ],
        ]);
    }

    /**
     * Release a seat lock owned by the current browser/device session.
     */
    public function release(Showtime $showtime, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'seatNumber' => ['required', 'string', 'max:5'],
            'clientId' => ['required', 'string', 'max:100'],
        ]);

        SeatLock::query()
            ->where('showtime_id', $showtime->id)
            ->where('seat_number', strtoupper($validated['seatNumber']))
            ->where('locked_by', $validated['clientId'])
            ->delete();

        return response()->json([
            'data' => [
                'seatNumber' => strtoupper($validated['seatNumber']),
                'status' => 'available',
            ],
        ]);
    }

    private function deleteExpiredLocks(Showtime $showtime): void
    {
        SeatLock::query()
            ->where('showtime_id', $showtime->id)
            ->where('expires_at', '<=', now())
            ->delete();
    }

    private function assertSeatExists(Showtime $showtime, string $seatNumber): void
    {
        $showtime->loadMissing('hall');

        if (! preg_match('/^([A-Z])([1-9][0-9]*)$/', $seatNumber, $matches)) {
            throw ValidationException::withMessages([
                'seatNumber' => 'Seat number is invalid.',
            ]);
        }

        $rowIndex = ord($matches[1]) - ord('A') + 1;
        $column = (int) $matches[2];

        if ($rowIndex > $showtime->hall->seat_rows || $column > $showtime->hall->seats_per_row) {
            throw ValidationException::withMessages([
                'seatNumber' => 'Seat number is outside this hall layout.',
            ]);
        }
    }
}
