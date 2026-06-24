<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ConcessionItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ConcessionItemController extends Controller
{
    /**
     * Return concession items for the food and beverages screen.
     */
    public function index(Request $request): JsonResponse
    {
        $items = ConcessionItem::query()
            ->where('is_available', true)
            ->when($request->filled('category'), function ($query) use ($request): void {
                $query->where('category', $request->string('category'));
            })
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(fn (ConcessionItem $item) => [
                'id' => $item->id,
                'name' => $item->name,
                'description' => $item->description,
                'category' => $item->category,
                'price' => $item->price_cents,
                'originalPrice' => $item->original_price_cents,
                'discountPercent' => $item->discount_percent,
                'imageUrl' => $item->image_url,
            ]);

        return response()->json([
            'data' => $items,
        ]);
    }
}
