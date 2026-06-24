<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'reference',
    'showtime_id',
    'ticket_type',
    'location',
    'cinema_hall',
    'show_date',
    'start_time',
    'seats',
    'concessions',
    'ticket_total_cents',
    'concession_total_cents',
    'service_charge_cents',
    'grand_total_cents',
    'payment_method',
    'card_last_four',
    'status',
])]
class Booking extends Model
{
    /**
     * @return BelongsTo<Showtime, $this>
     */
    public function showtime(): BelongsTo
    {
        return $this->belongsTo(Showtime::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'show_date' => 'date',
            'seats' => 'array',
            'concessions' => 'array',
            'ticket_total_cents' => 'integer',
            'concession_total_cents' => 'integer',
            'service_charge_cents' => 'integer',
            'grand_total_cents' => 'integer',
        ];
    }
}
