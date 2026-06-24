<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'title',
    'slug',
    'synopsis',
    'poster_url',
    'backdrop_url',
    'trailer_url',
    'release_date',
    'duration_minutes',
    'age_rating',
    'language',
    'format',
    'genres',
    'cast_members',
    'director',
    'writers',
    'rating_average',
    'rating_count',
    'is_featured',
    'sort_order',
])]
class Movie extends Model
{
    /**
     * Use readable URLs for API route model binding.
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'release_date' => 'date',
            'genres' => 'array',
            'cast_members' => 'array',
            'writers' => 'array',
            'rating_average' => 'decimal:1',
            'rating_count' => 'integer',
            'duration_minutes' => 'integer',
            'is_featured' => 'boolean',
            'sort_order' => 'integer',
        ];
    }
}
