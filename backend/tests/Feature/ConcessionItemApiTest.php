<?php

namespace Tests\Feature;

use App\Models\ConcessionItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ConcessionItemApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_concession_items_can_be_listed(): void
    {
        ConcessionItem::query()->create([
            'name' => 'Fresh XL Combo',
            'description' => 'Double large popcorn and 4 Pepsi',
            'category' => 'combo',
            'price_cents' => 5400,
            'original_price_cents' => 6000,
            'discount_percent' => 10,
            'sort_order' => 1,
        ]);

        $response = $this->getJson('/api/concession-items');

        $response
            ->assertOk()
            ->assertJsonPath('data.0.name', 'Fresh XL Combo')
            ->assertJsonPath('data.0.category', 'combo')
            ->assertJsonPath('data.0.price', 5400)
            ->assertJsonPath('data.0.discountPercent', 10);
    }

    public function test_concession_items_can_be_filtered_by_category(): void
    {
        ConcessionItem::query()->create([
            'name' => 'Fresh XL Combo',
            'description' => 'Double large popcorn and 4 Pepsi',
            'category' => 'combo',
            'price_cents' => 5400,
        ]);

        ConcessionItem::query()->create([
            'name' => 'Pepsi',
            'description' => 'Chilled regular Pepsi',
            'category' => 'beverage',
            'price_cents' => 900,
        ]);

        $response = $this->getJson('/api/concession-items?category=beverage');

        $response
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Pepsi');
    }
}
