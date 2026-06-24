<?php

namespace Database\Seeders;

use App\Models\Movie;
use App\Models\ConcessionItem;
use App\Models\CinemaHall;
use App\Models\CinemaLocation;
use App\Models\Showtime;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        Movie::query()->upsert([
            [
                'title' => 'Venom: Let There Be Carnage',
                'slug' => 'venom-let-there-be-carnage',
                'synopsis' => 'Eddie Brock tries to revive his career by interviewing serial killer Cletus Kasady, who becomes the host of an alien symbiote and escapes prison.',
                'poster_url' => 'https://image.tmdb.org/t/p/w500/rjkmN1dniUHVYAtwuV3Tji7FsDO.jpg',
                'backdrop_url' => 'https://image.tmdb.org/t/p/w1280/vIgyYkXkg6NC2whRbYjBD7eb3Er.jpg',
                'trailer_url' => 'https://www.youtube.com/watch?v=-FmWuCgJmxo',
                'release_date' => '2021-10-01',
                'duration_minutes' => 97,
                'age_rating' => '13+',
                'language' => 'English',
                'format' => 'IMAX 3D',
                'genres' => json_encode(['Action', 'Adventure', 'Sci-Fi']),
                'cast_members' => json_encode(['Tom Hardy', 'Woody Harrelson', 'Michelle Williams', 'Naomie Harris']),
                'director' => 'Andy Serkis',
                'writers' => json_encode(['Kelly Marcel', 'Tom Hardy']),
                'rating_average' => 4.0,
                'rating_count' => 20,
                'is_featured' => true,
                'sort_order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'No Time To Die',
                'slug' => 'no-time-to-die',
                'synopsis' => 'James Bond has left active service, but his peace is interrupted when an old friend asks for help tracking a dangerous new weapon.',
                'poster_url' => 'https://image.tmdb.org/t/p/w500/iUgygt3fscRoKWCV1d0C7FbM9TP.jpg',
                'backdrop_url' => 'https://image.tmdb.org/t/p/w1280/r2GAjd4rNOHJh6i6Y0FntmYuPQW.jpg',
                'trailer_url' => 'https://www.youtube.com/watch?v=BIhNsAtPbPI',
                'release_date' => '2021-10-08',
                'duration_minutes' => 163,
                'age_rating' => '13+',
                'language' => 'English',
                'format' => '2D',
                'genres' => json_encode(['Action', 'Adventure', 'Thriller']),
                'cast_members' => json_encode(['Daniel Craig', 'Rami Malek', 'Lea Seydoux', 'Lashana Lynch']),
                'director' => 'Cary Joji Fukunaga',
                'writers' => json_encode(['Neal Purvis', 'Robert Wade', 'Phoebe Waller-Bridge']),
                'rating_average' => 4.3,
                'rating_count' => 34,
                'is_featured' => true,
                'sort_order' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Shang-Chi and the Legend of the Ten Rings',
                'slug' => 'shang-chi-and-the-legend-of-the-ten-rings',
                'synopsis' => 'Shang-Chi must confront the past he thought he left behind when he is drawn into the web of the mysterious Ten Rings organization.',
                'poster_url' => 'https://image.tmdb.org/t/p/w500/1BIoJGKbXjdFDAqUEiA2VHqkK1Z.jpg',
                'backdrop_url' => 'https://image.tmdb.org/t/p/w1280/cinER0ESG0eJ49kXlExM0MEWGxW.jpg',
                'trailer_url' => 'https://www.youtube.com/watch?v=8YjFbMbfXaQ',
                'release_date' => '2021-09-03',
                'duration_minutes' => 132,
                'age_rating' => '13+',
                'language' => 'English',
                'format' => '2D',
                'genres' => json_encode(['Action', 'Adventure', 'Fantasy']),
                'cast_members' => json_encode(['Simu Liu', 'Awkwafina', 'Tony Leung', 'Michelle Yeoh']),
                'director' => 'Destin Daniel Cretton',
                'writers' => json_encode(['Dave Callaham', 'Destin Daniel Cretton', 'Andrew Lanham']),
                'rating_average' => 4.5,
                'rating_count' => 28,
                'is_featured' => false,
                'sort_order' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Omo Ghetto: The Saga',
                'slug' => 'omo-ghetto-the-saga',
                'synopsis' => 'A comedy drama following twin sisters living very different lives as old habits and new responsibilities collide.',
                'poster_url' => null,
                'backdrop_url' => null,
                'trailer_url' => null,
                'release_date' => '2020-12-25',
                'duration_minutes' => 110,
                'age_rating' => '16+',
                'language' => 'English',
                'format' => '2D',
                'genres' => json_encode(['Comedy', 'Drama']),
                'cast_members' => json_encode(['Funke Akindele', 'Chioma Akpotha', 'Eniola Badmus']),
                'director' => 'Funke Akindele',
                'writers' => json_encode(['Funke Akindele']),
                'rating_average' => 3.8,
                'rating_count' => 12,
                'is_featured' => false,
                'sort_order' => 4,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ], ['slug']);

        $locations = [
            [
                'name' => 'Mid Valley Megamall',
                'city' => 'Kuala Lumpur',
                'address' => 'Lingkaran Syed Putra, Mid Valley City',
                'sort_order' => 1,
                'halls' => ['Hall 1', 'Hall 2'],
            ],
            [
                'name' => 'Sunway Velocity Mall',
                'city' => 'Kuala Lumpur',
                'address' => 'Jalan Peel, Maluri',
                'sort_order' => 2,
                'halls' => ['Hall 3', 'Hall 4'],
            ],
            [
                'name' => 'IOI City Mall',
                'city' => 'Putrajaya',
                'address' => 'Lebuh IRC, IOI Resort City',
                'sort_order' => 3,
                'halls' => ['IMAX Hall', 'Hall 5'],
            ],
        ];

        foreach ($locations as $locationIndex => $locationData) {
            $location = CinemaLocation::query()->updateOrCreate(
                ['name' => $locationData['name']],
                [
                    'city' => $locationData['city'],
                    'address' => $locationData['address'],
                    'sort_order' => $locationData['sort_order'],
                ],
            );

            foreach ($locationData['halls'] as $hallIndex => $hallName) {
                CinemaHall::query()->updateOrCreate(
                    [
                        'cinema_location_id' => $location->id,
                        'name' => $hallName,
                    ],
                    [
                        'seat_rows' => 8,
                        'seats_per_row' => 8,
                        'sort_order' => ($locationIndex * 10) + $hallIndex + 1,
                    ],
                );
            }
        }

        $movies = Movie::query()->orderBy('sort_order')->get();
        $halls = CinemaHall::query()->with('location')->orderBy('sort_order')->get();
        $baseDate = Carbon::today()->addDay();
        $times = ['09:20', '11:40', '13:20', '15:30', '17:40', '19:30', '21:20'];

        foreach ($movies as $movieIndex => $movie) {
            foreach ($halls as $hallIndex => $hall) {
                for ($day = 0; $day < 5; $day++) {
                    foreach (array_slice($times, ($movieIndex + $hallIndex + $day) % 3, 3) as $time) {
                        $startsAt = Carbon::parse($baseDate->copy()->addDays($day)->toDateString().' '.$time);

                        Showtime::query()->updateOrCreate(
                            [
                                'movie_id' => $movie->id,
                                'cinema_hall_id' => $hall->id,
                                'starts_at' => $startsAt,
                            ],
                            [
                                'ticket_type' => 'Classic',
                                'price_cents' => 2500 + ($hallIndex * 250),
                            ],
                        );
                    }
                }
            }
        }

        ConcessionItem::query()->upsert([
            [
                'name' => 'Tasty Combo',
                'description' => 'Shawarma, pack of fries and Pepsi',
                'category' => 'combo',
                'price_cents' => 3500,
                'original_price_cents' => null,
                'discount_percent' => null,
                'image_url' => null,
                'sort_order' => 1,
                'is_available' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Fresh XL Combo',
                'description' => 'Double large popcorn and 4 Pepsi',
                'category' => 'combo',
                'price_cents' => 5400,
                'original_price_cents' => 6000,
                'discount_percent' => 10,
                'image_url' => null,
                'sort_order' => 2,
                'is_available' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Yummy Combo',
                'description' => '2 hotdogs, 2 Lays chips and 4 Pepsi',
                'category' => 'combo',
                'price_cents' => 6500,
                'original_price_cents' => null,
                'discount_percent' => null,
                'image_url' => null,
                'sort_order' => 3,
                'is_available' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Fresh Combo',
                'description' => 'Large popcorn and candy with Pepsi',
                'category' => 'combo',
                'price_cents' => 2500,
                'original_price_cents' => null,
                'discount_percent' => null,
                'image_url' => null,
                'sort_order' => 4,
                'is_available' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Special Combo',
                'description' => 'Chicken shawarma and pack of fries',
                'category' => 'combo',
                'price_cents' => 2550,
                'original_price_cents' => 3000,
                'discount_percent' => 15,
                'image_url' => null,
                'sort_order' => 5,
                'is_available' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Delight Combo',
                'description' => 'Double pack medium popcorn',
                'category' => 'combo',
                'price_cents' => 2000,
                'original_price_cents' => null,
                'discount_percent' => null,
                'image_url' => null,
                'sort_order' => 6,
                'is_available' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Classic Popcorn',
                'description' => 'Large salted popcorn',
                'category' => 'food',
                'price_cents' => 1800,
                'original_price_cents' => null,
                'discount_percent' => null,
                'image_url' => null,
                'sort_order' => 10,
                'is_available' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Nachos Pack',
                'description' => 'Nachos with cheese dip',
                'category' => 'food',
                'price_cents' => 2200,
                'original_price_cents' => null,
                'discount_percent' => null,
                'image_url' => null,
                'sort_order' => 11,
                'is_available' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Pepsi',
                'description' => 'Chilled regular Pepsi',
                'category' => 'beverage',
                'price_cents' => 900,
                'original_price_cents' => null,
                'discount_percent' => null,
                'image_url' => null,
                'sort_order' => 20,
                'is_available' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Bottled Water',
                'description' => 'Mineral water',
                'category' => 'beverage',
                'price_cents' => 600,
                'original_price_cents' => null,
                'discount_percent' => null,
                'image_url' => null,
                'sort_order' => 21,
                'is_available' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ], ['name']);
    }
}
