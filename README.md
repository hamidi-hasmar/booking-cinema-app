# Cinema Booking App

This project is a cinema booking demo built for the interview assessment. The main focus is the live booking flow, especially real-time style seat locking so two users cannot book the same seat at the same time.

## Tech Stack

Backend:
- PHP 8.3
- Laravel 13
- SQLite database
- Laravel migrations and seeders
- PHPUnit feature tests

Frontend:
- React Native
- Expo
- Expo Router
- TypeScript
- React hooks for API/state management

## Installation Guide

### Backend Setup

```bash
cd backend
composer install
copy .env.example .env
php artisan key:generate
```

Make sure the backend uses SQLite in `.env`:

```env
DB_CONNECTION=sqlite
```

Create the SQLite database file if it does not exist:

```bash
type nul > database/database.sqlite
```

Run migrations and seed demo data:

```bash
php artisan migrate --seed
```

Start the backend API:

```bash
php artisan serve
```

Default backend URL:

```txt
http://127.0.0.1:8000
```

### Frontend Setup

```bash
cd frontend
npm install
```

Start Expo:

```bash
npm start
```

Run on web:

```bash
npm run web
```

Run on Android emulator:

```bash
npm run android
```

The app already handles Android emulator API access by using:

```txt
http://10.0.2.2:8000
```

For web, it uses:

```txt
http://localhost:8000
```

If needed, override the API URL:

```env
EXPO_PUBLIC_API_URL=http://your-api-url:8000
```

## API List

### Movies

Get movie list:

```http
GET /api/movies
```

Get movie detail:

```http
GET /api/movies/{movieId}
```

### Booking Options

Get locations, cinema halls, dates, and showtimes for a movie:

```http
GET /api/movies/{movieId}/booking-options
```

Returns:
- ticket types
- cinema locations
- halls
- dates
- available showtimes

### Live Seat Booking

Get current seat map for a showtime:

```http
GET /api/showtimes/{showtimeId}/seats?clientId={clientId}
```

Lock a seat:

```http
POST /api/showtimes/{showtimeId}/seats/lock
```

Body:

```json
{
  "seatNumber": "A3",
  "clientId": "client-one"
}
```

Release a seat:

```http
POST /api/showtimes/{showtimeId}/seats/release
```

Body:

```json
{
  "seatNumber": "A3",
  "clientId": "client-one"
}
```

### Food And Beverages

Get all concession items:

```http
GET /api/concession-items
```

Filter by category:

```http
GET /api/concession-items?category=combo
GET /api/concession-items?category=food
GET /api/concession-items?category=beverage
```

### Mock Payment And Booking Record

Create final booking after mock card payment:

```http
POST /api/bookings
```

Body:

```json
{
  "showtimeId": 1,
  "ticketType": "Classic",
  "location": "Mid Valley Megamall",
  "cinemaHall": "Hall 1",
  "showDate": "2026-06-26",
  "startTime": "19:30",
  "seats": ["A3", "A4"],
  "concessions": [
    {
      "id": 1,
      "name": "Fresh XL Combo",
      "quantity": 1,
      "price": 5400
    }
  ],
  "ticketTotal": 5000,
  "concessionTotal": 5400,
  "grandTotal": 10450,
  "paymentMethod": "debit_card",
  "cardNumber": "4111111111111234"
}
```

The app stores only the card last four digits. There is no real payment gateway integration.

## Frontend With API Flow

1. Home screen calls:

```http
GET /api/movies
```

2. Movie detail screen calls:

```http
GET /api/movies/{movieId}
```

3. Ticket booking screen calls:

```http
GET /api/movies/{movieId}/booking-options
```

The user selects:
- ticket type
- location
- cinema hall
- date
- time

4. Once a showtime is selected, the seat map calls:

```http
GET /api/showtimes/{showtimeId}/seats?clientId={clientId}
```

The frontend polls this endpoint every few seconds to keep the seat map updated.

5. When the user taps a seat:

```http
POST /api/showtimes/{showtimeId}/seats/lock
```

If the user taps their selected seat again:

```http
POST /api/showtimes/{showtimeId}/seats/release
```

6. Food and beverages screen calls:

```http
GET /api/concession-items
```

Food and beverages are optional. The user may continue without choosing anything.

7. Booking summary is built from the selected movie, seats, showtime, and concessions.

8. Payment screens collect mock payment details and submit:

```http
POST /api/bookings
```

9. Success screen shows the booking reference.

## Live Booking Focus

The most important part of this assessment is the live seat booking behavior.

The implementation uses temporary seat locks:

- When a user selects a seat, the backend creates a row in `seat_locks`.
- Each lock belongs to a `showtime_id`, `seat_number`, and `client_id`.
- A database unique constraint prevents the same seat from being locked twice for the same showtime.
- Locks expire after 5 minutes.
- The frontend polls the seat map API so other users can see newly locked seats.

Important backend protection:

```txt
unique(showtime_id, seat_number)
```

This is what enforces first-come-first-served behavior at the database level.

Current live update strategy:

```txt
Short polling
```

The frontend refreshes the seat map every few seconds. This is simpler than WebSocket but still demonstrates the required real-time booking scenario. A production version could replace polling with WebSocket broadcasting.

## How To Test Live Booking

### Option 1: Test With Two App Sessions

1. Start backend:

```bash
cd backend
php artisan serve
```

2. Start frontend:

```bash
cd frontend
npm start
```

3. Open the app in two places, for example:

```txt
Browser web view + Android emulator
```

or:

```txt
Two browser windows
```

4. In both sessions:

- Open the same movie.
- Tap `Book Ticket`.
- Select the same location.
- Select the same cinema hall.
- Select the same date.
- Select the same showtime.

5. In Session A, select seat `A3`.

Expected result:

- `A3` becomes selected for Session A.
- After the next poll, Session B sees `A3` as unavailable/locked.
- Session B cannot select `A3`.

6. In Session A, tap `A3` again to release it.

Expected result:

- `A3` becomes available again.
- Session B can select it after the next poll.

### Option 2: Test With API Client

Get seat map as first user:

```http
GET http://127.0.0.1:8000/api/showtimes/1/seats?clientId=client-one
```

Lock seat as first user:

```http
POST http://127.0.0.1:8000/api/showtimes/1/seats/lock
```

Body:

```json
{
  "seatNumber": "A3",
  "clientId": "client-one"
}
```

Try locking the same seat as second user:

```http
POST http://127.0.0.1:8000/api/showtimes/1/seats/lock
```

Body:

```json
{
  "seatNumber": "A3",
  "clientId": "client-two"
}
```

Expected result:

```txt
409 Conflict
```

Release seat as first user:

```http
POST http://127.0.0.1:8000/api/showtimes/1/seats/release
```

Body:

```json
{
  "seatNumber": "A3",
  "clientId": "client-one"
}
```

After release, another user can lock the seat.

## Tests

Run backend tests:

```bash
cd backend
php artisan test
```

Run frontend type check:

```bash
cd frontend
npx.cmd tsc --noEmit
```

On macOS/Linux:

```bash
npx tsc --noEmit
```
