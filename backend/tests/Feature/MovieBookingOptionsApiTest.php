<?php

namespace Tests\Feature;

use App\Models\CinemaHall;
use App\Models\CinemaLocation;
use App\Models\Movie;
use App\Models\Showtime;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class MovieBookingOptionsApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_movie_booking_options_return_locations_halls_and_times(): void
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
            'city' => 'Kuala Lumpur',
            'address' => 'Lingkaran Syed Putra, Mid Valley City',
        ]);

        $hall = CinemaHall::query()->create([
            'cinema_location_id' => $location->id,
            'name' => 'Hall 1',
            'seat_rows' => 8,
            'seats_per_row' => 8,
        ]);

        Showtime::query()->create([
            'movie_id' => $movie->id,
            'cinema_hall_id' => $hall->id,
            'starts_at' => Carbon::tomorrow()->setTime(19, 30),
            'ticket_type' => 'Classic',
            'price_cents' => 2500,
        ]);

        $response = $this->getJson("/api/movies/{$movie->id}/booking-options");

        $response
            ->assertOk()
            ->assertJsonPath('data.locations.0.name', 'Mid Valley Megamall')
            ->assertJsonPath('data.locations.0.halls.0.name', 'Hall 1')
            ->assertJsonPath('data.locations.0.halls.0.seatRows', 8)
            ->assertJsonPath('data.locations.0.halls.0.dates.0.times.0.startTime', '19:30')
            ->assertJsonPath('data.ticketTypes.0.label', 'Classic');
    }
}
