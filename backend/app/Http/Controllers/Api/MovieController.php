<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MovieDetailResource;
use App\Http\Resources\MovieResource;
use App\Models\Movie;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\JsonResponse;

class MovieController extends Controller
{
    /**
     * Return movies for the home/search screen.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $movies = Movie::query()
            ->when($request->filled('search'), function ($query) use ($request): void {
                $query->where('title', 'like', '%'.$request->string('search')->trim().'%');
            })
            ->when($request->boolean('featured'), function ($query): void {
                $query->where('is_featured', true);
            })
            ->orderBy('sort_order')
            ->orderBy('title')
            ->get();

        return MovieResource::collection($movies);
    }

    /**
     * Return one movie for the movie detail screen.
     */
    public function show(Movie $movie): MovieDetailResource
    {
        return new MovieDetailResource($movie);
    }

    /**
     * Return booking locations, halls, and showtimes for one movie.
     */
    public function bookingOptions(Movie $movie): JsonResponse
    {
        $showtimes = $movie->showtimes()
            ->with(['hall.location'])
            ->where('starts_at', '>=', now()->startOfDay())
            ->orderBy('starts_at')
            ->get();

        $locations = $showtimes
            ->groupBy(fn ($showtime) => $showtime->hall->location->id)
            ->map(function ($locationShowtimes) {
                $location = $locationShowtimes->first()->hall->location;

                return [
                    'id' => $location->id,
                    'name' => $location->name,
                    'city' => $location->city,
                    'address' => $location->address,
                    'halls' => $locationShowtimes
                        ->groupBy(fn ($showtime) => $showtime->hall->id)
                        ->map(function ($hallShowtimes) {
                            $hall = $hallShowtimes->first()->hall;

                            return [
                                'id' => $hall->id,
                                'name' => $hall->name,
                                'seatRows' => $hall->seat_rows,
                                'seatsPerRow' => $hall->seats_per_row,
                                'dates' => $hallShowtimes
                                    ->groupBy(fn ($showtime) => $showtime->starts_at->toDateString())
                                    ->map(fn ($dateShowtimes, $date) => [
                                        'date' => $date,
                                        'times' => $dateShowtimes
                                            ->map(fn ($showtime) => [
                                                'id' => $showtime->id,
                                                'startTime' => $showtime->starts_at->format('H:i'),
                                            ])
                                            ->values(),
                                    ])
                                    ->values(),
                            ];
                        })
                        ->values(),
                ];
            })
            ->values();

        return response()->json([
            'data' => [
                'ticketTypes' => [
                    [
                        'label' => 'Classic',
                        'minPrice' => 1500,
                        'maxPrice' => 5000,
                    ],
                ],
                'locations' => $locations,
            ],
        ]);
    }
}
