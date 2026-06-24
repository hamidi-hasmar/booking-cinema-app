<?php

namespace Tests\Feature;

use App\Models\CinemaHall;
use App\Models\CinemaLocation;
use App\Models\Movie;
use App\Models\Showtime;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class ShowtimeSeatLockApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_seat_can_only_be_locked_by_one_client(): void
    {
        $showtime = $this->createShowtime();

        $this->postJson("/api/showtimes/{$showtime->id}/seats/lock", [
            'seatNumber' => 'A3',
            'clientId' => 'client-one',
        ])->assertOk()
            ->assertJsonPath('data.seatNumber', 'A3')
            ->assertJsonPath('data.lockedByCurrentUser', true);

        $this->getJson("/api/showtimes/{$showtime->id}/seats?clientId=client-one")
            ->assertOk()
            ->assertJsonPath('data.seats.2.seatNumber', 'A3')
            ->assertJsonPath('data.seats.2.status', 'locked')
            ->assertJsonPath('data.seats.2.lockedByCurrentUser', true);

        $this->postJson("/api/showtimes/{$showtime->id}/seats/lock", [
            'seatNumber' => 'A3',
            'clientId' => 'client-two',
        ])->assertConflict();
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
