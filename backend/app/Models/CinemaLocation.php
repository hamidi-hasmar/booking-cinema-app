<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'city', 'address', 'sort_order'])]
class CinemaLocation extends Model
{
    /**
     * @return HasMany<CinemaHall, $this>
     */
    public function halls(): HasMany
    {
        return $this->hasMany(CinemaHall::class);
    }
}
