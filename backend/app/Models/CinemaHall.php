<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['cinema_location_id', 'name', 'seat_rows', 'seats_per_row', 'sort_order'])]
class CinemaHall extends Model
{
    /**
     * @return BelongsTo<CinemaLocation, $this>
     */
    public function location(): BelongsTo
    {
        return $this->belongsTo(CinemaLocation::class, 'cinema_location_id');
    }

    /**
     * @return HasMany<Showtime, $this>
     */
    public function showtimes(): HasMany
    {
        return $this->hasMany(Showtime::class);
    }
}
