# Cinema Booking App

Cinema booking demo for the interview assessment. The main assessment focus is the live seat booking flow.

## Tech Stack

Backend:
- PHP 8.3
- Laravel 13
- SQLite
- PHPUnit

Frontend:
- React Native
- Expo
- Expo Router
- TypeScript

## Installation

Backend:

```bash
cd backend
composer install
copy .env.example .env
php artisan key:generate
```

Set SQLite in `backend/.env`:

```env
DB_CONNECTION=sqlite
```

Create the database, migrate, seed, and start the API:

```bash
type nul > database/database.sqlite
php artisan migrate --seed
php artisan serve
```

Backend URL:

```txt
http://127.0.0.1:8000
```

Frontend:

```bash
cd frontend
npm install
npm start
```

Run targets:

```bash
npm run web
npm run android
```

API URL handling:
- Web uses `http://localhost:8000`
- Android emulator uses `http://10.0.2.2:8000`
- Override with `EXPO_PUBLIC_API_URL=http://your-api-url:8000`

## API List

- `GET /api/movies`
- `GET /api/movies/{movieId}`
- `GET /api/movies/{movieId}/booking-options`
- `GET /api/showtimes/{showtimeId}/seats?clientId={clientId}`
- `POST /api/showtimes/{showtimeId}/seats/lock`
- `POST /api/showtimes/{showtimeId}/seats/release`
- `GET /api/concession-items`
- `GET /api/concession-items?category=combo`
- `GET /api/concession-items?category=food`
- `GET /api/concession-items?category=beverage`
- `POST /api/bookings`

## Live Booking

Live booking is implemented with temporary seat locks and short polling.

Key backend files:
- `backend/routes/api.php`
- `backend/app/Http/Controllers/Api/ShowtimeSeatController.php`
- `backend/app/Http/Controllers/Api/BookingController.php`
- `backend/app/Models/SeatLock.php`
- `backend/database/migrations/2026_06_24_000005_create_seat_locks_table.php`

Key frontend files:
- `frontend/features/api/movie-api.ts`
- `frontend/features/hooks/use-showtime-seats.ts`
- `frontend/features/screens/movie-booking-options-screen.tsx`

### How It Works

1. The frontend creates a temporary `clientId` for the current app session.
2. When a showtime is selected, the frontend calls:

```http
GET /api/showtimes/{showtimeId}/seats?clientId={clientId}
```

3. The backend returns the seat map with each seat marked as available, locked by this user, or locked by another user.
4. The frontend polls this endpoint every 3 seconds to keep the seat map updated.
5. When a user selects a seat, the frontend calls:

```http
POST /api/showtimes/{showtimeId}/seats/lock
```

6. The backend stores the selected seat in `seat_locks`.
7. The lock is tied to:

```txt
showtime_id
seat_number
locked_by
expires_at
```

8. If another user tries to lock the same seat, the API returns:

```txt
409 Conflict
```

9. If the user deselects the seat, the frontend calls:

```http
POST /api/showtimes/{showtimeId}/seats/release
```

10. After mock payment, the booking is saved through `POST /api/bookings`, and the temporary seat lock is cleared.

### Why This Prevents Double Booking

The backend checks the seat inside a database transaction and locks the existing row using `lockForUpdate()`. This makes the seat lock first-come-first-served.

Locks also expire after 5 minutes, so abandoned seat selections do not block seats forever.

### Interview Summary

The live booking feature uses short polling plus temporary database locks. The frontend refreshes the seat map every 3 seconds. When a user selects a seat, the backend creates a lock for that showtime and seat using the current `clientId`. If another user tries to select the same seat, the backend returns `409 Conflict`. Locks expire after 5 minutes and are removed after the final booking is saved.

## Testing Live Booking

### Test With Two App Sessions

1. Start the backend:

```bash
cd backend
php artisan serve
```

2. Start the frontend:

```bash
cd frontend
npm start
```

3. Open the same movie booking screen in two sessions, for example web and Android emulator.
4. Select the same location, hall, date, and showtime.
5. In Session A, select seat `A3`.
6. In Session B, wait for the next poll.

Expected result:
- Session A sees `A3` as selected.
- Session B sees `A3` as unavailable.
- Session B cannot select `A3`.

Then release `A3` from Session A.

Expected result:
- Session B sees `A3` become available again after polling.

### Test With API Client

Lock a seat:

```http
POST http://127.0.0.1:8000/api/showtimes/1/seats/lock
```

```json
{
  "seatNumber": "A3",
  "clientId": "client-one"
}
```

Try the same seat as another user:

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

Release the seat:

```http
POST http://127.0.0.1:8000/api/showtimes/1/seats/release
```

```json
{
  "seatNumber": "A3",
  "clientId": "client-one"
}
```

## Tests

Backend:

```bash
cd backend
php artisan test
```

Frontend:

```bash
cd frontend
npx.cmd tsc --noEmit
```
