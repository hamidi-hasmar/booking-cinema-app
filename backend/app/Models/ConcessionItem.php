<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'name',
    'description',
    'category',
    'price_cents',
    'original_price_cents',
    'discount_percent',
    'image_url',
    'sort_order',
    'is_available',
])]
class ConcessionItem extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'price_cents' => 'integer',
            'original_price_cents' => 'integer',
            'discount_percent' => 'integer',
            'sort_order' => 'integer',
            'is_available' => 'boolean',
        ];
    }
}
