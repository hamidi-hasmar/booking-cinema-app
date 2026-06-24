<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MovieDetailResource;
use App\Http\Resources\MovieResource;
use App\Models\Movie;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class MovieController extends Controller
{
    /**
     * Return movies for the home/search screen.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $movies = Movie::query()
            ->when($request->filled('search'), function ($query) use ($request): void {
                $query->where('title', 'like', '%'.$request->string('search')->trim().'%');
            })
            ->when($request->boolean('featured'), function ($query): void {
                $query->where('is_featured', true);
            })
            ->orderBy('sort_order')
            ->orderBy('title')
            ->get();

        return MovieResource::collection($movies);
    }

    /**
     * Return one movie for the movie detail screen.
     */
    public function show(Movie $movie): MovieDetailResource
    {
        return new MovieDetailResource($movie);
    }
}
