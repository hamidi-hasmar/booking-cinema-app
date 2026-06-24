<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MovieResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'posterUrl' => $this->poster_url,
            'backdropUrl' => $this->backdrop_url,
            'genres' => $this->genres,
            'releaseDate' => $this->release_date?->toDateString(),
            'durationMinutes' => $this->duration_minutes,
            'ageRating' => $this->age_rating,
            'language' => $this->language,
            'format' => $this->format,
            'rating' => [
                'average' => (float) $this->rating_average,
                'count' => $this->rating_count,
            ],
            'isFeatured' => $this->is_featured,
        ];
    }
}
