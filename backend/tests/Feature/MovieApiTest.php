<?php

namespace Tests\Feature;

use App\Models\Movie;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MovieApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_movies_can_be_listed(): void
    {
        Movie::query()->create([
            'title' => 'Venom: Let There Be Carnage',
            'slug' => 'venom-let-there-be-carnage',
            'synopsis' => 'A test synopsis.',
            'duration_minutes' => 97,
            'genres' => ['Action', 'Adventure', 'Sci-Fi'],
            'rating_average' => 4.0,
            'rating_count' => 20,
            'is_featured' => true,
        ]);

        $response = $this->getJson('/api/movies');

        $response
            ->assertOk()
            ->assertJsonPath('data.0.title', 'Venom: Let There Be Carnage')
            ->assertJsonPath('data.0.slug', 'venom-let-there-be-carnage')
            ->assertJsonPath('data.0.rating.average', 4);
    }

    public function test_movie_detail_can_be_viewed_by_slug(): void
    {
        Movie::query()->create([
            'title' => 'No Time To Die',
            'slug' => 'no-time-to-die',
            'synopsis' => 'Bond returns for one more mission.',
            'duration_minutes' => 163,
            'genres' => ['Action', 'Adventure', 'Thriller'],
            'cast_members' => ['Daniel Craig', 'Rami Malek'],
            'director' => 'Cary Joji Fukunaga',
            'writers' => ['Neal Purvis', 'Robert Wade'],
        ]);

        $response = $this->getJson('/api/movies/no-time-to-die');

        $response
            ->assertOk()
            ->assertJsonPath('data.title', 'No Time To Die')
            ->assertJsonPath('data.synopsis', 'Bond returns for one more mission.')
            ->assertJsonPath('data.castMembers.0', 'Daniel Craig');
    }
}
