<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class MovieDetailResource extends MovieResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return array_merge(parent::toArray($request), [
            'synopsis' => $this->synopsis,
            'trailerUrl' => $this->trailer_url,
            'castMembers' => $this->cast_members ?? [],
            'director' => $this->director,
            'writers' => $this->writers ?? [],
        ]);
    }
}
