<?php

use App\Http\Controllers\Api\MovieController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\ConcessionItemController;
use App\Http\Controllers\Api\ShowtimeSeatController;
use Illuminate\Support\Facades\Route;

Route::get('/movies', [MovieController::class, 'index']);
Route::get('/movies/{movie}/booking-options', [MovieController::class, 'bookingOptions']);
Route::get('/movies/{movie}', [MovieController::class, 'show']);

Route::get('/concession-items', [ConcessionItemController::class, 'index']);

Route::post('/bookings', [BookingController::class, 'store']);

Route::get('/showtimes/{showtime}/seats', [ShowtimeSeatController::class, 'index']);
Route::post('/showtimes/{showtime}/seats/lock', [ShowtimeSeatController::class, 'lock']);
Route::post('/showtimes/{showtime}/seats/release', [ShowtimeSeatController::class, 'release']);
