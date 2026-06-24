<?php

namespace Tests\Feature;

use App\Models\CinemaHall;
use App\Models\CinemaLocation;
use App\Models\Movie;
use App\Models\SeatLock;
use App\Models\Showtime;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class BookingApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_booking_can_be_recorded_after_mock_payment(): void
    {
        $showtime = $this->createShowtime();

        SeatLock::query()->create([
            'showtime_id' => $showtime->id,
            'seat_number' => 'A3',
            'locked_by' => 'client-one',
            'expires_at' => now()->addMinutes(5),
        ]);

        $response = $this->postJson('/api/bookings', [
            'showtimeId' => $showtime->id,
            'ticketType' => 'Classic',
            'location' => 'Mid Valley Megamall',
            'cinemaHall' => 'Hall 1',
            'showDate' => Carbon::tomorrow()->toDateString(),
            'startTime' => '19:30',
            'seats' => ['A3'],
            'concessions' => [
                [
                    'id' => 1,
                    'name' => 'Fresh XL Combo',
                    'quantity' => 1,
                    'price' => 5400,
                ],
            ],
            'ticketTotal' => 2500,
            'concessionTotal' => 5400,
            'grandTotal' => 7950,
            'paymentMethod' => 'debit_card',
            'cardNumber' => '4111111111111234',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.seats', 'A3')
            ->assertJsonPath('data.cardLastFour', '1234')
            ->assertJsonPath('data.status', 'paid');

        $this->assertDatabaseHas('bookings', [
            'showtime_id' => $showtime->id,
            'card_last_four' => '1234',
            'status' => 'paid',
        ]);

        $this->assertDatabaseMissing('seat_locks', [
            'showtime_id' => $showtime->id,
            'seat_number' => 'A3',
        ]);
    }

    private function createShowtime(): Showtime
    {
        $movie = Movie::query()->create([
            'title' => 'Venom: Let There Be Carnage',
            'slug' => 'venom-let-there-be-carnage',
            'synopsis' => 'A test synopsis.',
            'duration_minutes' => 97,
            'genres' => ['Action', 'Adventure', 'Sci-Fi'],
        ]);

        $location = CinemaLocation::query()->create([
            'name' => 'Mid Valley Megamall',
        ]);

        $hall = CinemaHall::query()->create([
            'cinema_location_id' => $location->id,
            'name' => 'Hall 1',
            'seat_rows' => 8,
            'seats_per_row' => 8,
        ]);

        return Showtime::query()->create([
            'movie_id' => $movie->id,
            'cinema_hall_id' => $hall->id,
            'starts_at' => Carbon::tomorrow()->setTime(19, 30),
            'ticket_type' => 'Classic',
            'price_cents' => 2500,
        ]);
    }
}
