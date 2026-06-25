<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
{
     /**
     * @return array<string, mixed>
     */

     public function toArray(Request $request): array
     {
        return [

                'id' => $this->id,
                'reference' => $this->reference,
                'showtimeId' => $this->showtime_id,
                'ticketType' => $this->ticket_type,
                'location' => $this->location,
                'cinemaHall' => $this->cinema_hall,
                'showDate' => $this->show_date->toDateString(),
                'startTime' => $this->start_time,
                'seats' => implode(', ', $this->seats),
                'concessions' => collect($this->concessions)
                    ->map(fn (array $item) => "{$item['name']} [x{$item['quantity']}]")
                    ->implode(', '),
                'ticketTotal' => $this->ticket_total_cents,
                'concessionTotal' => $this->concession_total_cents,
                'grandTotal' => $this->grand_total_cents,
                'paymentMethod' => $this->payment_method,
                'cardLastFour' => $this->card_last_four,
                'status' => $this->status,
                'createdAt' => $this->created_at->toISOString(),

        ];
     }
}
